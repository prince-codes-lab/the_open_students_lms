# The OPEN Students - Mini LMS Platform

A comprehensive Learning Management System (LMS) for The OPEN Students, featuring course management, payment integration with Paystack, automatic certificate generation, and educational tours.

## 🎨 Brand Identity

- **Colors**: Deep Purple (#4E0942), Vivid Yellow (#FEEB00), Hot Pink (#FF2768), Light Orchid (#DD91D0)
- **Tagline**: "Beyond the Classroom"
- **Mission**: Empowering African and Asian youth through digital courses, practical learning, mentorship, and educational tours

## ✨ Features

### For Students
- 📚 Browse and enroll in digital courses
- 🗺️ Register for educational tours across Nigeria
- 💳 Secure payment processing with Paystack (NGN & USD)
- 📊 Track learning progress in real-time
- 🎓 Automatic certificate generation upon course completion
- 📧 Certificate delivery via email
- 👤 Personal dashboard with progress tracking
- 🎯 Access to Google Classroom integration

### For Admins
- ➕ Create and manage courses
- 📝 Add course modules and lessons (video, text, quiz, assignment)
- 👥 View student enrollments and progress
- 🎖️ Manage certificates
- 📈 Track platform statistics
- 🗺️ Manage educational tours

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- A Paystack account (for payment processing)

### Environment Variables Required

You need to add these environment variables to your Vercel project:

#### 1. Paystack Configuration (CRITICAL)

\`\`\`bash
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
\`\`\`

**How to get Paystack keys:**
1. Go to [Paystack Dashboard](https://dashboard.paystack.com)
2. Navigate to **Settings → API Keys & Webhooks**
3. Copy your **Public Key** (starts with `pk_test_` or `pk_live_`)
4. Copy your **Secret Key** (starts with `sk_test_` or `sk_live_`)
5. Add both to your environment variables in Vercel

#### 2. Supabase Configuration (Already Connected)

The following Supabase variables are already configured:
- `SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Database Setup

The database schema is automatically created when you run the SQL scripts in the `scripts/` folder.

**To set up the database:**

1. The following scripts will be executed automatically:
   - `001_create_tables.sql` - Creates all necessary tables
   - `002_profile_trigger.sql` - Sets up user profile automation
   - `003_seed_courses.sql` - Adds initial courses
   - `004_seed_tours.sql` - Adds educational tours
   - `005_add_course_content.sql` - Creates course content tables

2. All tables have Row Level Security (RLS) enabled for data protection

### Email Configuration (Supabase Limitation)

**Current Limitation:**
On Supabase free tier, emails are sent from "supabase" by default and you cannot customize the sender name.

**Solutions:**

**Option A: Upgrade Supabase (Recommended for Production)**
- Upgrade to Supabase Pro ($25/month)
- Customize email templates and sender name
- Go to: Supabase Dashboard → Authentication → Email Templates

**Option B: Use Third-Party Email Service (Alternative)**
- Integrate Resend, SendGrid, or similar service
- Full control over email branding
- Requires additional setup

**For now:** The system works with Supabase's default emails. Students will receive certificates, but the sender will show as "supabase".

## 📁 Project Structure

\`\`\`
├── app/
│   ├── admin/              # Admin panel for course management
│   ├── auth/               # Authentication pages (login, signup)
│   ├── dashboard/          # Student dashboard
│   ├── enroll/             # Enrollment and payment flow
│   ├── learn/              # Course learning interface
│   ├── programs/           # Course catalog
│   ├── tours/              # Educational tours
│   ├── community/          # Community page
│   └── api/                # API routes
├── components/
│   ├── navigation.tsx      # Main navigation with logo
│   ├── footer.tsx          # Site footer
│   ├── logo.tsx            # Custom graduation cap logo
│   └── loading-modal.tsx   # Loading state component
├── lib/
│   ├── supabase/           # Supabase client utilities
│   └── paystack.ts         # Paystack payment utilities
└── scripts/                # Database setup scripts
\`\`\`

## 🎓 Course Management

### Adding a New Course

1. Go to `/admin` (requires authentication)
2. Click "Add New Course"
3. Fill in course details:
   - Title, description, category
   - Pricing (NGN and USD)
   - Duration and level
   - Google Classroom link (optional)
4. Click "Create Course"

### Adding Course Content

1. Go to `/admin/courses`
2. Click "Content" on any course
3. Add modules (course sections)
4. Add lessons to each module:
   - Video lessons (YouTube or direct video URL)
   - Text/Article content
   - Quizzes
   - Assignments
5. Students can track progress through each lesson

## 💳 Payment Flow

1. Student browses courses/tours
2. Clicks "Enroll Now"
3. Selects currency (NGN or USD)
4. Clicks "Pay with Paystack"
5. Completes payment in Paystack popup
6. Payment is verified automatically
7. Enrollment is activated
8. Student gains access to course/tour

## 🎖️ Certificate System

Certificates are automatically generated and sent when:
- Student completes 100% of course progress
- Certificate includes:
  - Student name
  - Course title
  - Completion date
  - Unique certificate number
  - The OPEN Students branding

Certificates are:
- Stored in the database
- Sent via email (Supabase Auth emails)
- Downloadable from student dashboard

## 🎨 Custom Fonts (Optional)

The platform currently uses **Inter** font (Google Fonts). 

**To add custom fonts:**

If you have font files for:
- **HelloFont ID LongFeiShuShu** (for headings)
- **Twister** (for accents)

1. Add font files to `public/fonts/`
2. Update `app/layout.tsx` to import custom fonts
3. Update `app/globals.css` font variables

## 🔒 Security Features

- ✅ Row Level Security (RLS) on all database tables
- ✅ Secure authentication with Supabase Auth (for students)
- ✅ Separate admin authentication system
- ✅ Protected API routes
- ✅ Secure payment processing with Paystack
- ✅ Environment variables for sensitive data
- ✅ HTTPS encryption (via Vercel)

## 🐛 Troubleshooting

### Payment Not Working

**Error: "Payment system is not configured"**
- **Solution**: Add `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` and `PAYSTACK_SECRET_KEY` to environment variables

**Error: "Payment verification failed"**
- **Solution**: Check that `PAYSTACK_SECRET_KEY` is correct and starts with `sk_test_` or `sk_live_`

### Email Issues

**Emails showing "supabase" as sender**
- **Solution**: This is a Supabase free tier limitation. Upgrade to Pro or use a third-party email service.

**Emails not being received**
- **Solution**: Check spam folder. Verify email address is correct in user profile.

### Database Errors

**Error: "relation does not exist"**
- **Solution**: Run all SQL scripts in the `scripts/` folder in order (001, 002, 003, 004, 005)

**Error: "permission denied"**
- **Solution**: Check Row Level Security policies. Ensure user is authenticated.

## 📊 Admin Access

### Admin Login Credentials

**Direct Admin Login (No Supabase Auth Required)**

- **URL**: `/admin/login`
- **Email**: `sheisdaniellawilliams@gmail.com`
- **Password**: `sheisdaniellawilliams`

**Features:**
- Separate authentication system from students
- Session-based (stored in browser sessionStorage)
- No Supabase auth required
- Access to full admin dashboard

### Admin Dashboard Features

Once logged in, you can:
1. **Course Management**
   - Create new courses
   - Edit existing courses
   - Add modules and lessons
   - Manage course content (video, text, quizzes)
   - Set pricing and duration

2. **Student Management**
   - View all registered students
   - Track enrollments
   - Monitor student progress
   - View payment history

3. **Certificate Management**
   - View all issued certificates
   - Track certificate delivery
   - Resend certificates if needed

4. **Platform Statistics**
   - Total courses
   - Total students
   - Active enrollments
   - Certificates issued

### Security Notes

**For Production:**
- Change admin credentials in `lib/admin-auth.ts`
- Implement database-based admin management
- Add role-based access control
- Enable two-factor authentication

**Current Setup:**
- Admin credentials are hardcoded for development
- Session expires when browser is closed
- Only one admin user supported
- Suitable for initial launch and testing

## 🚀 Deployment

This project is designed to be deployed on Vercel:

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review the code comments (marked with `[v0]`)
- Contact the development team

## 🎯 Roadmap

Future enhancements:
- [ ] Role-based admin access control
- [ ] Advanced analytics dashboard
- [ ] Mobile app
- [ ] Live video classes
- [ ] Student forums and discussions
- [ ] Mentor matching system
- [ ] Internship opportunities board

---

**Built with ❤️ for The OPEN Students**

*Beyond the Classroom*
