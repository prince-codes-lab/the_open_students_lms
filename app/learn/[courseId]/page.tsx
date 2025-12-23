import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, Circle, PlayCircle, FileText, ClipboardList, Award } from "lucide-react"
import { getCurrentUser, formatMongoData } from "@/lib/mongodb/helpers"
import { connectDB } from "@/lib/mongodb/connection"
import { Enrollment } from "@/lib/mongodb/models/Enrollment"
import { Course } from "@/lib/mongodb/models/Course"
import { CourseModule } from "@/lib/mongodb/models/CourseModule"
import { ModuleLesson } from "@/lib/mongodb/models/ModuleLesson"
import { LessonProgress } from "@/lib/mongodb/models/LessonProgress"

const iconMap: Record<string, typeof PlayCircle> = {
  video: PlayCircle,
  text: FileText,
  quiz: ClipboardList,
  assignment: Award,
}

export default async function LearnCoursePage({ params }: { params: { courseId: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    throw new Error("MONGODB_URI not configured")
  }

  await connectDB(mongoUri)

  const enrollment = await Enrollment.findOne({
    userId: user.id,
    courseId: params.courseId,
  }).lean({ virtuals: true })

  if (!enrollment) {
    redirect("/programs")
  }

  const enrollmentProgress = Number((enrollment as any)?.progress ?? 0)

  const courseDoc = await Course.findById(params.courseId).lean({ virtuals: true })
  if (!courseDoc) {
    return <div>Course not found</div>
  }

  const modules = await CourseModule.find({ courseId: params.courseId }).sort({ orderIndex: 1 }).lean({ virtuals: true })
  const moduleIds = modules.map((mod) => mod._id?.toString()).filter(Boolean)

  const lessons = await ModuleLesson.find({ moduleId: { $in: moduleIds } })
    .sort({ orderIndex: 1 })
    .lean({ virtuals: true })

  const lessonsByModule = lessons.reduce<Record<string, any[]>>((acc, lesson) => {
    const moduleId = lesson.moduleId?.toString()
    if (!moduleId) return acc
    if (!acc[moduleId]) {
      acc[moduleId] = []
    }
    acc[moduleId].push(lesson)
    return acc
  }, {})

  const progressDocs = await LessonProgress.find({ userId: user.id }).lean({ virtuals: true })
  const progressMap = new Map(
    progressDocs.map((progress) => [progress.lesson_id || progress.lessonId?.toString(), progress.completed]),
  )

  const course = formatMongoData(courseDoc)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#DD91D0]/10 to-[#FF2768]/10">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#4E0942] mb-2">{course.title}</h1>
          <p className="text-gray-600">{course.description}</p>
        </div>

        <Card className="border-2 border-[#4E0942] mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#4E0942]">Course Progress</span>
              <span className="text-sm font-bold text-[#4E0942]">{enrollmentProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-[#4E0942] to-[#DD91D0] h-3 rounded-full transition-all"
                style={{ width: `${enrollmentProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {modules.map((module, moduleIndex) => {
            const moduleLessons = lessonsByModule[module._id?.toString() || ""] || []
            return (
              <Card key={module._id?.toString()} className="border-2 border-[#DD91D0]">
                <CardHeader>
                  <CardTitle className="text-[#4E0942]">
                    Module {moduleIndex + 1}: {module.title}
                  </CardTitle>
                  {module.description && <p className="text-sm text-gray-600">{module.description}</p>}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {moduleLessons.map((lesson: any) => {
                      const lessonId = lesson._id?.toString()
                      const isCompleted = lessonId ? progressMap.get(lessonId) : false
                      const Icon = iconMap[lesson.content_type] || FileText

                      return (
                        <Link key={lessonId} href={`/learn/${params.courseId}/lesson/${lessonId}`} className="block">
                          <div className="flex items-center gap-4 p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-[#FF2768] hover:shadow-md transition-all group">
                            <div className="flex-shrink-0">
                              {isCompleted ? (
                                <CheckCircle2 size={24} className="text-green-500" />
                              ) : (
                                <Circle size={24} className="text-gray-400 group-hover:text-[#FF2768]" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Icon size={16} className="text-[#4E0942]" />
                                <span className="font-medium text-[#4E0942] group-hover:text-[#FF2768]">
                                  {lesson.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-gray-600">
                                <span className="capitalize">{lesson.content_type}</span>
                                {lesson.duration_minutes > 0 && <span>• {lesson.duration_minutes} min</span>}
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {modules.length === 0 && (
            <Card className="border-2 border-dashed border-[#DD91D0]">
              <CardContent className="p-12 text-center">
                <p className="text-gray-600 mb-4">Course content is being prepared. Check back soon!</p>
                {course.google_classroom_link && (
                  <Button asChild className="bg-[#4E0942] hover:bg-[#4E0942]/90">
                    <Link href={course.google_classroom_link} target="_blank">
                      Open Google Classroom
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8">
          <Button asChild variant="outline" className="border-[#4E0942] text-[#4E0942] bg-transparent">
            <Link href="/dashboard">← Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
