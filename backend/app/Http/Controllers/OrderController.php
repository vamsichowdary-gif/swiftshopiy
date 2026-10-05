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

        $userId = $request->user('sanctum')?->id ?? auth('sanctum')->id();

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
        $orders = Order::where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);

        return response()->json($orders);
    }
}