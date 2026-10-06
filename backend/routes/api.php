<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\SupportController;
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
    Route::get('/user/support-tickets', [SupportController::class, 'index']);
    Route::post('/user/support-tickets', [SupportController::class, 'store']);

    // Admin-Only Routes
    Route::middleware(EnsureAdminUser::class)->prefix('admin')->name('admin.')->group(function () {
        Route::get('/overview', [AdminController::class, 'overview'])->name('overview');
        Route::get('/orders', [AdminController::class, 'orders'])->name('orders');
        Route::patch('/orders/{order}/status', [AdminController::class, 'updateOrderStatus'])->name('orders.updateStatus');
        Route::get('/users', [AdminController::class, 'users'])->name('users');
        Route::get('/support-tickets', [SupportController::class, 'adminIndex'])->name('support-tickets');
        Route::patch('/support-tickets/{ticket}', [SupportController::class, 'update'])->name('support-tickets.update');

        // Admin Product Management
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');
    });

    // Alias routes without prefix for product operations
    Route::middleware(EnsureAdminUser::class)->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
    });
});
