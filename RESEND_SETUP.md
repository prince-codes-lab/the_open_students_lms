# Resend Email Setup Guide

## Overview
The OPEN Students now uses **Resend** for sending branded, professional emails that won't end up in spam folders.

## Why Resend?
- ✅ **High Deliverability**: Emails reach inbox (not spam)
- ✅ **Professional Branding**: Emails branded as "The OPEN Students"
- ✅ **Free Tier**: Up to 100 emails/day free
- ✅ **Easy Setup**: Takes 5 minutes
- ✅ **SPF/DKIM**: Automatically configured for you

## Setup Steps

### Step 1: Create a Resend Account
1. Go to [https://resend.com](https://resend.com)
2. Click "Sign up"
3. Use your email and create a password
4. Verify your email

### Step 2: Get Your API Key
1. Log in to [Resend Dashboard](https://resend.com)
2. Go to **Settings** → **API Keys**
3. Copy your API key (starts with `re_`)
4. Keep it secret!

### Step 3: Configure Environment Variables
1. Open `.env.local` in your project
2. Find the line with `RESEND_API_KEY=re_your_api_key_here`
3. Replace `re_your_api_key_here` with your actual API key
4. **Don't commit this file** (it's in .gitignore)

### Step 4: Verify Your Domain (Optional but Recommended)
For best deliverability and to show your own domain:

1. In Resend Dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `theopenstudents.com`)
4. Add the DNS records shown (DKIM, SPF, Return-Path)
5. Wait for verification (usually 5-10 minutes)

**Note**: If you don't verify your domain, Resend will use their domain (emails still work fine).

## What Emails Are Sent?

### 1. Welcome Email (On Signup)
- **When**: User signs up
- **To**: New user's email
- **Subject**: "Welcome to The OPEN Students - Confirm Your Email"
- **Contains**: Confirmation link, feature overview, security notice

### 2. Branded Header
All emails are branded with:
- The OPEN Students logo (🎓)
- Brand colors (Purple #4E0942, Yellow #FEEB00)
- Professional template
- Security best practices

## Testing

### Test Signup Flow
1. Run: `npm run dev`
2. Go to [http://localhost:3000/auth/sign-up](http://localhost:3000/auth/sign-up)
3. Sign up with a test email
4. Check email inbox for welcome message

### Check Logs
If using localhost (without Resend API key):
1. Open browser console (F12)
2. Check terminal output for email logs
3. Once API key is added, actual emails will be sent

## Troubleshooting

### Email not arriving?
1. Check `.env.local` has correct `RESEND_API_KEY`
2. Check spam/junk folder
3. Verify domain in Resend Dashboard (optional)
4. Check Resend Dashboard logs for errors

### API Key issues?
1. Make sure key starts with `re_`
2. Regenerate key in Resend Dashboard if needed
3. Restart dev server after updating `.env.local`

### Domain deliverability?
- Without domain verification: Emails marked as "via resend.com"
- With domain verification: Emails marked as "via theopenstudents.com"
- Both work fine, but verified domains have better reputation

## Next Steps: Add More Emails

You can easily add more emails:

1. Create email template in `lib/email.ts`:
   ```typescript
   export function generateCertificateEmail(studentName: string): string {
     return `...HTML template...`
   }
   ```

2. Send it:
   ```typescript
   await sendEmail({
     to: studentEmail,
     subject: "Your Certificate",
     html: generateCertificateEmail(studentName)
   })
   ```

## Production Deployment

### Vercel
1. Go to your Vercel project settings
2. Add environment variable: `RESEND_API_KEY`
3. Paste your API key
4. Redeploy

### Netlify
1. Go to Site settings → Build & deploy → Environment
2. Add `RESEND_API_KEY` with your API key
3. Redeploy

### Other Platforms
Add `RESEND_API_KEY` to your platform's environment variables section

## Security Notes
- ✅ API key is never exposed to frontend (server-side only)
- ✅ Never commit `.env.local` to Git
- ✅ Use different API keys for dev/production
- ✅ Rotate keys periodically

## Support
- Resend docs: [https://resend.com/docs](https://resend.com/docs)
- Email issues: Check Resend Dashboard → Emails tab
- Need help? Contact Resend support
