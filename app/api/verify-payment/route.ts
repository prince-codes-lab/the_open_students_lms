import { type NextRequest, NextResponse } from "next/server"
import { verifyPaystackPayment } from "@/lib/paystack"
import { AdminSettings } from "@/lib/mongodb/models/AdminSettings"
import { Enrollment } from "@/lib/mongodb/models/Enrollment"
import { connectDBWithRetry } from "@/lib/mongodb/connection"

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json()

    if (!reference) {
      return NextResponse.json({ success: false, error: "Reference is required" }, { status: 400 })
    }

    console.log("[open] Verifying payment reference:", reference)

    let secretOverride = ""
    const mongoUriForSettings = process.env.MONGODB_URI
    if (mongoUriForSettings) {
      try {
        const conn = await connectDBWithRetry(mongoUriForSettings)
        if (conn) {
          const settings = await AdminSettings.findOne().lean()
          const fromDb = (settings as any)?.environmentVariables?.PAYSTACK_SECRET_KEY
          if (typeof fromDb === "string" && fromDb) {
            secretOverride = fromDb
          }
        }
      } catch (e) {
        console.error("[open] Failed to read admin settings for secret override:", e)
      }
    }
    if (!secretOverride || secretOverride === "") {
      secretOverride = process.env.PAYSTACK_SECRET_KEY || ""
    }

    const verification = await verifyPaystackPayment(reference, secretOverride)

    if (!verification.success) {
      console.error("[open] Payment verification failed:", verification.error)
      return NextResponse.json({ success: false, error: verification.error }, { status: 400 })
    }

    console.log("[open] Payment verified successfully:", verification.data)

    // Update enrollment status in database
    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 })
    }

    const conn = await connectDBWithRetry(mongoUri)
    if (!conn) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 503 })
    }

    const enrollment = await Enrollment.findOne({
      $or: [{ paymentReference: reference }, { payment_reference: reference }],
    })

    if (!enrollment) {
      console.error("[open] Enrollment not found for reference:", reference)
      return NextResponse.json({ success: false, error: "Enrollment not found" }, { status: 404 })
    }

    if (!verification.data) {
      enrollment.paymentStatus = "failed"
      enrollment.payment_status = "failed"
      await enrollment.save()
      return NextResponse.json({ success: false, error: "Verification missing payment data" }, { status: 400 })
    }

    const verifiedAmount = Number(verification.data.amount)
    const verifiedCurrency = String(verification.data.currency)

    const expectedAmountMinor = Math.round(Number(enrollment.amountPaid || 0) * 100)
    const expectedCurrency = String(enrollment.currency || "")

    if (verifiedAmount !== expectedAmountMinor || verifiedCurrency !== expectedCurrency) {
      enrollment.paymentStatus = "failed"
      enrollment.payment_status = "failed"
      await enrollment.save()
      return NextResponse.json(
        {
          success: false,
          error: "Payment mismatch detected",
        },
        { status: 400 },
      )
    }

    enrollment.paymentStatus = "completed"
    enrollment.payment_status = "completed"
    await enrollment.save()

    console.log("[open] Enrollment updated successfully")

    return NextResponse.json({ success: true, data: verification.data })
  } catch (error) {
    console.error("[open] Payment verification error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Verification failed" },
      { status: 500 },
    )
  }
}
