import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { redirect } from "next/navigation"
import { BookOpen, MapPin, Award, TrendingUp, Calendar, ExternalLink, Download, LogOut, User } from "lucide-react"
import { ProgressUpdater } from "@/components/progress-updater"
import { getCurrentUser, formatMongoData } from "@/lib/mongodb/helpers"
import { Enrollment } from "@/lib/mongodb/models/Enrollment"
import { Profile } from "@/lib/mongodb/models/Profile"
import { Course } from "@/lib/mongodb/models/Course"
import { Tour } from "@/lib/mongodb/models/Tour"
import { connectDB } from "@/lib/mongodb/connection"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/login?redirect=/dashboard")
  }

  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <section className="pt-32 pb-16">
          <div className="container mx-auto px-4">
            <Card className="border-2 border-[#4E0942]">
              <CardHeader>
                <CardTitle className="text-[#4E0942]">Dashboard Unavailable</CardTitle>
                <CardDescription>Database connection is not configured. Set `MONGODB_URI` to load dashboard data.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/programs" className="text-[#4E0942] hover:text-[#FF2768] font-medium">← Browse Programs</Link>
              </CardContent>
            </Card>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  await connectDB(mongoUri)

  // Get user profile
  const profile = await Profile.findOne({ userId: user.id })

  // Get enrollments
  const enrollments = await Enrollment.find({
    userId: user.id,
    paymentStatus: "completed",
  })
    .populate("courseId")
    .populate("tourId")
    .sort({ createdAt: -1 })

  // Get certificates
  const certificates = await Enrollment.find({
    userId: user.id,
    completed: true,
  })
    .populate("courseId")
    .populate("tourId")

  const courseEnrollments = enrollments.filter((e: any) => e.courseId)
  const tourEnrollments = enrollments.filter((e: any) => e.tourId)
  const completedCount = enrollments.filter((e: any) => e.completed).length
  const averageProgress =
    enrollments.length > 0
      ? Math.round(enrollments.reduce((sum: number, e: any) => sum + (e.progress || 0), 0) / enrollments.length)
      : 0

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in-up">
              <div>
                <h1 className="text-4xl font-bold text-[#4E0942] mb-2">
                  Welcome back, {profile?.fullName || profile?.full_name || "Student"}!
                </h1>
                <p className="text-lg text-gray-700">Continue your learning journey</p>
              </div>
              <div className="flex gap-3">
                <Button asChild variant="outline" className="border-2 border-[#4E0942] text-[#4E0942] bg-transparent">
                  <Link href="/dashboard/profile">
                    <User size={18} className="mr-2" />
                    Profile
                  </Link>
                </Button>
                <form action="/api/auth/logout" method="POST">
                  <Button
                    type="submit"
                    variant="outline"
                    className="border-2 border-[#FF2768] text-[#FF2768] bg-transparent"
                  >
                    <LogOut size={18} className="mr-2" />
                    Logout
                  </Button>
                </form>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="border-2 border-[#4E0942]/20 hover:border-[#4E0942] transition-all animate-scale-in">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <BookOpen className="text-[#4E0942]" size={24} />
                    <Badge className="bg-[#4E0942] text-white">{courseEnrollments.length}</Badge>
                  </div>
                  <div className="text-2xl font-bold text-[#4E0942]">{courseEnrollments.length}</div>
                  <div className="text-sm text-gray-600">Active Courses</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-[#FF2768]/20 hover:border-[#FF2768] transition-all animate-scale-in delay-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <MapPin className="text-[#FF2768]" size={24} />
                    <Badge className="bg-[#FF2768] text-white">{tourEnrollments.length}</Badge>
                  </div>
                  <div className="text-2xl font-bold text-[#FF2768]">{tourEnrollments.length}</div>
                  <div className="text-sm text-gray-600">Upcoming Tours</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-[#FEEB00]/20 hover:border-[#FEEB00] transition-all animate-scale-in delay-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="text-[#FEEB00]" size={24} />
                    <Badge className="bg-[#FEEB00] text-[#4E0942]">{certificates.length}</Badge>
                  </div>
                  <div className="text-2xl font-bold text-[#4E0942]">{certificates.length}</div>
                  <div className="text-sm text-gray-600">Certificates Earned</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-[#DD91D0]/20 hover:border-[#DD91D0] transition-all animate-scale-in delay-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="text-[#DD91D0]" size={24} />
                    <Badge className="bg-[#DD91D0] text-white">{averageProgress}%</Badge>
                  </div>
                  <div className="text-2xl font-bold text-[#4E0942]">{averageProgress}%</div>
                  <div className="text-sm text-gray-600">Average Progress</div>
                </CardContent>
              </Card>
            </div>

            {/* My Courses */}
            {courseEnrollments.length > 0 && (
              <div className="space-y-6 animate-fade-in-up delay-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-[#4E0942]">My Courses</h2>
                  <Button asChild variant="outline" className="border-2 border-[#4E0942] text-[#4E0942] bg-transparent">
                    <Link href="/programs">Browse More</Link>
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {courseEnrollments.map((enrollment: any) => {
                    const course = enrollment.courseId
                    if (!course) return null

                    const courseData = formatMongoData(course)
                    const enrollmentData = formatMongoData(enrollment)

                    return (
                      <div key={enrollmentData.id} className="space-y-4">
                        <Card className="border-2 hover:border-[#FF2768] transition-all hover:shadow-xl group">
                          <CardHeader>
                            <div className="flex items-start justify-between mb-2">
                              <Badge
                                className={`${
                                  enrollmentData.completed
                                    ? "bg-[#FEEB00] text-[#4E0942]"
                                    : "bg-[#4E0942] text-white"
                                }`}
                              >
                                {enrollmentData.completed ? "Completed" : "In Progress"}
                              </Badge>
                              {enrollmentData.completed && enrollmentData.certificateSent && (
                                <Badge className="bg-[#FF2768] text-white">Certificate Sent</Badge>
                              )}
                            </div>
                            <CardTitle className="text-xl text-[#4E0942] group-hover:text-[#FF2768] transition-colors">
                              {courseData.title}
                            </CardTitle>
                            <CardDescription>{courseData.description}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-semibold text-[#4E0942]">{enrollmentData.progress || 0}%</span>
                              </div>
                              <Progress value={enrollmentData.progress || 0} className="h-2" />
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <span>
                                Duration: {courseData.durationWeeks || courseData.duration_weeks || "N/A"} weeks
                              </span>
                              <span className="capitalize">{courseData.category}</span>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                asChild
                                className="flex-1 bg-[#4E0942] hover:bg-[#4E0942]/90 text-white font-semibold"
                              >
                                <Link href={`/learn/${courseData.id}`}>
                                  <BookOpen size={16} className="mr-2" />
                                  Start Learning
                                </Link>
                              </Button>
                              {(courseData.googleClassroomLink || courseData.google_classroom_link) && (
                                <Button
                                  asChild
                                  variant="outline"
                                  className="border-2 border-[#4E0942] text-[#4E0942] bg-transparent"
                                >
                                  <a
                                    href={courseData.googleClassroomLink || courseData.google_classroom_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <ExternalLink size={16} />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>

                        {!enrollmentData.completed && (
                          <ProgressUpdater
                            enrollmentId={enrollmentData.id}
                            currentProgress={enrollmentData.progress || 0}
                            courseTitle={courseData.title}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* My Tours */}
            {tourEnrollments.length > 0 && (
              <div className="space-y-6 animate-fade-in-up delay-300">
                <h2 className="text-3xl font-bold text-[#4E0942]">My Tours</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {tourEnrollments.map((enrollment: any) => {
                    const tour = enrollment.tourId
                    if (!tour) return null

                    const tourData = formatMongoData(tour)
                    const enrollmentData = formatMongoData(enrollment)

                    return (
                      <Card
                        key={enrollmentData.id}
                        className="border-2 hover:border-[#FF2768] transition-all hover:shadow-xl"
                      >
                        <CardHeader>
                          <Badge className="bg-[#FF2768] text-white w-fit mb-2">Educational Tour</Badge>
                          <CardTitle className="text-xl text-[#4E0942]">{tourData.title}</CardTitle>
                          <CardDescription>{tourData.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin size={18} className="text-[#FF2768]" />
                            <span className="text-sm">{tourData.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar size={18} className="text-[#FF2768]" />
                            <span className="text-sm">
                              {tourData.date ? new Date(tourData.date).toLocaleDateString() : "TBD"}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Certificates */}
            {certificates.length > 0 && (
              <div className="space-y-6 animate-fade-in-up delay-400">
                <h2 className="text-3xl font-bold text-[#4E0942]">My Certificates</h2>

                <div className="grid md:grid-cols-3 gap-6">
                  {certificates.map((cert: any) => {
                    const certData = formatMongoData(cert)
                    const title = certData.courseId?.title || certData.tourId?.title || "Certificate"

                    return (
                      <Card key={certData.id} className="border-2 border-[#FEEB00] hover:shadow-xl transition-all">
                        <CardContent className="p-6 space-y-4">
                          <div className="w-16 h-16 bg-[#FEEB00] rounded-full flex items-center justify-center mx-auto">
                            <Award size={32} className="text-[#4E0942]" />
                          </div>
                          <div className="text-center space-y-2">
                            <h3 className="font-bold text-[#4E0942]">{title}</h3>
                            <p className="text-sm text-gray-600">Certificate #{certData.certificateNumber}</p>
                            <p className="text-xs text-gray-500">
                              Issued: {certData.issuedAt ? new Date(certData.issuedAt).toLocaleDateString() : "N/A"}
                            </p>
                          </div>
                          <Button
                            asChild
                            variant="outline"
                            className="w-full border-2 border-[#4E0942] text-[#4E0942] bg-transparent"
                          >
                            <a href={certData.certificateUrl || "#"} download>
                              <Download size={16} className="mr-2" />
                              Download
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {enrollments.length === 0 && (
              <Card className="border-2 border-[#DD91D0] shadow-xl animate-scale-in">
                <CardContent className="p-12 text-center space-y-6">
                  <div className="w-24 h-24 bg-[#4E0942] rounded-full flex items-center justify-center mx-auto">
                    <BookOpen size={48} className="text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-[#4E0942]">Start Your Learning Journey</h3>
                    <p className="text-gray-700 max-w-md mx-auto">
                      You haven&apos;t enrolled in any courses or tours yet. Browse our programs and start learning today!
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="bg-[#4E0942] hover:bg-[#4E0942]/90 text-white font-bold">
                      <Link href="/programs">Browse Courses</Link>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="border-2 border-[#FF2768] text-[#FF2768] hover:bg-[#FF2768] hover:text-white bg-transparent"
                    >
                      <Link href="/tours">View Tours</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
