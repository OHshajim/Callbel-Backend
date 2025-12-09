const randomstring = require("randomstring");
const User = require("../../../models/User");
const sendBrevoCampaign = require("../../../utils/brevoEmail");

const sendOtp = async (req, res) => {
  let { email } = req.body;

  if (!email) {
    return res.status(400).json({ status: "error", email: "email required" });
  }

  let user;

  try {
    user = await User.findOne({ email });
  } catch (e) {
    return res
      .status(404)
      .json({ status: "error", email: "error while reading database" });
  }

  if (!user) {
    return res
      .status(404)
      .json({ status: "error", email: "no user matches this email address" });
  }

  const code = randomstring.generate({ charset: "numeric", length: 6 });

  await sendBrevoCampaign({
    subject: `${process.env.WEBSITE_NAME} - Password Reset Code`,
    senderName: process.env.WEBSITE_NAME,
    senderEmail: process.env.BREVO_EMAIL,
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - CallBell</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', Arial, sans-serif;
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            margin: 0;
            padding: 40px 20px;
            min-height: 100vh;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(220, 38, 38, 0.1);
            border: 1px solid #fecaca;
        }
        
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%);
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        
        .logo {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 64px;
            height: 64px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            margin-bottom: 20px;
        }
        
        .logo-icon {
            color: white;
            width: 32px;
            height: 32px;
        }
        
        .header h1 {
            color: white;
            font-size: 28px;
            font-weight: 700;
            margin: 0;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 20px;
            color: #1f2937;
            font-weight: 600;
            margin-bottom: 16px;
        }
        
        .message {
            font-size: 16px;
            line-height: 1.6;
            color: #4b5563;
            margin-bottom: 32px;
        }
        
        .code-container {
            background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
            border: 2px dashed #dc2626;
            border-radius: 16px;
            padding: 32px;
            text-align: center;
            margin: 32px 0;
        }
        
        .verification-code {
            font-family: 'Inter', monospace;
            font-size: 40px;
            font-weight: 700;
            letter-spacing: 8px;
            color: #dc2626;
            display: inline-block;
            padding: 0 20px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(220, 38, 38, 0.1);
        }
        
        .timer {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: #fef2f2;
            padding: 8px 16px;
            border-radius: 20px;
            margin-top: 20px;
            font-size: 14px;
            color: #dc2626;
            font-weight: 600;
        }
        
        .timer-icon {
            width: 16px;
            height: 16px;
        }
        
        .instructions {
            background: #f9fafb;
            border-radius: 12px;
            padding: 24px;
            margin: 32px 0;
        }
        
        .instructions h3 {
            font-size: 16px;
            color: #1f2937;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .instructions ol {
            padding-left: 20px;
            color: #4b5563;
        }
        
        .instructions li {
            margin-bottom: 12px;
            line-height: 1.5;
        }
        
        .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            border-radius: 8px;
            margin: 24px 0;
        }
        
        .warning p {
            color: #92400e;
            font-size: 14px;
            margin: 0;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .warning-icon {
            width: 20px;
            height: 20px;
            flex-shrink: 0;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 24px 0;
            box-shadow: 0 4px 20px rgba(220, 38, 38, 0.2);
            transition: all 0.3s ease;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 30px rgba(220, 38, 38, 0.3);
        }
        
        .footer {
            border-top: 1px solid #e5e7eb;
            padding: 30px;
            text-align: center;
            background: #f9fafb;
        }
        
        .social-links {
            display: flex;
            justify-content: center;
            gap: 16px;
            margin: 20px 0;
        }
        
        .social-icon {
            width: 24px;
            height: 24px;
            color: #6b7280;
            transition: color 0.3s ease;
        }
        
        .social-icon:hover {
            color: #dc2626;
        }
        
        .copyright {
            font-size: 12px;
            color: #9ca3af;
            margin-top: 20px;
        }
        
        .support {
            font-size: 14px;
            color: #6b7280;
            margin: 16px 0;
        }
        
        .support a {
            color: #dc2626;
            text-decoration: none;
            font-weight: 600;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 20px 10px;
            }
            
            .email-container {
                border-radius: 16px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .verification-code {
                font-size: 32px;
                letter-spacing: 4px;
                padding: 0 16px;
            }
            
            .code-container {
                padding: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">
                <svg class="logo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            </div>
            <h1>Reset Your Password</h1>
        </div>

        <!-- Content -->
        <div class="content">
            <h2 class="greeting">Hi ${user.name},</h2>
            
            <p class="message">
                We received a request to reset your password for your CallBell account. 
                Use the verification code below to complete the password reset process.
            </p>

            <!-- Verification Code -->
            <div class="code-container">
                <div class="verification-code">${code}</div>
                <div class="timer">
                    <svg class="timer-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Valid for 10 minutes
                </div>
            </div>

            <!-- Instructions -->
            <div class="instructions">
                <h3>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How to reset your password
                </h3>
                <ol>
                    <li>Go to the password reset page on CallBell</li>
                    <li>Enter the verification code above</li>
                    <li>Create a new strong password</li>
                    <li>Sign in with your new credentials</li>
                </ol>
            </div>

            <!-- Warning -->
            <div class="warning">
                <p>
                    <svg class="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.772 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    If you didn't request this password reset, please ignore this email or 
                    contact our support team immediately.
                </p>
            </div>

            <!-- CTA Button -->
            <div style="text-align: center;">
                <a href="${
                  process.env.WEBSITE_URL
                }/reset-password?code=${code}" class="cta-button">
                    Reset Password Now
                </a>
            </div>

            <!-- Support Info -->
            <div class="support">
                Need help? Contact our support team at 
                <a href="mailto:support@callbell.com">support@callbell.com</a>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <!-- Social Links -->
            <div class="social-links">
                <a href="#">
                    <svg class="social-icon" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                </a>
                <a href="#">
                    <svg class="social-icon" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                </a>
                <a href="#">
                    <svg class="social-icon" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                </a>
            </div>

            <!-- Copyright -->
            <div class="copyright">
                © ${new Date().getFullYear()} CallBell. All rights reserved.
                <br>
                <small>This email was sent to ${user.email}</small>
            </div>
        </div>
    </div>
</body>
</html>
`,
    to: email,
  });

  await User.findOneAndUpdate({ email }, { $set: { otp: code } });
  res.status(200).json({ success: true, message: "email queued" });
};

module.exports = sendOtp;
