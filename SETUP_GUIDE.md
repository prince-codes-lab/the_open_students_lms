# Complete Setup Guide for The OPEN Students LMS

This guide will walk you through setting up the entire platform from scratch.

## Step 1: Environment Variables Setup

### Required Variables

You need to add these to your Vercel project:

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click "Settings" → "Environment Variables"

2. **Add Paystack Keys** (CRITICAL - Payment won't work without these)

\`\`\`
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_key_here
PAYSTACK_SECRET_KEY=sk_test_your_key_here
\`\`\`

**Where to get these:**
- Visit https://dashboard.paystack.com
- Go to Settings → API Keys & Webhooks
- Copy both Public Key and Secret Key
- Use TEST keys for development, LIVE keys for production

### Supabase Variables (Already Configured)

These should already be set up:
- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Step 2: Database Setup

The database will be automatically set up when you run the SQL scripts.

### Option A: Automatic Setup (Recommended)

The scripts in the `scripts/` folder will run automatically when needed.

### Option B: Manual Setup

If you prefer to run them manually:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Run each script in order:
   - `001_create_tables.sql`
   - `002_profile_trigger.sql`
   - `003_seed_courses.sql`
   - `004_seed_tours.sql`
   - `005_add_course_content.sql`

## Step 3: Test the Platform

### Create Your First Admin Account

1. Visit your deployed site
2. Click "Join the Journey" or go to `/auth/sign-up`
3. Create an account with your email
4. Check your email for verification link
5. Click the verification link
6. You're now logged in!

### Add Your First Course

1. Go to `/admin`
2. Click "Add New Course"
3. Fill in the details:
   \`\`\`
   Title: Professional Writing Masterclass
   Description: Learn to write compelling content
   Category: Writing
   Level: Beginner
   Price NGN: 5000
   Price USD: 5
   Duration: 4 weeks
   \`\`\`
4. Click "Create Course"
5. Click "Content" to add modules and lessons

### Test Payment Flow

1. Log out and create a new test student account
2. Browse to `/programs`
3. Click "Enroll Now" on a course
4. Select currency (NGN or USD)
5. Click "Pay with Paystack"
6. Use Paystack test card:
   \`\`\`
   Card Number: 4084 0840 8408 4081
   Expiry: Any future date
   CVV: 408
   \`\`\`
7. Complete payment
8. Check dashboard - course should appear

## Step 4: Customize Content

### Update Homepage Content

Edit `app/page.tsx` to customize:
- Hero section text
- About section
- Team information
- Call-to-action buttons

### Add Your Courses

Use the admin panel at `/admin/courses` to:
1. Create courses
2. Add modules
3. Add lessons (videos, text, quizzes)
4. Set pricing

### Add Educational Tours

Edit `scripts/004_seed_tours.sql` to add your tours, or create them via the admin panel.

## Step 5: Email Configuration

### Current Setup (Free Tier)

Emails are sent via Supabase Auth with "supabase" as sender.

### To Customize Emails (Requires Upgrade)

**Option 1: Upgrade Supabase to Pro**
1. Go to Supabase Dashboard
2. Upgrade to Pro ($25/month)
3. Navigate to Authentication → Email Templates
4. Customize:
   - Sender name: "The OPEN Students"
   - Email templates
   - Branding

**Option 2: Use Third-Party Email Service**
1. Sign up for Resend (https://resend.com) or SendGrid
2. Get API key
3. Update certificate email code to use the service
4. Add API key to environment variables

## Step 6: Go Live

### Before Going Live Checklist

- [ ] Add LIVE Paystack keys (not test keys)
- [ ] Test all payment flows with real cards
- [ ] Verify email delivery works
- [ ] Add real course content
- [ ] Test on mobile devices
- [ ] Set up custom domain
- [ ] Enable Vercel Analytics
- [ ] Set up error monitoring

### Switch to Live Paystack Keys

1. Go to Paystack Dashboard
2. Switch from Test to Live mode
3. Copy LIVE keys (start with `pk_live_` and `sk_live_`)
4. Update environment variables in Vercel:
   \`\`\`
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_live_key
   PAYSTACK_SECRET_KEY=sk_live_your_live_key
   \`\`\`
5. Redeploy your application

## Step 7: Ongoing Management

### Adding New Courses

1. Go to `/admin/courses`
2. Click "Add New Course"
3. Fill in details
4. Add content (modules and lessons)
5. Publish!

### Managing Students

1. Go to `/admin/students`
2. View all enrolled students
3. Track their progress
4. Issue certificates manually if needed

### Monitoring Payments

1. Check Paystack Dashboard for all transactions
2. View enrollments in `/admin/enrollments`
3. Verify payment status matches

## Common Issues & Solutions

### Issue: "Payment system not configured"

**Solution:**
- Check that `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` is set
- Verify it starts with `pk_test_` or `pk_live_`
- Redeploy after adding environment variables

### Issue: "Database error: relation does not exist"

**Solution:**
- Run all SQL scripts in order
- Check Supabase logs for errors
- Verify RLS policies are enabled

### Issue: Emails not being received

**Solution:**
- Check spam folder
- Verify email in Supabase Auth users table
- Check Supabase email logs
- Consider upgrading to Pro for better deliverability

### Issue: Certificate not generating

**Solution:**
- Ensure course progress is 100%
- Check API logs for errors
- Verify certificate table has RLS policies
- Check email sending is working

## Need Help?

If you encounter issues:

1. Check the browser console for errors (F12)
2. Check Vercel deployment logs
3. Check Supabase logs
4. Review the code comments (marked with `[v0]`)
5. Verify all environment variables are set correctly

## Security Best Practices

1. **Never commit API keys to Git**
2. **Use environment variables for all secrets**
3. **Keep Supabase RLS policies enabled**
4. **Use HTTPS only (Vercel provides this)**
5. **Regularly update dependencies**
6. **Monitor for suspicious activity**
7. **Backup your database regularly**

---

**You're all set! 🎉**

Your mini LMS is ready to empower students beyond the classroom!
