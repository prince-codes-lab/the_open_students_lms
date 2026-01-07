import { User } from "@/lib/mongodb/models/User"
import { connectDB } from "@/lib/mongodb/connection"
import { sendEmail, generateVerificationEmail } from "@/lib/email"
import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) throw new Error("MONGODB_URI not configured")

    await connectDB(mongoUri)

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // If already verified, no need to resend
    if (user.emailVerified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 })
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex")
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    user.verificationToken = verificationToken
    user.verificationTokenExpiry = verificationTokenExpiry
    await user.save()

    // Send verification email
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://theopenstudents.com"
      const verificationLink = `${siteUrl}/api/auth/verify-email?email=${encodeURIComponent(email)}&token=${verificationToken}`

      const emailContent = generateVerificationEmail(user.fullName, verificationLink, email)
      const emailResult = await sendEmail({
        to: email,
        subject: "Verify Your Email - The OPEN Students",
        html: emailContent,
      })

      if (emailResult.error) {
        console.error("[open] Resend verification email failed:", emailResult.error)
        return NextResponse.json(
          { error: "Failed to send verification email. Please try again." },
          { status: 500 },
        )
      }

      console.log("[open] Verification email resent to:", email)
      return NextResponse.json(
        { success: true, message: "Verification email sent. Please check your inbox." },
        { status: 200 },
      )
    } catch (emailError) {
      console.error("[open] Error sending verification email:", emailError)
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("[open] Resend verification email error:", error)
    return NextResponse.json({ error: "Failed to resend verification email" }, { status: 500 })
  }
}
