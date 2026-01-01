import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react"
import mongoose from "mongoose"
import { getCurrentUser, formatMongoData } from "@/lib/mongodb/helpers"
import { connectDB } from "@/lib/mongodb/connection"
import { ModuleLesson } from "@/lib/mongodb/models/ModuleLesson"
import { LessonProgress } from "@/lib/mongodb/models/LessonProgress"

export default async function LessonPage({ params }: { params: { courseId: string; lessonId: string } }) {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/auth/login")
  }

  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    throw new Error("MONGODB_URI not configured")
  }

  await connectDB(mongoUri)

  const lessonDoc = await ModuleLesson.findById(params.lessonId).populate("moduleId").lean({ virtuals: true })
  if (!lessonDoc) {
    return <div>Lesson not found</div>
  }

  const lesson = formatMongoData(lessonDoc)
  const progress = await LessonProgress.findOne({
    userId: user.id,
    lessonId: params.lessonId,
  }).lean({ virtuals: true })

  const isCompleted = Boolean((progress as any)?.completed)

  const contentType = lesson.content_type || lesson.contentType
  const videoUrl = lesson.content_url || (contentType === "video" ? lesson.content : "")
  const textContent = lesson.content_text || (contentType !== "video" ? lesson.content : "")

  async function markComplete(_: FormData) {
    "use server"

    const currentUser = await getCurrentUser()
    if (!currentUser) {
      redirect("/auth/login")
    }

    const mongoUri = process.env.MONGODB_URI
    if (!mongoUri) {
      throw new Error("MONGODB_URI not configured")
    }

    await connectDB(mongoUri)

    await LessonProgress.findOneAndUpdate(
      { userId: currentUser.id, lessonId: params.lessonId },
      {
        $set: {
          userId: new mongoose.Types.ObjectId(currentUser.id),
          lessonId: new mongoose.Types.ObjectId(params.lessonId),
          courseId: new mongoose.Types.ObjectId(params.courseId),
          completed: true,
          completedAt: new Date(),
        },
      },
      { upsert: true },
    )

    redirect(`/learn/${params.courseId}`)
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link
              href={`/learn/${params.courseId}`}
              className="text-[#4E0942] hover:text-[#FF2768] font-medium flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back to Course
            </Link>
          </div>

          <Card className="border-2 border-[#4E0942]">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-2">{lesson.moduleId?.title}</p>
                  <CardTitle className="text-[#4E0942] text-2xl">{lesson.title}</CardTitle>
                </div>
                {isCompleted && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 size={20} />
                    <span className="text-sm font-medium">Completed</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {contentType === "video" && videoUrl && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  {videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be") ? (
                    <iframe src={videoUrl.replace("watch?v=", "embed/")} className="w-full h-full" allowFullScreen />
                  ) : (
                    <video src={videoUrl} controls className="w-full h-full" />
                  )}
                </div>
              )}

              {textContent && (
                <div className="prose max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{textContent}</div>
                </div>
              )}

              {lesson.duration_minutes > 0 && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Duration:</span> {lesson.duration_minutes} minutes
                </div>
              )}

              {!isCompleted && (
                <form action={markComplete}>
                  <Button type="submit" className="w-full bg-[#4E0942] hover:bg-[#4E0942]/90 text-lg py-6">
                    <CheckCircle2 className="mr-2" size={20} />
                    Mark as Complete
                  </Button>
                </form>
              )}

              {isCompleted && (
                <Button asChild className="w-full bg-[#FF2768] hover:bg-[#FF2768]/90 text-lg py-6">
                  <Link href={`/learn/${params.courseId}`}>
                    Continue to Next Lesson
                    <ArrowRight className="ml-2" size={20} />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
