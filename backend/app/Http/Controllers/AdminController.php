<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use App\Mail\OrderStatusMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{
    public function overview()
    {
        $statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        $counts = collect($statuses)->mapWithKeys(fn ($status) => [strtolower($status) => Order::where('status', $status)->count()]);

        return response()->json([
            'total_orders' => Order::count(),
            'total_revenue' => Order::where('status', '!=', 'Cancelled')->sum('total'),
            'total_users' => User::whereRaw('LOWER(role) = ?', ['customer'])->count(),
            'status_counts' => $counts,
            'recent_orders' => Order::with('user:id,user_id,name,email')->latest()->limit(8)->get(),
        ]);
    }

    public function orders(Request $request)
    {
        $query = Order::with('user:id,user_id,name,email')->latest();
        if ($request->filled('status') && $request->status !== 'All') {
            $query->where('status', $request->status);
        }
        return response()->json($query->get());
    }

    public function updateOrderStatus(Request $request, Order $order)
    {
        $validated = $request->validate([
            'status' => 'required|in:Pending,Processing,Shipped,Delivered,Cancelled',
            'tracking_link' => 'nullable|string',
        ]);

        $oldStatus = $order->status;
        $order->update(['status' => $validated['status']]);
        $newStatus = $validated['status'];

        if (!empty($order->customer_email) && strtolower($oldStatus) !== strtolower($newStatus)) {
            try {
                if ($newStatus === 'Shipped') {
                    $trackingLink = $validated['tracking_link'] ?? ($order->tracking_url ?? null);
                    Mail::to($order->customer_email)->send(new OrderStatusMail(
                        customerName: $order->customer_name,
                        orderId: (string) $order->id,
                        status: 'Shipped',
                        trackingLink: $trackingLink
                    ));
                } elseif ($newStatus === 'Delivered') {
                    Mail::to($order->customer_email)->send(new OrderStatusMail(
                        customerName: $order->customer_name,
                        orderId: (string) $order->id,
                        status: 'Delivered'
                    ));
                } elseif ($newStatus === 'Cancelled') {
                    Mail::to($order->customer_email)->send(new OrderStatusMail(
                        customerName: $order->customer_name,
                        orderId: (string) $order->id,
                        status: 'Cancelled'
                    ));
                }
            } catch (\Throwable $e) {
                Log::warning("Failed to send order status update email for #{$order->id} ({$newStatus}): " . $e->getMessage());
            }
        }

        return response()->json($order);
    }

    public function users()
    {
        return response()->json(User::query()->select('id', 'user_id', 'username', 'name', 'email', 'role', 'created_at')->withCount('orders')->latest()->get());
    }
}
