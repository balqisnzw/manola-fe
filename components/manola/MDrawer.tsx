"use client"

import { useEffect } from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface MDrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: React.ReactNode
  children: React.ReactNode
  /** Lebar drawer di layar ≥ sm. Di mobile selalu full-width. */
  width?: string
}

export function MDrawer({
  isOpen,
  onClose,
  title,
  children,
  width = "sm:w-[480px]",
}: MDrawerProps) {
  // Kunci scroll body saat drawer terbuka
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

  return (
    <>
      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full bg-white border-l border-[#E5E7EB] shadow-xl z-50 transform transition-transform duration-300",
          width,
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
          <div className="text-lg font-semibold text-[#0A0A0A]">{title}</div>
          <button
            onClick={onClose}
            className="p-1 text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F9F9F9] rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-65px)] p-6">
          {children}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={onClose}
        />
      )}
    </>
  )
}
