"use client"

import { useState, useEffect } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MInput } from "@/components/manola/MInput"
import { MButton } from "@/components/manola/MButton"
import { MLoader } from "@/components/manola/MLoader"
import { LayoutDashboard, Users, UserCog, Settings, Package, ClipboardList, Sliders } from "lucide-react"
import { authService, settingService } from "@/lib/services"
import { toast } from "sonner"

const navItems = [
  { label: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
  { label: "Stok Barang", href: "/owner/produk", icon: Package },
  { label: "Riwayat Restock", href: "/owner/restock", icon: ClipboardList },
  { label: "Pelanggan", href: "/owner/pelanggan", icon: Users },
  { label: "Karyawan", href: "/owner/karyawan", icon: UserCog },
  { label: "Konfigurasi Toko", href: "/owner/konfigurasi", icon: Sliders },
  { label: "Pengaturan Profil", href: "/owner/pengaturan", icon: Settings },
]

export default function OwnerKonfigurasiPage() {
  const currentUser = authService.getCurrentUser()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [shopName, setShopName] = useState("")
  const [shopAddress, setShopAddress] = useState("")
  const [shopPhone, setShopPhone] = useState("")
  const [taxPercent, setTaxPercent] = useState("")
  const [bankName, setBankName] = useState("")
  const [bankAccount, setBankAccount] = useState("")
  
  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    setLoading(true)
    try {
      const data = await settingService.get()
      setShopName(data.shop_name || "MANOLA Store")
      setShopAddress(data.shop_address || "")
      setShopPhone(data.shop_phone || "")
      setTaxPercent(data.tax_percent || "0")
      setBankName(data.bank_name || "")
      setBankAccount(data.bank_account || "")
    } catch (err) {
      console.error(err)
      toast.error("Gagal memuat konfigurasi toko")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await settingService.update({
        shop_name: shopName,
        shop_address: shopAddress,
        shop_phone: shopPhone,
        tax_percent: taxPercent,
        bank_name: bankName,
        bank_account: bankAccount,
      })
      toast.success("Konfigurasi global toko berhasil diperbarui")
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui konfigurasi")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SidebarLayout navItems={navItems} userName={currentUser?.nama ?? "Owner"} userRole="Owner">
      <h1 className="text-2xl font-bold text-[#0A0A0A] mb-6">Konfigurasi Toko</h1>

      {loading ? (
        <MLoader />
      ) : (
        <MCard className="max-w-xl">
          <form onSubmit={handleSave} className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Informasi Umum</h2>
            <MInput label="Nama Toko" required value={shopName} onChange={e => setShopName(e.target.value)} />
            <MInput label="Alamat Toko" required value={shopAddress} onChange={e => setShopAddress(e.target.value)} />
            <MInput label="Nomor Telepon Toko" required value={shopPhone} onChange={e => setShopPhone(e.target.value)} />

            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2 pt-2">Keuangan & Pembayaran</h2>
            <MInput label="PPN (%)" type="number" required value={taxPercent} onChange={e => setTaxPercent(e.target.value)} />
            <MInput label="Nama Bank Transaksi" placeholder="Contoh: BCA / Mandiri" value={bankName} onChange={e => setBankName(e.target.value)} />
            <MInput label="Nomor Rekening Bank" placeholder="Contoh: 12930283719" value={bankAccount} onChange={e => setBankAccount(e.target.value)} />

            <MButton type="submit" variant="primary" fullWidth size="lg" className="mt-4" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan Konfigurasi Global"}
            </MButton>
          </form>
        </MCard>
      )}
    </SidebarLayout>
  )
}
