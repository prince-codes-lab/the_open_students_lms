import { NextResponse } from "next/server"
import { connectDBWithRetry } from "@/lib/mongodb/connection"
import { Subscriber } from "@/lib/mongodb/models/Subscriber"

export async function POST(request: Request) {
  try {
    const mongoUri = process.env.MONGODB_URI
    const body = await request.json()
    const { name, email, location } = body || {}
    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    const conn = mongoUri ? await connectDBWithRetry(mongoUri) : null
    if (!conn) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 503 })
    }

    const existing = await Subscriber.findOne({ email })
    if (existing) {
      existing.name = name ?? existing.name
      existing.location = location ?? existing.location
      await existing.save()
      return NextResponse.json({ success: true })
    }

    await Subscriber.create({ name, email, location })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[open] Newsletter subscribe error:", error)
    return NextResponse.json({ success: false, error: "Failed to subscribe" }, { status: 500 })
  }
}
