// Certificate generation utilities
export function generateCertificateNumber(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `TOS-CERT-${timestamp}-${random}`
}

export interface CertificateData {
  studentName: string
  courseName?: string
  tourName?: string
  completionDate: string
  certificateNumber: string
}

export function generateCertificateSVG(data: CertificateData): string {
  const { studentName, courseName, tourName, completionDate, certificateNumber } = data
  const programName = courseName || tourName || "Program"

  return `
    <svg width="1200" height="850" xmlns="http://www.w3.org/2000/svg">
       Background 
      <rect width="1200" height="850" fill="#FFFFFF"/>
      
       Border 
      <rect x="40" y="40" width="1120" height="770" fill="none" stroke="#4E0942" stroke-width="8"/>
      <rect x="50" y="50" width="1100" height="750" fill="none" stroke="#FEEB00" stroke-width="4"/>
      
       Decorative elements 
      <circle cx="150" cy="150" r="60" fill="#DD91D0" opacity="0.2"/>
      <circle cx="1050" cy="150" r="60" fill="#FF2768" opacity="0.2"/>
      <circle cx="150" cy="700" r="60" fill="#FF2768" opacity="0.2"/>
      <circle cx="1050" cy="700" r="60" fill="#DD91D0" opacity="0.2"/>
      
       Logo/Badge 
      <circle cx="600" cy="180" r="70" fill="#4E0942"/>
      <circle cx="600" cy="180" r="60" fill="#FEEB00"/>
      <text x="600" y="195" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#4E0942" text-anchor="middle">TOS</text>
      
       Title 
      <text x="600" y="300" font-family="Georgia, serif" font-size="48" font-weight="bold" fill="#4E0942" text-anchor="middle">CERTIFICATE OF COMPLETION</text>
      
       Subtitle 
      <text x="600" y="350" font-family="Arial, sans-serif" font-size="20" fill="#666666" text-anchor="middle">This is to certify that</text>
      
       Student Name 
      <text x="600" y="420" font-family="Georgia, serif" font-size="56" font-weight="bold" fill="#FF2768" text-anchor="middle">${studentName}</text>
      <line x1="300" y1="440" x2="900" y2="440" stroke="#4E0942" stroke-width="2"/>
      
       Program Name 
      <text x="600" y="500" font-family="Arial, sans-serif" font-size="20" fill="#666666" text-anchor="middle">has successfully completed</text>
      <text x="600" y="550" font-family="Georgia, serif" font-size="36" font-weight="bold" fill="#4E0942" text-anchor="middle">${programName}</text>
      
       Date 
      <text x="600" y="620" font-family="Arial, sans-serif" font-size="18" fill="#666666" text-anchor="middle">on ${completionDate}</text>
      
       Footer 
      <text x="300" y="720" font-family="Arial, sans-serif" font-size="16" fill="#4E0942" text-anchor="middle">The OPEN Students</text>
      <line x1="200" y1="730" x2="400" y2="730" stroke="#4E0942" stroke-width="2"/>
      <text x="300" y="750" font-family="Arial, sans-serif" font-size="14" fill="#666666" text-anchor="middle">Authorized Signature</text>
      
      <text x="900" y="720" font-family="Arial, sans-serif" font-size="16" fill="#4E0942" text-anchor="middle">Beyond the Classroom</text>
      <line x1="800" y1="730" x2="1000" y2="730" stroke="#4E0942" stroke-width="2"/>
      <text x="900" y="750" font-family="Arial, sans-serif" font-size="14" fill="#666666" text-anchor="middle">Official Seal</text>
      
       Certificate Number 
      <text x="600" y="790" font-family="Arial, sans-serif" font-size="12" fill="#999999" text-anchor="middle">Certificate No: ${certificateNumber}</text>
    </svg>
  `
}

export async function sendCertificateEmail(
  to: string,
  studentName: string,
  programName: string,
  certificateUrl: string,
): Promise<{ success: boolean; error?: string }> {
  // In a production environment, you would integrate with an email service like:
  // - Resend
  // - SendGrid
  // - AWS SES
  // - Mailgun

  // For now, we'll simulate the email sending
  console.log("[open] Sending certificate email to:", to)
  console.log("[open] Student:", studentName)
  console.log("[open] Program:", programName)
  console.log("[open] Certificate URL:", certificateUrl)

  // Simulate email content
  const emailContent = `
    Dear ${studentName},

    Congratulations on completing ${programName}!

    We are thrilled to award you this certificate of completion. Your dedication and hard work have paid off, and we're proud to have been part of your learning journey.

    You can download your certificate here: ${certificateUrl}

    Keep learning and growing beyond the classroom!

    Best regards,
    The OPEN Students Team
  `

  console.log("[open] Email content:", emailContent)

  // Return success (in production, this would be the actual email service response)
  return { success: true }
}
