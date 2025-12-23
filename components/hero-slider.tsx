"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

type SliderItem = { imageUrl: string; caption?: string }

export function HeroSlider({ items, asBackground = false }: { items: SliderItem[]; asBackground?: boolean }) {
  const images = useMemo(() => items.filter((i) => i.imageUrl), [items])
  const [index, setIndex] = useState(0)
  const [isHover, setIsHover] = useState(false)

  useEffect(() => {
    if (images.length <= 1 || isHover) return
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(id)
  }, [images.length, isHover])

  if (images.length === 0) return null

  const goPrev = () => setIndex((prev) => (prev - 1 + images.length) % images.length)
  const goNext = () => setIndex((prev) => (prev + 1) % images.length)

  return (
    <div
      className={asBackground ? "absolute inset-0 w-full h-full max-w-none overflow-hidden" : "relative w-screen max-w-none rounded-none overflow-hidden shadow-2xl"}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className={asBackground ? "absolute inset-0 h-full" : "relative h-[60vh] md:h-[70vh]"}>
        {images.map((img, i) => (
          <Image
            key={img.imageUrl + i}
            src={img.imageUrl || "/placeholder.svg"}
            alt={img.caption || `Slide ${i + 1}`}
            fill
            sizes="100vw"
            unoptimized
            className={`object-cover absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
            priority={i === 0}
          />
        ))}
        {asBackground && <div className="absolute inset-0 bg-black/40" />}
      </div>
      {!asBackground && images[index]?.caption && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/40 text-white rounded-lg px-4 py-2 text-sm">
          {images[index].caption}
        </div>
      )}
      {!asBackground && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`w-2.5 h-2.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
            />
          ))}
        </div>
      )}
      {!asBackground && images.length > 1 && (
        <>
          <button
            aria-label="Previous slide"
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            aria-label="Next slide"
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </div>
  )
}
