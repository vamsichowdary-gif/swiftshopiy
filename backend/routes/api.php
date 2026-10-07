<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\SupportController;
use App\Http\Controllers\FlashDealController;
use App\Http\Controllers\AuthOtpController;
use App\Http\Middleware\EnsureAdminUser;

// Public Authentication
Route::post('/send-otp', [AuthOtpController::class, 'sendOtp']);
Route::post('/register', [AuthOtpController::class, 'registerWithOtp']);
Route::post('/register-password', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/login-otp', [AuthOtpController::class, 'verifyLoginOtp']);
Route::post('/send-mobile-otp', [AuthOtpController::class, 'sendMobileOtp']);
Route::post('/login-mobile-otp', [AuthOtpController::class, 'verifyMobileOtp']);

// Public Product Catalog
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{product}', [ProductController::class, 'show']);

// Public Flash Deals & News Ticker
Route::get('/flash-deals', [FlashDealController::class, 'getPublic']);
Route::get('/news', [FlashDealController::class, 'getPublic']);

// Public / Fallback File Upload endpoint (also available under admin)
Route::post('/upload-images', [ProductController::class, 'uploadImages']);
Route::post('/products/bulk-import-public', [ProductController::class, 'bulkImport']);

// Public Checkout (resolves user if auth token present or email matches)
Route::post('/checkout', [OrderController::class, 'store']);

// Database migration runner (safe & idempotent)
Route::get('/run-migrations', function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        return response()->json([
            'success' => true,
            'output' => \Illuminate\Support\Facades\Artisan::output()
        ]);
    } catch (\Throwable $e) {
        return response()->json(['error' => $e->getMessage()], 500);
    }
});

// Protected Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    Route::get('/user/orders', [OrderController::class, 'userOrders']);
    Route::patch('/user/orders/{order}/cancel', [OrderController::class, 'cancel']);
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
        Route::post('/products/upload-images', [ProductController::class, 'uploadImages'])->name('products.upload-images');
        Route::post('/products/bulk-import', [ProductController::class, 'bulkImport'])->name('products.bulk-import');

        // Admin Flash Deals & News Ticker Management
        Route::get('/flash-deals', [FlashDealController::class, 'adminIndex'])->name('flash-deals.index');
        Route::post('/flash-deals', [FlashDealController::class, 'storeDeal'])->name('flash-deals.store');
        Route::patch('/flash-deals/{id}/toggle', [FlashDealController::class, 'toggleDeal'])->name('flash-deals.toggle');
        Route::delete('/flash-deals/{id}', [FlashDealController::class, 'destroyDeal'])->name('flash-deals.destroy');

        Route::post('/news', [FlashDealController::class, 'storeNews'])->name('news.store');
        Route::patch('/news/{id}/toggle', [FlashDealController::class, 'toggleNews'])->name('news.toggle');
        Route::delete('/news/{id}', [FlashDealController::class, 'destroyNews'])->name('news.destroy');
    });

    // Alias routes without prefix for product operations
    Route::middleware(EnsureAdminUser::class)->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{product}', [ProductController::class, 'update']);
        Route::delete('/products/{product}', [ProductController::class, 'destroy']);
        Route::post('/products/upload-images', [ProductController::class, 'uploadImages']);
        Route::post('/products/bulk-import', [ProductController::class, 'bulkImport']);
    });
});
