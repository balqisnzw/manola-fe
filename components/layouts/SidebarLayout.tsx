"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LogOut, LucideIcon } from "lucide-react"
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

  const handleLogout = () => {
    removeToken()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-60 h-full bg-white border-r border-[#E5E7EB] flex flex-col z-40">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-[#E5E7EB]">
          <span className="font-bold tracking-widest text-sm text-[#0A0A0A]">
            MANOLA
          </span>
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
      <main className="ml-60 min-h-screen p-8">
        {children}
      </main>
    </div>
  )
}