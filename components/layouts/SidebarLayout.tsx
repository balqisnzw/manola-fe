"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LogOut, LucideIcon, Menu, X } from "lucide-react"
import { removeToken } from "@/lib/api"

interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

interface SidebarLayoutProps {
  navItems: NavItem[]
  children: React.ReactNode
  userName: string
  userRole: string
}

export function SidebarLayout({
  navItems,
  children,
  userName,
  userRole,
}: SidebarLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Tutup menu mobile ketika rute berubah
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = () => {
    removeToken()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-[#E5E7EB] sticky top-0 z-30">
        <span className="font-bold tracking-widest text-sm text-[#0A0A0A]">
          MANOLA
        </span>
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 -mr-2 text-[#6B7280] hover:bg-gray-100 rounded-md transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 w-60 h-full bg-white border-r border-[#E5E7EB] flex flex-col z-50 transition-transform duration-300 ease-in-out lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[#E5E7EB] flex items-center justify-between">
          <span className="font-bold tracking-widest text-sm text-[#0A0A0A] hidden lg:block">
            MANOLA
          </span>
          <span className="font-bold tracking-widest text-sm text-[#0A0A0A] lg:hidden">
            MENU
          </span>
          <button 
            className="lg:hidden p-1 text-[#6B7280] hover:text-[#0A0A0A] hover:bg-gray-100 rounded-md transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User block */}
        <div className="px-6 py-4 border-b border-[#E5E7EB]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-sm font-medium">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="text-sm font-medium text-[#0A0A0A]">
                {userName}
              </p>

              <p className="text-xs text-[#6B7280]">
                {userRole}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              pathname.startsWith(item.href + "/")

            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-6 py-2.5 text-sm transition-colors",
                  isActive
                    ? "border-l-2 border-[#0A0A0A] bg-[#F9F9F9] text-[#0A0A0A] font-medium"
                    : "text-[#6B7280] hover:bg-[#F9F9F9] hover:text-[#0A0A0A]"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#E5E7EB]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-2 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md w-full transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-60 min-h-screen p-4 lg:p-8">
        {children}
      </main>
    </div>
  )
}