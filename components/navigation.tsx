"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useEffect, useState } from "react"
import { Logo } from "@/components/logo"
import Image from "next/image"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [brand, setBrand] = useState<{ logoUrl?: string; logoName?: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch("/api/admin/settings")
        const data = await res.json()
        if (!cancelled) setBrand({ logoUrl: data?.logoUrl, logoName: data?.logoName })
      } catch {}
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#DD91D0]/20 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="transition-transform group-hover:scale-110">
              {brand?.logoUrl ? (
                <Image
                  src={brand.logoUrl || "/placeholder.svg"}
                  alt={brand.logoName || "Logo"}
                  width={40}
                  height={40}
                  unoptimized
                  className="h-10 w-10 object-contain"
                />
              ) : (
                <Logo size="md" />
              )}
            </div>
            <div className="hidden md:block">
              <div className="text-[#4E0942] font-bold text-lg leading-tight">The OPEN Students</div>
              <div className="text-[#FF2768] text-xs font-medium">Beyond the Classroom</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/#about" className="text-[#4E0942] hover:text-[#FF2768] font-medium transition-colors">
              About
            </Link>
            <Link href="/programs" className="text-[#4E0942] hover:text-[#FF2768] font-medium transition-colors">
              Programs
            </Link>
            <Link href="/tours" className="text-[#4E0942] hover:text-[#FF2768] font-medium transition-colors">
              Tours
            </Link>
            <Link href="/community" className="text-[#4E0942] hover:text-[#FF2768] font-medium transition-colors">
              Community
            </Link>
            <Link href="/dashboard" className="text-[#4E0942] hover:text-[#FF2768] font-medium transition-colors">
              Dashboard
            </Link>
            <Button
              asChild
              className="bg-[#FEEB00] hover:bg-[#FEEB00]/90 text-[#4E0942] font-bold shadow-lg hover:shadow-xl transition-all"
            >
              <Link href="/auth/sign-up">Join the Journey</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-[#4E0942]" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 animate-fade-in-up">
            <Link
              href="/#about"
              className="block text-[#4E0942] hover:text-[#FF2768] font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/programs"
              className="block text-[#4E0942] hover:text-[#FF2768] font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Programs
            </Link>
            <Link
              href="/tours"
              className="block text-[#4E0942] hover:text-[#FF2768] font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Tours
            </Link>
            <Link
              href="/community"
              className="block text-[#4E0942] hover:text-[#FF2768] font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Community
            </Link>
            <Link
              href="/dashboard"
              className="block text-[#4E0942] hover:text-[#FF2768] font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Button
              asChild
              className="w-full bg-[#FEEB00] hover:bg-[#FEEB00]/90 text-[#4E0942] font-bold"
              onClick={() => setIsMenuOpen(false)}
            >
              <Link href="/auth/sign-up">Join the Journey</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  )
}
