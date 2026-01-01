# Nodemailer Email Setup Guide

## Overview
The OPEN Students uses **Nodemailer** for sending branded, professional emails. Nodemailer is a flexible Node.js module for sending emails with support for any SMTP provider.

## Why Nodemailer?
- ✅ **Flexible**: Works with any SMTP provider (Gmail, SendGrid, AWS SES, custom servers)
- ✅ **Cost-effective**: Free with many providers' free tiers
- ✅ **Professional Branding**: Full control over email design and sender info
- ✅ **Reliable**: Widely used and battle-tested
- ✅ **Node.js Native**: No external dependencies beyond the library

## Setup Steps

### Step 1: Choose an SMTP Provider

**Option 1: Gmail (Free, Easy)**
- Free tier available
- Good for testing
- Requires "App Password" for security

**Option 2: SendGrid (Recommended for Production)**
- 100 free emails/day
- Better deliverability
- Professional support
- https://sendgrid.com

**Option 3: AWS SES**
- Very affordable
- Good for high volume
- https://aws.amazon.com/ses

**Option 4: Your Own SMTP Server**
- Full control
- Requires server setup

### Step 2: Get SMTP Credentials

**For Gmail:**
1. Enable 2-factor authentication on your Google account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Select Mail and Windows Computer (or your platform)
4. Generate app password
5. Copy the 16-character password

**For SendGrid:**
1. Sign up at https://sendgrid.com
2. Go to Settings → API Keys
3. Create a new API key
4. Copy the key

**For Other Providers:**
- Check their SMTP documentation for host, port, and credentials

### Step 3: Configure Environment Variables

Edit `.env.local` and add:

```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@theopenstudents.com
```

**For SendGrid:**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASSWORD=SG.your_sendgrid_key
SMTP_FROM=noreply@theopenstudents.com
```

**For AWS SES:**
```bash
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-ses-user
SMTP_PASSWORD=your-ses-password
SMTP_FROM=verified-sender@yourdomain.com
```

### Step 4: Test Email Delivery

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Create a test account at [http://localhost:3000/auth/sign-up](http://localhost:3000/auth/sign-up)

3. Check your email inbox for the welcome message

4. If not received:
   - Check spam/junk folder
   - Verify environment variables are correct
   - Check server logs for errors

## Email Configuration Details

### Default Settings
- **From Address**: Configured via `SMTP_FROM` environment variable
- **Reply-To**: support@theopenstudents.com
- **Port**: 587 (TLS) or 465 (SSL) - use 587 with SMTP_SECURE=false

### Emails Sent by System

#### 1. Welcome Email (On Signup)
- **When**: User creates account
- **To**: New user's email
- **Subject**: "Welcome to The OPEN Students - Confirm Your Email"
- **Contains**: Confirmation link, feature overview, security info
- **Template**: `lib/email.ts` → `generateWelcomeEmail()`

## Troubleshooting

### Email not arriving?

**Check 1: Verify SMTP Credentials**
```bash
# Test connection (from project root)
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

transporter.verify((err, success) => {
  if (err) console.error('Connection failed:', err);
  else console.log('SMTP connected successfully!');
});
"
```

**Check 2: View Server Logs**
- Check terminal output where dev server is running
- Look for `[open]` prefixed messages
- Error messages will be detailed

**Check 3: Common Issues**
- **Gmail**: Did you create an App Password (not regular password)?
- **SendGrid**: Is API key correct? Should start with `SG.`
- **Port**: Did you use 587 (TLS) not 465 (SSL)?
- **Secure flag**: Use `false` with port 587, `true` with port 465
- **Spam folder**: Check before assuming failure

### Environment variables not loading?

1. Restart dev server after adding `.env.local` changes
2. Make sure file is named `.env.local` (not `.env`)
3. Check no extra spaces around = signs
4. Don't use quotes around values

### "SMTP_HOST not configured" warning?

This is normal in development if:
- You haven't set up SMTP yet
- You're testing on localhost
- Environment variables haven't loaded

Emails will only be sent when SMTP is fully configured.

## Adding More Emails

To send other types of emails (certificates, notifications, etc.):

1. **Create email template** in `lib/email.ts`:
   ```typescript
   export function generateCertificateEmail(
     studentName: string,
     courseName: string,
     certificateUrl: string
   ): string {
     return `
       <!DOCTYPE html>
       <html>
         <body>
           <h1>Congratulations, ${studentName}!</h1>
           <p>You've successfully completed ${courseName}</p>
           <a href="${certificateUrl}">Download Certificate</a>
         </body>
       </html>
     `
   }
   ```

2. **Send the email** in your API route:
   ```typescript
   import { sendEmail, generateCertificateEmail } from "@/lib/email"

   // When course is completed:
   await sendEmail({
     to: studentEmail,
     subject: "Certificate - " + courseName,
     html: generateCertificateEmail(studentName, courseName, certificateUrl)
   })
   ```

## Production Deployment

### Vercel
1. Go to project Settings
2. Click "Environment Variables"
3. Add these variables:
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_SECURE`
   - `SMTP_USER`
   - `SMTP_PASSWORD`
   - `SMTP_FROM`
4. Click "Save"
5. Redeploy your site

### Other Platforms (Netlify, Railway, etc.)
Follow same pattern - add environment variables in platform dashboard, then redeploy.

### Important for Production
- Use a dedicated email sending service (SendGrid, AWS SES)
- Don't use personal email (Gmail) in production
- Keep API keys secure - never commit to Git
- Use different credentials for dev/production if possible
- Monitor email delivery in service dashboard

## Security Best Practices

✅ **Do:**
- Keep API keys in environment variables
- Never commit `.env.local` to Git (.gitignore handles this)
- Use dedicated email sending services in production
- Rotate API keys periodically
- Monitor email logs for issues

❌ **Don't:**
- Hardcode API keys in code
- Share API keys in Slack/email
- Use personal email credentials in production
- Log sensitive email content

## Cost Analysis

| Provider | Free Tier | Notes |
|----------|-----------|-------|
| Gmail | 500/month | Good for testing, requires App Password |
| SendGrid | 100/day | Great for production, professional support |
| AWS SES | 200/day | Cheapest at scale, tiny cost for overage |
| Your Server | ∞ | Full control, requires server management |

## Support

- **Nodemailer docs**: https://nodemailer.com/
- **SMTP Setup**: Check your provider's documentation
- **Issues**: Check server logs for specific error messages
- **Testing**: Use the welcome email as a test

## What's Next?

Once emails are working:
1. Test the signup flow end-to-end
2. Monitor first week of emails in provider dashboard
3. Adjust email templates as needed
4. Add more email types as features are built
5. Set up email reputation monitoring for production
