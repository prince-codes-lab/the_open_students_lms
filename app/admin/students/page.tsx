import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { AdminGuard } from "@/components/admin-guard"
import { User, Mail, MapPin, Calendar } from "lucide-react"
import { connectDB } from "@/lib/mongodb/connection"
import { Profile } from "@/lib/mongodb/models/Profile"
import { Enrollment } from "@/lib/mongodb/models/Enrollment"
import { formatMongoData } from "@/lib/mongodb/helpers"

export const dynamic = "force-dynamic"

export default async function AdminStudentsPage() {
  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-8">
            <Card className="border-2 border-[#4E0942]">
              <CardHeader>
                <CardTitle className="text-[#4E0942]">Students Unavailable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Database connection is not configured. Set `MONGODB_URI` to view students.</p>
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

  const profileDocs = await Profile.find().sort({ createdAt: -1 }).lean({ virtuals: true })
  const enrollmentDocs = await Enrollment.find().select("userId user_id").lean({ virtuals: true })

  const enrollmentCounts = enrollmentDocs.reduce<Record<string, number>>((acc, enrollment) => {
    const userId = (enrollment.user_id as string) || enrollment.userId?.toString()
    if (!userId) return acc
    acc[userId] = (acc[userId] || 0) + 1
    return acc
  }, {})

  const students = formatMongoData(profileDocs).map((profile: any) => ({
    ...profile,
    enrollmentCount: enrollmentCounts[profile.user_id] || 0,
  }))

  return (
    <AdminGuard>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#4E0942] mb-2">Students</h1>
            <p className="text-gray-600">View and manage all registered students</p>
          </div>

          <Card className="border-2 border-[#4E0942]">
            <CardHeader>
              <CardTitle className="text-[#4E0942]">All Students ({students.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {students.map((student: any) => (
                  <div key={student.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#4E0942] rounded-full flex items-center justify-center">
                            <User size={20} className="text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-[#4E0942]">{student.full_name || "No name"}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail size={14} />
                              <span>{student.email}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 ml-13">
                          {student.country && (
                            <div className="flex items-center gap-1">
                              <MapPin size={14} />
                              <span>{student.country}</span>
                            </div>
                          )}
                          {student.age && <span>Age: {student.age}</span>}
                          {student.phone && <span>Phone: {student.phone}</span>}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 ml-13">
                          <Calendar size={12} />
                          <span>
                            Joined:{" "}
                            {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "Date unavailable"}
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-[#4E0942] text-white">{student.enrollmentCount} enrollments</Badge>
                    </div>
                  </div>
                ))}
                {students.length === 0 && <p className="text-center text-gray-500 py-8">No students registered yet</p>}
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
