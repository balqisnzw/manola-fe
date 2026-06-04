"use client"

import { useState } from "react"
import Link from "next/link"

import { LogoutButton } from "@/components/auth/LogoutButton"

import { NavbarLayout } from "@/components/layouts/NavbarLayout"
import { MCard } from "@/components/manola/MCard"
import { MInput } from "@/components/manola/MInput"
import { MButton } from "@/components/manola/MButton"

import {
  Settings,
  CheckCircle,
} from "lucide-react"

import { authService } from "@/lib/services"

const navItems = [
  { label: "Transaksi", href: "/kasir/transaksi" },
  { label: "Riwayat", href: "/kasir/riwayat" },
]

export default function KasirPengaturanPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const currentUser = authService.getCurrentUser()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      alert("Konfirmasi password baru tidak cocok.")
      return
    }
    setLoading(true)
    try {
      await authService.changePassword(currentPassword, newPassword)
      setShowSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (err: any) {
      alert("Gagal mengubah password: " + (err.message || "Terjadi kesalahan"))
    } finally {
      setLoading(false)
    }
  }

  const rightContent = (
  <div className="flex items-center gap-4">
    <span className="text-sm text-[#6B7280]">
      {currentUser?.nama ?? "Kasir"}
    </span>

    <Link
      href="/kasir/pengaturan"
      className="text-[#0A0A0A]"
    >
      <Settings className="w-5 h-5" />
    </Link>

    <LogoutButton />
  </div>
)

  return (
    <NavbarLayout navItems={navItems} rightContent={rightContent}>
      <div className="p-8">
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
            <MButton type="submit" variant="primary" className="mt-4" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan Password"}
            </MButton>
          </form>
        </MCard>
      </div>
    </NavbarLayout>
  )
}
