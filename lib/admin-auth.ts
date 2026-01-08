// Simple admin authentication with environment variables
// This is a direct login system for the admin user

function getAdminCredentials() {
  // In production require environment variables. In non-production (dev/test)
  // allow a local fallback to make development/testing easier.
  // const inProduction = process.env.NODE_ENV === "production"

  const adminEmailEnv = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL
  const adminPasswordEnv = process.env.ADMIN_PASSWORD

  // if (inProduction) {
  //   return {
  //     email: adminEmailEnv || "",
  //     password: adminPasswordEnv || "",
  //   }
  // }

  // Dev fallback (non-production)
  const FALLBACK_ADMIN_EMAIL = "sheisdaniellawilliams@gmail.com"
  const FALLBACK_ADMIN_PASSWORD = "sheisdaniellawilliams"
  //  return {
  //   email: adminEmailEnv || FALLBACK_ADMIN_EMAIL,
  //   password: adminPasswordEnv || FALLBACK_ADMIN_PASSWORD,
  // }
  return {
    email: FALLBACK_ADMIN_EMAIL,
    password: FALLBACK_ADMIN_PASSWORD,
  }
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const credentials = getAdminCredentials()
  return email === credentials.email && password === credentials.password
}

export function setAdminSession() {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("admin_authenticated", "true")
    const credentials = getAdminCredentials()
    sessionStorage.setItem("admin_email", credentials.email)
  }
}

export function clearAdminSession() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("admin_authenticated")
    sessionStorage.removeItem("admin_email")
  }
}

export function isAdminAuthenticated(): boolean {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("admin_authenticated") === "true"
  }
  return false
}

export function getAdminEmail(): string | null {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("admin_email")
  }
  return null
}
