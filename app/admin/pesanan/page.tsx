"use client"

import { useState } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MButton } from "@/components/manola/MButton"
import { MInput } from "@/components/manola/MInput"
import { MBadge } from "@/components/manola/MBadge"
import { LayoutDashboard, ShoppingBag, Archive, Truck, ClipboardList, MessageSquare, Settings, Search, X, Check } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Produk", href: "/admin/produk", icon: ShoppingBag },
  { label: "Stok", href: "/admin/stok", icon: Archive },
  { label: "Supplier", href: "/admin/supplier", icon: Truck },
  { label: "Pesanan", href: "/admin/pesanan", icon: ClipboardList },
  { label: "Ulasan", href: "/admin/ulasan", icon: MessageSquare },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
]

const orders = [
  { id: "ORD-2024-0201", customer: "Ahmad Rizky", type: "Online", date: "20 Apr 2024", total: 850000, status: "Dikemas", items: [{ name: "Kaos Oversize Black", size: "L", color: "Hitam", qty: 2, subtotal: 400000 }, { name: "Celana Cargo Olive", size: "32", color: "Olive", qty: 1, subtotal: 250000 }], address: "Jl. Merdeka No. 45, Jakarta Selatan 12345", phone: "081234567890", email: "ahmad.rizky@email.com", paymentMethod: "GoPay" },
  { id: "ORD-2024-0200", customer: "Siti Nurhaliza", type: "Online", date: "20 Apr 2024", total: 650000, status: "Dikirim", items: [{ name: "Hoodie Essential Gray", size: "M", color: "Abu-abu", qty: 1, subtotal: 350000 }, { name: "Kaos Graphic White", size: "M", color: "Putih", qty: 1, subtotal: 180000 }], address: "Jl. Sudirman No. 88, Bandung 40115", phone: "082345678901", email: "siti.n@email.com", paymentMethod: "Virtual Account" },
  { id: "ORD-2024-0199", customer: "Budi Prakoso", type: "Offline", date: "19 Apr 2024", total: 450000, status: "Selesai", items: [{ name: "Jaket Bomber Navy", size: "L", color: "Navy", qty: 1, subtotal: 450000 }], phone: "083456789012", paymentMethod: "Cash" },
  { id: "ORD-2024-0198", customer: "Dewi Lestari", type: "Online", date: "19 Apr 2024", total: 920000, status: "Selesai", items: [{ name: "Hoodie Zip Brown", size: "M", color: "Coklat", qty: 1, subtotal: 380000 }, { name: "Celana Jogger Black", size: "M", color: "Hitam", qty: 2, subtotal: 440000 }], address: "Jl. Gatot Subroto No. 12, Surabaya 60123", phone: "084567890123", email: "dewi.l@email.com", paymentMethod: "Kartu Kredit" },
  { id: "ORD-2024-0197", customer: "Eko Saputra", type: "Online", date: "18 Apr 2024", total: 380000, status: "Dikemas", items: [{ name: "Kaos Polo Navy", size: "L", color: "Navy", qty: 1, subtotal: 250000 }, { name: "Topi Snapback Black", size: "-", color: "Hitam", qty: 1, subtotal: 130000 }], address: "Jl. Diponegoro No. 56, Semarang 50132", phone: "085678901234", email: "eko.s@email.com", paymentMethod: "GoPay" },
  { id: "ORD-2024-0196", customer: "Fitri Handayani", type: "Offline", date: "18 Apr 2024", total: 280000, status: "Selesai", items: [{ name: "Kaos Basic White", size: "S", color: "Putih", qty: 2, subtotal: 280000 }], phone: "086789012345", paymentMethod: "Cash" },
  { id: "ORD-2024-0195", customer: "Gunawan Wibowo", type: "Online", date: "17 Apr 2024", total: 750000, status: "Dikirim", items: [{ name: "Celana Chino Beige", size: "32", color: "Beige", qty: 2, subtotal: 560000 }, { name: "Kaos Graphic White", size: "L", color: "Putih", qty: 1, subtotal: 180000 }], address: "Jl. Ahmad Yani No. 34, Malang 65112", phone: "087890123456", email: "gunawan.w@email.com", paymentMethod: "Virtual Account" },
  { id: "ORD-2024-0194", customer: "Hana Pertiwi", type: "Online", date: "17 Apr 2024", total: 520000, status: "Dikemas", items: [{ name: "Jaket Denim Blue", size: "S", color: "Biru", qty: 1, subtotal: 420000 }, { name: "Topi Snapback Black", size: "-", color: "Hitam", qty: 1, subtotal: 100000 }], address: "Jl. Pahlawan No. 78, Yogyakarta 55122", phone: "088901234567", email: "hana.p@email.com", paymentMethod: "Alfamart" },
]

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`
}

const steps = ["Dikemas", "Dikirim", "Selesai"]

export default function AdminPesananPage() {
  const [activeTab, setActiveTab] = useState<"semua" | "online" | "offline">("semua")
  const [filterStatus, setFilterStatus] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null)

  const filteredOrders = orders.filter((order) => {
    const matchTab = activeTab === "semua" || order.type.toLowerCase() === activeTab
    const matchStatus = !filterStatus || order.status === filterStatus
    const matchSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchTab && matchStatus && matchSearch
  })

  const columns = [
    { key: "id", label: "ID Pesanan", render: (item: typeof orders[0]) => <span className="font-mono text-sm">{item.id}</span> },
    { key: "customer", label: "Pelanggan", render: (item: typeof orders[0]) => <span className="font-medium">{item.customer}</span> },
    {
      key: "type",
      label: "Tipe",
      render: (item: typeof orders[0]) => (
        <MBadge variant={item.type === "Online" ? "info" : "gray"}>{item.type}</MBadge>
      ),
    },
    { key: "date", label: "Tanggal" },
    { key: "total", label: "Total", render: (item: typeof orders[0]) => formatRupiah(item.total) },
    {
      key: "status",
      label: "Status",
      render: (item: typeof orders[0]) => (
        <MBadge
          variant={
            item.status === "Dikemas" ? "warning" : item.status === "Dikirim" ? "info" : "success"
          }
        >
          {item.status}
        </MBadge>
      ),
    },
    {
      key: "action",
      label: "Aksi",
      render: (item: typeof orders[0]) => (
        <MButton variant="ghost" size="sm" onClick={() => setSelectedOrder(item)}>
          Lihat Detail
        </MButton>
      ),
    },
  ]

  const getStepIndex = (status: string) => steps.indexOf(status)

  return (
    <SidebarLayout navItems={navItems} userName="Rina Dewi" userRole="Admin">
      {/* Filter Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex gap-1 bg-[#F9F9F9] rounded-full p-1">
            {(["semua", "online", "offline"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm rounded-full transition ${
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
            className="h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-white"
          >
            <option value="">Semua Status</option>
            <option value="Dikemas">Dikemas</option>
            <option value="Dikirim">Dikirim</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
        <div className="w-64">
          <MInput
            placeholder="Cari ID atau nama pelanggan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Table */}
      <MCard padding="sm">
        <MTable columns={columns} data={filteredOrders} />
      </MCard>

      {/* Slide-over Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-[480px] bg-white border-l border-[#E5E7EB] shadow-xl z-50 transform transition-transform duration-300 ${
          selectedOrder ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedOrder && (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="font-mono text-lg font-semibold text-[#0A0A0A]">{selectedOrder.id}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F9F9F9] rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto h-[calc(100%-65px)] p-6">
              {/* Customer Info */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#0A0A0A] mb-3">Info Pelanggan</h3>
                <div className="space-y-1 text-sm">
                  <p className="font-medium">{selectedOrder.customer}</p>
                  <p className="text-[#6B7280]">{selectedOrder.email}</p>
                  <p className="text-[#6B7280]">{selectedOrder.phone}</p>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#0A0A0A] mb-3">Item Pesanan</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[#6B7280] text-xs">
                      <th className="pb-2">Foto</th>
                      <th className="pb-2">Nama</th>
                      <th className="pb-2">Ukuran</th>
                      <th className="pb-2">Warna</th>
                      <th className="pb-2">Qty</th>
                      <th className="pb-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} className="border-t border-[#E5E7EB]">
                        <td className="py-2"><div className="w-10 h-10 bg-gray-100 rounded-md" /></td>
                        <td className="py-2">{item.name}</td>
                        <td className="py-2">{item.size}</td>
                        <td className="py-2">{item.color}</td>
                        <td className="py-2">{item.qty}</td>
                        <td className="py-2 text-right">{formatRupiah(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Shipping Address (Online only) */}
              {selectedOrder.type === "Online" && selectedOrder.address && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-[#0A0A0A] mb-3">Alamat Pengiriman</h3>
                  <p className="text-sm text-[#6B7280]">{selectedOrder.address}</p>
                </div>
              )}

              {/* Payment */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#0A0A0A] mb-3">Pembayaran</h3>
                <div className="flex items-center justify-between text-sm">
                  <MBadge variant="gray">{selectedOrder.paymentMethod}</MBadge>
                  <span className="font-semibold">{formatRupiah(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">Status Pesanan</h3>
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
                            {step}
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
              </div>
            </div>
          </>
        )}
      </div>

      {/* Backdrop */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setSelectedOrder(null)}
        />
      )}
    </SidebarLayout>
  )
}
