import { createJWT } from "@/lib/auth/jwt"
import { createUser } from "@/lib/auth/mongodb-auth"
import { Profile } from "@/lib/mongodb/models/Profile"
import { connectDB } from "@/lib/mongodb/connection"
import { NextResponse } from "next/server"
import { sendEmail, generateWelcomeEmail } from "@/lib/email"

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

    const token = await createJWT({
      userId: (result.user!).id,
      email: (result.user!).email,
      role: "student",
    })

    const response = NextResponse.json({ success: true, user: result.user }, { status: 201 })

    const isHttps = (() => {
      try {
        return new URL(request.url).protocol === "https:"
      } catch {
        return false
      }
    })()

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    })

    // Send welcome email asynchronously (don't block the response)
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://theopenstudents.com"
      const confirmationLink = `${siteUrl}/auth/sign-up-success?email=${encodeURIComponent(email)}&confirmed=true`
      
      const emailContent = generateWelcomeEmail(fullName, confirmationLink)
      await sendEmail({
        to: email,
        subject: "Welcome to The OPEN Students - Confirm Your Email",
        html: emailContent,
      })
      console.log("[open] Welcome email sent to:", email)
    } catch (emailError) {
      console.error("[open] Welcome email sending error:", emailError)
      // Don't fail the signup if email sending fails
    }

    return response
  } catch (error) {
    console.error("[open] Signup error:", error)
    return NextResponse.json({ error: "Signup failed" }, { status: 500 })
  }
}
