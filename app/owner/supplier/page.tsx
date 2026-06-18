"use client"

import { useState, useEffect } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MInput } from "@/components/manola/MInput"
import { Search } from "lucide-react"
import { supplierService, type Supplier } from "@/lib/services/supplierService"
import { MLoader } from "@/components/manola/MLoader"
import { ownerNavItems } from "@/components/layouts/ownerNav"
import { authService } from "@/lib/services"

export default function OwnerSupplierPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    loadSuppliers()
  }, [])

  const loadSuppliers = async () => {
    try {
      setLoading(true)
      const data = await supplierService.getAll()
      setSuppliers(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredSuppliers = suppliers.filter((s) =>
    s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.no_telepon.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.alamat ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns = [
    { key: "nama", label: "Nama Supplier", render: (item: Supplier) => <span className="font-medium text-[#0A0A0A]">{item.nama}</span> },
    { key: "no_telepon", label: "No. Telepon", render: (item: Supplier) => <span className="text-sm">{item.no_telepon}</span> },
    { key: "alamat", label: "Alamat", render: (item: Supplier) => <span className="text-sm text-[#6B7280]">{item.alamat ?? "-"}</span> },
    { key: "createdAt", label: "Terdaftar", render: (item: Supplier) => (
        <span className="text-sm text-[#6B7280]">
          {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
        </span>
    )}
  ]

  return (
    <SidebarLayout navItems={ownerNavItems} userName={currentUser?.nama ?? "Owner"} userRole="Owner">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Daftar Supplier</h1>
        <div className="w-full sm:w-72">
          <MInput
            placeholder="Cari Supplier"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      <MCard padding="sm">
        {loading ? (
          <MLoader text="Memuat data supplier..." />
        ) : (
          <MTable columns={columns} data={filteredSuppliers} />
        )}
      </MCard>
    </SidebarLayout>
  )
}
