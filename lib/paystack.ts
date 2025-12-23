// Paystack configuration and utilities
export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ""
export const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || ""

export interface PaystackConfig {
  email: string
  amount: number // in kobo (multiply by 100)
  currency: "NGN" | "USD"
  reference: string
  metadata?: Record<string, unknown>
  callback_url?: string
}

export function generatePaymentReference(): string {
  return `TOS-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
}

export async function verifyPaystackPayment(reference: string, secretOverride?: string): Promise<{
  success: boolean
  data?: {
    status: string
    amount: number
    currency: string
    paid_at: string
    reference: string
  }
  error?: string
}> {
  const secret = (secretOverride && secretOverride !== "") ? secretOverride : PAYSTACK_SECRET_KEY
  if (!secret || secret === "") {
    console.error("[open] PAYSTACK_SECRET_KEY is not configured")
    return {
      success: false,
      error: "Payment system not configured. Please contact administrator.",
    }
  }

  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[open] Paystack API error:", response.status, errorText)
      return {
        success: false,
        error: `Payment verification failed: ${response.status}`,
      }
    }

    const result = await response.json()

    if (result.status && result.data.status === "success") {
      return {
        success: true,
        data: result.data,
      }
    }

    return {
      success: false,
      error: result.message || "Payment verification failed",
    }
  } catch (error) {
    console.error("[open] Payment verification exception:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Payment verification error",
    }
  }
}
