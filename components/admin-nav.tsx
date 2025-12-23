"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function AdminNav() {
  const pathname = usePathname()
  const items = [
    { href: "/admin/settings", label: "Site Settings" },
    { href: "/admin/founder", label: "Founder" },
  ]

  return (
    <div className="flex items-center gap-3 mb-6">
      {items.map((item) => {
        const active = pathname === item.href
        return (
          <Button
            key={item.href}
            asChild
            variant={active ? "default" : "outline"}
            className={active ? "bg-[#4E0942] text-white" : "border-2 border-[#4E0942] text-[#4E0942]"}
          >
            <Link href={item.href}>{item.label}</Link>
          </Button>
        )
      })}
    </div>
  )
}
