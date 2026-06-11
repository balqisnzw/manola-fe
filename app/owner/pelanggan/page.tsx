"use client"

import { useState, useEffect } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MInput } from "@/components/manola/MInput"
import { MDrawer } from "@/components/manola/MDrawer"
import { MLoader } from "@/components/manola/MLoader"
import { LayoutDashboard, Users, UserCog, Settings, Package, ClipboardList, Sliders, Search } from "lucide-react"
import { userService, authService } from "@/lib/services"
import type { UserData } from "@/lib/services/miscServices"

const navItems = [
  { label: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
  { label: "Stok Barang", href: "/owner/produk", icon: Package },
  { label: "Riwayat Restock", href: "/owner/restock", icon: ClipboardList },
  { label: "Pelanggan", href: "/owner/pelanggan", icon: Users },
  { label: "Karyawan", href: "/owner/karyawan", icon: UserCog },
  { label: "Konfigurasi Toko", href: "/owner/konfigurasi", icon: Sliders },
  { label: "Pengaturan Profil", href: "/owner/pengaturan", icon: Settings },
]

export default function OwnerPelangganPage() {
  const [customers, setCustomers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<UserData | null>(null)

  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    setLoading(true)
    try {
      const data = await userService.getCustomers()
      setCustomers(data)
    } catch (err) {
      console.error("Failed to load customers:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(
    (c) =>
      c.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns = [
    { key: "name", label: "Nama", render: (item: UserData) => <span className="font-medium">{item.nama}</span> },
    { key: "email", label: "Email", render: (item: UserData) => item.email },
    {
      key: "joinDate",
      label: "Tanggal Daftar",
      render: (item: UserData) =>
        new Date(item.createdAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
    },
    {
      key: "action",
      label: "Aksi",
      render: (item: UserData) => (
        <button
          onClick={() => setSelectedCustomer(item)}
          className="text-sm text-[#6B7280] hover:text-[#0A0A0A] font-medium"
        >
          Lihat Detail
        </button>
      ),
    },
  ]

  return (
    <SidebarLayout navItems={navItems} userName={currentUser?.nama ?? "Owner"} userRole="Owner">
      <h1 className="text-2xl font-semibold text-[#0A0A0A] mb-6">Pelanggan</h1>

      {/* Search */}
      <div className="mb-4">
        <MInput
          placeholder="Cari nama atau email pelanggan..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Table */}
      {loading ? (
        <MLoader />
      ) : (
        <MCard padding="sm">
          <MTable columns={columns} data={filteredCustomers} />
        </MCard>
      )}

      {/* Slide-over Panel */}
      <MDrawer
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.nama}
      >
        {selectedCustomer && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">Informasi Akun</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-lg font-medium">
                {selectedCustomer.nama.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-[#0A0A0A]">{selectedCustomer.nama}</p>
                <p className="text-sm text-[#6B7280]">{selectedCustomer.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-[#6B7280]">Bergabung:</span>{" "}
                {new Date(selectedCustomer.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        )}
      </MDrawer>
    </SidebarLayout>
  )
}
