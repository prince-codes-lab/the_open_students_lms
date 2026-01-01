import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { BookOpen, Palette, Video, Mic, UsersIcon, BookText, Package, Building2 } from "lucide-react"
import { connectDBWithRetry } from "@/lib/mongodb/connection"
import { Course } from "@/lib/mongodb/models/Course"
import { formatMongoData } from "@/lib/mongodb/helpers"
export const dynamic = "force-dynamic"

const categoryIcons = {
  writing: BookOpen,
  graphics: Palette,
  video: Video,
  speaking: Mic,
  leadership: UsersIcon,
  storytelling: BookText,
}

const categoryColors = {
  writing: "#FF2768",
  graphics: "#4E0942",
  video: "#FEEB00",
  speaking: "#DD91D0",
  leadership: "#FF2768",
  storytelling: "#4E0942",
}

export default async function ProgramsPage() {
  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <section className="pt-32 pb-16">
          <div className="container mx-auto px-4">
            <Card className="border-2 border-[#4E0942]">
              <CardHeader>
                <CardTitle className="text-[#4E0942]">Programs Unavailable</CardTitle>
                <CardDescription>Database connection is not configured. Set `MONGODB_URI` to load programs.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/" className="text-[#4E0942] hover:text-[#FF2768] font-medium">← Back to Home</Link>
              </CardContent>
            </Card>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  const conn = await connectDBWithRetry(mongoUri)
  if (!conn) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <section className="pt-32 pb-16">
          <div className="container mx-auto px-4">
            <Card className="border-2 border-[#4E0942]">
              <CardHeader>
                <CardTitle className="text-[#4E0942]">Programs Temporarily Unavailable</CardTitle>
                <CardDescription>We’re having trouble connecting to our database. Please try again shortly.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/" className="text-[#4E0942] hover:text-[#FF2768] font-medium">← Back to Home</Link>
              </CardContent>
            </Card>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  let rawCourses: any[] = []
  try {
    rawCourses = await Course.find({
      $or: [{ isActive: true }, { is_active: true }],
    })
      .sort({ title: 1 })
      .lean({ virtuals: true })
  } catch (err) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <section className="pt-32 pb-16">
          <div className="container mx-auto px-4">
            <Card className="border-2 border-[#4E0942]">
              <CardHeader>
                <CardTitle className="text-[#4E0942]">Programs Temporarily Unavailable</CardTitle>
                <CardDescription>We’re having trouble loading programs. Please try again shortly.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/" className="text-[#4E0942] hover:text-[#FF2768] font-medium">← Back to Home</Link>
              </CardContent>
            </Card>
          </div>
        </section>
        <Footer />
      </div>
    )
  }

  const courses = formatMongoData(rawCourses)

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            <div className="bg-[#4E0942] rounded-2xl px-8 py-12 text-center">
              <Badge className="bg-[#FEEB00] text-[#4E0942] hover:bg-[#FEEB00]/90 text-sm font-bold px-4 py-2">
                Skills Acquisition Programs
              </Badge>
              <h1 className="mt-6 text-5xl md:text-6xl font-bold text-white text-balance">
                Master Skills That <span className="text-[#FEEB00]">Matter</span>
              </h1>
              <p className="mt-4 text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                Choose from our comprehensive range of practical courses designed to equip you with real-world skills.
                Each program includes guided workbooks and certificates upon completion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Individual Courses */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4 animate-fade-in-up">
              <h2 className="text-4xl font-bold text-[#4E0942]">Individual Courses</h2>
              <div className="w-24 h-1 bg-[#FF2768] mx-auto" />
              <p className="text-lg text-gray-700">₦5,000 per course | $5 per course</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses?.map((course: any, index: number) => {
                const Icon = categoryIcons[course.category as keyof typeof categoryIcons]
                const color = categoryColors[course.category as keyof typeof categoryColors]

                return (
                  <Card
                    key={course.id}
                    className="border-2 hover:border-[#FF2768] transition-all hover:shadow-xl group animate-scale-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader>
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: `${color}20` }}
                      >
                        <Icon size={28} style={{ color }} />
                      </div>
                      <CardTitle className="text-xl text-[#4E0942]">{course.title}</CardTitle>
                      <CardDescription className="text-base">{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-semibold text-[#4E0942]">{Number(course.duration_weeks || 0)} weeks</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-[#FF2768]">₦{Number(course.price_ngn || 0).toLocaleString()}</div>
                          <div className="text-sm text-gray-600">${Number(course.price_usd || 0)}</div>
                        </div>
                        <Button asChild className="bg-[#4E0942] hover:bg-[#4E0942]/90 text-white font-semibold">
                          <Link href={`/enroll?course=${course.id}`}>Enroll Now</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Combo Packages */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4 animate-fade-in-up">
              <div className="flex items-center justify-center gap-2">
                <Package className="text-[#FF2768]" size={32} />
                <h2 className="text-4xl font-bold text-[#4E0942]">Combo Packages</h2>
              </div>
              <div className="w-24 h-1 bg-[#FF2768] mx-auto" />
              <p className="text-lg text-gray-700">Save more when you bundle courses together</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Creative Combo",
                  courses: ["Writing", "Graphics Design", "Video Editing"],
                  price_ngn: 12000,
                  price_usd: 10,
                  color: "#FF2768",
                  description: "Perfect for aspiring content creators and digital artists",
                },
                {
                  title: "Communication Combo",
                  courses: ["Writing", "Public Speaking"],
                  price_ngn: 10000,
                  price_usd: 8,
                  color: "#4E0942",
                  description: "Master the art of effective communication",
                },
                {
                  title: "Leadership Combo",
                  courses: ["Public Speaking", "Leadership & Teamwork"],
                  price_ngn: 10000,
                  price_usd: 8,
                  color: "#DD91D0",
                  description: "Develop essential leadership and team management skills",
                },
              ].map((combo, index) => (
                <Card
                  key={combo.title}
                  className="border-2 hover:border-[#FF2768] transition-all hover:shadow-xl animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    <div className="w-full h-2 rounded-full mb-4" style={{ backgroundColor: combo.color }} />
                    <CardTitle className="text-2xl text-[#4E0942]">{combo.title}</CardTitle>
                    <CardDescription className="text-base">{combo.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700">Includes:</p>
                      <ul className="space-y-1">
                        {combo.courses.map((course) => (
                          <li key={course} className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#FF2768]" />
                            {course}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-3xl font-bold text-[#FF2768]">₦{combo.price_ngn.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">${combo.price_usd}</div>
                        </div>
                        <Badge className="bg-[#FEEB00] text-[#4E0942] hover:bg-[#FEEB00]/90">Save 20%</Badge>
                      </div>
                      <Button asChild className="w-full bg-[#4E0942] hover:bg-[#4E0942]/90 text-white font-semibold">
                        <Link href={`/enroll?combo=${combo.title.toLowerCase().replace(" ", "-")}`}>
                          Get This Combo
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Full Suite */}
            <Card className="border-4 border-[#FEEB00] shadow-2xl animate-scale-in delay-300">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <Badge className="bg-[#FF2768] text-white hover:bg-[#FF2768]/90 text-sm font-bold px-4 py-2">
                      BEST VALUE
                    </Badge>
                    <h3 className="text-3xl font-bold text-[#4E0942]">Full Skills Suite</h3>
                    <p className="text-gray-700 leading-relaxed">
                      Get access to all 6 courses and become a well-rounded professional with skills in writing, design,
                      video, speaking, leadership, and storytelling.
                    </p>
                    <div className="flex items-baseline gap-4">
                      <div className="text-4xl font-bold text-[#FF2768]">₦30,000</div>
                      <div className="text-xl text-gray-600">$25</div>
                      <Badge className="bg-[#FEEB00] text-[#4E0942] hover:bg-[#FEEB00]/90">Save 40%</Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <Button
                      asChild
                      size="lg"
                      className="w-full bg-[#FF2768] hover:bg-[#FF2768]/90 text-white font-bold text-lg py-6"
                    >
                      <Link href="/enroll?combo=full-suite">Enroll in Full Suite</Link>
                    </Button>
                    <p className="text-sm text-center text-gray-600">Includes all 6 courses + certificates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Organization Plans */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4 animate-fade-in-up">
              <div className="flex items-center justify-center gap-2">
                <Building2 className="text-[#4E0942]" size={32} />
                <h2 className="text-4xl font-bold text-[#4E0942]">Organization Plans</h2>
              </div>
              <div className="w-24 h-1 bg-[#FF2768] mx-auto" />
              <p className="text-lg text-gray-700">
                Special pricing for schools, corporates, and educational organizations
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  tier: "Tier 1",
                  participants: "2-100 participants",
                  price_ngn: 4000,
                  price_usd: 4,
                  features: ["All courses access", "Bulk certificates", "Progress tracking", "Email support"],
                },
                {
                  tier: "Tier 2",
                  participants: "100-500 participants",
                  price_ngn: 3000,
                  price_usd: 3,
                  features: [
                    "All courses access",
                    "Bulk certificates",
                    "Progress tracking",
                    "Priority support",
                    "Custom branding",
                  ],
                  popular: true,
                },
                {
                  tier: "Tier 3",
                  participants: "500+ participants",
                  price_ngn: 2000,
                  price_usd: 2,
                  features: [
                    "All courses access",
                    "Bulk certificates",
                    "Progress tracking",
                    "Dedicated support",
                    "Custom branding",
                    "API access",
                  ],
                },
              ].map((plan, index) => (
                <Card
                  key={plan.tier}
                  className={`border-2 transition-all hover:shadow-xl animate-scale-in ${
                    plan.popular ? "border-[#FF2768] shadow-lg scale-105" : "hover:border-[#FF2768]"
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader>
                    {plan.popular && (
                      <Badge className="bg-[#FF2768] text-white hover:bg-[#FF2768]/90 w-fit mb-2">MOST POPULAR</Badge>
                    )}
                    <CardTitle className="text-2xl text-[#4E0942]">{plan.tier}</CardTitle>
                    <CardDescription className="text-base font-semibold">{plan.participants}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <div className="text-3xl font-bold text-[#FF2768]">₦{plan.price_ngn.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">per participant (${plan.price_usd})</div>
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="text-sm text-gray-700 flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-[#FEEB00] flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-3 h-3 text-[#4E0942]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      asChild
                      className={`w-full font-semibold ${
                        plan.popular
                          ? "bg-[#FF2768] hover:bg-[#FF2768]/90 text-white"
                          : "bg-[#4E0942] hover:bg-[#4E0942]/90 text-white"
                      }`}
                    >
                      <Link href="/enroll?type=organization">Request a Quote</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Learning Flow */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4 animate-fade-in-up">
              <h2 className="text-4xl font-bold text-[#4E0942]">How It Works</h2>
              <div className="w-24 h-1 bg-[#FF2768] mx-auto" />
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: "1", title: "Enroll", description: "Choose your course or package" },
                { step: "2", title: "Pay", description: "Complete payment via Paystack" },
                { step: "3", title: "Learn", description: "Access Google Classroom" },
                { step: "4", title: "Certify", description: "Receive certificate via email" },
              ].map((item, index) => (
                <div
                  key={item.step}
                  className="text-center space-y-4 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-16 h-16 bg-[#4E0942] rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-[#4E0942]">{item.title}</h3>
                  <p className="text-gray-700">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
