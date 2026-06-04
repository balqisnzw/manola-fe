"use client"

import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface MLoaderProps {
  /** Ukuran spinner: sm (16px), md (24px), lg (32px) */
  size?: "sm" | "md" | "lg"
  /** Teks opsional yang ditampilkan di samping spinner */
  text?: string
  /** Kelas CSS tambahan untuk wrapper */
  className?: string
  /** Apakah ditampilkan sebagai inline (di dalam tombol) atau block (tengah halaman) */
  inline?: boolean
}

const sizeMap = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-8 h-8",
}

export function MLoader({
  size = "md",
  text,
  className,
  inline = false,
}: MLoaderProps) {
  if (inline) {
    return (
      <span className={cn("inline-flex items-center gap-2", className)}>
        <Loader2 className={cn(sizeMap[size], "animate-spin")} />
        {text && <span>{text}</span>}
      </span>
    )
  }

  return (
    <div className={cn("flex items-center justify-center py-12 gap-2 text-[#6B7280]", className)}>
      <Loader2 className={cn(sizeMap[size], "animate-spin")} />
      {text && <span>{text}</span>}
    </div>
  )
}
