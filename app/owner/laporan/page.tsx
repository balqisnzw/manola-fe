"use client"

import { useState, useEffect } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MButton } from "@/components/manola/MButton"
import { MBadge } from "@/components/manola/MBadge"
import { MLoader } from "@/components/manola/MLoader"
import { Printer } from "lucide-react"
import { orderService, type Order } from "@/lib/services/orderService"
import { authService } from "@/lib/services"
import { formatPrice } from "@/lib/utils"
import { toast } from "sonner"
import { ownerNavItems } from "@/components/layouts/ownerNav"

function getStatusVariant(status: string) {
  switch (status) {
    case "DIPROSES": return "warning"
    case "DIKEMAS": return "warning"
    case "DIKIRIM": return "info"
    case "SELESAI": return "success"
    case "DIBATALKAN": return "danger"
    default: return "gray"
  }
}

export default function OwnerLaporanPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("")
  const [filterDateFrom, setFilterDateFrom] = useState("")
  const [filterDateTo, setFilterDateTo] = useState("")

  const currentUser = authService.getCurrentUser()

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try { setOrders(await orderService.getAll({})) }
    catch { toast.error("Gagal memuat data pesanan") }
    finally { setLoading(false) }
  }

  const mappedOrders = orders.map(o => ({
    ...o,
    computedStatus: o.payment?.status_pembayaran === "GAGAL" ? "DIBATALKAN" : o.status
  }))

  const filteredOrders = mappedOrders.filter((o) => {
    if (filterStatus && o.computedStatus !== filterStatus) return false
    
    const orderDate = new Date(o.createdAt)

    if (filterDateFrom) {
      const from = new Date(filterDateFrom)
      from.setHours(0, 0, 0, 0)
      if (orderDate < from) return false
    }

    if (filterDateTo) {
      const to = new Date(filterDateTo)
      to.setHours(23, 59, 59, 999)
      if (orderDate > to) return false
    }
    return true
  })

  const totalPenjualan = filteredOrders
    .filter((o) => o.payment?.status_pembayaran === "BERHASIL")
    .reduce((sum, o) => sum + o.total_harga, 0)

  const totalPesanan = filteredOrders.length
  const totalSelesai = filteredOrders.filter((o) => o.computedStatus === "SELESAI").length

  const totalPenjualanOnline = filteredOrders
    .filter((o) => o.payment?.status_pembayaran === "BERHASIL" && o.jenis === "ONLINE")
    .reduce((sum, o) => sum + o.total_harga, 0)

  const totalPenjualanOfflineCash = filteredOrders
    .filter((o) => o.payment?.status_pembayaran === "BERHASIL" && o.jenis === "OFFLINE" && o.payment?.metode_pembayaran === "CASH")
    .reduce((sum, o) => sum + o.total_harga, 0)

  const totalPenjualanOfflineQRIS = filteredOrders
    .filter((o) => o.payment?.status_pembayaran === "BERHASIL" && o.jenis === "OFFLINE" && o.payment?.metode_pembayaran === "QRIS")
    .reduce((sum, o) => sum + o.total_harga, 0)

  function handlePrint() {
    window.print()
  }

  const columns = [
    { key: "id", label: "#", render: (o: Order) => <span className="font-mono text-sm">{o.id}</span> },
    { key: "tanggal", label: "Tanggal", render: (o: Order) => new Date(o.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) },
    { key: "pelanggan", label: "Pelanggan", render: (o: Order) => o.user?.nama ?? "Guest" },
    { key: "jenis", label: "Jenis", render: (o: Order) => <MBadge variant={o.jenis === "ONLINE" ? "info" : "gray"}>{o.jenis}</MBadge> },
    { key: "total", label: "Total", render: (o: any) => formatPrice(o.total_harga) },
    { key: "status", label: "Status", render: (o: any) => <MBadge variant={getStatusVariant(o.computedStatus) as any}>{o.computedStatus}</MBadge> },
    { key: "pembayaran", label: "Pembayaran", render: (o: Order) => {
        if (o.payment?.metode_pembayaran === "MIDTRANS" && (o.payment as any).midtrans_payment_type) {
          return (o.payment as any).midtrans_payment_type;
        }
        return o.payment?.metode_pembayaran ?? "-";
    } },
  ]

  return (
    <SidebarLayout navItems={ownerNavItems} userName={currentUser?.nama ?? "Owner"} userRole="Owner">
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
            <option value="DIBATALKAN">Dibatalkan</option>
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
            <p className="text-sm text-[#6B7280]">Total Pendapatan (Lunas)</p>
            <p className="text-2xl font-bold text-[#0A0A0A]">{formatPrice(totalPenjualan)}</p>
          </MCard>
        </div>

        {/* Rincian Pemasukan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <MCard>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <p className="text-sm text-[#6B7280]">Pemasukan Online (Midtrans)</p>
            </div>
            <p className="text-2xl font-bold text-blue-600">{formatPrice(totalPenjualanOnline)}</p>
          </MCard>
          <MCard>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <p className="text-sm text-[#6B7280]">Pemasukan Kasir (Cash)</p>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{formatPrice(totalPenjualanOfflineCash)}</p>
          </MCard>
          <MCard>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-purple-500"></div>
              <p className="text-sm text-[#6B7280]">Pemasukan Kasir (QRIS)</p>
            </div>
            <p className="text-2xl font-bold text-purple-600">{formatPrice(totalPenjualanOfflineQRIS)}</p>
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
