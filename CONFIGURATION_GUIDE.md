# Configuration & Setup Guide - Updated Features

## Summary of Improvements

This guide covers the new configuration system that allows you to manage all environment variables, Mailchimp integration, and founder information from the admin dashboard.

---

## 1. Admin Credentials Migration

### What Changed
- Admin credentials are now loaded from `.env.local` instead of being hardcoded
- You can update them from the admin dashboard (under **Site Settings → Admin Login Credentials**)
- Changes are stored in the database for the next deployment

### Setup Steps

1. **Create `.env.local` file** in your project root:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Update with your credentials:**
   ```env
   ADMIN_EMAIL=your-email@example.com
   NEXT_PUBLIC_ADMIN_EMAIL=your-email@example.com
   ADMIN_PASSWORD=your-secure-password
   ```

3. **Access admin login:**
   - Go to `/admin/login`
   - Use the credentials you set above

4. **Update from Dashboard:**
   - Navigate to **Admin → Settings**
   - Go to "Admin Login Credentials" section
   - Change email/password
   - Click "Save All Settings"
   - **⚠️ Note:** Changes take effect after deployment

---

## 2. Founder Section on Homepage

### What Changed
- Founder information is now editable from the admin dashboard
- Includes name, title, biography, and profile image
- Changes appear immediately on the homepage

### How to Edit

1. **Go to Admin Dashboard** → **Settings**
2. **Find "Founder Information (Homepage)" section**
3. **Update:**
   - Founder name
   - Title/Position (e.g., "Founder & Visionary")
   - Biography (full text description)
   - Profile image (upload or image URL)
4. **Click "Save All Settings"**

### Database Storage
- Data stored in MongoDB (MONGODB_URI_2)
- Fallback to AdminSettings if MONGODB_URI_2 not available
- Cached for performance if database is down

---

## 3. Logo Configuration

### What Changed
- Logo is now manageable from the admin dashboard
- Supports uploading or providing image URL
- Used across the site header/navigation

### How to Update

1. **Navigate to Admin → Settings**
2. **Find "Site Logo" section**
3. **Upload new logo:**
   - Click upload field
   - Select PNG or JPG (max 5MB)
   - Preview shows immediately
4. **Save changes**

---

## 4. Mailchimp Integration

### What Changed
- Newsletter subscribers sync to Mailchimp automatically
- Contacts are saved to your Mailchimp audience
- Dual storage: MongoDB + Mailchimp

### Setup Mailchimp

