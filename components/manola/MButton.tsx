"use client"

import { ButtonHTMLAttributes, forwardRef } from "react"
import { cn } from "@/lib/utils"

interface MButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline"
  size?: "sm" | "md" | "lg"
  fullWidth?: boolean
}

const MButton = forwardRef<HTMLButtonElement, MButtonProps>(
  ({ className, variant = "primary", size = "md", fullWidth = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-[#0A0A0A] text-white hover:bg-[#1a1a1a]": variant === "primary",
            "border border-[#0A0A0A] text-[#0A0A0A] hover:bg-[#F9F9F9] bg-white": variant === "secondary",
            "text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F9F9F9]": variant === "ghost",
            "bg-red-500 text-white hover:bg-red-600": variant === "danger",
            "border border-[#E5E7EB] text-[#374151] hover:bg-[#F9F9F9] bg-white": variant === "outline",
          },
          {
            "h-8 px-3 text-sm": size === "sm",
            "h-10 px-4 text-sm": size === "md",
            "h-12 px-6 text-base": size === "lg",
          },
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

MButton.displayName = "MButton"

export { MButton }
