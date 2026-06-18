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
  { label: "Pesanan", href: "/packaging/pesanan" },
]

export default function PackagingPengaturanPage() {
  const currentUser = authService.getCurrentUser()

  const [nama, setNama] = useState(currentUser?.nama ?? "")
  const [email, setEmail] = useState(currentUser?.email ?? "")
  const [noTelepon, setNoTelepon] = useState(currentUser?.no_telepon ?? "")
  const [showProfileSuccess, setShowProfileSuccess] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileLoading(true)
    try {
      await authService.updateProfile({ nama, email, no_telepon: noTelepon })
      setShowProfileSuccess(true)
      setTimeout(() => setShowProfileSuccess(false), 3000)
    } catch (err: any) {
      alert("Gagal memperbarui profil: " + (err.message || "Terjadi kesalahan"))
    } finally {
      setProfileLoading(false)
    }
  }

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
      {currentUser?.nama ?? "Packaging"}
    </span>

    <Link
      href="/packaging/pengaturan"
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

        <div className="space-y-6 max-w-md">
          <MCard>
            <h2 className="font-semibold text-[#0A0A0A] mb-4">Profil Akun</h2>
            
            {showProfileSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-700">Profil berhasil diperbarui</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <MInput
                label="Nama Lengkap"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
              />
              <MInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <MInput
                label="No. Telepon"
                type="tel"
                value={noTelepon}
                onChange={(e) => setNoTelepon(e.target.value)}
              />
              <MButton type="submit" variant="primary" className="mt-4" disabled={profileLoading}>
                {profileLoading ? "Menyimpan..." : "Simpan Profil"}
              </MButton>
            </form>
          </MCard>

          <MCard>
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
      </div>
    </NavbarLayout>
  )
}
