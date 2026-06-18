"use client"

import { useState, useEffect } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MButton } from "@/components/manola/MButton"
import { MInput } from "@/components/manola/MInput"
import { MBadge } from "@/components/manola/MBadge"
import { MDrawer } from "@/components/manola/MDrawer"
import { MLoader } from "@/components/manola/MLoader"
import { LayoutDashboard, ShoppingBag, Archive, Truck, ClipboardList, MessageSquare, Settings, Search, Check, FolderTree, Tag, Image, FileText } from "lucide-react"

import { orderService, authService } from "@/lib/services"
import type { Order } from "@/lib/services/orderService"
import { formatPrice } from "@/lib/utils"
import { adminNavItems } from "@/components/layouts/adminNav"

function getStatusVariant(order: Order): "warning" | "info" | "success" | "gray" | "danger" {
  if (order.payment?.status_pembayaran === "GAGAL") return "danger"
  switch (order.status) {
    case "DIPROSES": return "warning"
    case "DIKEMAS": return "warning"
    case "DIKIRIM": return "info"
    case "SELESAI": return "success"
    default: return "gray"
  }
}

function getStatusLabel(order: Order) {
  if (order.payment?.status_pembayaran === "GAGAL") return "Dibatalkan"
  switch (order.status) {
    case "DIPROSES": return "Diproses"
    case "DIKEMAS": return "Dikemas"
    case "DIKIRIM": return "Dikirim"
    case "SELESAI": return "Selesai"
    default: return order.status
  }
}

const steps = ["DIKEMAS", "DIKIRIM", "SELESAI"]
const stepLabels = ["Dikemas", "Dikirim", "Selesai"]

