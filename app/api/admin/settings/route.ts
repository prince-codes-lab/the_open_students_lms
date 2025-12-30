import { NextResponse } from "next/server"
import { connectDBWithRetry } from "@/lib/mongodb/connection"
import { AdminSettings } from "@/lib/mongodb/models/AdminSettings"
import * as fs from "fs"
import * as path from "path"

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
      NEXT_PUBLIC_ADMIN_EMAIL: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "",
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",
      MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY || "",
      MAILCHIMP_AUDIENCE_ID: process.env.MAILCHIMP_AUDIENCE_ID || "",
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
      NEXT_PUBLIC_ADMIN_EMAIL: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "",
      ADMIN_EMAIL: process.env.ADMIN_EMAIL || "",
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "",
      MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY || "",
      MAILCHIMP_AUDIENCE_ID: process.env.MAILCHIMP_AUDIENCE_ID || "",
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

// PUT endpoint to update environment variables
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const envVariables = body.environmentVariables || {}

    // Save to database for persistence
    const mongoUri = process.env.MONGODB_URI
    if (mongoUri) {
      try {
        const conn = await connectDBWithRetry(mongoUri)
        if (conn) {
          let settings = await AdminSettings.findOne()
          if (!settings) {
            settings = new AdminSettings({ environmentVariables: envVariables })
          } else {
            settings.environmentVariables = envVariables
          }
          await settings.save()
          cachedSettings = settings
        }
      } catch (e) {
        console.error("[open] Failed to save env vars to database:", e)
      }
    }

    // Note: Actual process.env updates would require server restart
    // This stores them for next.js to read on restart, but the values 
    // won't be live until redeployment with .env.local update
    console.log("[open] Environment variables updated (requires deployment to take effect)")

    return NextResponse.json({
      success: true,
      message: "Environment variables saved. Changes will take effect after deployment.",
      environmentVariables: envVariables,
    })
  } catch (error) {
    console.error("[open] Environment variable update error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update environment variables",
      },
      { status: 500 },
    )
  }
}
