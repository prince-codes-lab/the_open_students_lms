# Admin Guide - The OPEN Students LMS

Complete guide for administrators to manage the platform.

## 🔐 Admin Access

### Login Credentials
- **URL**: `/admin/login`
- **Email**: sheisdaniellawilliams@gmail.com
- **Password**: sheisdaniellawilliams

### Security Notes
- Admin authentication is separate from student authentication
- Session is stored in browser sessionStorage
- No Supabase auth required for admin
- Change credentials in `lib/admin-auth.ts` for production

## 📚 Course Management

### Creating a Course

1. Navigate to **Admin Dashboard** → **Manage Courses** → **Add New Course**

2. Fill in required fields:
   - **Title**: Course name (e.g., "Creative Writing Masterclass")
   - **Description**: What students will learn
   - **Category**: Select from dropdown
     - writing
     - graphics
     - video
     - speaking
     - leadership
     - storytelling
   - **Price (NGN)**: Price in Nigerian Naira (e.g., 5000)
   - **Price (USD)**: Price in US Dollars (e.g., 5)
   - **Duration**: Number of weeks (e.g., 6)
   - **Google Classroom Link**: Optional external link

3. Click **Create Course**

### Adding Course Content

After creating a course, add modules and lessons:

1. Go to **Manage Courses** → Click **Content** on your course

2. **Add a Module** (Section):
   - Click "Add Module"
   - Enter module title (e.g., "Introduction to Writing")
   - Enter description
   - Set order (1, 2, 3...)

3. **Add Lessons to Module**:
   - Click "Add Lesson" under a module
   - Enter lesson title
   - Select lesson type:
     - **Text**: Written content
     - **Video**: YouTube/Vimeo URL
   - Add content
   - Set duration (minutes)
   - Set order

### Editing a Course

1. Go to **Manage Courses**
2. Click **Edit** on the course
3. Update fields
4. Click **Save Changes**

### Deactivating a Course

1. Edit the course
2. Toggle "Active" to OFF
3. Course will be hidden from students but data is preserved

## 👥 Student Management

### Viewing Students

Navigate to **Admin Dashboard** → **View Students**

You can see:
- Total registered students
- Student names and emails
- Registration dates
- Enrollment counts

### Managing Enrollments

Navigate to **Admin Dashboard** → **Manage Enrollments**

View:
- All course enrollments
- Payment status (pending, completed, failed)
- Student progress (0-100%)
- Enrollment dates
- Payment references

### Tracking Progress

1. Go to **Manage Enrollments**
2. Click on an enrollment
3. View:
   - Lessons completed
   - Current progress percentage
   - Time spent
   - Last activity

## 🏆 Certificate Management

### Viewing Certificates

Navigate to **Admin Dashboard** → **View Certificates**

See:
- All issued certificates
- Student names
- Course names
- Issue dates
- Certificate numbers
- Download links

### Certificate Generation

Certificates are generated automatically when:
- Student completes 100% of course lessons
- System creates certificate with unique number
- Email is sent to student automatically

### Manual Certificate Reissue

If a student didn't receive their certificate:

1. Go to **View Certificates**
2. Find the certificate
3. Click **Resend Email**
4. Certificate will be sent again

## 📊 Dashboard Statistics

The admin dashboard shows:

1. **Total Courses**: Number of active courses
2. **Total Students**: Registered users
3. **Active Enrollments**: Paid enrollments
4. **Certificates Issued**: Total certificates generated

## 💳 Payment Management

### Viewing Payments

All payments are tracked in the enrollments table:

1. Go to **Manage Enrollments**
2. Filter by payment status:
   - **Completed**: Successful payments
   - **Pending**: Awaiting payment
   - **Failed**: Payment failed

### Payment Details

Each enrollment shows:
- Payment reference (from Paystack)
- Amount paid
- Currency (NGN/USD)
- Payment date
- Paystack transaction ID

### Refunds

To process a refund:
1. Log into Paystack dashboard
2. Find transaction by reference
3. Process refund through Paystack
4. Update enrollment status in admin panel

## 🎓 Educational Tours

### Managing Tours

1. Tours are managed in the database
2. To add a tour, insert into `tours` table via SQL
3. Or create a tour management page (coming soon)

### Tour Fields

- Title
- Description
- Location
- State
- Date
- Price (NGN/USD)
- Max participants
- Current participants

## 🔧 Common Admin Tasks

### Adding a New Admin User

Currently, only one admin is supported. To add more:

1. Edit `lib/admin-auth.ts`
2. Add new credentials to the verification function
3. Or implement database-based admin management

### Bulk Course Upload

To add multiple courses at once:

1. Prepare SQL INSERT statements
2. Run in Supabase SQL editor
3. Or use the admin interface to add one by one

### Exporting Student Data

1. Go to Supabase dashboard
2. Navigate to Table Editor
3. Select `profiles` or `enrollments` table
4. Click Export → CSV

### Backing Up Data

1. Use Supabase dashboard
2. Go to Database → Backups
3. Create manual backup
4. Or set up automatic backups (Pro plan)

## 📧 Email Configuration

### Current Setup

- Emails sent via Supabase Auth
- Sender shows as "supabase" (free tier limitation)
- Certificate emails sent automatically

### Customizing Emails

To customize email templates:

**Option 1**: Upgrade to Supabase Pro
- Go to Supabase dashboard
- Navigate to Authentication → Email Templates
- Customize templates with your branding

**Option 2**: Use Third-Party Service
- Integrate Resend or SendGrid
- Update email sending logic in API routes
- Full control over email design

## 🚨 Troubleshooting

### Students Can't Access Course

**Check**:
1. Is enrollment payment status "completed"?
2. Is course active?
3. Does course have content (modules/lessons)?

### Certificate Not Sent

**Check**:
1. Did student complete 100% of lessons?
2. Check `certificates` table for record
3. Verify email address is correct
4. Check Supabase logs for email errors

### Payment Not Verified

**Check**:
1. Paystack webhook is configured
2. Payment reference exists in Paystack
3. Check API logs for verification errors
4. Verify Paystack secret key is correct

## 📱 Mobile Admin Access

The admin panel is fully responsive:
- Access from any device
- Same functionality on mobile
- Optimized for touch interfaces

## 🔒 Security Best Practices

1. **Change Default Password**: Update admin credentials in production
2. **Use HTTPS**: Always access admin panel over HTTPS
3. **Regular Backups**: Back up database regularly
4. **Monitor Access**: Check admin access logs
5. **Secure API Keys**: Never commit Paystack keys to git

## 📈 Growth & Scaling

As your platform grows:

1. **Upgrade Supabase**: Move to Pro for better performance
2. **CDN for Videos**: Use Cloudflare or similar for video hosting
3. **Email Service**: Switch to dedicated email provider
4. **Analytics**: Add Google Analytics or Mixpanel
5. **Monitoring**: Set up error tracking (Sentry)

## 💡 Tips & Best Practices

1. **Course Structure**: Keep modules focused (3-5 lessons each)
2. **Video Length**: Aim for 5-15 minute videos
3. **Pricing**: Test different price points
4. **Certificates**: Make them visually appealing
5. **Communication**: Email students regularly with updates

## 📞 Support

For technical issues:
- Check error logs in browser console
- Review Supabase logs
- Contact v0 support if needed

---

**Last Updated**: January 2025  
**Version**: 1.0
