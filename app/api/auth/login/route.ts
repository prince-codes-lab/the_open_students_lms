import { createJWT } from "@/lib/auth/jwt"
import { authenticateUser } from "@/lib/auth/mongodb-auth"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    const result = await authenticateUser(email, password)

    if (!result.success) {
      // If email not verified, return specific error
      if ((result as any).emailNotVerified) {
        return NextResponse.json(
          {
            error: result.error,
            emailNotVerified: true,
            email: email,
          },
          { status: 403 },
        )
      }
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    const token = await createJWT({
      userId: result.user!.id,
      email: result.user!.email,
      role: result.user!.role,
    })

    const response = NextResponse.json({ success: true, user: result.user }, { status: 200 })

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

    return response
  } catch (error) {
    console.error("[open] Login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
