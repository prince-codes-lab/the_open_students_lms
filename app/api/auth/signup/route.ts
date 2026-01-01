import { createJWT } from "@/lib/auth/jwt"
import { createUser } from "@/lib/auth/mongodb-auth"
import { Profile } from "@/lib/mongodb/models/Profile"
import { connectDB } from "@/lib/mongodb/connection"
import { NextResponse } from "next/server"
import { sendEmail, generateVerificationEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email, password, fullName, phone, ageRange, country } = await request.json()

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Email, password, and full name required" }, { status: 400 })
    }

    const result = await createUser(email, password, fullName)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Create profile
    try {
      const mongoUri = process.env.MONGODB_URI
      if (!mongoUri) throw new Error("MONGODB_URI not configured")

      await connectDB(mongoUri)

      const user = result.user!
      const profile = new Profile({
        userId: user.id,
        email,
        fullName,
        phone,
        ageRange,
        country,
      })

      await profile.save()
    } catch (profileError) {
      console.error("[open] Profile creation error:", profileError)
      // Continue even if profile creation fails
    }

    // Send verification email BEFORE creating JWT
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://theopenstudents.com"
      const verificationLink = `${siteUrl}/api/auth/verify-email?email=${encodeURIComponent(email)}&token=${result.user?.verificationToken}`
      
      const emailContent = generateVerificationEmail(fullName, verificationLink, email)
      const emailResult = await sendEmail({
        to: email,
        subject: "Verify Your Email - The OPEN Students",
        html: emailContent,
      })
      
      if (emailResult.error) {
        console.error("[open] Email sending failed:", emailResult.error)
      } else {
        console.log("[open] Verification email sent to:", email)
      }
    } catch (emailError) {
      console.error("[open] Verification email error:", emailError)
      // Don't fail signup if email sending fails, but warn user
    }

    // Return response indicating email verification is required
    return NextResponse.json(
      {
        success: true,
        message: "Account created! Please check your email to verify your account.",
        user: {
          id: result.user?.id,
          email: result.user?.email,
          fullName: result.user?.fullName,
        },
        emailVerificationRequired: true,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[open] Signup error:", error)
    return NextResponse.json({ error: "Signup failed" }, { status: 500 })
  }
}
