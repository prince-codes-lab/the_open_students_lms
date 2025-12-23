import { NextResponse } from "next/server"
import { connectDBWithRetry } from "@/lib/mongodb/connection"
import { AdminSettings } from "@/lib/mongodb/models/AdminSettings"

let cachedSettings: any | null = null

export async function GET() {
  try {
    const mongoUri = process.env.MONGODB_URI
    const envDefaults = {
      NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
      PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY || "",
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "",
      JWT_SECRET: process.env.JWT_SECRET || "",
      MONGODB_URI: process.env.MONGODB_URI || "",
      MONGODB_URI_2: process.env.MONGODB_URI_2 || "",
    }
    if (!mongoUri) {
      return NextResponse.json({ ...(cachedSettings || {}), environmentDefaults: envDefaults }, { status: 200 })
    }

    const conn = await connectDBWithRetry(mongoUri)
    const settings = conn ? await AdminSettings.findOne() : null

    // Cache and return when DB is down
    if (!conn) {
      return NextResponse.json({ ...(cachedSettings || {}), environmentDefaults: envDefaults }, { status: 200 })
    }

    cachedSettings = settings || cachedSettings
    return NextResponse.json({ ...(settings?.toObject?.() || settings || {}), environmentDefaults: envDefaults })
  } catch (error) {
    console.error("[open] Settings fetch error:", error)
    const envDefaults = {
      NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
      PAYSTACK_SECRET_KEY: process.env.PAYSTACK_SECRET_KEY || "",
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "",
      JWT_SECRET: process.env.JWT_SECRET || "",
      MONGODB_URI: process.env.MONGODB_URI || "",
      MONGODB_URI_2: process.env.MONGODB_URI_2 || "",
    }
    return NextResponse.json({ ...(cachedSettings || {}), environmentDefaults: envDefaults }, { status: 200 })
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  try {
    const mongoUri = process.env.MONGODB_URI

    // If DB is not configured or unavailable, update cache and succeed
    if (!mongoUri) {
      cachedSettings = { ...(cachedSettings || {}), ...body }
      return NextResponse.json(cachedSettings, { status: 200 })
    }

    const conn = await connectDBWithRetry(mongoUri)
    if (!conn) {
      cachedSettings = { ...(cachedSettings || {}), ...body }
      return NextResponse.json(cachedSettings, { status: 200 })
    }

    let settings = await AdminSettings.findOne()
    if (!settings) {
      settings = new AdminSettings(body)
    } else {
      Object.assign(settings, body)
    }

    await settings.save()
    cachedSettings = settings
    return NextResponse.json(settings)
  } catch (error) {
    console.error("[open] Settings save error:", error)
    // Fall back to cache using already-parsed body
    cachedSettings = { ...(cachedSettings || {}), ...body }
    return NextResponse.json(cachedSettings, { status: 200 })
  }
}

export async function DELETE() {
  try {
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      cachedSettings = null
      return NextResponse.json({ success: true }, { status: 200 })
    }

    const conn = await connectDBWithRetry(mongoUri)
    if (!conn) {
      cachedSettings = null
      return NextResponse.json({ success: true }, { status: 200 })
    }

    await AdminSettings.deleteMany({})
    cachedSettings = null
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("[open] Settings delete error:", error)
    cachedSettings = null
    return NextResponse.json({ success: true }, { status: 200 })
  }
}
