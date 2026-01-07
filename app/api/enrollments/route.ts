import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import mongoose from "mongoose"
import { verifyJWT } from "@/lib/auth/jwt"
import { connectDBWithRetry } from "@/lib/mongodb/connection"
import { Enrollment } from "@/lib/mongodb/models/Enrollment"
import { Course } from "@/lib/mongodb/models/Course"
import { Tour } from "@/lib/mongodb/models/Tour"

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const payload = await verifyJWT(token)
    if (!payload?.userId) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const { courseId, tourId, reference, currency, amount, enrollmentType } = await request.json()

    if (!reference || !currency || typeof amount !== "number") {
      return NextResponse.json({ success: false, error: "Missing enrollment details" }, { status: 400 })
    }

    if (!courseId && !tourId) {
      return NextResponse.json({ success: false, error: "Course or tour is required" }, { status: 400 })
    }

    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 })
    }

    const conn = await connectDBWithRetry(mongoUri)
    if (!conn) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 503 })
    }

    const isValidObjectId = (val: unknown) => typeof val === "string" && /^[0-9a-fA-F]{24}$/.test(val)

    let resolvedType: "course" | "tour" | "combo" = "combo"
    let resolvedAmount = 0
    let resolvedCurrency: "NGN" | "USD" = currency === "USD" ? "USD" : "NGN"

    if (isValidObjectId(courseId)) {
      resolvedType = "course"
      try {
        const course = await Course.findById(courseId).lean({ virtuals: true })
        if (course) {
          resolvedAmount = resolvedCurrency === "NGN" ? Number((course as any).price_ngn || 0) : Number((course as any).price_usd || 0)
        }
      } catch {}
    } else if (isValidObjectId(tourId)) {
      resolvedType = "tour"
      try {
        const tour = await Tour.findById(tourId).lean({ virtuals: true })
        if (tour) {
          resolvedAmount = resolvedCurrency === "NGN" ? Number((tour as any).price_ngn || 0) : Number((tour as any).price_usd || 0)
        }
      } catch {}
    } else {
      resolvedType = "combo"
      const combos: Record<string, { price_ngn: number; price_usd: number }> = {
        "combo:creative-combo": { price_ngn: 12000, price_usd: 10 },
        "combo:communication-combo": { price_ngn: 10000, price_usd: 8 },
        "combo:leadership-combo": { price_ngn: 10000, price_usd: 8 },
        "combo:full-suite": { price_ngn: 30000, price_usd: 25 },
      }
      const key = typeof courseId === "string" ? courseId : typeof tourId === "string" ? tourId : ""
      const combo = combos[key]
      if (combo) {
        resolvedAmount = resolvedCurrency === "NGN" ? combo.price_ngn : combo.price_usd
      }
    }

    if (!resolvedAmount || Number.isNaN(resolvedAmount) || resolvedAmount <= 0) {
      return NextResponse.json({ success: false, error: "Invalid price for selected enrollment" }, { status: 400 })
    }

    // Reuse existing pending enrollment for the same reference to avoid duplicates
    const existing = await Enrollment.findOne({
      $or: [{ paymentReference: reference }, { payment_reference: reference }],
    })

    const enrollment = existing && existing.paymentStatus === "pending"
      ? existing
      : await Enrollment.create({
      userId: new mongoose.Types.ObjectId(payload.userId as string),
      courseId: isValidObjectId(courseId) ? new mongoose.Types.ObjectId(courseId as string) : undefined,
      tourId: isValidObjectId(tourId) ? new mongoose.Types.ObjectId(tourId as string) : undefined,
      paymentReference: reference,
      paymentStatus: "pending",
      amountPaid: resolvedAmount,
      currency: resolvedCurrency,
      enrollmentType: enrollmentType || resolvedType,
    })

    return NextResponse.json({ success: true, data: { id: enrollment._id.toString() } })
  } catch (error) {
    console.error("[open] Enrollment creation error:", error)
    return NextResponse.json({ success: false, error: "Failed to create enrollment" }, { status: 500 })
  }
}

