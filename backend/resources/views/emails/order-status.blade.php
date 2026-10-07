<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Order Status Update</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
    
    <div style="border-bottom: 2px solid #f0f0f0; padding-bottom: 12px; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #111;">SwiftShopiy</h2>
    </div>

    <h3>Hi {{ $customerName }},</h3>

    @if($status === 'Placed')
        <p>Thank you for shopping with us! Your order <strong>#{{ $orderId }}</strong> has been placed successfully and is being prepared.</p>
    @elseif($status === 'Shipped')
        <p>Great news! Your order <strong>#{{ $orderId }}</strong> has shipped and is on its way to your delivery address.</p>
        @if($trackingLink)
            <p>
                <a href="{{ $trackingLink }}" style="display: inline-block; padding: 10px 18px; background: #000; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold;">
                    Track Shipment
                </a>
            </p>
        @endif
    @elseif($status === 'Delivered')
        <p>Your package for order <strong>#{{ $orderId }}</strong> has been delivered. We hope you enjoy your purchase!</p>
    @elseif($status === 'Cancelled')
        <p>Your order <strong>#{{ $orderId }}</strong> has been cancelled. If payment was completed, your refund is being processed according to our refund timeline.</p>
    @endif

    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Order ID:</strong> #{{ $orderId }}</p>
        <p style="margin: 0 0 8px 0;"><strong>Current Status:</strong> <span style="color: #0070f3; font-weight: bold;">{{ $status }}</span></p>
        @if($totalAmount)
            <p style="margin: 0;"><strong>Total:</strong> {{ $totalAmount }}</p>
        @endif
    </div>

    @if(!empty($items))
        <h4>Items Ordered:</h4>
        <ul style="padding-left: 20px;">
            @foreach($items as $item)
                <li>{{ $item['name'] ?? ($item['title'] ?? 'Product') }} &times; {{ $item['quantity'] ?? ($item['qty'] ?? 1) }}</li>
            @endforeach
        </ul>
    @endif

    <p style="margin-top: 30px; font-size: 13px; color: #777;">
        Need help? Contact support or visit your account dashboard at <a href="https://swiftshopiy.vercel.app">swiftshopiy.vercel.app</a>.
    </p>
</body>
</html>
