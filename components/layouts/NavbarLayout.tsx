"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

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

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-[#E5E7EB] flex items-center px-8 justify-between z-40">
        {/* Logo */}
        <span className="font-bold tracking-widest text-sm text-[#0A0A0A]">MANOLA</span>

        {/* Navigation */}
        <nav className="flex items-center gap-6">
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

        {/* Right content */}
        <div className="flex items-center gap-4">
          {rightContent}
        </div>
      </header>

      {/* Main content */}
      <main className="pt-14 min-h-screen">
        {children}
      </main>
    </div>
  )
}
