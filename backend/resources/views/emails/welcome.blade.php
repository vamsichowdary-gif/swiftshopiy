<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Welcome to SwiftShopiy</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
    <h2 style="color: #111;">Welcome to SwiftShopiy, {{ $name }}!</h2>
    <p>Thank you for creating an account with us. We are thrilled to have you onboard.</p>
    
    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Account Details:</strong></p>
        <p style="margin: 0 0 5px 0;"><strong>Name:</strong> {{ $name }}</p>
        <p style="margin: 0;"><strong>Registered Email:</strong> {{ $email }}</p>
    </div>

    <p>You can now browse collections, place orders, and track your shipments directly from your portal.</p>

    <div style="margin: 30px 0;">
        <a href="https://swiftshopiy.vercel.app/login" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
            Visit Store &amp; Login
        </a>
    </div>

    <p style="font-size: 12px; color: #777;">If you did not register for this account, please ignore this email.</p>
</body>
</html>