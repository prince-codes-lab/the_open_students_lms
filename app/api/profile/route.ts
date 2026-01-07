import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import mongoose from "mongoose"
import { verifyJWT } from "@/lib/auth/jwt"
import { connectDB } from "@/lib/mongodb/connection"
import { Profile } from "@/lib/mongodb/models/Profile"

async function authenticate() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return null
  }

  const payload = await verifyJWT(token)
  if (!payload?.userId || !payload.email) {
    return null
  }

  return { userId: payload.userId as string, email: payload.email as string }
}

export async function GET() {
  try {
    const session = await authenticate()
    if (!session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 })
    }

    await connectDB(mongoUri)

    const profile = await Profile.findOne({ userId: session.userId }).lean({ virtuals: true })

    return NextResponse.json({
      success: true,
      profile: profile || { email: session.email, fullName: "", phone: "", age: "", country: "" },
    })
  } catch (error) {
    console.error("[open] Profile fetch error:", error)
    return NextResponse.json({ success: false, error: "Failed to load profile" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const session = await authenticate()
    if (!session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const { fullName, phone, age, country } = await request.json()

    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 })
    }

    await connectDB(mongoUri)

    const updatedProfile = await Profile.findOneAndUpdate(
      { userId: session.userId },
      {
        $set: {
          userId: new mongoose.Types.ObjectId(session.userId),
          fullName: fullName || "",
          phone: phone || "",
          age: age ? Number(age) : undefined,
          country: country || "",
          email: session.email,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean({ virtuals: true })

    return NextResponse.json({ success: true, profile: updatedProfile })
  } catch (error) {
    console.error("[open] Profile update error:", error)
    return NextResponse.json({ success: false, error: "Failed to update profile" }, { status: 500 })
  }
}

