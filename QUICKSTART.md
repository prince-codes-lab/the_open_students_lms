# Quick Start - New Configuration System

## 🚀 Get Started in 5 Minutes

### Step 1: Set Environment Variables
```bash
# Copy the template
cp .env.local.example .env.local

# Edit .env.local with your values:
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-secure-password
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxx
```

### Step 2: Restart Dev Server
```bash
npm run dev
```

### Step 3: Login to Admin
- Go to http://localhost:3000/admin/login
- Email: Use the one you set in ADMIN_EMAIL
- Password: Use the one you set in ADMIN_PASSWORD

### Step 4: Configure Everything Else
- Admin → Settings
- Update founder info
- Update Paystack keys
- Add Mailchimp credentials
- Update any other settings
- Click "Save All Settings"

---

## 📋 What Each Section Does

### Admin Login Credentials
- Controls who can access `/admin`
- Changes stored in database
- Take effect after redeployment

### Founder Information
- Shows on homepage
- Displays founder name, title, bio, and photo
- Updates appear instantly

### Payment Gateway (Paystack)
- Handles course/tour payments
- Keys must be set for payments to work
- Test keys for development, live keys for production

### Newsletter (Mailchimp)
- Syncs newsletter subscribers to Mailchimp
- Requires Mailchimp account (free tier available)
- Falls back gracefully if not configured

### Database Configuration
- MongoDB connection strings
- Two separate databases supported
- Required for app to function

### Site Configuration
- JWT_SECRET: Keep this secure, never share
- Site URL: Used for redirects and email links

---

## ✅ Common Setup Tasks

### Setup Paystack
1. Go to https://dashboard.paystack.com
2. Settings → API Keys & Webhooks
3. Copy both keys
4. Paste in Admin → Settings → Payment Gateway
5. Save and test

### Setup Mailchimp
1. Go to https://mailchimp.com
2. Create account or login
3. Get API key: Settings → API keys
4. Get Audience ID: Audience → Audience name → Settings
5. Add both to Admin → Settings → Newsletter
6. Save and test

### Change Admin Password
1. Login to admin
2. Go to Settings
3. Update "Admin Login Credentials" section
4. Click Save
5. Password takes effect on next deployment

### Update Founder Info
1. Login to admin
2. Go to Settings
3. Update "Founder Information (Homepage)" section
4. Upload image or paste image URL
5. Save - updates appear immediately

---

## 🐛 Troubleshooting

### Admin Login Not Working
- Check `.env.local` has correct ADMIN_EMAIL and ADMIN_PASSWORD
- Verify NEXT_PUBLIC_ADMIN_EMAIL matches ADMIN_EMAIL
- Clear browser cache/sessionStorage
- Restart dev server

### Paystack Payment Fails
- Check public key is set (error should say if missing)
- Verify secret key in environment
- Check course/tour has a price set
- Use test card for testing: 4084 0840 8408 4081

### Founder Info Not Showing
- Verify MongoDB URI is configured
- Check data was saved (check admin dashboard)
- Clear browser cache
- Hard refresh homepage (Ctrl+Shift+R)

### Newsletter Not Syncing
- Verify Mailchimp API key is correct
- Check Audience ID is correct
- Confirm Mailchimp account is active
- Check subscriber email format

---

## 📚 Full Documentation

For detailed information, see:
- `CONFIGURATION_GUIDE.md` - Comprehensive setup guide
- `UPDATES_SUMMARY.md` - Summary of all changes
- `.env.local.example` - All available environment variables

---

## 🔒 Security Checklist

Before going to production:

- [ ] Change admin password to something secure
- [ ] Update JWT_SECRET to random secure string
- [ ] Use live Paystack keys (not test keys)
- [ ] Configure Mailchimp with production audience
- [ ] Set NEXT_PUBLIC_SITE_URL to your domain
- [ ] Ensure .env.local is in .gitignore (it is)
- [ ] Test admin login works
- [ ] Test payment flow
- [ ] Test newsletter signup

---

## 🎯 Next: Deploy!

1. Commit all changes (except `.env.local`)
2. Deploy to your hosting platform (Vercel, etc.)
3. Add environment variables to hosting platform
4. Verify admin login works
5. Test payment and newsletter features
6. Celebrate! 🎉

---

Questions? Check CONFIGURATION_GUIDE.md or UPDATES_SUMMARY.md