export default function AdminPesananPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"semua" | "online" | "offline">("semua")
  const [filterStatus, setFilterStatus] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    setLoading(true)
    try {
      const data = await orderService.getAll()
      setOrders(data)
    } catch (err) {
      console.error("Failed to load orders:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const isDibatalkan = order.payment?.status_pembayaran === "GAGAL"
    const computedStatus = isDibatalkan ? "DIBATALKAN" : order.status
    const matchTab = activeTab === "semua" || order.jenis.toLowerCase() === activeTab
    const matchStatus = !filterStatus || computedStatus === filterStatus
    const matchSearch = String(order.id).includes(searchQuery) ||
      (order.user?.nama ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    return matchTab && matchStatus && matchSearch
  })

  const columns = [
    { key: "id", label: "ID Pesanan", render: (item: Order) => <span className="font-mono text-sm">#{item.id}</span> },
    { key: "customer", label: "Pelanggan", render: (item: Order) => <span className="font-medium">{item.user?.nama ?? "Walk-in"}</span> },
    {
      key: "type",
      label: "Tipe",
      render: (item: Order) => (
        <MBadge variant={item.jenis === "ONLINE" ? "info" : "gray"}>{item.jenis}</MBadge>
      ),
    },
    {
      key: "date",
      label: "Tanggal",
      render: (item: Order) =>
        new Date(item.createdAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
    },
    { key: "total", label: "Total", render: (item: Order) => formatPrice(item.total_harga) },
    {
      key: "status",
      label: "Status",
      render: (item: Order) => (
        <MBadge variant={getStatusVariant(item)}>
          {getStatusLabel(item)}
        </MBadge>
      ),
    },
    {
      key: "action",
      label: "Aksi",
      render: (item: Order) => (
        <MButton variant="ghost" size="sm" onClick={() => setSelectedOrder(item)}>
          Lihat Detail
        </MButton>
      ),
    },
  ]

  const getStepIndex = (status: string) => steps.indexOf(status)

  return (
    <SidebarLayout navItems={adminNavItems} userName={currentUser?.nama ?? "Admin"} userRole={currentUser?.role ?? "Admin"}>
      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex gap-1 bg-[#F9F9F9] rounded-full p-1 overflow-x-auto no-scrollbar">
            {(["semua", "online", "offline"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm rounded-full transition whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-[#0A0A0A] text-white"
                    : "text-[#6B7280] hover:text-[#0A0A0A]"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-white w-full sm:w-auto focus:outline-none focus:border-[#0A0A0A]"
          >
            <option value="">Semua Status</option>
            <option value="DIPROSES">Diproses</option>
            <option value="DIKEMAS">Dikemas</option>
            <option value="DIKIRIM">Dikirim</option>
            <option value="SELESAI">Selesai</option>
            <option value="DIBATALKAN">Dibatalkan</option>
          </select>
        </div>
        <div className="w-full lg:w-64">
          <MInput
            placeholder="Cari ID atau nama pelanggan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <MLoader />
      ) : (
        <MCard padding="sm">
          <MTable columns={columns} data={filteredOrders} />
        </MCard>
      )}

      {/* Slide-over Panel */}
      <MDrawer
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? <span className="font-mono">#{selectedOrder.id}</span> : undefined}
      >
        {selectedOrder && (
          <>
            {/* Customer Info */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[#0A0A0A] mb-3">Info Pelanggan</h3>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{selectedOrder.user?.nama ?? "Walk-in Customer"}</p>
                <p className="text-[#6B7280]">{selectedOrder.user?.email ?? "-"}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[#0A0A0A] mb-3">Item Pesanan</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#6B7280] text-xs">
                    <th className="pb-2">Nama</th>
                    <th className="pb-2">Ukuran</th>
                    <th className="pb-2">Warna</th>
                    <th className="pb-2">Qty</th>
                    <th className="pb-2 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item) => {
                    const normalPrice = item.variant?.product?.price;
                    const isDiscounted = normalPrice && item.harga_satuan < normalPrice;
                    
                    return (
                      <tr key={item.id} className="border-t border-[#E5E7EB]">
                        <td className="py-2">
                          <p>{item.variant?.product?.name ?? "Produk (Dihapus)"}</p>
                          {isDiscounted && (
                            <p className="text-[10px] mt-0.5 text-[#6B7280]">
                              Harga promo: <span className="text-green-600 font-medium">{formatPrice(item.harga_satuan)}</span> 
                              {' '}(normal: <span className="line-through">{formatPrice(normalPrice)}</span>)
                            </p>
                          )}
                        </td>
                        <td className="py-2">{item.variant?.size ?? "-"}</td>
                        <td className="py-2">{item.variant?.color ?? "-"}</td>
                        <td className="py-2">{item.jumlah}</td>
                        <td className="py-2 text-right">{formatPrice(item.harga_satuan * item.jumlah)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Shipping Address (Online only) */}
            {selectedOrder.jenis === "ONLINE" && selectedOrder.alamat_pengiriman && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#0A0A0A] mb-3">Pengiriman</h3>
                <div className="text-sm text-[#6B7280]">
                  <p className="font-medium text-[#0A0A0A] mb-1">
                    Kurir: <span className="uppercase">{selectedOrder.ekspedisi || "-"}</span>
                  </p>
                  {selectedOrder.resi && (
                    <p className="mb-2">
                      Resi: <span className="font-mono text-[#0A0A0A] bg-gray-100 px-1 py-0.5 rounded">{selectedOrder.resi}</span>
                    </p>
                  )}
                  <p className="mt-2 text-xs uppercase tracking-wider font-semibold text-[#0A0A0A]">Alamat:</p>
                  <p className="mt-1">{selectedOrder.alamat_pengiriman}</p>
                </div>
              </div>
            )}

            {/* Payment */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[#0A0A0A] mb-3">Pembayaran</h3>
              <div className="flex items-center justify-between text-sm">
                <MBadge variant="gray">
                  {selectedOrder.payment?.metode_pembayaran === "MIDTRANS" && (selectedOrder.payment as any).midtrans_payment_type
                    ? (selectedOrder.payment as any).midtrans_payment_type
                    : (selectedOrder.payment?.metode_pembayaran ?? "-")}
                </MBadge>
                <span className="font-semibold">{formatPrice(selectedOrder.total_harga)}</span>
              </div>
            </div>

            {/* Progress Stepper */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">Status Pesanan</h3>
              {selectedOrder.payment?.status_pembayaran === "GAGAL" ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                  <p className="text-red-600 font-semibold text-sm">Pesanan Dibatalkan</p>
                  <p className="text-red-500 text-xs mt-1">Pembayaran kedaluwarsa atau dibatalkan oleh pengguna.</p>
                </div>
              ) : selectedOrder.jenis === "OFFLINE" ? (
                <div className="flex items-center justify-center p-4 bg-[#F9F9F9] border border-[#E5E7EB] rounded-lg">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500 text-white mb-2 shadow-sm">
                      <Check className="w-5 h-5" />
                    </div>
                    <p className="text-[#0A0A0A] font-medium text-sm">Selesai</p>
                    <p className="text-[#6B7280] text-xs mt-0.5">Diserahkan langsung di kasir.</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center">
                  {steps.map((step, idx) => {
                    const currentStep = getStepIndex(selectedOrder.status)
                    const isCompleted = idx < currentStep
                    const isActive = idx === currentStep
                    const isUpcoming = idx > currentStep

                    return (
                      <div key={step} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              isCompleted
                                ? "bg-green-500 text-white"
                                : isActive
                                ? "bg-[#0A0A0A] text-white"
                                : "border-2 border-[#E5E7EB] bg-white text-[#6B7280]"
                            }`}
                          >
                            {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span className={`text-xs mt-2 ${isUpcoming ? "text-[#6B7280]" : "text-[#0A0A0A]"}`}>
                            {stepLabels[idx]}
                          </span>
                        </div>
                        {idx < steps.length - 1 && (
                          <div
                            className={`flex-1 h-0.5 mx-2 ${
                              idx < currentStep ? "bg-green-500" : "bg-[#E5E7EB]"
                            }`}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </MDrawer>
    </SidebarLayout>
  )
}