1. **Get API Key:**
   - Log in to [Mailchimp](https://mailchimp.com)
   - Go to **Settings → API keys**
   - Copy your API key (format: `xxxxxxxxxxxxx-us1`)

2. **Get Audience ID:**
   - Go to **Audience → Audience name → Settings**
   - Look for "Audience ID"
   - Copy it

3. **Add to .env.local:**
   ```env
   MAILCHIMP_API_KEY=xxxxxxxxxxxxx-us1
   MAILCHIMP_AUDIENCE_ID=xxxxxxxxxx
   ```

4. **Or Update from Dashboard:**
   - Admin → Settings
   - "Newsletter (Mailchimp)" section
   - Enter both values
   - Save

### How It Works

When a user subscribes to the newsletter:
1. Email saved to MongoDB (Subscriber collection)
2. Automatically added to Mailchimp audience
3. Fields synced: email, first name, last name
4. If Mailchimp fails, local DB still saves (fail-safe)

---

## 5. Paystack Configuration

### Updated Features
- Better error handling with detailed messages
- API key retrieved from admin settings if set
- Fallback to environment variables

### Setup Steps

1. **Get Paystack Keys:**
   - Visit [Paystack Dashboard](https://dashboard.paystack.com)
   - Settings → **API Keys & Webhooks**
   - Copy Public Key (pk_test_...) and Secret Key (sk_test_...)

2. **Add to .env.local:**
   ```env
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
   PAYSTACK_SECRET_KEY=sk_test_xxxxx
   ```

3. **Or Update from Dashboard:**
   - Admin → Settings
   - "Payment Gateway (Paystack)" section
   - Enter both keys
   - Save

4. **Test Payment Flow:**
   - Use Paystack test card:
     - Card: `4084084084084081`
     - Expiry: Any future date
     - CVV: `408`

### Improvements Made
- ✅ Better error messages (no generic alerts)
- ✅ Script loading status tracked
- ✅ Detailed console logging for debugging
- ✅ Proper null/undefined checks
- ✅ Graceful fallbacks

---

## 6. Environment Variables Dashboard

### What Changed
- All environment variables can be viewed/edited from admin dashboard
- Variables include:
  - Payment (Paystack)
  - Database (MongoDB)
  - Authentication (JWT, Admin credentials)
  - Email (Mailchimp)
  - Site configuration

### How to Use

1. **Admin → Settings**
2. **Scroll through sections:**
   - **Admin Login Credentials** - Admin email/password
   - **Payment Gateway** - Paystack keys
   - **Newsletter** - Mailchimp config
   - **Database Configuration** - MongoDB URIs
   - **Site Configuration** - JWT, Site URL

3. **Update values** as needed
4. **Click "Save All Settings"**
5. **Deploy for changes to take effect**

### ⚠️ Important Notes
- Changes are stored in database
- **Do NOT rely on admin UI for critical production values**
- Use Vercel/hosting environment variables for production
- Database storage is for convenience, not security
- Never save sensitive data in comments

---

## 7. Database Configuration

### What Changed
- Two separate MongoDB instances supported
- MONGODB_URI: Main database (courses, users, enrollments)
- MONGODB_URI_2: Secondary database (founder, admin settings)

### Setup

1. **Get MongoDB Connection Strings:**
   - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create two separate projects/clusters (optional)
   - Copy connection strings

2. **Add to .env.local:**
   ```env
   MONGODB_URI=mongodb+srv://user:pass@cluster1.mongodb.net/db1
   MONGODB_URI_2=mongodb+srv://user:pass@cluster2.mongodb.net/db2
   ```

3. **Or Update from Dashboard:**
   - Admin → Settings
   - "Database Configuration" section
   - Paste connection strings
   - Save

---

## 8. Deployment Checklist

Before deploying to production:

- [ ] Update `.env.local` with production values
- [ ] Change admin email and password
- [ ] Set strong JWT_SECRET
- [ ] Use live Paystack keys (not test keys)
- [ ] Configure Mailchimp with production audience
- [ ] Set NEXT_PUBLIC_SITE_URL to your domain
- [ ] Deploy and verify admin login works
- [ ] Test payment flow with real card
- [ ] Test newsletter signup

---

## 9. Troubleshooting

### Admin Login Not Working
- Check email/password in .env.local
- Verify NEXT_PUBLIC_ADMIN_EMAIL matches ADMIN_EMAIL
- Clear browser sessionStorage
- Try incognito mode

### Paystack Integration Failing
- Verify public key is set (check error message)
- Confirm secret key is in environment
- Check that price is greater than 0
- Verify script loads (check browser console)
- Test with Paystack test card

### Founder Info Not Showing
- Verify MONGODB_URI_2 is configured
- Check founder data in admin dashboard
- Clear browser cache
- Reload homepage

### Mailchimp Not Syncing
- Verify API key and Audience ID are correct
- Check Mailchimp account is active
- Confirm subscriber has valid email
- Check admin dashboard error messages

---

## 10. Security Reminders

⚠️ **CRITICAL:**
- Never commit `.env.local` to git
- Change all default passwords immediately
- Use environment variables for production
- Database storage is for convenience, not security
- Admin dashboard values are not encrypted
- Always use HTTPS in production
- Rotate JWT_SECRET regularly
- Keep Paystack keys secret (never expose in frontend code)

---

## Support

For issues or questions:
1. Check browser console for errors
2. Check server logs
3. Verify all environment variables are set
4. Try clearing cache and restarting dev server

