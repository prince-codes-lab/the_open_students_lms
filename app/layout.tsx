import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "The OPEN Students - Beyond the Classroom",
  description: "Empowering African and Asian youth through digital courses, mentorship, and educational tours.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`antialiased`}>
      <body>{children}</body>
    </html>
  )
}
