"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { authService } from "@/lib/services/authService"

interface LogoutButtonProps {
  className?: string
}

export function LogoutButton({
  className = "text-red-500 hover:text-red-600",
}: LogoutButtonProps) {
  const router = useRouter()

  const handleLogout = () => {
    authService.logout()
    router.push("/login")
  }

  return (
    <button
      onClick={handleLogout}
      className={className}
    >
      <LogOut className="w-5 h-5" />
    </button>
  )
}