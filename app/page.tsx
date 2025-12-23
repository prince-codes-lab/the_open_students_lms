import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Sparkles, Target, Users, Lightbulb, TrendingUp, Heart } from "lucide-react"
import { Logo } from "@/components/logo"
import { connectDBWithRetry } from "@/lib/mongodb/connection"
import { AdminSettings } from "@/lib/mongodb/models/AdminSettings"
import { HeroSlider } from "@/components/hero-slider"
import Image from "next/image"
import { connectDB2WithRetry } from "@/lib/mongodb/connection"
import { FounderSchema } from "@/lib/mongodb/models/Founder"
type SliderItem = { imageUrl: string; caption?: string }
type FounderData = { name?: string; title?: string; bio?: string; imageUrl?: string }

export const dynamic = "force-dynamic"

export default async function HomePage() {
  let sliderItems: SliderItem[] = []
  let founder: FounderData | null = null
  const mongoUri = process.env.MONGODB_URI
  if (mongoUri) {
    try {
      const conn = await connectDBWithRetry(mongoUri)
      const settings = (await AdminSettings.findOne().lean()) as unknown as { homepageSlider?: SliderItem[] } | null
      const items = (settings?.homepageSlider as SliderItem[] | undefined) ?? []
      sliderItems = Array.isArray(items) ? items : []
    } catch {
      // Fallback to API cached settings
      try {
        const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
        const res = await fetch(new URL("/api/admin/settings", base))
        if (res.ok) {
          const data = (await res.json()) as { homepageSlider?: SliderItem[] } | null
          const items = (data?.homepageSlider as SliderItem[] | undefined) ?? []
          sliderItems = Array.isArray(items) ? items : []
        }
      } catch {}
    }
  }

  const defaultSamples: SliderItem[] = [
    { imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200", caption: "Learning in action" },
    { imageUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=1200", caption: "Collaboration and growth" },
    { imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200", caption: "Practical, real-world skills" },
  ]
  if (!Array.isArray(sliderItems) || sliderItems.length === 0) {
    sliderItems = defaultSamples
  }

  const mongoUri2 = process.env.MONGODB_URI_2
  if (mongoUri2) {
    try {
      const conn2 = await connectDB2WithRetry(mongoUri2)
      if (conn2) {
        const FounderModel = conn2.models.Founder || conn2.model("Founder", FounderSchema)
        const data = (await FounderModel.findOne().lean()) as unknown as FounderData | null
        if (data) {
          founder = { name: data.name, title: data.title, bio: data.bio, imageUrl: data.imageUrl }
        }
      }
    } catch {
      // Fallback to API cached founder
      try {
        const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
        const res = await fetch(new URL("/api/admin/founder", base))
        if (res.ok) {
          const data = (await res.json()) as FounderData | null
          if (data) {
            founder = { name: data.name, title: data.title, bio: data.bio, imageUrl: data.imageUrl }
          }
        }
      } catch {}
    }
  } else {
    // No DB configured: use API cached founder if available
    try {
      const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      const res = await fetch(new URL("/api/admin/founder", base))
      if (res.ok) {
        const data = (await res.json()) as FounderData | null
        if (data) {
          founder = { name: data.name, title: data.title, bio: data.bio, imageUrl: data.imageUrl }
        }
      }
    } catch {}
  }

  return (
    <div className="min-h-screen font-sans">
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#4E0942] pt-20">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#FEEB00]/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FF2768]/20 rounded-full blur-3xl animate-float delay-200" />
        </div>

        {sliderItems.length > 0 && <HeroSlider items={sliderItems} asBackground />}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            {!sliderItems.length && (
              <div className="animate-scale-in">
                <div className="inline-block p-8 bg:white/10 backdrop-blur-sm rounded-3xl border-4 border-[#FEEB00] shadow-2xl">
                  <Logo size="lg" />
                </div>
              </div>
            )}

            <div className="space-y-4 animate-fade-in-up delay-100">
              <h1 className="text-5xl md:text-7xl font-bold text-white text-balance font-sans">
                The OPEN <span className="text-[#FEEB00]">Students</span>
              </h1>
              <p className="text-2xl md:text-4xl text-[#FEEB00] font-bold">Beyond the Classroom</p>
            </div>

            

            {/* Description */}
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto animate-fade-in-up delay-200 leading-relaxed">
              Empowering African and Asian youths through digital courses, practical learning, mentorship, and
              educational tours. Join us in raising a generation of emotionally, socially, and intellectually
              intelligent leaders.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up delay-300">
              <Button
                asChild
                size="lg"
                className="bg-[#FEEB00] hover:bg-[#FEEB00]/90 text-[#4E0942] font-bold text-lg px-8 py-6 shadow-2xl hover:shadow-[#FEEB00]/50 transition-all hover:scale-105"
              >
                <Link href="/auth/sign-up">Join the Journey</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-2 border-white font-bold text-lg px-8 py-6 backdrop-blur-sm transition-all hover:scale-105"
              >
                <Link href="/programs">Explore Programs</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-8 animate-fade-in-up delay-400">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#FEEB00]">6+</div>
                <div className="text-sm text-white/80">Skills Programs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#FEEB00]">7</div>
                <div className="text-sm text-white/80">States Tour</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#FEEB00]">100%</div>
                <div className="text-sm text-white/80">Practical</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Main About */}
            <div className="text-center space-y-6 animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold text-[#4E0942]">About The OPEN Students</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#FF2768] to-[#FEEB00] mx-auto" />
              <p className="text-lg text-gray-700 leading-relaxed">
                The OPEN Students is an education technology (edtech) and youth development platform focused on bridging
                the gap between academic learning and real-world application. We provide digital courses, practical
                learning resources, conversations, mentorship, and internship opportunities for teenagers, students, and
                young adults across Africa and Asia.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Our goal is to raise a generation of emotionally, socially, spiritually, and intellectually intelligent
                individuals equipped to thrive in life, work, and leadership.
              </p>
            </div>

            {/* Founder Section */}
            <Card className="border-2 border-[#DD91D0] shadow-xl overflow-hidden animate-slide-in-left">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="bg-gradient-to-br from-[#4E0942] to-[#DD91D0] p-8 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      {founder?.imageUrl ? (
                        <div className="w-32 h-32 rounded-full mx-auto overflow-hidden relative">
                          <Image
                            src={founder.imageUrl || "/placeholder.svg"}
                            alt={founder?.name || "Founder"}
                            fill
                            sizes="128px"
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 bg-[#FEEB00] rounded-full mx-auto flex items-center justify-center">
                          <span className="text-[#4E0942] font-bold text-4xl">DW</span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-2xl font-bold text-white">{founder?.name || "Daniella Williams"}</h3>
                        <p className="text-[#FEEB00]">{founder?.title || "Founder & Visionary"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-8 bg-white">
                    <h3 className="text-2xl font-bold text-[#4E0942] mb-4">Meet Our Founder</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {founder?.bio || "Daniella Williams is a dynamic, multi-talented thinker and strategist who blends creativity, emotional intelligence, and practical execution to empower students and young adults. With a rich background in public speaking, content creation, and digital media, she envisions The OPEN Students as a platform that equips young people with the skills, mentorship, and real-world experiences they need to succeed beyond the classroom."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Brand Values Section */}
      <section className="py-20 bg-gradient-to-br from-[#DD91D0]/10 to-[#FF2768]/10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center space-y-4 mb-12 animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold text-[#4E0942]">Our Core Values</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#FF2768] to-[#FEEB00] mx-auto" />
              <p className="text-lg text-gray-700">The principles that guide everything we do</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: Target,
                  title: "Practicality",
                  description: "We prioritize applicable knowledge that makes a real difference",
                  color: "#FF2768",
                },
                {
                  icon: Heart,
                  title: "Transparency",
                  description: "We keep it real and honest in everything we do",
                  color: "#FEEB00",
                },
                {
                  icon: Users,
                  title: "Collaboration",
                  description: "We build with people and for people",
                  color: "#4E0942",
                },
                {
                  icon: Sparkles,
                  title: "Empowerment",
                  description: "We empower learners to take charge of their growth",
                  color: "#DD91D0",
                },
                {
                  icon: Lightbulb,
                  title: "Innovation",
                  description: "We seek fresh ways to bridge learning and life",
                  color: "#FF2768",
                },
                {
                  icon: TrendingUp,
                  title: "Excellence",
                  description: "We strive for excellence in every learning experience",
                  color: "#FEEB00",
                },
              ].map((value, index) => (
                <Card
                  key={value.title}
                  className="border-2 hover:border-[#FF2768] transition-all hover:shadow-xl group animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6 space-y-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${value.color}20` }}
                    >
                      <value.icon size={28} style={{ color: value.color }} />
                    </div>
                    <h3 className="text-xl font-bold text-[#4E0942]">{value.title}</h3>
                    <p className="text-gray-700 leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold text-[#4E0942] mb-4">Meet Our Team</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#FF2768] to-[#FEEB00] mx-auto mb-6" />
              <p className="text-lg text-gray-700">
                We&apos;re building an amazing team of passionate individuals dedicated to transforming education.
              </p>
            </div>

            <Card className="border-2 border-[#DD91D0] shadow-xl animate-scale-in delay-200">
              <CardContent className="p-12">
                <div className="space-y-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#4E0942] to-[#DD91D0] rounded-full mx-auto flex items-center justify-center">
                    <Users size={40} className="text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#4E0942]">Join Our Growing Team</h3>
                  <p className="text-gray-700 leading-relaxed">
                    We&apos;re looking for passionate individuals to join us in our mission to transform education. Social
                    Media Managers, Content Creators, and more positions coming soon!
                  </p>
                  <Button asChild size="lg" className="bg-[#FF2768] hover:bg-[#FF2768]/90 text-white font-bold">
                    <Link href="/community">Join the Team</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#4E0942] to-[#DD91D0]">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-balance font-sans">
              Ready to Go <span className="text-[#FEEB00]">Beyond the Classroom?</span>
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              Join thousands of students already transforming their futures with practical skills and real-world
              experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-[#FEEB00] hover:bg-[#FEEB00]/90 text-[#4E0942] font-bold text-lg px-8 py-6 shadow-2xl hover:scale-105 transition-all"
              >
                <Link href="/auth/sign-up">Get Started Today</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-2 border-white font-bold text-lg px-8 py-6 backdrop-blur-sm hover:scale-105 transition-all"
              >
                <Link href="/programs">View All Programs</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
