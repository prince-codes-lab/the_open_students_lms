"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import { LoadingModal } from "@/components/loading-modal"
import { PAYSTACK_PUBLIC_KEY, generatePaymentReference } from "@/lib/paystack"

type EnrollItem = {
  id: string
  title: string
  description?: string
  price_ngn?: number
  price_usd?: number
}

type UserSummary = {
  id: string
  email: string
}

export interface EnrollFormProps {
  user: UserSummary
  course?: EnrollItem | null
  tour?: EnrollItem | null
  publicKeyOverride?: string
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (config: {
        key: string
        email: string
        amount: number
        currency: string
        ref: string
        metadata?: Record<string, unknown>
        onClose: () => void
        callback: (response: { reference: string }) => void
      }) => { openIframe: () => void }
    }
  }
}

export function EnrollForm({ user, course, tour, publicKeyOverride }: EnrollFormProps) {
  const router = useRouter()
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN")
  const [processing, setProcessing] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const item = useMemo(() => course || tour || null, [course, tour])
  const itemType: "course" | "tour" | null = course ? "course" : tour ? "tour" : null

  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://js.paystack.co/v1/inline.js"
    script.async = true
    script.onload = () => {
      console.log("[open] Paystack script loaded")
      setScriptLoaded(true)
    }
    script.onerror = () => {
      console.error("[open] Failed to load Paystack script")
      setError("Failed to load the payment system. Please refresh the page.")
    }
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const price = useMemo(() => {
    if (!item) return 0
    return currency === "NGN" ? item.price_ngn ?? 0 : item.price_usd ?? 0
  }, [currency, item])

  const enrollmentType = itemType ?? "combo"
  const activePublicKey = (publicKeyOverride && publicKeyOverride !== "") ? publicKeyOverride : PAYSTACK_PUBLIC_KEY

  const handlePayment = async () => {
    if (!user || !item || !itemType) return

    if (!scriptLoaded) {
      setError("Payment system is loading. Please wait a moment and try again.")
      return
    }

    if (!window.PaystackPop) {
      setError("Payment system failed to initialize. Please refresh the page and try again.")
      return
    }

    if (!activePublicKey || activePublicKey === "" || activePublicKey === "undefined") {
      setError("Payment system is not configured. Please contact the administrator.")
      return
    }

    if (!price || Number.isNaN(price) || price <= 0) {
      setError("Invalid price for this enrollment. Please contact support.")
      return
    }

    setError(null)
    setProcessing(true)

    try {
      const reference = generatePaymentReference()
      console.log("[open] Creating enrollment with reference:", reference)

      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course?.id ?? null,
          tourId: tour?.id ?? null,
          reference,
          currency,
          amount: price,
          enrollmentType,
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create enrollment. Please try again.")
      }

      console.log("[open] Enrollment created, opening Paystack popup")

      const handler = window.PaystackPop.setup({
        key: activePublicKey,
        email: user.email,
        amount: Math.round(price * 100),
        currency,
        ref: reference,
        metadata: {
          user_id: user.id,
          course_id: course?.id,
          tour_id: tour?.id,
          course_title: course?.title,
          tour_title: tour?.title,
        },
        onClose: () => {
          console.log("[open] Payment dialog closed by user")
          setProcessing(false)
        },
        callback: async (payment) => {
          try {
            console.log("[open] Payment callback received:", payment.reference)
            const verificationResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ reference: payment.reference }),
            })

            const verificationResult = await verificationResponse.json()
            if (!verificationResponse.ok || !verificationResult.success) {
              throw new Error(verificationResult.error || "Payment verification failed")
            }

            console.log("[open] Payment verified successfully")
            router.push(`/enrollment-success?reference=${payment.reference}`)
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Payment verification failed. Please contact support with your reference."
            console.error("[open] Payment verification error:", errorMsg)
            setError(errorMsg)
            setProcessing(false)
          }
        },
      })

      handler.openIframe()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred. Please try again."
      console.error("[open] Payment initiation error:", errorMsg)
      setError(errorMsg)
      setProcessing(false)
    }
  }

  if (processing) {
    return <LoadingModal message="Processing your payment..." />
  }

  if (!item) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-gray-700">No course or tour selected. Please go back and choose a program.</p>
            <Button asChild className="w-full bg-[#4E0942] hover:bg-[#4E0942]/90 text-white">
              <a href="/programs">Browse Programs</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <section className="pt-32 pb-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-4 animate-fade-in-up">
            <Badge className="bg-[#FEEB00] text-[#4E0942] hover:bg-[#FEEB00]/90 text-sm font-bold px-4 py-2">
              Enrollment
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-[#4E0942]">Complete Your Enrollment</h1>
            <p className="text-lg text-gray-700">You&apos;re one step away from starting your learning journey</p>
          </div>

          {error && (
            <Alert variant="destructive" className="border-2 border-red-500">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card className="border-2 border-[#DD91D0] shadow-xl animate-scale-in">
            <CardHeader>
              <CardTitle className="text-2xl text-[#4E0942]">{item.title}</CardTitle>
              <CardDescription className="text-base">
                {itemType === "course" ? "Digital Course" : "Educational Tour"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold text-[#4E0942]">Select Currency</Label>
                <RadioGroup value={currency} onValueChange={(value) => setCurrency(value as "NGN" | "USD")}>
                  <div className="flex items-center space-x-2 p-4 border-2 rounded-lg hover:border-[#FF2768] transition-colors cursor-pointer">
                    <RadioGroupItem value="NGN" id="ngn" />
                    <Label htmlFor="ngn" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">Nigerian Naira (₦)</span>
                        <span className="text-2xl font-bold text-[#FF2768]">
                          ₦{(item.price_ngn ?? 0).toLocaleString()}
                        </span>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border-2 rounded-lg hover:border-[#FF2768] transition-colors cursor-pointer">
                    <RadioGroupItem value="USD" id="usd" />
                    <Label htmlFor="usd" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">US Dollar ($)</span>
                        <span className="text-2xl font-bold text-[#FF2768]">${item.price_usd ?? 0}</span>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-semibold text-[#4E0942]">What&apos;s Included:</h3>
                <ul className="space-y-2">
                  {itemType === "course" ? (
                    <>
                      <li className="flex items-center gap-2 text-gray-700">
                        <CheckCircle2 size={20} className="text-[#FEEB00]" />
                        <span>Full course access via Google Classroom</span>
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <CheckCircle2 size={20} className="text-[#FEEB00]" />
                        <span>Guided workbook and learning materials</span>
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <CheckCircle2 size={20} className="text-[#FEEB00]" />
                        <span>Certificate of completion via email</span>
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <CheckCircle2 size={20} className="text-[#FEEB00]" />
                        <span>Lifetime access to course materials</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-center gap-2 text-gray-700">
                        <CheckCircle2 size={20} className="text-[#FEEB00]" />
                        <span>Full tour participation</span>
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <CheckCircle2 size={20} className="text-[#FEEB00]" />
                        <span>Site visits and networking opportunities</span>
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <CheckCircle2 size={20} className="text-[#FEEB00]" />
                        <span>Workshop participation</span>
                      </li>
                      <li className="flex items-center gap-2 text-gray-700">
                        <CheckCircle2 size={20} className="text-[#FEEB00]" />
                        <span>Certificate of participation</span>
                      </li>
                    </>
                  )}
                </ul>
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold text-[#4E0942]">Total Amount:</span>
                  <span className="text-3xl font-bold text-[#FF2768]">
                    {currency === "NGN" ? `₦${price.toLocaleString()}` : `$${price}`}
                  </span>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-[#4E0942] hover:bg-[#4E0942]/90 text-white font-bold text-lg py-6"
              >
                Pay with Paystack
              </Button>

              <p className="text-xs text-center text-gray-600">
                Secure payment powered by Paystack. Your payment information is encrypted and secure.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

