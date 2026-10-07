<?php

use Illuminate\Support\Facades\Route;
use App\Mail\WelcomeMail;
use Illuminate\Support\Facades\Mail;
use App\Http\Controllers\AuthOtpController;

Route::get('/', function () {
    return view('welcome');
});

// Fallback image serving route with universal CORS headers
Route::get('/Products/{filename}', function ($filename) {
    $path = public_path('Products/' . $filename);
    if (!file_exists($path)) {
        return response()->json(['error' => 'Product image not found on server'], 404);
    }
    $mime = mime_content_type($path) ?: 'image/jpeg';
    return response()->file($path, [
        'Content-Type' => $mime,
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'GET, OPTIONS',
    ]);
})->where('filename', '.*');

// Safe test route (only sends when you visit http://127.0.0.1:8000/test-mail)
Route::get('/test-mail', function () {
    Mail::to('naiduvamsi489@gmail.com')->send(new WelcomeMail('Vamsi', 'naiduvamsi489@gmail.com'));
    return response()->json(['message' => 'Test email sent successfully!']);
});



Route::post('/send-otp', [AuthOtpController::class, 'sendOtp']);
Route::post('/register', [AuthOtpController::class, 'registerWithOtp']);
Route::post('/login-otp', [AuthOtpController::class, 'verifyLoginOtp']);