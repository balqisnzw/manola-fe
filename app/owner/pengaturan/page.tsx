"use client"

import { useState } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MInput } from "@/components/manola/MInput"
import { MButton } from "@/components/manola/MButton"
import { LayoutDashboard, Users, UserCog, Settings, CheckCircle } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
  { label: "Pelanggan", href: "/owner/pelanggan", icon: Users },
  { label: "Karyawan", href: "/owner/karyawan", icon: UserCog },
  { label: "Pengaturan", href: "/owner/pengaturan", icon: Settings },
]

export default function OwnerPengaturanPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Dummy submit
    setShowSuccess(true)
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <SidebarLayout navItems={navItems} userName="Budi Santoso" userRole="Owner">
      <h1 className="text-2xl font-semibold text-[#0A0A0A] mb-6">Pengaturan</h1>

      <MCard className="max-w-md">
        <h2 className="font-semibold text-[#0A0A0A] mb-4">Ganti Password</h2>

        {showSuccess && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-green-700">Password berhasil diubah</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <MInput
            label="Password Saat Ini"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            showPasswordToggle
            required
          />
          <MInput
            label="Password Baru"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            showPasswordToggle
            required
          />
          <MInput
            label="Konfirmasi Password Baru"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            showPasswordToggle
            required
          />
          <MButton type="submit" variant="primary" className="mt-4">
            Simpan Password
          </MButton>
        </form>
      </MCard>
    </SidebarLayout>
  )
}
