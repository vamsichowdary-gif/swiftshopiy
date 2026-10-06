<?php

use Illuminate\Support\Facades\Route;

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
