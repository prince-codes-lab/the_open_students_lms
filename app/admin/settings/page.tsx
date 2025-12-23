"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

  useEffect(() => {
    fetchSettings()
  }, [])

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

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setMessage({ type: "success", text: "Settings saved successfully!" })
      } else {
        setMessage({ type: "error", text: "Failed to save settings" })
      }
    } catch (error) {
      console.error("[open] Error saving settings:", error)
      setMessage({ type: "error", text: "Error saving settings" })
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
            {/* Logo Upload */}
            <Card className="border-2 border-[#DD91D0]">
              <CardHeader>
                <CardTitle>Site Logo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-6">
                  {logoPreview && (
                    <Image
                      src={logoPreview || "/placeholder.svg"}
                      alt="Logo preview"
                      width={96}
                      height={96}
                      unoptimized
                      className="h-24 w-24 object-contain"
                    />
                  )}
                  <div className="flex-1">
                    <Label htmlFor="logo-upload" className="block mb-2">
                      Upload New Logo
                    </Label>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-gray-600 mt-2">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </CardContent>
            </Card>

          {/* Environment Variables */}
          <Card className="border-2 border-[#FF2768]">
              <CardHeader>
                <CardTitle>Environment Variables</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {[
                    { key: "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY", label: "Paystack Public Key" },
                    { key: "PAYSTACK_SECRET_KEY", label: "Paystack Secret Key" },
                    { key: "NEXT_PUBLIC_SITE_URL", label: "Site URL" },
                    { key: "JWT_SECRET", label: "JWT Secret" },
                    { key: "MONGODB_URI", label: "MongoDB URI 1" },
                    { key: "MONGODB_URI_2", label: "MongoDB URI 2" },
                  ].map((env) => (
                    <div key={env.key}>
                      <Label htmlFor={env.key} className="text-sm">
                        {env.label}
                      </Label>
                      <Input
                        id={env.key}
                        type={env.key.includes("SECRET") || env.key.includes("JWT") ? "password" : "text"}
                        value={
                          settings?.environmentVariables?.[env.key] ??
                          settings?.environmentDefaults?.[env.key] ??
                          ""
                        }
                        onChange={(e) => handleEnvChange(env.key, e.target.value)}
                        placeholder={
                          settings?.environmentDefaults?.[env.key]
                            ? settings.environmentDefaults[env.key]
                            : `Enter ${env.label}`
                        }
                        className="mt-1"
                      />
                    </div>
                  ))}
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
              <Button onClick={handleSave} disabled={saving} className="bg-[#4E0942] hover:bg-[#4E0942]/90 text-white">
                <Save className="mr-2" size={18} />
                {saving ? "Saving..." : "Save Settings"}
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
