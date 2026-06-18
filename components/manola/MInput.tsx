"use client"

import { InputHTMLAttributes, forwardRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

interface MInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  showPasswordToggle?: boolean
  prefix?: string
  icon?: React.ReactNode
}

const MInput = forwardRef<HTMLInputElement, MInputProps>(
  ({ className, label, error, type = "text", showPasswordToggle, prefix, icon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === "password"
    const inputType = isPassword && showPassword ? "text" : type

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
            {label} {props.required && <span className="text-red-500">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]">
              {icon}
            </div>
          )}
          {prefix && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] text-sm">
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={cn(
              "w-full h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-white",
              "focus:border-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#0A0A0A]",
              "placeholder:text-[#9CA3AF] disabled:bg-[#F9F9F9] disabled:cursor-not-allowed",
              icon && "pl-10",
              prefix && "pl-10",
              (isPassword && showPasswordToggle) && "pr-10",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />
          {isPassword && showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#0A0A0A]"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

MInput.displayName = "MInput"

export { MInput }
