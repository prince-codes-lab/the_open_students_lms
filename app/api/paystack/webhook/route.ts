import { type NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb/connection"
import { Enrollment } from "@/lib/mongodb/models/Enrollment"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY || ""
    if (!secret) {
      return NextResponse.json({ success: false, error: "Payment system not configured" }, { status: 500 })
    }

    const bodyText = await request.text()
    const signature = request.headers.get("x-paystack-signature") || ""

    const hash = crypto.createHmac("sha512", secret).update(bodyText).digest("hex")
    if (hash !== signature) {
      return NextResponse.json({ success: false, error: "Invalid signature" }, { status: 400 })
    }

    const event = JSON.parse(bodyText)

    if (event.event === "charge.success") {
      const reference: string | undefined = event.data?.reference

      if (reference) {
        const mongoUri = process.env.MONGODB_URI
        if (!mongoUri) {
          return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 })
        }

        await connectDB(mongoUri)

        const enrollment = await Enrollment.findOne({
          $or: [{ paymentReference: reference }, { payment_reference: reference }],
        })

        if (enrollment) {
          const amountMinor = Number(event.data?.amount || 0)
          const currency = String(event.data?.currency || "")

          const expectedAmountMinor = Math.round(Number(enrollment.amountPaid || 0) * 100)
          const expectedCurrency = String(enrollment.currency || "")

          if (amountMinor === expectedAmountMinor && currency === expectedCurrency) {
            enrollment.paymentStatus = "completed"
            enrollment.payment_status = "completed"
            await enrollment.save()
          } else {
            enrollment.paymentStatus = "failed"
            enrollment.payment_status = "failed"
            await enrollment.save()
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[open] Paystack webhook error:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
