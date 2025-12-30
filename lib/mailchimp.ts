// Mailchimp integration for newsletter
export const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY || ""
export const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID || ""
export const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX || "us1"

export interface MailchimpSubscribeConfig {
  email: string
  firstName?: string
  lastName?: string
  tags?: string[]
}

export interface MailchimpResponse {
  success: boolean
  data?: any
  error?: string
}

export async function subscribeToMailchimp(config: MailchimpSubscribeConfig, apiKeyOverride?: string, audienceOverride?: string): Promise<MailchimpResponse> {
  const apiKey = apiKeyOverride && apiKeyOverride !== "" ? apiKeyOverride : MAILCHIMP_API_KEY
  const audience = audienceOverride && audienceOverride !== "" ? audienceOverride : MAILCHIMP_AUDIENCE_ID

  if (!apiKey || !audience) {
    console.error("[open] Mailchimp API key or audience ID is not configured")
    return {
      success: false,
      error: "Newsletter system not configured",
    }
  }

  try {
    const [apiKeyPart, datacenter] = apiKey.split("-")
    const url = `https://${datacenter}.api.mailchimp.com/3.0/lists/${audience}/members`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: config.email,
        status: "subscribed",
        merge_fields: {
          FNAME: config.firstName || "",
          LNAME: config.lastName || "",
        },
        tags: config.tags || [],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[open] Mailchimp subscription error:", response.status, errorData)
      return {
        success: false,
        error: errorData.detail || "Failed to subscribe to newsletter",
      }
    }

    const data = await response.json()
    return {
      success: true,
      data,
    }
  } catch (error) {
    console.error("[open] Mailchimp subscription exception:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Subscription failed",
    }
  }
}
