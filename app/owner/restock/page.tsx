"use client"

import { useState, useEffect } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MLoader } from "@/components/manola/MLoader"
import { LayoutDashboard, Users, UserCog, Settings, Package, ClipboardList, Sliders } from "lucide-react"
import { authService, stockService } from "@/lib/services"
import type { RestockItem } from "@/lib/services/restockService"

import { ownerNavItems as navItems } from "@/components/layouts/ownerNav"

export default function OwnerRestockPage() {
  const [restocks, setRestocks] = useState<RestockItem[]>([])
  const [loading, setLoading] = useState(true)

  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    loadRestocks()
  }, [])

  async function loadRestocks() {
    setLoading(true)
    try {
      const data = await stockService.getAll()
      setRestocks(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: "createdAt", label: "Tanggal Restock", render: (item: RestockItem) => (
      new Date(item.createdAt).toLocaleString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    )},
    { key: "productName", label: "Produk", render: (item: RestockItem) => (
      <span className="font-semibold">{item.variant?.product?.name || "-"}</span>
    )},
    { key: "details", label: "Detail Varian", render: (item: RestockItem) => (
      `Ukuran: ${item.variant?.size}${item.variant?.color ? `, Warna: ${item.variant.color}` : ""}`
    )},
    { key: "supplier", label: "Supplier", render: (item: RestockItem) => item.supplier?.nama || "-" },
    { key: "jumlah", label: "Jumlah Masuk", render: (item: RestockItem) => (
      <span className="text-green-600 font-bold">+{item.jumlah} pcs</span>
    )}
  ]

  return (
    <SidebarLayout navItems={navItems} userName={currentUser?.nama ?? "Owner"} userRole="Owner">
      <h1 className="text-2xl font-bold text-[#0A0A0A] mb-6">Riwayat Restock</h1>

      {loading ? (
        <MLoader />
      ) : (
        <MCard padding="sm">
          <MTable columns={columns} data={restocks} />
        </MCard>
      )}
    </SidebarLayout>
  )
}
