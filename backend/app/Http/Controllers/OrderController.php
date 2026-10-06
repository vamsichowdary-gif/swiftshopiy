<?php
namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'total' => 'required|numeric|min:0',
            'items' => 'required|array|min:1',
        ]);

        $userId = null;
        try {
            if ($request->bearerToken()) {
                $userId = auth('sanctum')->user()?->id;
            }
        } catch (\Throwable $e) {
            $userId = null;
        }

        if (!$userId && $request->filled('customer_email')) {
            $existingUser = \App\Models\User::whereRaw('LOWER(email) = ?', [strtolower($request->customer_email)])->first();
            if ($existingUser) {
                $userId = $existingUser->id;
            }
        }

        $order = Order::create([
            'user_id'        => $userId,
            'customer_name'  => $validated['customer_name'],
            'customer_email' => $validated['customer_email'],
            'total'          => $validated['total'],
            'status'         => 'Pending',
            'items'          => $validated['items'],
        ]);

        return response()->json([
            'message' => 'Order placed successfully',
            'order'   => $order,
        ], 201);
    }

    // Fetch user-specific orders for UserDashboard
    public function userOrders(Request $request)
    {
        $user = $request->user();
        $orders = Order::where(function ($query) use ($user) {
            $query->where('user_id', $user->id);
            if ($user->email) {
                $query->orWhereRaw('LOWER(customer_email) = ?', [strtolower($user->email)]);
            }
        })
        ->latest()
        ->paginate(15);

        return response()->json($orders);
    }
}