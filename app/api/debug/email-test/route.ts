import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const to = (body && (body.to as string)) || process.env.SMTP_TEST_TO || process.env.SMTP_FROM || "test@example.com"
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    const html = `<p>This is a test email from The OPEN Students sent at ${new Date().toISOString()}</p><p>Site: ${siteUrl}</p>`

    const result = await sendEmail({ to, subject: "[TEST] The OPEN Students - Email Test", html })

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Test email sent", to })
  } catch (error) {
    console.error("[open] Email test error:", error)
    return NextResponse.json({ success: false, error: "Email test failed" }, { status: 500 })
  }
}
