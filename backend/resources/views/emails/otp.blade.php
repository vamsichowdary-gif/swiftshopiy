<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; padding: 40px 15px;">
        <tr>
            <td align="center">
                
                <!-- Main Container Card -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05); overflow: hidden; text-align: left;">
                    <tr>
                        <td style="padding: 36px 36px 32px 36px;">
                            
                            <!-- Header: Brand & Tag -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
                                <tr>
                                    <td align="left" style="vertical-align: middle;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                            <tr>
                                                <td style="vertical-align: middle; padding-right: 10px;">
                                                    <div style="width: 32px; height: 32px; background: linear-gradient(135deg, #4f46e5 0%, #302ac2 100%); border-radius: 8px; text-align: center; line-height: 32px; color: #ffffff; font-weight: 800; font-size: 16px;">
                                                        S
                                                    </div>
                                                </td>
                                                <td style="vertical-align: middle;">
                                                    <span style="font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.3px;">SwiftShopiy</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td align="right" style="vertical-align: middle;">
                                        <span style="font-size: 12px; font-weight: 600; color: #64748b; letter-spacing: 0.2px;">Account verification</span>
                                    </td>
                                </tr>
                            </table>

                            <!-- Greeting -->
                            <p style="margin: 0 0 12px 0; font-size: 15px; color: #334155; font-weight: 500;">
                                Hi {{ $name ?? 'there' }},
                            </p>

                            <!-- Heading -->
                            <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; line-height: 1.25;">
                                Verify your email
                            </h1>

                            <!-- Intro Text -->
                            <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569; line-height: 1.6;">
                                Welcome to SwiftShopiy. Let's make sure this email belongs to you. Use the code below to finish setting up your account.
                            </p>

                            <!-- Dashed OTP Code Card -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 0 0 24px 0;">
                                <tr>
                                    <td align="center" style="border: 2px dashed #4f46e5; border-radius: 12px; background-color: #f8faff; padding: 24px 16px;">
                                        
                                        <!-- Code Label Pill -->
                                        <div style="display: inline-block; padding: 4px 12px; background-color: #e0e7ff; color: #4338ca; border-radius: 6px; font-size: 11px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 14px;">
                                            YOUR VERIFICATION CODE
                                        </div>

                                        <!-- Big 6-digit Code (formatted as 3 digits + space + 3 digits) -->
                                        <div style="font-size: 40px; font-weight: 800; color: #1e1b4b; letter-spacing: 8px; font-family: 'Courier New', Courier, monospace; margin-bottom: 12px; line-height: 1;">
                                            @php
                                                $cleanOtp = (string) $otp;
                                                $formattedOtp = strlen($cleanOtp) === 6 ? substr($cleanOtp, 0, 3) . ' ' . substr($cleanOtp, 3, 3) : $cleanOtp;
                                            @endphp
                                            {{ $formattedOtp }}
                                        </div>

                                        <!-- Expiry Notice -->
                                        <div style="font-size: 12px; color: #64748b; font-weight: 500;">
                                            &#x23F1; Expires in 10 minutes
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <!-- Return to App Instruction -->
                            <p style="margin: 0 0 24px 0; font-size: 13px; color: #475569; line-height: 1.5;">
                                Return to the SwiftShopiy app and enter this code on the email verification screen to continue.
                            </p>

                            <!-- Security Warning Box -->
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 14px 16px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                            <tr>
                                                <td style="vertical-align: top; padding-right: 12px; font-size: 16px; line-height: 1;">
                                                    &#x1F6E1;&#xFE0F;
                                                </td>
                                                <td style="vertical-align: top;">
                                                    <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #0f172a;">
                                                        Keep this code to yourself
                                                    </p>
                                                    <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                                                        Never share this code with anyone. SwiftShopiy will never ask for it. If you didn't request this email, you can safely ignore it.
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Help Section -->
                            <div style="border-top: 1px solid #f1f5f9; padding-top: 18px; margin-top: 8px;">
                                <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 700; color: #0f172a;">
                                    We're here to help
                                </p>
                                <p style="margin: 0; font-size: 12px; color: #64748b;">
                                    Questions? Contact <a href="mailto:support@swiftshopiy.com" style="color: #4f46e5; text-decoration: none; font-weight: 600;">support@swiftshopiy.com</a>
                                </p>
                            </div>

                        </td>
                    </tr>
                </table>

                <!-- Footer -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 520px; text-align: center; margin-top: 24px;">
                    <tr>
                        <td style="font-size: 11px; color: #94a3b8; line-height: 1.6;">
                            <p style="margin: 0 0 4px 0;">SwiftShopiy - A safer space for your online shopping.</p>
                            <p style="margin: 0 0 4px 0;">&copy; {{ date('Y') }} SwiftShopiy Technologies. All rights reserved.</p>
                            <p style="margin: 0;">This is an automated email. Please don't reply.</p>
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>

</body>
</html>