"use client"

import { useState, useEffect } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MButton } from "@/components/manola/MButton"
import { MBadge } from "@/components/manola/MBadge"
import { MLoader } from "@/components/manola/MLoader"
import {
  LayoutDashboard, ShoppingBag, Archive, Truck, ClipboardList,
  MessageSquare, Settings, Printer, Tag, Image, FileText,
  FolderTree,
} from "lucide-react"
import { orderService, type Order } from "@/lib/services/orderService"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Produk", href: "/admin/produk", icon: ShoppingBag },
  { label: "Kategori", href: "/admin/kategori", icon: FolderTree },
  { label: "Stok", href: "/admin/stok", icon: Archive },
  { label: "Supplier", href: "/admin/supplier", icon: Truck },
  { label: "Pesanan", href: "/admin/pesanan", icon: ClipboardList },
  { label: "Promo", href: "/admin/promo", icon: Tag },
  { label: "Banner", href: "/admin/banner", icon: Image },
  { label: "Laporan", href: "/admin/laporan", icon: FileText },
  { label: "Ulasan", href: "/admin/ulasan", icon: MessageSquare },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
]

function getStatusVariant(status: string) {
  switch (status) {
    case "DIPROSES": return "warning"
    case "DIKEMAS": return "warning"
    case "DIKIRIM": return "info"
    case "SELESAI": return "success"
    default: return "gray"
  }
}

export default function AdminLaporanPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("")
  const [filterDateFrom, setFilterDateFrom] = useState("")
  const [filterDateTo, setFilterDateTo] = useState("")

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try { setOrders(await orderService.getAll({})) }
    catch { toast.error("Gagal memuat data pesanan") }
    finally { setLoading(false) }
  }

  const filteredOrders = orders.filter((o) => {
    if (filterStatus && o.status !== filterStatus) return false
    if (filterDateFrom && new Date(o.createdAt) < new Date(filterDateFrom)) return false
    if (filterDateTo) {
      const to = new Date(filterDateTo)
      to.setHours(23, 59, 59, 999)
      if (new Date(o.createdAt) > to) return false
    }
    return true
  })

  const totalPenjualan = filteredOrders
    .filter((o) => o.status === "SELESAI")
    .reduce((sum, o) => sum + o.total_harga, 0)

  const totalPesanan = filteredOrders.length
  const totalSelesai = filteredOrders.filter((o) => o.status === "SELESAI").length

  function handlePrint() {
    window.print()
  }

  const columns = [
    { key: "id", label: "#", render: (o: Order) => <span className="font-mono text-sm">{o.id}</span> },
    { key: "tanggal", label: "Tanggal", render: (o: Order) => new Date(o.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) },
    { key: "pelanggan", label: "Pelanggan", render: (o: Order) => o.user?.nama ?? "Guest" },
    { key: "jenis", label: "Jenis", render: (o: Order) => <MBadge variant={o.jenis === "ONLINE" ? "info" : "gray"}>{o.jenis}</MBadge> },
    { key: "total", label: "Total", render: (o: Order) => formatPrice(o.total_harga) },
    { key: "status", label: "Status", render: (o: Order) => <MBadge variant={getStatusVariant(o.status) as any}>{o.status}</MBadge> },
    { key: "pembayaran", label: "Pembayaran", render: (o: Order) => o.payment?.metode_pembayaran ?? "-" },
  ]

  return (
    <SidebarLayout navItems={navItems} userName="Admin" userRole="Admin">
      {/* Screen only: header & filters */}
      <div className="print:hidden">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[#0A0A0A]">Laporan Penjualan</h1>
          <MButton onClick={handlePrint}><Printer className="w-4 h-4 mr-2" />Cetak Laporan</MButton>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-white">
            <option value="">Semua Status</option>
            <option value="DIPROSES">Diproses</option>
            <option value="DIKEMAS">Dikemas</option>
            <option value="DIKIRIM">Dikirim</option>
            <option value="SELESAI">Selesai</option>
          </select>
          <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-white" />
          <span className="flex items-center text-sm text-[#6B7280]">s/d</span>
          <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-white" />
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <MCard>
            <p className="text-sm text-[#6B7280]">Total Pesanan</p>
            <p className="text-2xl font-bold text-[#0A0A0A]">{totalPesanan}</p>
          </MCard>
          <MCard>
            <p className="text-sm text-[#6B7280]">Pesanan Selesai</p>
            <p className="text-2xl font-bold text-green-600">{totalSelesai}</p>
          </MCard>
          <MCard>
            <p className="text-sm text-[#6B7280]">Total Penjualan (Selesai)</p>
            <p className="text-2xl font-bold text-[#0A0A0A]">{formatPrice(totalPenjualan)}</p>
          </MCard>
        </div>
      </div>

      {/* Print header (only visible when printing) */}
      <div className="hidden print:block mb-4">
        <h1 className="text-xl font-bold text-center">Laporan Penjualan — MANOLA</h1>
        <p className="text-sm text-center text-gray-500">
          {filterDateFrom && filterDateTo
            ? `Periode: ${filterDateFrom} s/d ${filterDateTo}`
            : "Seluruh periode"
          }
        </p>
        <div className="flex justify-around mt-2 text-sm">
          <span>Total Pesanan: {totalPesanan}</span>
          <span>Selesai: {totalSelesai}</span>
          <span>Total Penjualan: {formatPrice(totalPenjualan)}</span>
        </div>
        <hr className="mt-2" />
      </div>

      {/* Table */}
      <MCard padding="sm">
        {loading ? <MLoader text="Memuat data..." /> : <MTable columns={columns} data={filteredOrders} />}
      </MCard>
    </SidebarLayout>
  )
}
