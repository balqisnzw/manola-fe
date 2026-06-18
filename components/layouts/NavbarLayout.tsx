"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"
import { settingService } from "@/lib/services/miscServices"
import { getImageUrl } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
}

interface NavbarLayoutProps {
  navItems: NavItem[]
  children: React.ReactNode
  rightContent?: React.ReactNode
}

export function NavbarLayout({ navItems, children, rightContent }: NavbarLayoutProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    settingService.get().then(s => {
      if (s.logo_url) setLogoUrl(s.logo_url)
    }).catch(() => {})
  }, [])

  // Tutup menu mobile ketika rute berubah
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#E5E7EB] flex items-center px-4 md:px-8 justify-between z-50">
        {/* Logo */}
        {logoUrl ? (
          <img src={getImageUrl(logoUrl)} alt="MANOLA" className="h-6 object-contain" />
        ) : (
          <span className="font-bold tracking-widest text-sm text-[#0A0A0A]">MANOLA</span>
        )}

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm transition-colors",
                  isActive
                    ? "font-semibold text-[#0A0A0A]"
                    : "text-[#6B7280] hover:text-[#0A0A0A]"
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Right content */}
        <div className="hidden md:flex items-center gap-4">
          {rightContent}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 -mr-2 text-[#6B7280] hover:bg-gray-100 rounded-md transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 bg-white border-b border-[#E5E7EB] z-40 flex flex-col p-4 shadow-lg shadow-black/5 animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-2 mb-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-sm transition-colors py-3 border-b border-gray-100 px-2 rounded-md",
                    isActive
                      ? "font-semibold text-[#0A0A0A] bg-gray-50"
                      : "text-[#6B7280] hover:bg-gray-50"
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          
          <div className="flex flex-col gap-4 px-2 pt-2">
            {rightContent}
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 top-14 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="pt-14 min-h-screen">
        {children}
      </main>
    </div>
  )
}
