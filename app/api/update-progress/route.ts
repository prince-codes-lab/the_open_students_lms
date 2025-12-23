import { type NextRequest, NextResponse } from "next/server"
import { Enrollment } from "@/lib/mongodb/models/Enrollment"
import { connectDB } from "@/lib/mongodb/connection"

export async function POST(request: NextRequest) {
  try {
    const { enrollmentId, progress } = await request.json()

    if (!enrollmentId || progress === undefined) {
      return NextResponse.json({ success: false, error: "Enrollment ID and progress are required" }, { status: 400 })
    }

    if (progress < 0 || progress > 100) {
      return NextResponse.json({ success: false, error: "Progress must be between 0 and 100" }, { status: 400 })
    }

    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 })
    }

    await connectDB(mongoUri)

    const enrollment = await Enrollment.findById(enrollmentId)
    if (!enrollment) {
      return NextResponse.json({ success: false, error: "Enrollment not found" }, { status: 404 })
    }

    enrollment.progress = progress
    await enrollment.save()

    // If progress is 100%, automatically complete the course
    if (progress === 100) {
      const completeResponse = await fetch(`${request.nextUrl.origin}/api/complete-course`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId }),
      })

      const completeResult = await completeResponse.json()

      return NextResponse.json({
        success: true,
        completed: true,
        certificate: completeResult.data,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[open] Progress update error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to update progress" },
      { status: 500 },
    )
  }
}