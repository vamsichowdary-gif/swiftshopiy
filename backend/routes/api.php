<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Middleware\EnsureAdminUser;
use App\Http\Controllers\OrderController;

// Public Authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public Product List
Route::get('/products', [ProductController::class, 'index']);

Route::post('/checkout', [OrderController::class, 'store']);

// Protected User Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Admin Routes Protected by EnsureAdminUser
    Route::middleware(EnsureAdminUser::class)->group(function () {
        Route::get('/admin/overview', [AdminController::class, 'overview']);
        Route::get('/admin/orders', [AdminController::class, 'orders']);
        Route::patch('/admin/orders/{order}/status', [AdminController::class, 'updateOrderStatus']);
        Route::get('/admin/users', [AdminController::class, 'users']);
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    });
});