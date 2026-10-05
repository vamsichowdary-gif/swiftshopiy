<?php

use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// CORS headers
$allowed_origins = [
    'https://swiftshopiy.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
];

$http_origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($http_origin, $allowed_origins, true) || preg_match('/\.vercel\.app$/', $http_origin)) {
    header("Access-Control-Allow-Origin: $http_origin");
} else {
    header("Access-Control-Allow-Origin: https://swiftshopiy.vercel.app");
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, Accept, Origin");

// Handle preflight OPTIONS request
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
(require_once __DIR__.'/../bootstrap/app.php')
    ->handleRequest(Request::capture());