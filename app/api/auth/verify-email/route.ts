import { verifyEmail } from "@/lib/auth/mongodb-auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")
    const token = searchParams.get("token")

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and verification token are required" },
        { status: 400 },
      )
    }

    const result = await verifyEmail(email, token)

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          verified: false,
        },
        { status: 400 },
      )
    }

    // Email verified successfully - redirect to login with success message
    const redirectUrl = new URL("/auth/login", process.env.NEXT_PUBLIC_SITE_URL || "https://theopenstudents.com")
    redirectUrl.searchParams.set("verified", "true")
    redirectUrl.searchParams.set("email", email)

    return NextResponse.redirect(redirectUrl.toString())
  } catch (error) {
    console.error("[open] Email verification error:", error)
    return NextResponse.json(
      { error: "Email verification failed", verified: false },
      { status: 500 },
    )
  }
}
