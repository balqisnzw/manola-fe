"use client"

import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface MModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  maxWidth?: "xs" | "sm" | "md" | "lg" | "2xl"
}

export function MModal({ isOpen, onClose, title, children, footer, maxWidth = "lg" }: MModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={cn(
          "bg-white rounded-lg shadow-xl w-full mx-4 max-h-[90vh] flex flex-col",
          {
            "max-w-xs": maxWidth === "xs",
            "max-w-sm": maxWidth === "sm",
            "max-w-md": maxWidth === "md",
            "max-w-lg": maxWidth === "lg",
            "max-w-2xl": maxWidth === "2xl",
          }
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
            <h2 className="text-lg font-semibold text-[#0A0A0A]">{title}</h2>
            <button
              onClick={onClose}
              className="text-[#6B7280] hover:text-[#0A0A0A] p-1 rounded-md hover:bg-[#F9F9F9]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB]">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
