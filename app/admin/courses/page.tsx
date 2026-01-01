import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Edit } from "lucide-react"
import { AdminGuard } from "@/components/admin-guard"
import { connectDB } from "@/lib/mongodb/connection"
import { Course } from "@/lib/mongodb/models/Course"
import { formatMongoData } from "@/lib/mongodb/helpers"

export const dynamic = "force-dynamic"

export default async function AdminCoursesPage() {
  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-8">
            <Card className="border-2 border-[#4E0942]">
              <CardHeader>
                <CardTitle className="text-[#4E0942]">Courses Unavailable</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">Database connection is not configured. Set `MONGODB_URI` to manage courses.</p>
                <Button asChild variant="outline" className="border-[#4E0942] text-[#4E0942] bg-transparent">
                  <Link href="/admin">← Back to Admin</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AdminGuard>
    )
  }

  await connectDB(mongoUri)

  const rawCourses = await Course.find()
    .sort({ createdAt: -1 })
    .lean({ virtuals: true })

  const courses = formatMongoData(rawCourses) || []

  return (
    <AdminGuard>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-[#4E0942] mb-2">Manage Courses</h1>
              <p className="text-gray-600">Create and edit course content</p>
            </div>
            <Button asChild className="bg-[#4E0942] hover:bg-[#4E0942]/90">
              <Link href="/admin/courses/new">
                <Plus className="mr-2" size={18} />
                Add New Course
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses?.map((course: any) => (
              <Card key={course.id} className="border-2 hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle className="text-[#4E0942] text-lg">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#FF2768] font-bold">
                      ₦{(course.price_ngn || course.priceNgn || 0).toLocaleString()} / $
                      {course.price_usd || course.priceUsd || 0}
                    </span>
                    <span className="text-gray-500">
                      {course.duration_weeks || course.durationWeeks || 0} weeks
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" className="flex-1 bg-[#4E0942] hover:bg-[#4E0942]/90">
                      <Link href={`/admin/courses/${course.id}`}>
                        <Edit className="mr-1" size={14} />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="flex-1 border-[#FF2768] text-[#FF2768] bg-transparent"
                    >
                      <Link href={`/admin/courses/${course.id}/content`}>
                        <Plus className="mr-1" size={14} />
                        Content
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {courses?.length === 0 && (
            <Card className="border-2 border-dashed border-[#DD91D0]">
              <CardContent className="p-12 text-center">
                <p className="text-gray-600 mb-4">No courses yet. Create your first course to get started!</p>
                <Button asChild className="bg-[#4E0942] hover:bg-[#4E0942]/90">
                  <Link href="/admin/courses/new">
                    <Plus className="mr-2" size={18} />
                    Create First Course
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="mt-8">
            <Button asChild variant="outline" className="border-[#4E0942] text-[#4E0942] bg-transparent">
              <Link href="/admin">← Back to Admin</Link>
            </Button>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
