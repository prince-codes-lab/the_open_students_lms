import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Users, Award, TrendingUp, Plus } from "lucide-react"
import { AdminGuard } from "@/components/admin-guard"
import { connectDB } from "@/lib/mongodb/connection"
import { Course } from "@/lib/mongodb/models/Course"
import { Enrollment } from "@/lib/mongodb/models/Enrollment"
import { Certificate } from "@/lib/mongodb/models/Certificate"
import { Profile } from "@/lib/mongodb/models/Profile"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-8">
            <Card className="border-2 border-[#4E0942]">
              <CardHeader>
                <CardTitle className="text-[#4E0942]">Admin Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Database connection is not configured. Set `MONGODB_URI` to enable dashboard stats.</p>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button asChild variant="outline" className="border-[#4E0942] text-[#4E0942] bg-transparent">
                    <Link href="/admin/courses">Manage Courses</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-[#FF2768] text-[#FF2768] bg-transparent">
                    <Link href="/admin/students">View Students</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-[#DD91D0] text-[#DD91D0] bg-transparent">
                    <Link href="/admin/certificates">View Certificates</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-[#FEEB00] text-[#4E0942] bg-transparent">
                    <Link href="/admin/analytics">View Analytics</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminGuard>
    )
  }

  await connectDB(mongoUri)

  const [coursesCount, enrollments, certificatesCount, studentsCount] = await Promise.all([
    Course.countDocuments(),
    Enrollment.find().lean(),
    Certificate.countDocuments(),
    Profile.countDocuments(),
  ])

  const paymentStatus = (enrollment: any) => enrollment.paymentStatus || enrollment.payment_status || "pending"
  const completedEnrollments = enrollments.filter((enrollment) => paymentStatus(enrollment) === "completed")

  const stats = [
    {
      title: "Total Courses",
      value: coursesCount,
      icon: BookOpen,
      color: "#4E0942",
    },
    {
      title: "Total Students",
      value: studentsCount,
      icon: Users,
      color: "#FF2768",
    },
    {
      title: "Active Enrollments",
      value: completedEnrollments.length,
      icon: TrendingUp,
      color: "#FEEB00",
    },
    {
      title: "Certificates Issued",
      value: certificatesCount,
      icon: Award,
      color: "#DD91D0",
    },
  ]

  return (
    <AdminGuard>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#4E0942] mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Manage courses, students, and content</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title} className="border-2 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold" style={{ color: stat.color }}>
                        {stat.value}
                      </p>
                    </div>
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}20` }}
                    >
                      <stat.icon size={24} style={{ color: stat.color }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 border-[#FEEB00] hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-[#4E0942]">Analytics & Reports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full bg-[#FEEB00] hover:bg-[#FEEB00]/90 text-[#4E0942]">
                  <Link href="/admin/analytics">
                    <TrendingUp className="mr-2" size={18} />
                    View Analytics
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#4E0942] hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-[#4E0942]">Course Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full bg-[#4E0942] hover:bg-[#4E0942]/90">
                  <Link href="/admin/courses">
                    <BookOpen className="mr-2" size={18} />
                    Manage Courses
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-[#4E0942] text-[#4E0942] bg-transparent">
                  <Link href="/admin/courses/new">
                    <Plus className="mr-2" size={18} />
                    Add New Course
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#FF2768] hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-[#FF2768]">Student Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full bg-[#FF2768] hover:bg-[#FF2768]/90">
                  <Link href="/admin/students">
                    <Users className="mr-2" size={18} />
                    View Students
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-[#FF2768] text-[#FF2768] bg-transparent">
                  <Link href="/admin/enrollments">
                    <TrendingUp className="mr-2" size={18} />
                    Manage Enrollments
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#DD91D0] hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle className="text-[#DD91D0]">Certificates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full bg-[#DD91D0] hover:bg-[#DD91D0]/90">
                  <Link href="/admin/certificates">
                    <Award className="mr-2" size={18} />
                    View Certificates
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Back to Site */}
          <div className="mt-8">
            <Button asChild variant="outline" className="border-[#4E0942] text-[#4E0942] bg-transparent">
              <Link href="/dashboard">← Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
