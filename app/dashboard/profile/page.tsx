"use client"

import type React from "react"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    age: "",
    country: "",
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/profile", { cache: "no-store" })
        if (response.status === 401) {
          router.push("/auth/login?redirect=/dashboard/profile")
          return
        }

        const result = await response.json()
        if (result.success && result.profile) {
          setFormData({
            full_name: result.profile.fullName || result.profile.full_name || "",
            email: result.profile.email || "",
            phone: result.profile.phone || "",
            age: result.profile.age?.toString() || "",
            country: result.profile.country || "",
          })
        } else {
          setMessage({ type: "error", text: result.error || "Failed to load profile" })
        }
      } catch (error) {
        setMessage({
          type: "error",
          text: error instanceof Error ? error.message : "Failed to load profile",
        })
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.full_name,
          phone: formData.phone,
          age: formData.age ? Number.parseInt(formData.age) : undefined,
          country: formData.country,
        }),
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update profile")
      }

      setMessage({ type: "success", text: "Profile updated successfully!" })
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update profile",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF2768]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center gap-4 animate-fade-in-up">
              <Button asChild variant="outline" size="icon" className="border-2 border-[#4E0942] bg-transparent">
                <Link href="/dashboard">
                  <ArrowLeft size={20} />
                </Link>
              </Button>
              <div>
                <h1 className="text-4xl font-bold text-[#4E0942]">My Profile</h1>
                <p className="text-gray-700">Manage your account information</p>
              </div>
            </div>

            <Card className="border-2 border-[#DD91D0] shadow-xl animate-scale-in">
              <CardHeader>
                <CardTitle className="text-2xl text-[#4E0942]">Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={handleChange}
                      className="border-2 focus:border-[#FF2768]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      disabled
                      value={formData.email}
                      className="border-2 bg-gray-50"
                    />
                    <p className="text-xs text-gray-600">Email cannot be changed</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        className="border-2 focus:border-[#FF2768]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        value={formData.age}
                        onChange={handleChange}
                        className="border-2 focus:border-[#FF2768]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      type="text"
                      value={formData.country}
                      onChange={handleChange}
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
                    disabled={saving}
                    className="w-full bg-[#4E0942] hover:bg-[#4E0942]/90 text-white font-bold py-6"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
