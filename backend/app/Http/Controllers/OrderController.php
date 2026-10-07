<?php
namespace App\Http\Controllers;

use App\Models\Order;
use App\Mail\OrderStatusMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

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

        // Send Order Placed Notification Email
        if (!empty($order->customer_email)) {
            try {
                $items = is_array($order->items) ? $order->items : (method_exists($order->items, 'toArray') ? $order->items->toArray() : (array) $order->items);
                Mail::to($order->customer_email)->send(new OrderStatusMail(
                    customerName: $order->customer_name,
                    orderId: (string) $order->id,
                    status: 'Placed',
                    items: $items,
                    totalAmount: '₹' . number_format((float) $order->total, 2)
                ));
            } catch (\Throwable $e) {
                Log::warning("Failed to send order placed email for order #{$order->id}: " . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Order placed successfully',
            'order'   => $order,
        ], 201);
    }

    // Cancel order
    public function cancel(Request $request, Order $order)
    {
        $user = $request->user();
        if ($order->user_id !== $user->id && strtolower($order->customer_email) !== strtolower($user->email)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if (in_array(strtolower($order->status), ['shipped', 'delivered', 'cancelled'])) {
            return response()->json(['message' => "Order cannot be cancelled in {$order->status} status."], 422);
        }

        $order->update(['status' => 'Cancelled']);

        if (!empty($order->customer_email)) {
            try {
                Mail::to($order->customer_email)->send(new OrderStatusMail(
                    customerName: $order->customer_name,
                    orderId: (string) $order->id,
                    status: 'Cancelled'
                ));
            } catch (\Throwable $e) {
                Log::warning("Failed to send order cancelled email for order #{$order->id}: " . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Order cancelled successfully',
            'order' => $order
        ]);
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