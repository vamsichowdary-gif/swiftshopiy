<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\OrderController;
use App\Http\Middleware\EnsureAdminUser;

// Public Authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public Product Catalog
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']); // Useful for frontend auth state

    // Authenticated Checkout
    Route::post('/checkout', [OrderController::class, 'store']);
    Route::get('/user/orders', [OrderController::class, 'userOrders']);

    // Admin-Only Routes
    Route::middleware(EnsureAdminUser::class)->prefix('admin')->name('admin.')->group(function () {
        Route::get('/overview', [AdminController::class, 'overview'])->name('overview');
        Route::get('/orders', [AdminController::class, 'orders'])->name('orders');
        Route::patch('/orders/{order}/status', [AdminController::class, 'updateOrderStatus'])->name('orders.updateStatus');
        Route::get('/users', [AdminController::class, 'users'])->name('users');

        // Admin Product Management
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
    });
});
