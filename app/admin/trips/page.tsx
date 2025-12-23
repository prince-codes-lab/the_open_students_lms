"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Save, Trash2, Plus } from "lucide-react"
import { AdminGuard } from "@/components/admin-guard"
import Image from "next/image"

export default function AdminTrips() {
  const [trips, setTrips] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [editingTripId, setEditingTripId] = useState<string | null>(null)

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      const response = await fetch("/api/admin/trips")
      const data = await response.json()
      setTrips(data || [])
      setLoading(false)
    } catch (error) {
      console.error("[open] Error fetching trips:", error)
      setLoading(false)
    }
  }

  const handleAddTrip = () => {
    const newTrip = {
      title: "New Trip",
      description: "",
      state: "",
      location: "",
      updates: [],
    }
    setTrips([...trips, newTrip])
    setEditingTripId(`new-${Date.now()}`)
  }

  const handleUpdateTrip = (index: number, field: string, value: any) => {
    const updatedTrips = [...trips]
    updatedTrips[index] = { ...updatedTrips[index], [field]: value }
    setTrips(updatedTrips)
  }

  const handleAddUpdate = (tripIndex: number) => {
    const updatedTrips = [...trips]
    if (!updatedTrips[tripIndex].updates) {
      updatedTrips[tripIndex].updates = []
    }
    updatedTrips[tripIndex].updates.push({
      title: "Trip Update",
      description: "",
      imageUrl: "",
      date: new Date().toISOString().split("T")[0],
    })
    setTrips(updatedTrips)
  }

  const handleUpdateImage = (tripIndex: number, updateIndex: number, file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const updatedTrips = [...trips]
      updatedTrips[tripIndex].updates[updateIndex].imageUrl = reader.result as string
      updatedTrips[tripIndex].updates[updateIndex].imageName = file.name
      setTrips(updatedTrips)
    }
    reader.readAsDataURL(file)
  }

  const handleDeleteTrip = (index: number) => {
    setTrips(trips.filter((_, i) => i !== index))
  }

  const handleDeleteUpdate = (tripIndex: number, updateIndex: number) => {
    const updatedTrips = [...trips]
    updatedTrips[tripIndex].updates.splice(updateIndex, 1)
    setTrips(updatedTrips)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      for (const trip of trips) {
        await fetch("/api/admin/trips", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(trip),
        })
      }
      setMessage({ type: "success", text: "All trips saved successfully!" })
      setEditingTripId(null)
    } catch (error) {
      console.error("[open] Error saving trips:", error)
      setMessage({ type: "error", text: "Error saving trips" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#DD91D0]/10 to-[#FF2768]/10">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-[#4E0942]">Manage Trips & Memories</h1>
            <Button onClick={handleAddTrip} className="bg-[#FEEB00] hover:bg-[#FEEB00]/90 text-[#4E0942]">
              <Plus className="mr-2" size={18} />
              Add New Trip
            </Button>
          </div>

          {message && (
            <Alert variant={message.type === "success" ? "default" : "destructive"} className="mb-6">
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6">
            {trips.map((trip, tripIndex) => (
              <Card key={tripIndex} className="border-2 border-[#DD91D0]">
                <CardHeader className="flex flex-row items-start justify-between">
                  <CardTitle>Trip {tripIndex + 1}</CardTitle>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteTrip(tripIndex)}>
                    <Trash2 size={16} />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Trip Basic Info */}
                  <div className="grid gap-4">
                    <div>
                      <Label className="text-sm">Trip Title</Label>
                      <Input
                        value={trip.title}
                        onChange={(e) => handleUpdateTrip(tripIndex, "title", e.target.value)}
                        placeholder="e.g., Lagos Cultural Tour 2026"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">State</Label>
                      <Input
                        value={trip.state}
                        onChange={(e) => handleUpdateTrip(tripIndex, "state", e.target.value)}
                        placeholder="e.g., Lagos"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Location</Label>
                      <Input
                        value={trip.location}
                        onChange={(e) => handleUpdateTrip(tripIndex, "location", e.target.value)}
                        placeholder="Specific location"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Description</Label>
                      <Textarea
                        value={trip.description}
                        onChange={(e) => handleUpdateTrip(tripIndex, "description", e.target.value)}
                        placeholder="Trip description"
                        className="mt-1 min-h-24"
                      />
                    </div>
                  </div>

                  {/* Trip Updates/Memories */}
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#4E0942]">Trip Updates & Memories</h3>
                      <Button
                        size="sm"
                        onClick={() => handleAddUpdate(tripIndex)}
                        className="bg-[#FF2768] hover:bg-[#FF2768]/90"
                      >
                        <Plus size={14} className="mr-1" />
                        Add Update
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {trip.updates?.map((update: any, updateIndex: number) => (
                        <Card key={updateIndex} className="border border-[#DD91D0]/50 bg-white/50">
                          <CardContent className="p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <Label className="text-xs">Update Title</Label>
                                <Input
                                  value={update.title}
                                  onChange={(e) => {
                                    const updatedTrips = [...trips]
                                    updatedTrips[tripIndex].updates[updateIndex].title = e.target.value
                                    setTrips(updatedTrips)
                                  }}
                                  placeholder="Update title"
                                  className="mt-1 text-sm"
                                />
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteUpdate(tripIndex, updateIndex)}
                                className="text-red-500 hover:text-red-700 ml-2"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>

                            <div>
                              <Label className="text-xs">Update Date</Label>
                              <Input
                                type="date"
                                value={update.date}
                                onChange={(e) => {
                                  const updatedTrips = [...trips]
                                  updatedTrips[tripIndex].updates[updateIndex].date = e.target.value
                                  setTrips(updatedTrips)
                                }}
                                className="mt-1 text-sm"
                              />
                            </div>

                            <div>
                              <Label className="text-xs">Update Description</Label>
                              <Textarea
                                value={update.description}
                                onChange={(e) => {
                                  const updatedTrips = [...trips]
                                  updatedTrips[tripIndex].updates[updateIndex].description = e.target.value
                                  setTrips(updatedTrips)
                                }}
                                placeholder="What happened on this update?"
                                className="mt-1 text-sm min-h-20"
                              />
                            </div>

                            <div>
                              <Label className="text-xs">Memory Photo</Label>
                              <div className="flex items-center gap-3 mt-1">
                                {update.imageUrl && (
                                  <div className="h-16 w-16 rounded border border-[#DD91D0] overflow-hidden">
                                    <Image
                                      src={update.imageUrl || "/placeholder.svg"}
                                      alt="Memory"
                                      width={64}
                                      height={64}
                                      unoptimized
                                      className="object-cover"
                                    />
                                  </div>
                                )}
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleUpdateImage(tripIndex, updateIndex, file)
                                  }}
                                  className="flex-1 text-sm cursor-pointer"
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Save Button */}
            <div className="flex gap-4">
              <Button onClick={handleSave} disabled={saving} className="bg-[#4E0942] hover:bg-[#4E0942]/90 text-white">
                <Save className="mr-2" size={18} />
                {saving ? "Saving..." : "Save All Trips"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AdminGuard>
  )
}
