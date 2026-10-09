<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use App\Models\User;
use App\Models\Otp;
use App\Mail\OtpVerificationMail;
use App\Mail\WelcomeMail;

class AuthOtpController extends Controller
{
    /**
     * 1. Send 6-digit OTP to user's entered email
     * Stores OTP and expiry in the database 'otps' table and users table.
     */
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'type'  => 'nullable|string|in:register,login',
            'name'  => 'nullable|string|max:255',
        ]);

        $email = strtolower(trim($request->email));
        $type = $request->input('type', 'register');
        $name = $request->input('name') ?: 'there';

        // If logging in via OTP, ensure user exists
        if ($type === 'login') {
            $user = User::whereRaw('LOWER(email) = ?', [$email])->first();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'No account registered with this email address. Please create an account.'
                ], 404);
            }
            if ($user->name) {
                $name = $user->name;
            }
        }

        // If registering via OTP, prevent duplicate email
        if ($type === 'register') {
            $exists = User::whereRaw('LOWER(email) = ?', [$email])->exists();
            if ($exists) {
                return response()->json([
                    'success' => false,
                    'message' => 'An account already exists with this email address. Please sign in.'
                ], 422);
            }
        }

        $otp = (string) rand(100000, 999999);
        $expiresAt = now()->addMinutes(10);

        // 1. Store in Database 'otps' table with expiration
        try {
            Otp::create([
                'identifier' => $email,
                'otp'        => $otp,
                'type'       => 'email',
                'expires_at' => $expiresAt,
                'ip_address' => $request->ip(),
            ]);
        } catch (\Throwable $e) {
            Log::error("Failed to insert OTP in otps table: " . $e->getMessage());
        }

        // 2. Also store directly in users table if user exists
        try {
            User::whereRaw('LOWER(email) = ?', [$email])->update([
                'otp'            => $otp,
                'otp_expires_at' => $expiresAt,
            ]);
        } catch (\Throwable $e) {
            Log::warning("Could not update user table otp: " . $e->getMessage());
        }

        // 3. Store OTP in cache for 10 minutes (secondary lookup)
        Cache::put('otp_' . $email, $otp, $expiresAt);

        // 4. Dispatch OTP email to the entered address
        $dispatchResult = $this->dispatchOtpEmail($email, $otp, $name);
        $emailSent = $dispatchResult['sent'];
        $emailError = $dispatchResult['error'];

        return response()->json([
            'success'    => true,
            'message'    => $emailSent
                ? "OTP sent successfully to {$email}."
                : "OTP generated for {$email}.",
            'email_sent' => $emailSent,
            'dev_otp'    => $emailSent ? null : $otp,
            'note'       => $emailSent ? null : "Verification code: {$otp}. Please enter this code to verify.",
            'expires_at' => $expiresAt->toIso8601String(),
        ]);
    }

    /**
     * 2. Verify OTP & complete user registration
     */
    public function registerWithOtp(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'username' => 'nullable|string|max:50',
            'email'    => 'required|email|unique:users,email',
            'phone'    => 'nullable|string|max:20',
            'password' => 'required|string|min:6',
            'otp'      => 'required|numeric',
        ]);

        $email = strtolower(trim($request->email));
        $enteredOtp = (string)$request->otp;

        // 1. Check in DB otps table first
        $validOtpRecord = null;
        try {
            $validOtpRecord = Otp::where('identifier', $email)
                ->where('otp', $enteredOtp)
                ->where('expires_at', '>', now())
                ->whereNull('verified_at')
                ->latest()
                ->first();
        } catch (\Throwable $e) {
            Log::warning("DB check for Otp failed: " . $e->getMessage());
        }

        // 2. Fallback check in Cache
        $cachedOtp = Cache::get('otp_' . $email);

        if (!$validOtpRecord && (!$cachedOtp || (string)$cachedOtp !== $enteredOtp)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP code. Please request a new one.'
            ], 422);
        }

        // Mark OTP as verified in DB
        if ($validOtpRecord) {
            $validOtpRecord->update(['verified_at' => now()]);
        }
        Cache::forget('otp_' . $email);

        // Generate unique username if not provided
        $username = $request->username ? strtolower(trim($request->username)) : null;
        if (!$username || User::where('username', $username)->exists()) {
            $base = Str::slug(explode('@', $email)[0]);
            $username = $base . rand(100, 999);
        }

        // Format phone if provided
        $phone = null;
        if ($request->phone) {
            $rawPhone = preg_replace('/[^0-9]/', '', $request->phone);
            $phone = strlen($rawPhone) > 10 ? substr($rawPhone, -10) : $rawPhone;
            if ($phone) {
                $phone = '+91' . $phone;
            }
        }

        // Generate unique user_id
        do {
            $user_id = 'SW' . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
        } while (User::where('user_id', $user_id)->exists());

        // Create the user
        $user = User::create([
            'name'     => $request->name,
            'username' => $username,
            'user_id'  => $user_id,
            'email'    => $email,
            'phone'    => $phone,
            'password' => Hash::make($request->password),
            'role'     => 'Customer',
        ]);

        // Generate Sanctum token
        $token = $user->createToken('auth_token')->plainTextToken;

        // Send Welcome Letter
        try {
            Mail::to($user->email)->send(new WelcomeMail($user->name, $user->email));
        } catch (\Throwable $e) {
            Log::warning("Failed to send welcome letter to {$user->email}: " . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => 'Account registered successfully! Welcome to SwiftShopiy.',
            'token'   => $token,
            'user'    => [
                'id'       => $user->id,
                'username' => $user->username,
                'user_id'  => $user->user_id,
                'name'     => $user->name,
                'email'    => $user->email,
                'phone'    => $user->phone,
                'role'     => $user->role ?? 'Customer',
            ]
        ], 201);
    }

    /**
     * 3. Verify OTP for passwordless login
     */
    public function verifyLoginOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|numeric',
        ]);

        $email = strtolower(trim($request->email));
        $enteredOtp = (string)$request->otp;

        // 1. Check in DB otps table first
        $validOtpRecord = null;
        try {
            $validOtpRecord = Otp::where('identifier', $email)
                ->where('otp', $enteredOtp)
                ->where('expires_at', '>', now())
                ->whereNull('verified_at')
                ->latest()
                ->first();
        } catch (\Throwable $e) {
            Log::warning("DB check for Otp failed: " . $e->getMessage());
        }

        // 2. Fallback check in Cache
        $cachedOtp = Cache::get('otp_' . $email);

        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No user account found with this email.'
            ], 404);
        }

        // 3. Fallback check on user record
        $userOtpMatches = ($user->otp === $enteredOtp && $user->otp_expires_at && $user->otp_expires_at->isFuture());

        if (!$validOtpRecord && (!$cachedOtp || (string)$cachedOtp !== $enteredOtp) && !$userOtpMatches) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP code.'
            ], 422);
        }

        if ($validOtpRecord) {
            $validOtpRecord->update(['verified_at' => now()]);
        }
        Cache::forget('otp_' . $email);

        // Clear otp on user record
        try {
            $user->update(['otp' => null, 'otp_expires_at' => null]);
        } catch (\Throwable $e) {
            // Ignore
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'token'   => $token,
            'user'    => [
                'id'       => $user->id,
                'username' => $user->username,
                'user_id'  => $user->user_id,
                'name'     => $user->name,
                'email'    => $user->email,
                'phone'    => $user->phone,
                'role'     => $user->role ?? 'Customer',
            ]
        ]);
    }

    /**
     * 4. Send OTP to mobile phone
     * Stores OTP and expiry in the database 'otps' table and users table.
     */
    public function sendMobileOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
        ]);

        $rawPhone = preg_replace('/[^0-9]/', '', $request->phone);
        $cleanPhone = strlen($rawPhone) > 10 ? substr($rawPhone, -10) : $rawPhone;

        if (strlen($cleanPhone) < 10) {
            return response()->json([
                'success' => false,
                'message' => 'Please enter a valid 10-digit mobile number.'
            ], 422);
        }

        $otp = (string) rand(100000, 999999);
        $expiresAt = now()->addMinutes(10);

        // 1. Store in Database 'otps' table with expiration
        try {
            Otp::create([
                'identifier' => $cleanPhone,
                'otp'        => $otp,
                'type'       => 'mobile',
                'expires_at' => $expiresAt,
                'ip_address' => $request->ip(),
            ]);
        } catch (\Throwable $e) {
            Log::error("Failed to insert mobile OTP in otps table: " . $e->getMessage());
        }

        // 2. Also update in users table if user exists
        try {
            User::where('phone', $cleanPhone)
                ->orWhere('phone', '+91' . $cleanPhone)
                ->update([
                    'otp'            => $otp,
                    'otp_expires_at' => $expiresAt,
                ]);
        } catch (\Throwable $e) {
            Log::warning("Could not update user table mobile otp: " . $e->getMessage());
        }

        // 3. Store in cache
        Cache::put('otp_phone_' . $cleanPhone, $otp, $expiresAt);

        // 4. Try sending via Cloud SMS / Messaging Providers
        $smsSent = false;
        $smsError = null;

        // Provider A: Twilio SMS (free trial credits available)
        $twilioSid = env('TWILIO_SID');
        $twilioToken = env('TWILIO_AUTH_TOKEN');
        $twilioFrom = env('TWILIO_FROM');
        if ($twilioSid && $twilioToken && $twilioFrom) {
            try {
                $twRes = Http::withBasicAuth($twilioSid, $twilioToken)
                    ->asForm()
                    ->post("https://api.twilio.com/2010-04-01/Accounts/{$twilioSid}/Messages.json", [
                        'To'   => '+91' . $cleanPhone,
                        'From' => $twilioFrom,
                        'Body' => "SwiftShopiy: Your verification code is {$otp}. Valid for 10 minutes.",
                    ]);
                if ($twRes->successful()) {
                    $smsSent = true;
                    Log::info("OTP sent via Twilio SMS to +91{$cleanPhone}");
                } else {
                    $smsError = $twRes->json()['message'] ?? 'Twilio SMS failed';
                    Log::warning("Twilio SMS response: " . $twRes->body());
                }
            } catch (\Throwable $e) {
                $smsError = $e->getMessage();
                Log::warning("Twilio connection error: " . $e->getMessage());
            }
        }

        // Provider B: Meta WhatsApp Cloud API (1,000 free messages/month directly to +91 numbers)
        $waToken = env('WHATSAPP_TOKEN');
        $waPhoneId = env('WHATSAPP_PHONE_ID');
        if (!$smsSent && $waToken && $waPhoneId && !str_contains($waToken, 'your_meta')) {
            try {
                $waRes = Http::withToken($waToken)
                    ->post("https://graph.facebook.com/v19.0/{$waPhoneId}/messages", [
                        'messaging_product' => 'whatsapp',
                        'to'                => '91' . $cleanPhone,
                        'type'              => 'text',
                        'text'              => [
                            'body' => "Your SwiftShopiy verification OTP is: *{$otp}* (valid for 10 minutes).",
                        ],
                    ]);
                if ($waRes->successful()) {
                    $smsSent = true;
                    Log::info("OTP sent via WhatsApp Cloud API to 91{$cleanPhone}");
                } else {
                    $smsError = $waRes->json()['error']['message'] ?? 'WhatsApp dispatch failed';
                    Log::warning("WhatsApp API response: " . $waRes->body());
                }
            } catch (\Throwable $e) {
                $smsError = $e->getMessage();
                Log::warning("WhatsApp connection error: " . $e->getMessage());
            }
        }

        // Provider C: Fast2SMS route 'q' (Quick SMS)
        $apiKey = env('FAST2SMS_API_KEY');
        if (!$smsSent && $apiKey) {
            try {
                $response = Http::withHeaders([
                    'authorization' => $apiKey,
                    'Content-Type' => 'application/json',
                ])->post('https://www.fast2sms.com/dev/bulkV2', [
                    'route'            => 'q',
                    'message'          => "SwiftShopiy: Your verification code is {$otp}. Valid for 10 minutes. Please do not share.",
                    'language'         => 'english',
                    'flash'            => 0,
                    'numbers'          => $cleanPhone,
                ]);

                $resData = $response->json();
                if ($response->successful() && ($resData['return'] ?? false) === true) {
                    $smsSent = true;
                } else {
                    $smsError = $resData['message'] ?? 'SMS gateway response failed';
                    Log::warning("Fast2SMS route 'q' returned for {$cleanPhone}: " . json_encode($resData));
                }
            } catch (\Throwable $e) {
                $smsError = $e->getMessage();
                Log::warning("Fast2SMS connection error for {$cleanPhone}: " . $e->getMessage());
            }
        }

        return response()->json([
            'success'    => true,
            'message'    => $smsSent
                ? "OTP sent successfully to +91 {$cleanPhone}."
                : "OTP generated for +91 {$cleanPhone}.",
            'sms_sent'   => $smsSent,
            'dev_otp'    => $smsSent ? null : $otp,
            'note'       => $smsSent ? null : ($smsError ? "SMS Note: {$smsError}. Verification code: {$otp}" : "Verification code: {$otp}"),
            'expires_at' => $expiresAt->toIso8601String(),
        ]);
    }

    /**
     * 5. Verify Mobile OTP & login or create user
     */
    public function verifyMobileOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'otp'   => 'required|numeric',
        ]);

        $rawPhone = preg_replace('/[^0-9]/', '', $request->phone);
        $cleanPhone = strlen($rawPhone) > 10 ? substr($rawPhone, -10) : $rawPhone;
        $enteredOtp = (string)$request->otp;

        // 1. Check in DB otps table first
        $validOtpRecord = null;
        try {
            $validOtpRecord = Otp::where('identifier', $cleanPhone)
                ->where('otp', $enteredOtp)
                ->where('expires_at', '>', now())
                ->whereNull('verified_at')
                ->latest()
                ->first();
        } catch (\Throwable $e) {
            Log::warning("DB check for Mobile Otp failed: " . $e->getMessage());
        }

        // 2. Fallback check in Cache
        $cachedOtp = Cache::get('otp_phone_' . $cleanPhone);

        // 3. Fallback check in User table
        $user = User::where('phone', $cleanPhone)->orWhere('phone', '+91' . $cleanPhone)->first();
        $userOtpMatches = ($user && $user->otp === $enteredOtp && $user->otp_expires_at && $user->otp_expires_at->isFuture());

        if (!$validOtpRecord && (!$cachedOtp || (string)$cachedOtp !== $enteredOtp) && !$userOtpMatches) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired mobile OTP code.'
            ], 422);
        }

        if ($validOtpRecord) {
            $validOtpRecord->update(['verified_at' => now()]);
        }
        Cache::forget('otp_phone_' . $cleanPhone);

        // Find or create user with this phone
        if (!$user) {
            $userId = 'SW' . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
            $user = User::create([
                'name'     => 'Customer ' . substr($cleanPhone, -4),
                'username' => 'user_' . $cleanPhone,
                'user_id'  => $userId,
                'phone'    => '+91' . $cleanPhone,
                'email'    => 'user_' . $cleanPhone . '@swiftshopiy.com',
                'password' => Hash::make(Str::random(16)),
                'role'     => 'Customer',
            ]);
        } else {
            try {
                $user->update(['otp' => null, 'otp_expires_at' => null]);
            } catch (\Throwable $e) {
                // Ignore
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Mobile login successful.',
            'token'   => $token,
            'user'    => [
                'id'       => $user->id,
                'username' => $user->username,
                'user_id'  => $user->user_id,
                'name'     => $user->name,
                'email'    => $user->email,
                'phone'    => $user->phone,
                'role'     => $user->role ?? 'Customer',
            ]
        ]);
    }

    /**
     * Dispatch OTP email to the entered address.
     * Tries:
     * 1. Resend HTTP API (port 443 HTTPS - works on Render) if RESEND_API_KEY is present
     * 2. Brevo HTTP API (port 443 HTTPS - works on Render) if BREVO_API_KEY is present
     * 3. Laravel Mail / SMTP
     */
    private function dispatchOtpEmail(string $email, string $otp, string $name): array
    {
        // 1. Resend HTTP API (works seamlessly on Render)
        $resendKey = env('RESEND_API_KEY');
        if ($resendKey) {
            try {
                $fromEmail = env('MAIL_FROM_ADDRESS') ?: 'onboarding@resend.dev';
                $fromName = env('MAIL_FROM_NAME') ?: 'SwiftShopiy';
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $resendKey,
                    'Content-Type'  => 'application/json',
                ])->post('https://api.resend.com/emails', [
                    'from'    => "{$fromName} <{$fromEmail}>",
                    'to'      => [$email],
                    'subject' => "{$otp} is your verification code for SwiftShopiy",
                    'html'    => view('emails.otp', ['otp' => $otp, 'name' => $name])->render(),
                ]);

                if ($response->successful()) {
                    Log::info("OTP email sent via Resend API to {$email}");
                    return ['sent' => true, 'error' => null];
                } else {
                    Log::warning("Resend API failed: " . $response->body());
                }
            } catch (\Throwable $e) {
                Log::warning("Resend API connection error: " . $e->getMessage());
            }
        }

        // 2. Brevo HTTP API (works seamlessly on Render)
        $brevoKey = env('BREVO_API_KEY');
        if ($brevoKey) {
            try {
                $response = Http::withHeaders([
                    'api-key'      => $brevoKey,
                    'Content-Type' => 'application/json',
                ])->post('https://api.brevo.com/v3/smtp/email', [
                    'sender'      => [
                        'name'  => config('mail.from.name', 'SwiftShopiy'),
                        'email' => config('mail.from.address', 'naiduvamsi489@gmail.com')
                    ],
                    'to'          => [['email' => $email, 'name' => $name]],
                    'subject'     => "{$otp} is your verification code for SwiftShopiy",
                    'htmlContent' => view('emails.otp', ['otp' => $otp, 'name' => $name])->render(),
                ]);

                if ($response->successful()) {
                    Log::info("OTP email sent via Brevo API to {$email}");
                    return ['sent' => true, 'error' => null];
                } else {
                    Log::warning("Brevo API failed: " . $response->body());
                }
            } catch (\Throwable $e) {
                Log::warning("Brevo API connection error: " . $e->getMessage());
            }
        }

        // 3. Fallback to Laravel Mail (SMTP)
        try {
            Mail::to($email)->send(new OtpVerificationMail($otp, $name));
            Log::info("OTP email sent via SMTP to {$email}");
            return ['sent' => true, 'error' => null];
        } catch (\Throwable $e) {
            Log::warning("SMTP mail failed to {$email}: " . $e->getMessage());
            return ['sent' => false, 'error' => $e->getMessage()];
        }
    }
}