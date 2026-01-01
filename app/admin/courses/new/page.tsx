import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { AdminGuard } from "@/components/admin-guard"
import { connectDB } from "@/lib/mongodb/connection"
import { Course } from "@/lib/mongodb/models/Course"

export default async function NewCoursePage() {
  async function createCourse(formData: FormData) {
    "use server"

    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error("MONGODB_URI not configured")
    }

    await connectDB(mongoUri)

    const courseData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      duration_weeks: Number.parseInt(formData.get("duration_weeks") as string),
      price_ngn: Number.parseInt(formData.get("price_ngn") as string),
      price_usd: Number.parseInt(formData.get("price_usd") as string),
      category: formData.get("category") as string,
      google_classroom_link: formData.get("google_classroom_link") as string,
      is_active: true,
    }

    await Course.create({
      title: courseData.title,
      description: courseData.description,
      category: courseData.category,
      duration_weeks: courseData.duration_weeks,
      durationWeeks: courseData.duration_weeks,
      price_ngn: courseData.price_ngn,
      priceNgn: courseData.price_ngn,
      price_usd: courseData.price_usd,
      priceUsd: courseData.price_usd,
      google_classroom_link: courseData.google_classroom_link,
      googleClassroomLink: courseData.google_classroom_link,
      is_active: courseData.is_active,
      isActive: courseData.is_active,
    })

    redirect("/admin/courses")
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-[#4E0942] mb-2">Create New Course</h1>
              <p className="text-gray-600">Add a new course to your platform</p>
            </div>

            <Card className="border-2 border-[#4E0942]">
              <CardHeader>
                <CardTitle className="text-[#4E0942]">Course Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form action={createCourse} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Course Title *</Label>
                    <Input id="title" name="title" required placeholder="e.g., Professional Writing Masterclass" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      name="description"
                      required
                      rows={4}
                      placeholder="Describe what students will learn..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      name="category"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4E0942]"
                    >
                      <option value="writing">Writing</option>
                      <option value="graphics">Graphics Design</option>
                      <option value="video">Video Editing</option>
                      <option value="speaking">Public Speaking</option>
                      <option value="leadership">Leadership</option>
                      <option value="storytelling">Storytelling</option>
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price_ngn">Price (NGN) *</Label>
                      <Input id="price_ngn" name="price_ngn" type="number" required placeholder="5000" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price_usd">Price (USD) *</Label>
                      <Input id="price_usd" name="price_usd" type="number" required placeholder="5" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration_weeks">Duration (weeks) *</Label>
                    <Input id="duration_weeks" name="duration_weeks" type="number" required placeholder="6" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="google_classroom_link">Google Classroom Link</Label>
                    <Input
                      id="google_classroom_link"
                      name="google_classroom_link"
                      type="url"
                      placeholder="https://classroom.google.com/..."
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1 bg-[#4E0942] hover:bg-[#4E0942]/90">
                      Create Course
                    </Button>
                    <Button
                      asChild
                      type="button"
                      variant="outline"
                      className="flex-1 border-[#4E0942] text-[#4E0942] bg-transparent"
                    >
                      <Link href="/admin/courses">Cancel</Link>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
