<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated =$request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:50|alpha_dash|unique:users,username',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        // Generate a 6-digit padded code (e.g., SW104928)
        do {
            $user_id = 'SW' . str_pad(mt_rand(1, 999999), 6, '0', STR_PAD_LEFT);
        } while (User::where('user_id', $user_id)->exists());

        $user = User::create([
            'name' => $validated['name'],
            'username' => strtolower($validated['username']),
            'user_id' => $user_id,
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'Customer',
        ]);

        $token =$user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'user_id' => $user->user_id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ?? 'Customer',
            ],
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'identifier' => 'required_without:email|string|max:255',
            'email' => 'required_without:identifier|email|max:255',
            'password' => 'required|string',
        ]);

        $identifier = strtolower($validated['identifier'] ?? $validated['email']);
        $user = User::whereRaw('LOWER(email) = ?', [$identifier])
            ->orWhereRaw('LOWER(username) = ?', [$identifier])
            ->first();

        if (!$user || !Hash::check($request->password,$user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        $token =$user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => [
                'id' => $user->id,
                'username' => $user->username,
                'user_id' => $user->user_id, // Returned to frontend for navbar & dashboard
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role ?? 'Customer',
            ],
            'token' => $token,
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
