"use client"

import type React from "react"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Instagram, Twitter, Youtube, Mail, Users, Sparkles, Calendar, MapPin, Send, Loader2 } from "lucide-react"
import { useState } from "react"

export default function CommunityPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Subscription failed")
      }
      setMessage({
        type: "success",
        text: "Thank you for subscribing! You'll be the first to know about our upcoming tours and programs.",
      })
      setFormData({ name: "", email: "", location: "" })
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Subscription failed" })
    } finally {
      setSubmitting(false)
    }
  }

  // Calculate days until next tour (January 15, 2026)
  const nextTourDate = new Date("2026-01-15")
  const today = new Date()
  const daysUntil = Math.ceil((nextTourDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#DD91D0]/5 to-[#FF2768]/5">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-[#4E0942] via-[#DD91D0] to-[#FF2768]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in-up">
            <Badge className="bg-[#FEEB00] text-[#4E0942] hover:bg-[#FEEB00]/90 text-sm font-bold px-4 py-2">
              Join Our Community
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold text-white text-balance">
              Be Part of Something <span className="text-[#FEEB00]">Amazing</span>
            </h1>
            <p className="text-xl text-white/90 leading-relaxed max-w-2xl mx-auto">
              Connect with like-minded learners, stay updated on upcoming tours, and be part of a vibrant community
              that&apos;s redefining education.
            </p>
          </div>
        </div>
      </section>

      {/* Countdown Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4 animate-fade-in-up">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="text-[#FF2768]" size={32} />
                <h2 className="text-4xl font-bold text-[#4E0942]">Coming Soon</h2>
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-[#FF2768] to-[#FEEB00] mx-auto" />
            </div>

            <Card className="border-4 border-[#FEEB00] shadow-2xl animate-scale-in">
              <CardContent className="p-8 md:p-12">
                <div className="text-center space-y-8">
                  <div>
                    <h3 className="text-3xl md:text-4xl font-bold text-[#4E0942] mb-4">
                      2026 Educational Tour Kicks Off In
                    </h3>
                    <div className="flex justify-center gap-4 md:gap-8">
                      <div className="text-center">
                        <div className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-[#4E0942] to-[#DD91D0] rounded-2xl flex items-center justify-center mb-2">
                          <span className="text-3xl md:text-5xl font-bold text-white">
                            {Math.floor(daysUntil / 30)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600 font-semibold">Months</span>
                      </div>
                      <div className="text-center">
                        <div className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-[#FF2768] to-[#DD91D0] rounded-2xl flex items-center justify-center mb-2">
                          <span className="text-3xl md:text-5xl font-bold text-white">{daysUntil % 30}</span>
                        </div>
                        <span className="text-sm text-gray-600 font-semibold">Days</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#4E0942]/5 to-[#DD91D0]/5 rounded-lg p-6 space-y-4">
                    <div className="flex items-center justify-center gap-3">
                      <MapPin className="text-[#FF2768]" size={24} />
                      <h4 className="text-xl font-bold text-[#4E0942]">First Stop: Lagos Innovation Tour</h4>
                    </div>
                    <p className="text-gray-700">
                      Join us as we explore tech hubs, startups, and innovation centers in Lagos. Network with
                      entrepreneurs and industry leaders.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <Calendar size={16} />
                      <span>January 15, 2026 • Victoria Island, Lagos</span>
                    </div>
                  </div>

                  <Button
                    asChild
                    size="lg"
                    className="bg-[#FF2768] hover:bg-[#FF2768]/90 text-white font-bold text-lg px-8 py-6"
                  >
                    <a href="#newsletter">Get Notified</a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* TOS Community Section */}
      <section className="py-16 bg-gradient-to-br from-[#DD91D0]/10 to-[#FF2768]/10">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4 animate-fade-in-up">
              <div className="flex items-center justify-center gap-2">
                <Users className="text-[#4E0942]" size={32} />
                <h2 className="text-4xl font-bold text-[#4E0942]">TOS Community</h2>
              </div>
              <div className="w-24 h-1 bg-gradient-to-r from-[#FF2768] to-[#FEEB00] mx-auto" />
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Join our digital community for peer-to-peer learning, mentorship, networking, and exclusive updates.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Social Media Links */}
              <Card className="border-2 hover:border-[#FF2768] transition-all hover:shadow-xl animate-slide-in-left">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#4E0942]">Connect With Us</CardTitle>
                  <CardDescription>Follow us on social media for daily inspiration and updates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-lg border-2 hover:border-[#FF2768] hover:bg-[#FF2768]/5 transition-all group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FF2768] to-[#DD91D0] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Instagram size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[#4E0942]">Instagram</div>
                      <div className="text-sm text-gray-600">@theopenstudents</div>
                    </div>
                  </a>

                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-lg border-2 hover:border-[#4E0942] hover:bg-[#4E0942]/5 transition-all group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-[#4E0942] to-[#DD91D0] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Twitter size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[#4E0942]">Twitter/X</div>
                      <div className="text-sm text-gray-600">@theopenstudents</div>
                    </div>
                  </a>

                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-lg border-2 hover:border-[#FF2768] hover:bg-[#FF2768]/5 transition-all group"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FF2768] to-[#4E0942] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Youtube size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[#4E0942]">YouTube</div>
                      <div className="text-sm text-gray-600">The OPEN Students</div>
                    </div>
                  </a>

                  <a
                    href="mailto:info@theopenstudents.com"
                    className="flex items-center gap-4 p-4 rounded-lg border-2 hover:border-[#FEEB00] hover:bg-[#FEEB00]/5 transition-all group"
                  >
                    <div className="w-12 h-12 bg-[#FEEB00] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mail size={24} className="text-[#4E0942]" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-[#4E0942]">Email</div>
                      <div className="text-sm text-gray-600">info@theopenstudents.com</div>
                    </div>
                  </a>
                </CardContent>
              </Card>

              {/* Community Benefits */}
              <Card className="border-2 hover:border-[#4E0942] transition-all hover:shadow-xl animate-slide-in-right">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#4E0942]">Why Join?</CardTitle>
                  <CardDescription>Benefits of being part of our community</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {[
                      "Early access to new courses and tours",
                      "Exclusive discounts and special offers",
                      "Networking with peers and mentors",
                      "Behind-the-scenes content and updates",
                      "Participate in community challenges",
                      "Access to exclusive webinars and events",
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-[#FEEB00] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg className="w-4 h-4 text-[#4E0942]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section id="newsletter" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-4 border-[#FF2768] shadow-2xl animate-scale-in">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-[#FF2768] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send size={32} className="text-white" />
                </div>
                <CardTitle className="text-3xl text-[#4E0942]">Stay in the Loop</CardTitle>
                <CardDescription className="text-base">
                  Subscribe to our newsletter and be the first to know about educational tours, new programs, and
                  special offers.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="border-2 focus:border-[#FF2768]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="border-2 focus:border-[#FF2768]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">State/Country</Label>
                    <Input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., Lagos, Nigeria"
                      className="border-2 focus:border-[#FF2768]"
                    />
                  </div>

                  {message && (
                    <div
                      className={`p-4 rounded-lg ${
                        message.type === "success"
                          ? "bg-[#FEEB00]/20 text-[#4E0942]"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#FF2768] hover:bg-[#FF2768]/90 text-white font-bold text-lg py-6"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Subscribing...
                      </>
                    ) : (
                      <>
                        <Send size={20} className="mr-2" />
                        Subscribe Now
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-gray-600">We respect your privacy. Unsubscribe at any time.</p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Placeholder */}
      <section className="py-16 bg-gradient-to-br from-[#4E0942] to-[#DD91D0]">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
            <h2 className="text-4xl font-bold text-white">What Our Students Say</h2>
            <div className="w-24 h-1 bg-[#FEEB00] mx-auto" />
            <Card className="border-2 border-[#FEEB00] bg-white/95 backdrop-blur-sm">
              <CardContent className="p-12">
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#4E0942] to-[#DD91D0] rounded-full mx-auto flex items-center justify-center">
                    <Sparkles size={40} className="text-[#FEEB00]" />
                  </div>
                  <p className="text-xl text-gray-700 italic">
                    &quot;More testimonials and success stories coming soon as our students complete their programs and share
                    their experiences!&quot;
                  </p>
                  <p className="text-sm text-gray-600">Stay tuned for inspiring stories from our community</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
