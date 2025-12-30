"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Save } from "lucide-react"
import Image from "next/image"
import { AdminGuard } from "@/components/admin-guard"
import AdminNav from "@/components/admin-nav"

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [sliderItems, setSliderItems] = useState<Array<{ imageUrl: string; caption?: string }>>([])
  const [founder, setFounder] = useState<any>(null)

  useEffect(() => {
    fetchSettings()
    fetchFounder()
  }, [])

  const fetchFounder = async () => {
    try {
      const response = await fetch("/api/admin/founder")
      const data = await response.json()
      setFounder(data || {})
    } catch (error) {
      console.error("[open] Error fetching founder:", error)
    }
  }

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      const data = await response.json()
      setSettings(data)
      if (data.logoUrl) setLogoPreview(data.logoUrl)
      if (Array.isArray(data.homepageSlider)) setSliderItems(data.homepageSlider)
      setLoading(false)
    } catch (error) {
      console.error("[open] Error fetching settings:", error)
      setLoading(false)
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
        setSettings({
          ...settings,
          logoUrl: reader.result,
          logoName: file.name,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFounderImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFounder({
          ...founder,
          imageUrl: reader.result,
          imageName: file.name,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFounderChange = (field: string, value: string) => {
    setFounder({
      ...founder,
      [field]: value,
    })
  }

  const handleEnvChange = (key: string, value: string) => {
    setSettings({
      ...settings,
      environmentVariables: {
        ...settings.environmentVariables,
        [key]: value,
      },
    })
  }

  const syncSliderIntoSettings = (items: Array<{ imageUrl: string; caption?: string }>) => {
    setSliderItems(items)
    setSettings({
      ...settings,
      homepageSlider: items,
    })
  }

  const addSliderItem = () => {
    const items = [...sliderItems, { imageUrl: "", caption: "" }]
    syncSliderIntoSettings(items)
  }

  const updateSliderItem = (index: number, field: "imageUrl" | "caption", value: string) => {
    const items = sliderItems.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    syncSliderIntoSettings(items)
  }

  const removeSliderItem = (index: number) => {
    const items = sliderItems.filter((_, i) => i !== index)
    syncSliderIntoSettings(items)
  }

  const uploadSliderImage = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const items = sliderItems.map((item, i) => (i === index ? { ...item, imageUrl: reader.result as string } : item))
        syncSliderIntoSettings(items)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      // Save settings
      const settingsResponse = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (!settingsResponse.ok) {
        throw new Error("Failed to save settings")
      }

      // Save founder
      const founderResponse = await fetch("/api/admin/founder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(founder),
      })

      if (!founderResponse.ok) {
        throw new Error("Failed to save founder information")
      }

      setMessage({ type: "success", text: "All changes saved successfully!" })
    } catch (error) {
      console.error("[open] Error saving:", error)
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Error saving changes" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#DD91D0]/10 to-[#FF2768]/10">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-[#4E0942] mb-8">Site Settings & Configuration</h1>
          <AdminNav />

          {message && (
            <Alert variant={message.type === "success" ? "default" : "destructive"} className="mb-6">
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6">
          {/* Founder Section */}
          <Card className="border-2 border-[#DD91D0]">
            <CardHeader>
              <CardTitle>Founder Information (Homepage)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-1">
                  {founder?.imageUrl && (
                    <Image
                      src={founder.imageUrl || "/placeholder.svg"}
                      alt="Founder"
                      width={200}
                      height={200}
                      unoptimized
                      className="h-40 w-40 object-cover rounded-lg"
                    />
                  )}
                  <div className="mt-4">
                    <Label htmlFor="founder-image" className="block mb-2">
                      Founder Image
                    </Label>
                    <Input
                      id="founder-image"
                      type="file"
                      accept="image/*"
                      onChange={handleFounderImageUpload}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-600 mt-2">PNG, JPG up to 5MB</p>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <Label htmlFor="founder-name">Founder Name</Label>
                    <Input
                      id="founder-name"
                      type="text"
                      value={founder?.name || ""}
                      onChange={(e) => handleFounderChange("name", e.target.value)}
                      placeholder="Founder name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="founder-title">Title/Position</Label>
                    <Input
                      id="founder-title"
                      type="text"
                      value={founder?.title || ""}
                      onChange={(e) => handleFounderChange("title", e.target.value)}
                      placeholder="e.g., Founder & Visionary"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="founder-bio">Biography</Label>
                    <Textarea
                      id="founder-bio"
                      value={founder?.bio || ""}
                      onChange={(e) => handleFounderChange("bio", e.target.value)}
                      placeholder="Founder biography..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Credentials */}
          <Card className="border-2 border-[#4E0942]">
            <CardHeader>
              <CardTitle>Admin Login Credentials</CardTitle>
              <CardDescription>Update admin email and password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="admin-email" className="text-sm">
                    Admin Email (NEXT_PUBLIC_ADMIN_EMAIL)
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={
                      settings?.environmentVariables?.["NEXT_PUBLIC_ADMIN_EMAIL"] ||
                      settings?.environmentDefaults?.["NEXT_PUBLIC_ADMIN_EMAIL"] ||
                      ""
                    }
                    onChange={(e) => handleEnvChange("NEXT_PUBLIC_ADMIN_EMAIL", e.target.value)}
                    placeholder="admin@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="admin-password" className="text-sm">
                    Admin Password (ADMIN_PASSWORD)
                  </Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={
                      settings?.environmentVariables?.["ADMIN_PASSWORD"] ||
                      settings?.environmentDefaults?.["ADMIN_PASSWORD"] ||
                      ""
                    }
                    onChange={(e) => handleEnvChange("ADMIN_PASSWORD", e.target.value)}
                    placeholder="Secure password"
                    className="mt-1"
                  />
                </div>
              </div>
              <Alert variant="destructive">
                <AlertDescription>
                  ⚠️ Changing credentials requires deployment. Values are stored in environment and will take effect on next deploy.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Paystack Configuration */}
          <Card className="border-2 border-[#FF2768]">
            <CardHeader>
              <CardTitle>Payment Gateway (Paystack)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paystack-public" className="text-sm">
                    Paystack Public Key
                  </Label>
                  <Input
                    id="paystack-public"
                    type="password"
                    value={
                      settings?.environmentVariables?.["NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY"] ||
                      settings?.environmentDefaults?.["NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY"] ||
                      ""
                    }
                    onChange={(e) => handleEnvChange("NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY", e.target.value)}
                    placeholder="pk_test_..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="paystack-secret" className="text-sm">
                    Paystack Secret Key
                  </Label>
                  <Input
                    id="paystack-secret"
                    type="password"
                    value={
                      settings?.environmentVariables?.["PAYSTACK_SECRET_KEY"] ||
                      settings?.environmentDefaults?.["PAYSTACK_SECRET_KEY"] ||
                      ""
                    }
                    onChange={(e) => handleEnvChange("PAYSTACK_SECRET_KEY", e.target.value)}
                    placeholder="sk_test_..."
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mailchimp Configuration */}
          <Card className="border-2 border-[#FEEB00]">
            <CardHeader>
              <CardTitle>Newsletter (Mailchimp)</CardTitle>
              <CardDescription>Configure Mailchimp for newsletter subscriptions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mailchimp-key" className="text-sm">
                    Mailchimp API Key
                  </Label>
                  <Input
                    id="mailchimp-key"
                    type="password"
                    value={
                      settings?.environmentVariables?.["MAILCHIMP_API_KEY"] ||
                      settings?.environmentDefaults?.["MAILCHIMP_API_KEY"] ||
                      ""
                    }
                    onChange={(e) => handleEnvChange("MAILCHIMP_API_KEY", e.target.value)}
                    placeholder="xxxxxxxxxxxxx-us1"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="mailchimp-audience" className="text-sm">
                    Mailchimp Audience ID
                  </Label>
                  <Input
                    id="mailchimp-audience"
                    type="text"
                    value={
                      settings?.environmentVariables?.["MAILCHIMP_AUDIENCE_ID"] ||
                      settings?.environmentDefaults?.["MAILCHIMP_AUDIENCE_ID"] ||
                      ""
                    }
                    onChange={(e) => handleEnvChange("MAILCHIMP_AUDIENCE_ID", e.target.value)}
                    placeholder="xxxxxxxxxx"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Database Configuration */}
          <Card className="border-2 border-[#4E0942]">
            <CardHeader>
              <CardTitle>Database Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mongodb-1" className="text-sm">
                    MongoDB URI (Main)
                  </Label>
                  <Input
                    id="mongodb-1"
                    type="password"
                    value={
                      settings?.environmentVariables?.["MONGODB_URI"] ||
                      settings?.environmentDefaults?.["MONGODB_URI"] ||
                      ""
                    }
                    onChange={(e) => handleEnvChange("MONGODB_URI", e.target.value)}
                    placeholder="mongodb+srv://..."
                    className="mt-1 font-mono text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="mongodb-2" className="text-sm">
                    MongoDB URI (Secondary - Founder/Admin)
                  </Label>
                  <Input
                    id="mongodb-2"
                    type="password"
                    value={
                      settings?.environmentVariables?.["MONGODB_URI_2"] ||
                      settings?.environmentDefaults?.["MONGODB_URI_2"] ||
                      ""
                    }
                    onChange={(e) => handleEnvChange("MONGODB_URI_2", e.target.value)}
                    placeholder="mongodb+srv://..."
                    className="mt-1 font-mono text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Site Configuration */}
          <Card className="border-2 border-[#DD91D0]">
            <CardHeader>
              <CardTitle>Site Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="site-url" className="text-sm">
                    Site URL
                  </Label>
                  <Input
                    id="site-url"
                    type="text"
                    value={
                      settings?.environmentVariables?.["NEXT_PUBLIC_SITE_URL"] ||
                      settings?.environmentDefaults?.["NEXT_PUBLIC_SITE_URL"] ||
                      ""
                    }
                    onChange={(e) => handleEnvChange("NEXT_PUBLIC_SITE_URL", e.target.value)}
                    placeholder="https://example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="jwt-secret" className="text-sm">
                    JWT Secret
                  </Label>
                  <Input
                    id="jwt-secret"
                    type="password"
                    value={
                      settings?.environmentVariables?.["JWT_SECRET"] ||
                      settings?.environmentDefaults?.["JWT_SECRET"] ||
                      ""
                    }
                    onChange={(e) => handleEnvChange("JWT_SECRET", e.target.value)}
                    placeholder="Change this to a secure random string"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Homepage Slider */}
          <Card className="border-2 border-[#4E0942]">
            <CardHeader>
              <CardTitle>Homepage Image Slider</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {sliderItems.length === 0 && (
                  <p className="text-sm text-gray-600">No slider images yet. Add images to show on the homepage.</p>
                )}
                {sliderItems.map((item, index) => (
                  <div key={index} className="grid md:grid-cols-3 gap-4 items-center">
                    <div className="md:col-span-1">
                      {item.imageUrl && (
                        <div className="relative h-24 w-full rounded overflow-hidden">
                          <Image
                            src={item.imageUrl || "/placeholder.svg"}
                            alt={item.caption || `Slider image ${index + 1}`}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            unoptimized
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <div>
                        <Label htmlFor={`slider-image-${index}`}>Image URL</Label>
                        <Input
                          id={`slider-image-${index}`}
                          type="text"
                          value={item.imageUrl}
                          onChange={(e) => updateSliderItem(index, "imageUrl", e.target.value)}
                          placeholder="https://..."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`slider-upload-${index}`}>Or Upload Image</Label>
                        <Input
                          id={`slider-upload-${index}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => uploadSliderImage(index, e)}
                          className="cursor-pointer mt-1"
                        />
                        <p className="text-xs text-gray-600 mt-1">PNG, JPG up to 5MB</p>
                      </div>
                      <div>
                        <Label htmlFor={`slider-caption-${index}`}>Caption (optional)</Label>
                        <Input
                          id={`slider-caption-${index}`}
                          type="text"
                          value={item.caption || ""}
                          onChange={(e) => updateSliderItem(index, "caption", e.target.value)}
                          placeholder="Describe this image"
                          className="mt-1"
                        />
                      </div>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          className="border-2 border-[#FF2768] text-[#FF2768] hover:bg-[#FF2768] hover:text-white"
                          onClick={() => removeSliderItem(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                onClick={addSliderItem}
                className="bg-[#4E0942] hover:bg-[#4E0942]/90 text-white"
              >
                Add Slider Image
              </Button>
            </CardContent>
          </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button onClick={handleSaveAll} disabled={saving} className="bg-[#4E0942] hover:bg-[#4E0942]/90 text-white">
                <Save className="mr-2" size={18} />
                {saving ? "Saving..." : "Save All Settings"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-2 border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
                onClick={async () => {
                  setSaving(true)
                  setMessage(null)
                  try {
                    const res = await fetch("/api/admin/settings", { method: "DELETE" })
                    if (!res.ok) throw new Error("Failed to delete settings")
                    setSettings(null)
                    setLogoPreview(null)
                    setSliderItems([])
                    setMessage({ type: "success", text: "Settings deleted/reset successfully" })
                  } catch (e) {
                    setMessage({ type: "error", text: "Failed to delete settings" })
                  } finally {
                    setSaving(false)
                  }
                }}
              >
                Reset Settings
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
