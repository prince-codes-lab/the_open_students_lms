export function Logo({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizes = {
    sm: { container: 40, cap: 24, feather: 16 },
    md: { container: 48, cap: 28, feather: 20 },
    lg: { container: 64, cap: 36, feather: 24 },
  }

  const s = sizes[size]

  return (
    <svg className={className} width={s.container} height={s.container} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Feathers - decorative elements */}
      <path
        d="M15 25C15 25 12 20 10 18C8 16 6 15 6 15C6 15 8 17 10 19C12 21 15 25 15 25Z"
        fill="#FEEB00"
        opacity="0.8"
      />
      <path
        d="M49 25C49 25 52 20 54 18C56 16 58 15 58 15C58 15 56 17 54 19C52 21 49 25 49 25Z"
        fill="#FF2768"
        opacity="0.8"
      />
      <path d="M12 30C12 30 8 26 6 24C4 22 2 20 2 20C2 20 4 22 6 24C8 26 12 30 12 30Z" fill="#DD91D0" opacity="0.7" />
      <path
        d="M52 30C52 30 56 26 58 24C60 22 62 20 62 20C62 20 60 22 58 24C56 26 52 30 52 30Z"
        fill="#FEEB00"
        opacity="0.7"
      />

      {/* Graduation cap base - purple */}
      <ellipse cx="32" cy="38" rx="22" ry="6" fill="#4E0942" />

      {/* Graduation cap top - purple with yellow accent */}
      <path
        d="M32 20L10 28L32 36L54 28L32 20Z"
        fill="#4E0942"
        stroke="#FEEB00"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Tassel - pink */}
      <circle cx="32" cy="20" r="2" fill="#FF2768" />
      <line x1="32" y1="22" x2="28" y2="30" stroke="#FF2768" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="28" cy="30" r="2.5" fill="#FF2768" />

      {/* Cap detail lines - orchid */}
      <line x1="32" y1="28" x2="32" y2="38" stroke="#DD91D0" strokeWidth="1.5" />
      <path d="M54 28L54 32C54 35 45 38 32 38C19 38 10 35 10 32L10 28" stroke="#DD91D0" strokeWidth="1" />

      {/* Additional feather accents */}
      <path d="M20 24C20 24 18 22 17 21" stroke="#FEEB00" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M44 24C44 24 46 22 47 21" stroke="#FF2768" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}
