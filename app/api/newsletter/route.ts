import { NextResponse } from "next/server"
import { connectDBWithRetry } from "@/lib/mongodb/connection"
import { Subscriber } from "@/lib/mongodb/models/Subscriber"
import { subscribeToMailchimp } from "@/lib/mailchimp"
import { AdminSettings } from "@/lib/mongodb/models/AdminSettings"

export async function POST(request: Request) {
  try {
    const mongoUri = process.env.MONGODB_URI
    const body = await request.json()
    const { name, email, location } = body || {}
    
    if (!email || typeof email !== "string") {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    // Save to MongoDB
    const conn = mongoUri ? await connectDBWithRetry(mongoUri) : null
    if (conn) {
      const existing = await Subscriber.findOne({ email })
      if (existing) {
        existing.name = name ?? existing.name
        existing.location = location ?? existing.location
        await existing.save()
      } else {
        await Subscriber.create({ name, email, location })
      }
    }

    // Subscribe to Mailchimp if configured
    let mailchimpApiKey = process.env.MAILCHIMP_API_KEY || ""
    let mailchimpAudience = process.env.MAILCHIMP_AUDIENCE_ID || ""

    // Try to get from admin settings database
    if (mongoUri) {
      try {
        const settings = await AdminSettings.findOne().lean()
        const envVars = (settings as any)?.environmentVariables || {}
        if (envVars.MAILCHIMP_API_KEY) mailchimpApiKey = envVars.MAILCHIMP_API_KEY
        if (envVars.MAILCHIMP_AUDIENCE_ID) mailchimpAudience = envVars.MAILCHIMP_AUDIENCE_ID
      } catch (e) {
        console.error("[open] Failed to read mailchimp settings from db:", e)
      }
    }

    if (mailchimpApiKey && mailchimpAudience) {
      const mailchimpResult = await subscribeToMailchimp(
        {
          email,
          firstName: name?.split(" ")[0] || "",
          lastName: name?.split(" ").slice(1).join(" ") || "",
        },
        mailchimpApiKey,
        mailchimpAudience,
      )

      if (!mailchimpResult.success) {
        console.warn("[open] Mailchimp subscription failed (but local DB saved):", mailchimpResult.error)
        // Don't fail the request - local DB was saved
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[open] Newsletter subscribe error:", error)
    return NextResponse.json({ success: false, error: "Failed to subscribe" }, { status: 500 })
  }
}
