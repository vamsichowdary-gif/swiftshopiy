<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Models\User;
use App\Mail\OtpVerificationMail;
use App\Mail\WelcomeMail;

class AuthOtpController extends Controller
{
    /**
     * 1. Send 6-digit OTP to user's email
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
        $name = $request->input('name');

        // If logging in via OTP, ensure user exists
        if ($type === 'login') {
            $user = User::whereRaw('LOWER(email) = ?', [$email])->first();
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'No account registered with this email address. Please create an account.'
                ], 404);
            }
            if (!$name) {
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

        // Store OTP in cache for 10 minutes
        Cache::put('otp_' . $email, $otp, now()->addMinutes(10));

        // Dispatch OTP email
        try {
            Mail::to($email)->send(new OtpVerificationMail($otp, $name));
        } catch (\Throwable $e) {
            Log::error("Failed to send OTP email to {$email}: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Could not send verification email. Please check your email configuration.'
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'OTP sent successfully to your email.'
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
            'password' => 'required|string|min:6',
            'otp'      => 'required|numeric',
        ]);

        $email = strtolower(trim($request->email));
        $cachedOtp = Cache::get('otp_' . $email);

        if (!$cachedOtp || (string)$cachedOtp !== (string)$request->otp) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP code. Please request a new one.'
            ], 422);
        }

        // Generate unique username if not provided
        $username = $request->username ? strtolower(trim($request->username)) : null;
        if (!$username || User::where('username', $username)->exists()) {
            $base = Str::slug(explode('@', $email)[0]);
            $username = $base . rand(100, 999);
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
            'password' => Hash::make($request->password),
            'role'     => 'Customer',
        ]);

        // Clear used OTP
        Cache::forget('otp_' . $email);

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
            'message' => 'Account registered successfully! Welcome email sent.',
            'token'   => $token,
            'user'    => [
                'id'       => $user->id,
                'username' => $user->username,
                'user_id'  => $user->user_id,
                'name'     => $user->name,
                'email'    => $user->email,
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
        $cachedOtp = Cache::get('otp_' . $email);

        if (!$cachedOtp || (string)$cachedOtp !== (string)$request->otp) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP code.'
            ], 422);
        }

        $user = User::whereRaw('LOWER(email) = ?', [$email])->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No user account found with this email.'
            ], 404);
        }

        Cache::forget('otp_' . $email);

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
                'role'     => $user->role ?? 'Customer',
            ]
        ]);
    }
}