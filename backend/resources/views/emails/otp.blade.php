<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Your Verification Code</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 30px; margin: 0;">
    <div style="max-width: 480px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e0e0e0; text-align: center;">
        <h2 style="color: #222; margin-top: 0;">Verify Your Email</h2>
        <p style="color: #555; font-size: 14px; line-height: 1.5;">
            Use the One-Time Password (OTP) below to complete your verification for SwiftShopiy:
        </p>

        <div style="margin: 25px 0; background: #f0f4ff; padding: 15px 0; border-radius: 6px;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1a73e8;">{{ $otp }}</span>
        </div>

        <p style="color: #888; font-size: 13px; line-height: 1.4; margin-bottom: 0;">
            This OTP will expire in <strong>5 minutes</strong>. If you did not request this code, you can safely ignore this email.
        </p>
    </div>
</body>
</html>