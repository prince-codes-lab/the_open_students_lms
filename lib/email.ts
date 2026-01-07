// Email sending utilities using Nodemailer
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      }
    : undefined,
})

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  const { to, subject, html } = options

  try {
    // Validate SMTP configuration
    const missing = []
    if (!process.env.SMTP_HOST) missing.push("SMTP_HOST")
    if (!process.env.SMTP_PORT) missing.push("SMTP_PORT")
    if (!process.env.SMTP_USER) missing.push("SMTP_USER")
    if (!process.env.SMTP_PASSWORD) missing.push("SMTP_PASSWORD")

    if (missing.length > 0) {
      const msg = `[open] SMTP not configured or missing env: ${missing.join(", ")}`
      console.warn(msg)
      console.log("[open] Email would be sent to:", to)
      console.log("[open] Subject:", subject)
      return { success: false, error: msg }
    }

    // Verify transporter before sending
    await transporter.verify()
    console.log("[open] SMTP connection verified")

    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@theopenstudents.com",
      to,
      subject,
      html,
      replyTo: "support@theopenstudents.com",
    })

    console.log("[open] Email sent successfully:", result.messageId)
    return { success: true }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Failed to send email"
    console.error("[open] Email sending error:", errorMsg)
    console.error("[open] Error details:", error)
    // Return failure so callers can surface the problem
    return { success: false, error: errorMsg }
  }
}

export function generateWelcomeEmail(
  fullName: string,
  confirmationLink: string,
  to: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333;
            background-color: #f4f4f4;
          }
          .wrapper { background-color: #f4f4f4; padding: 20px; }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #4E0942 0%, #6b0c5c 100%);
            color: white; 
            padding: 40px 20px; 
            text-align: center; 
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
            letter-spacing: 1px;
          }
          .tagline {
            font-size: 14px;
            opacity: 0.9;
            margin-top: 5px;
          }
          .content { 
            padding: 40px 30px; 
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            color: #4E0942;
          }
          .intro-text {
            margin-bottom: 20px;
            color: #666;
          }
          .cta-section {
            text-align: center;
            margin: 30px 0;
          }
          .button { 
            display: inline-block; 
            padding: 14px 40px; 
            background-color: #FEEB00; 
            color: #4E0942; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: 700;
            font-size: 16px;
            border: 2px solid #FEEB00;
            transition: all 0.3s ease;
          }
          .button:hover {
            background-color: #fff59d;
            border-color: #FEEB00;
          }
          .link-text {
            margin-top: 15px;
            font-size: 12px;
            color: #999;
          }
          .link-text a {
            color: #4E0942;
            text-decoration: none;
            word-break: break-all;
            background-color: #f9f9f9;
            padding: 8px 12px;
            border-radius: 4px;
            display: block;
            margin-top: 8px;
            font-family: 'Courier New', monospace;
            font-size: 11px;
          }
          .features {
            background-color: #f9f9f9;
            border-left: 4px solid #FEEB00;
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .features h3 {
            color: #4E0942;
            margin-bottom: 12px;
            font-size: 16px;
          }
          .features ul {
            list-style: none;
            padding: 0;
          }
          .features li {
            padding: 6px 0;
            color: #666;
            font-size: 14px;
            padding-left: 25px;
            position: relative;
          }
          .features li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #FEEB00;
            font-weight: bold;
          }
          .footer { 
            background-color: #f4f4f4;
            padding: 30px; 
            text-align: center;
            border-top: 1px solid #e0e0e0;
            font-size: 12px; 
            color: #999;
          }
          .footer-links a {
            color: #4E0942;
            text-decoration: none;
            margin: 0 10px;
          }
          .security-note {
            background-color: #e3f2fd;
            border-left: 4px solid #2196F3;
            padding: 12px 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 13px;
            color: #1565c0;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="logo">🎓 The OPEN Students</div>
              <div class="tagline">Learning Beyond the Classroom</div>
            </div>

            <!-- Content -->
            <div class="content">
              <div class="greeting">Welcome, ${fullName}! 👋</div>
              
              <p class="intro-text">
                We're thrilled to have you join The OPEN Students community! Your account has been successfully created, and we can't wait for you to start your learning journey with us.
              </p>

              <!-- CTA Section -->
              <div class="cta-section">
                <p style="margin-bottom: 15px; color: #666;">Please confirm your email address to get started:</p>
                <a href="${confirmationLink}" class="button">Confirm My Email</a>
                <div class="link-text">
                  If the button doesn't work, copy and paste this link:<br>
                  <a href="${confirmationLink}">${confirmationLink}</a>
                </div>
              </div>

              <!-- Features -->
              <div class="features">
                <h3>What You Can Do Now:</h3>
                <ul>
                  <li>Access all our courses and learning programs</li>
                  <li>Track your progress and earn certificates</li>
                  <li>Join our educational tours and field trips</li>
                  <li>Connect with other learners in our community</li>
                  <li>Download learning resources and materials</li>
                </ul>
              </div>

              <!-- Security Note -->
              <div class="security-note">
                <strong>Didn't create this account?</strong> You can safely ignore this email. If you have questions, contact us at support@theopenstudents.com
              </div>

              <p style="margin-top: 20px; color: #999; font-size: 14px;">
                Happy learning! 🚀<br>
                <strong>The OPEN Students Team</strong>
              </p>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p style="margin-bottom: 10px;">&copy; 2025 The OPEN Students. All rights reserved.</p>
              <div class="footer-links">
                <a href="https://theopenstudents.com">Website</a>
                <a href="mailto:support@theopenstudents.com">Support</a>
              </div>
              <p style="margin-top: 15px; font-size: 11px; color: #bbb;">
                This email was sent to ${to}. You can manage your preferences anytime.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}
