"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save } from "lucide-react"
import Image from "next/image"
import { AdminGuard } from "@/components/admin-guard"
import AdminNav from "@/components/admin-nav"

export default function AdminFounder() {
  const [founder, setFounder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  useEffect(() => {
    fetchFounder()
  }, [])

  const fetchFounder = async () => {
    try {
      const response = await fetch("/api/admin/founder")
      const data = await response.json()
      setFounder(
        data || {
          name: "Daniella Williams",
          title: "Founder & Visionary",
          bio: "Daniella Williams is a dynamic, multi-talented thinker and strategist who blends creativity, emotional intelligence, and practical execution to empower students and young adults. With a rich background in public speaking, content creation, and digital media, she envisions The OPEN Students as a platform that equips young people with the skills, mentorship, and real-world experiences they need to succeed beyond the classroom.",
          imageUrl: "",
        },
      )
      if (data?.imageUrl) setImagePreview(data.imageUrl)
      setLoading(false)
    } catch (error) {
      console.error("[open] Error fetching founder:", error)
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        setFounder({
          ...founder,
          imageUrl: reader.result,
          imageName: file.name,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/founder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(founder),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Founder information updated successfully!" })
      } else {
        setMessage({ type: "error", text: "Failed to update founder information" })
      }
    } catch (error) {
      console.error("[open] Error saving founder:", error)
      setMessage({ type: "error", text: "Error saving founder information" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <AdminGuard>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-[#4E0942] mb-8">Edit Founder Information</h1>
          <AdminNav />

          {message && (
            <Alert variant={message.type === "success" ? "default" : "destructive"} className="mb-6">
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6">
            {/* Founder Image */}
            <Card className="border-2 border-[#DD91D0]">
              <CardHeader>
                <CardTitle>Founder Image</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  {imagePreview && (
                    <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0 relative">
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        alt="Founder"
                        fill
                        sizes="128px"
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <Label htmlFor="image-upload" className="block mb-2">
                      Upload Founder Image
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-600 mt-2">PNG, JPG up to 5MB. Square image recommended.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Founder Details */}
            <Card className="border-2 border-[#4E0942]">
              <CardHeader>
                <CardTitle>Founder Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={founder?.name || ""}
                    onChange={(e) => setFounder({ ...founder, name: e.target.value })}
                    placeholder="Enter founder's name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="title" className="text-sm">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={founder?.title || ""}
                    onChange={(e) => setFounder({ ...founder, title: e.target.value })}
                    placeholder="e.g., Founder & Visionary"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="bio" className="text-sm">
                    Biography
                  </Label>
                  <Textarea
                    id="bio"
                    value={founder?.bio || ""}
                    onChange={(e) => setFounder({ ...founder, bio: e.target.value })}
                    placeholder="Enter founder biography"
                    className="mt-1 min-h-32"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex gap-4">
              <Button onClick={handleSave} disabled={saving} className="bg-[#4E0942] hover:bg-[#4E0942]/90 text-white">
                <Save className="mr-2" size={18} />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
