<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function overview()
    {
        $statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        $counts = collect($statuses)->mapWithKeys(fn ($status) => [strtolower($status) => Order::where('status', $status)->count()]);

        return response()->json([
            'total_orders' => Order::count(),
            'total_revenue' => Order::where('status', '!=', 'Cancelled')->sum('total'),
            'total_users' => User::where('role', 'Customer')->count(),
            'status_counts' => $counts,
            'recent_orders' => Order::latest()->limit(8)->get(),
        ]);
    }

    public function orders(Request $request)
    {
        $query = Order::latest();
        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }
        return response()->json($query->get());
    }

    public function updateOrderStatus(Request $request, Order $order)
    {
        $validated = $request->validate(['status' => 'required|in:Pending,Processing,Shipped,Delivered,Cancelled']);
        $order->update($validated);
        return response()->json($order);
    }

    public function users()
    {
        return response()->json(User::query()->select('id', 'name', 'email', 'role', 'created_at')->latest()->get());
    }
}
