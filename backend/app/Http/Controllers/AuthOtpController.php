<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
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
        ]);

        $email = $request->email;
        $otp = rand(100000, 999999);

        // Store OTP in cache for 5 minutes
        Cache::put('otp_' . $email, $otp, now()->addMinutes(5));

        // Dispatch OTP email
        Mail::to($email)->send(new OtpVerificationMail((string)$otp));

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
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'otp'      => 'required|numeric',
        ]);

        $cachedOtp = Cache::get('otp_' . $request->email);

        if (!$cachedOtp || $cachedOtp != $request->otp) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP.'
            ], 422);
        }

        // Create the user
        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Clear used OTP
        Cache::forget('otp_' . $request->email);

        // Send Welcome Letter
        Mail::to($user->email)->send(new WelcomeMail($user->name, $user->email));

        return response()->json([
            'success' => true,
            'message' => 'Account registered successfully! Welcome email sent.',
            'user'    => $user
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

        $cachedOtp = Cache::get('otp_' . $request->email);

        if (!$cachedOtp || $cachedOtp != $request->otp) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP.'
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found with this email.'
            ], 404);
        }

        Cache::forget('otp_' . $request->email);

        $token = method_exists($user, 'createToken')
            ? $user->createToken('auth_token')->plainTextToken
            : null;

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'token'   => $token,
            'user'    => $user
        ]);
    }
}