export function generateVerificationEmail(
  fullName: string,
  verificationLink: string,
  to: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333;
            background-color: #f4f4f4;
          }
          .wrapper { background-color: #f4f4f4; padding: 20px; }
          .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header { 
            background: linear-gradient(135deg, #4E0942 0%, #6b0c5c 100%);
            color: white; 
            padding: 40px 20px; 
            text-align: center; 
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
            letter-spacing: 1px;
          }
          .content { 
            padding: 40px 30px; 
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            color: #4E0942;
          }
          .intro-text {
            margin-bottom: 20px;
            color: #666;
          }
          .cta-section {
            text-align: center;
            margin: 30px 0;
          }
          .button { 
            display: inline-block; 
            padding: 14px 40px; 
            background-color: #FEEB00; 
            color: #4E0942; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: 700;
            font-size: 16px;
            border: 2px solid #FEEB00;
            transition: all 0.3s ease;
          }
          .button:hover {
            background-color: #fff59d;
            border-color: #FEEB00;
          }
          .link-text {
            margin-top: 15px;
            font-size: 12px;
            color: #999;
          }
          .link-text a {
            color: #4E0942;
            text-decoration: none;
            word-break: break-all;
            background-color: #f9f9f9;
            padding: 8px 12px;
            border-radius: 4px;
            display: block;
            margin-top: 8px;
            font-family: 'Courier New', monospace;
            font-size: 11px;
          }
          .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 12px 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 13px;
            color: #856404;
          }
          .footer { 
            background-color: #f4f4f4;
            padding: 30px; 
            text-align: center;
            border-top: 1px solid #e0e0e0;
            font-size: 12px; 
            color: #999;
          }
          .footer-links a {
            color: #4E0942;
            text-decoration: none;
            margin: 0 10px;
          }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <div class="header">
              <div class="logo">🎓 The OPEN Students</div>
            </div>

            <div class="content">
              <div class="greeting">Verify Your Email, ${fullName}! ✉️</div>
              
              <p class="intro-text">
                Thank you for signing up with The OPEN Students! We're excited to have you join our community. To complete your registration and access your account, please verify your email address.
              </p>

              <div class="cta-section">
                <p style="margin-bottom: 15px; color: #666;">Click the button below to verify your email:</p>
                <a href="${verificationLink}" class="button">Verify Email Address</a>
                <div class="link-text">
                  If the button doesn't work, copy and paste this link:<br>
                  <a href="${verificationLink}">${verificationLink}</a>
                </div>
              </div>

              <div class="warning">
                <strong>⏰ Important:</strong> This link will expire in 24 hours. If it expires, you'll need to request a new verification email.
              </div>

              <p style="margin-top: 20px; color: #999; font-size: 14px;">
                Once verified, you'll have full access to:<br>
                ✓ All courses and learning programs<br>
                ✓ Progress tracking and certificates<br>
                ✓ Community features<br>
                ✓ Exclusive educational tours<br>
              </p>
            </div>

            <div class="footer">
              <p style="margin-bottom: 10px;">&copy; 2025 The OPEN Students. All rights reserved.</p>
              <div class="footer-links">
                <a href="https://theopenstudents.com">Website</a>
                <a href="mailto:support@theopenstudents.com">Support</a>
              </div>
              <p style="margin-top: 15px; font-size: 11px; color: #bbb;">
                This email was sent to ${to}.
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `
}