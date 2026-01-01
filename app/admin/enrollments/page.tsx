import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { AdminGuard } from "@/components/admin-guard"
import { BookOpen, MapPin, Calendar, DollarSign } from "lucide-react"
import { connectDB } from "@/lib/mongodb/connection"
import { Enrollment } from "@/lib/mongodb/models/Enrollment"
import { Profile } from "@/lib/mongodb/models/Profile"
import { formatMongoData } from "@/lib/mongodb/helpers"

export const dynamic = "force-dynamic"

export default async function AdminEnrollmentsPage() {
  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-8">
            <Card className="border-2 border-[#4E0942]">
              <CardHeader>
                <CardTitle className="text-[#4E0942]">Enrollments Unavailable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Database connection is not configured. Set `MONGODB_URI` to view enrollments.</p>
                <Link href="/admin" className="text-[#4E0942] hover:text-[#FF2768] font-medium">
                  ← Back to Admin Dashboard
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminGuard>
    )
  }

  await connectDB(mongoUri)

  const enrollmentDocs = await Enrollment.find()
    .populate("courseId")
    .populate("tourId")
    .populate("userId")
    .sort({ createdAt: -1 })
    .lean({ virtuals: true })

  const userIds = Array.from(
    new Set(
      enrollmentDocs
        .map((doc: any) => doc.user_id || doc.userId?._id?.toString())
        .filter((value): value is string => Boolean(value)),
    ),
  )

  const profileDocs = await Profile.find({ userId: { $in: userIds } }).lean({ virtuals: true })
  const profileMap = new Map(profileDocs.map((profile) => [profile.user_id, formatMongoData(profile)]))

  const enrollments = enrollmentDocs.map((doc: any) => {
    const formatted = formatMongoData(doc)
    const course = doc.courseId ? formatMongoData(doc.courseId) : null
    const tour = doc.tourId ? formatMongoData(doc.tourId) : null
    const profile = profileMap.get(doc.user_id) || profileMap.get(doc.userId?._id?.toString())
    const user = doc.userId

    const studentName =
      profile?.full_name || profile?.fullName || user?.fullName || user?.email || "Unknown Student"

    return {
      ...formatted,
      studentName,
      studentEmail: profile?.email || user?.email,
      course,
      tour,
    }
  })

  const completedEnrollments = enrollments.filter((e) => e.payment_status === "completed")
  const pendingEnrollments = enrollments.filter((e) => e.payment_status === "pending")

  return (
    <AdminGuard>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#4E0942] mb-2">Enrollments</h1>
            <p className="text-gray-600">Manage all course and tour enrollments</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-2 border-[#4E0942]">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-[#4E0942]">{enrollments.length}</div>
                <div className="text-sm text-gray-600">Total Enrollments</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-[#FEEB00]">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-[#4E0942]">{completedEnrollments.length}</div>
                <div className="text-sm text-gray-600">Completed Payments</div>
              </CardContent>
            </Card>
            <Card className="border-2 border-[#FF2768]">
              <CardContent className="p-6">
                <div className="text-2xl font-bold text-[#FF2768]">{pendingEnrollments.length}</div>
                <div className="text-sm text-gray-600">Pending Payments</div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-2 border-[#4E0942]">
            <CardHeader>
              <CardTitle className="text-[#4E0942]">All Enrollments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrollments.map((enrollment) => {
                  const programName = enrollment.course?.title || enrollment.tour?.title || "Unknown Program"
                  const programType = enrollment.course ? "Course" : "Tour"
                  const Icon = enrollment.course ? BookOpen : MapPin

                  return (
                    <div key={enrollment.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 bg-[#4E0942] rounded-full flex items-center justify-center flex-shrink-0">
                            <Icon size={20} className="text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-[#4E0942]">{enrollment.studentName}</h3>
                            <p className="text-sm text-gray-600">{enrollment.studentEmail}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs capitalize">
                                {programType}
                              </Badge>
                              <span className="text-sm text-gray-700">{programName}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge
                            className={`${
                              enrollment.payment_status === "completed"
                                ? "bg-[#FEEB00] text-[#4E0942]"
                                : "bg-gray-400 text-white"
                            }`}
                          >
                            {enrollment.payment_status}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <DollarSign size={14} />
                            <span>
                              {enrollment.currency} {enrollment.amount_paid?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {enrollment.payment_status === "completed" && programType === "Course" && (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-semibold text-[#4E0942]">{enrollment.progress || 0}%</span>
                          </div>
                          <Progress value={enrollment.progress || 0} className="h-2" />
                          {enrollment.completed && (
                            <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
                              <Badge className="bg-green-500 text-white">Completed</Badge>
                              {enrollment.certificate_sent && (
                                <Badge className="bg-[#FEEB00] text-[#4E0942]">Certificate Sent</Badge>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={12} />
                        <span>
                          Enrolled:{" "}
                          {enrollment.createdAt ? new Date(enrollment.createdAt).toLocaleDateString() : "Date unavailable"}
                        </span>
                        {enrollment.payment_reference && (
                          <span className="ml-4">Ref: {enrollment.payment_reference}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
                {enrollments.length === 0 && <p className="text-center text-gray-500 py-8">No enrollments yet</p>}
              </div>
            </CardContent>
          </Card>

          <div className="mt-8">
            <Link href="/admin" className="text-[#4E0942] hover:text-[#FF2768] font-medium flex items-center gap-2">
              ← Back to Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
