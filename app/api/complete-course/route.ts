import { type NextRequest, NextResponse } from "next/server"
import { Enrollment } from "@/lib/mongodb/models/Enrollment"
import { Certificate } from "@/lib/mongodb/models/Certificate"
import { Course } from "@/lib/mongodb/models/Course"
import { Tour } from "@/lib/mongodb/models/Tour"
import { Profile } from "@/lib/mongodb/models/Profile"
import { connectDB } from "@/lib/mongodb/connection"
import { generateCertificateNumber, generateCertificateSVG, sendCertificateEmail } from "@/lib/certificates"

export async function POST(request: NextRequest) {
  try {
    const { enrollmentId } = await request.json()

    if (!enrollmentId) {
      return NextResponse.json({ success: false, error: "Enrollment ID is required" }, { status: 400 })
    }

    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 })
    }

    await connectDB(mongoUri)

    // Get enrollment details with populated references
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate("courseId")
      .populate("tourId")
      .populate("userId")

    if (!enrollment) {
      return NextResponse.json({ success: false, error: "Enrollment not found" }, { status: 404 })
    }

    // Check if already completed
    if (enrollment.completed) {
      return NextResponse.json({ success: false, error: "Course already completed" }, { status: 400 })
    }

    // Get course or tour details
    const course = enrollment.courseId ? await Course.findById(enrollment.courseId) : null
    const tour = enrollment.tourId ? await Tour.findById(enrollment.tourId) : null

    // Get user profile
    const profile = await Profile.findOne({ userId: enrollment.userId })

    // Mark as completed
    enrollment.completed = true
    enrollment.progress = 100
    enrollment.completedAt = new Date()
    enrollment.completed_at = new Date()
    await enrollment.save()

    // Generate certificate
    const certificateNumber = generateCertificateNumber()
    const studentName = profile?.fullName || profile?.full_name || "Student"
    const programName = course?.title || tour?.title || "Program"
    const completionDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    const certificateSVG = generateCertificateSVG({
      studentName,
      courseName: course?.title,
      tourName: tour?.title,
      completionDate,
      certificateNumber,
    })

    // Create data URL
    const certificateUrl = `data:image/svg+xml;base64,${Buffer.from(certificateSVG).toString("base64")}`

    // Create certificate record
    const userIdValue = (enrollment.userId as any)?._id ?? enrollment.userId

    const certificate = new Certificate({
      enrollmentId: enrollment._id,
      enrollment_id: enrollment._id,
      userId: userIdValue,
      user_id: userIdValue?.toString(),
      certificateNumber,
      certificate_number: certificateNumber,
      certificateUrl,
      certificate_url: certificateUrl,
      issuedAt: new Date(),
      issued_at: new Date(),
    })

    await certificate.save()

    // Send certificate email
    const emailResult = await sendCertificateEmail(
      profile?.email || "",
      studentName,
      programName,
      certificateUrl,
    )

    if (emailResult.success) {
      enrollment.certificateSent = true
      enrollment.certificate_sent = true
      enrollment.certificateSentAt = new Date()
      enrollment.certificate_sent_at = new Date()
      await enrollment.save()
    }

    return NextResponse.json({
      success: true,
      data: {
        certificateNumber,
        certificateUrl,
        emailSent: emailResult.success,
      },
    })
  } catch (error) {
    console.error("[open] Course completion error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to complete course" },
      { status: 500 },
    )
  }
}