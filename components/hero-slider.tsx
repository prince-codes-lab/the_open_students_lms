"use client"

import { useEffect, useState } from "react"

const slides = [
  '/slider-1.svg',
  '/slider-2.svg',
  '/slider-3.svg',
  '/slider-4.svg',
  '/slider-5.svg',
];

export function HeroSlider({ asBackground = false }: { asBackground?: boolean }) {
  const [index, setIndex] = useState(0)
  const [isHover, setIsHover] = useState(false)

  useEffect(() => {
    if (slides.length <= 1 || isHover) return
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(id)
  }, [isHover])

  if (slides.length === 0) return null

  return (
    <div
      className={asBackground ? "absolute inset-0 w-full h-full max-w-none overflow-hidden" : "relative w-screen max-w-none rounded-none overflow-hidden shadow-2xl"}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div className={asBackground ? "absolute inset-0 h-full" : "relative h-[60vh] md:h-[70vh]"}>
        {slides.map((slide, i) => (
          <img
            key={slide + i}
            src={slide}
            alt={`Slide ${i + 1}`}
            className={`object-cover absolute inset-0 w-full h-full transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        {asBackground && <div className="absolute inset-0 bg-black/40" />}
      </div>
      {!asBackground && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`w-2.5 h-2.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`}
            />
          ))}
        </div>
      )}
      {!asBackground && slides.length > 1 && (
        <>
          <button
            aria-label="Previous slide"
            onClick={() => setIndex((prev) => (prev - 1 + slides.length) % slides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2"
          >
            ‹
          </button>
          <button
            aria-label="Next slide"
            onClick={() => setIndex((prev) => (prev + 1) % slides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2"
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}