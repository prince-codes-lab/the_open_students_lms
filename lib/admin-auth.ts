// Simple admin authentication without Supabase auth
// This is a direct login system for the admin user

const ADMIN_CREDENTIALS = {
  email: "sheisdaniellawilliams@gmail.com",
  password: "sheisdaniellawilliams",
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  return email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password
}

export function setAdminSession() {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("admin_authenticated", "true")
    sessionStorage.setItem("admin_email", ADMIN_CREDENTIALS.email)
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
