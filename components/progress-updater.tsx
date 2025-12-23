"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"
import { Loader2, CheckCircle2 } from "lucide-react"

interface ProgressUpdaterProps {
  enrollmentId: string
  currentProgress: number
  courseTitle: string
}

export function ProgressUpdater({ enrollmentId, currentProgress, courseTitle }: ProgressUpdaterProps) {
  const [progress, setProgress] = useState(currentProgress)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleUpdate = async () => {
    setUpdating(true)
    setMessage(null)

    try {
      const response = await fetch("/api/update-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId, progress }),
      })

      const result = await response.json()

      if (result.success) {
        if (result.completed) {
          setMessage({
            type: "success",
            text: "Congratulations! Course completed. Certificate has been sent to your email!",
          })
        } else {
          setMessage({ type: "success", text: "Progress updated successfully!" })
        }
      } else {
        setMessage({ type: "error", text: result.error || "Failed to update progress" })
      }
    } catch (error) {
      setMessage({ type: "error", text: "An error occurred while updating progress" })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <Card className="border-2 border-[#DD91D0]">
      <CardHeader>
        <CardTitle className="text-xl text-[#4E0942]">Update Progress</CardTitle>
        <CardDescription>{courseTitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-[#4E0942]">Progress</span>
            <span className="text-2xl font-bold text-[#FF2768]">{progress}%</span>
          </div>
          <Slider value={[progress]} onValueChange={(value) => setProgress(value[0])} max={100} step={5} />
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg flex items-start gap-3 ${
              message.type === "success" ? "bg-[#FEEB00]/20 text-[#4E0942]" : "bg-destructive/10 text-destructive"
            }`}
          >
            {message.type === "success" && <CheckCircle2 size={20} className="flex-shrink-0 mt-0.5" />}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        <Button
          onClick={handleUpdate}
          disabled={updating || progress === currentProgress}
          className="w-full bg-[#4E0942] hover:bg-[#4E0942]/90 text-white font-semibold"
        >
          {updating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Updating...
            </>
          ) : (
            "Update Progress"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
