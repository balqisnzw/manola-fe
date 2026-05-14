"use client"

import { useState } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MButton } from "@/components/manola/MButton"
import { MInput } from "@/components/manola/MInput"
import { MBadge } from "@/components/manola/MBadge"
import { LayoutDashboard, Users, UserCog, Settings, Search, X, Star, ChevronDown, ChevronUp } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
  { label: "Pelanggan", href: "/owner/pelanggan", icon: Users },
  { label: "Karyawan", href: "/owner/karyawan", icon: UserCog },
  { label: "Pengaturan", href: "/owner/pengaturan", icon: Settings },
]

const customers = [
  { id: 1, name: "Ahmad Rizky", email: "ahmad.rizky@email.com", phone: "081234567890", joinDate: "15 Jan 2024", totalPurchase: 4250000 },
  { id: 2, name: "Siti Nurhaliza", email: "siti.n@email.com", phone: "082345678901", joinDate: "20 Feb 2024", totalPurchase: 3780000 },
  { id: 3, name: "Budi Prakoso", email: "budi.p@email.com", phone: "083456789012", joinDate: "5 Mar 2024", totalPurchase: 2150000 },
  { id: 4, name: "Dewi Lestari", email: "dewi.l@email.com", phone: "084567890123", joinDate: "12 Mar 2024", totalPurchase: 5620000 },
  { id: 5, name: "Eko Saputra", email: "eko.s@email.com", phone: "085678901234", joinDate: "28 Mar 2024", totalPurchase: 1890000 },
  { id: 6, name: "Fitri Handayani", email: "fitri.h@email.com", phone: "086789012345", joinDate: "3 Apr 2024", totalPurchase: 3240000 },
  { id: 7, name: "Gunawan Wibowo", email: "gunawan.w@email.com", phone: "087890123456", joinDate: "10 Apr 2024", totalPurchase: 4780000 },
  { id: 8, name: "Hana Pertiwi", email: "hana.p@email.com", phone: "088901234567", joinDate: "18 Apr 2024", totalPurchase: 2560000 },
]

const customerOrders = [
  {
    id: "ORD-2024-0123",
    date: "20 Apr 2024",
    status: "Selesai" as const,
    total: 850000,
    items: [
      { name: "Kaos Oversize Black", size: "L", color: "Hitam", qty: 2, price: 200000 },
      { name: "Celana Cargo Olive", size: "32", color: "Olive", qty: 1, price: 250000 },
      { name: "Topi Snapback Black", size: "-", color: "Hitam", qty: 2, price: 100000 },
    ],
    hasReview: true,
    review: {
      rating: 5,
      text: "Kualitas produknya bagus banget, sesuai ekspektasi! Pengiriman juga cepat.",
    },
  },
  {
    id: "ORD-2024-0098",
    date: "5 Apr 2024",
    status: "Selesai" as const,
    total: 650000,
    items: [
      { name: "Hoodie Essential Gray", size: "M", color: "Abu-abu", qty: 1, price: 350000 },
      { name: "Kaos Graphic White", size: "M", color: "Putih", qty: 1, price: 200000 },
      { name: "Kaos Polo Navy", size: "M", color: "Navy", qty: 1, price: 100000 },
    ],
    hasReview: false,
  },
  {
    id: "ORD-2024-0075",
    date: "18 Mar 2024",
    status: "Dikirim" as const,
    total: 450000,
    items: [
      { name: "Jaket Bomber Navy", size: "L", color: "Navy", qty: 1, price: 450000 },
    ],
    hasReview: false,
  },
]

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`
}

export default function OwnerPelangganPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<typeof customers[0] | null>(null)
  const [expandedOrders, setExpandedOrders] = useState<string[]>([])

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    )
  }

  const columns = [
    { key: "name", label: "Nama", render: (item: typeof customers[0]) => <span className="font-medium">{item.name}</span> },
    { key: "email", label: "Email" },
    { key: "phone", label: "No. HP" },
    { key: "joinDate", label: "Tanggal Daftar" },
    { key: "totalPurchase", label: "Total Pembelian", render: (item: typeof customers[0]) => formatRupiah(item.totalPurchase) },
    {
      key: "action",
      label: "Aksi",
      render: (item: typeof customers[0]) => (
        <MButton variant="ghost" size="sm" onClick={() => setSelectedCustomer(item)}>
          Lihat Detail
        </MButton>
      ),
    },
  ]

  return (
    <SidebarLayout navItems={navItems} userName="Budi Santoso" userRole="Owner">
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
      <MCard padding="sm">
        <MTable columns={columns} data={filteredCustomers} />
      </MCard>

      {/* Slide-over Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-[480px] bg-white border-l border-[#E5E7EB] shadow-xl z-50 transform transition-transform duration-300 ${
          selectedCustomer ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedCustomer && (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-lg font-semibold text-[#0A0A0A]">{selectedCustomer.name}</h2>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F9F9F9] rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto h-[calc(100%-65px)] p-6">
              {/* Account Info */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">Informasi Akun</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-lg font-medium">
                    {selectedCustomer.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-[#0A0A0A]">{selectedCustomer.name}</p>
                    <p className="text-sm text-[#6B7280]">{selectedCustomer.email}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-[#6B7280]">Telepon:</span> {selectedCustomer.phone}</p>
                  <p><span className="text-[#6B7280]">Bergabung:</span> {selectedCustomer.joinDate}</p>
                </div>
              </div>

              <div className="border-t border-[#E5E7EB] my-6" />

              {/* Order History */}
              <div>
                <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">Riwayat Pembelian</h3>
                <div className="space-y-3">
                  {customerOrders.map((order) => (
                    <div key={order.id} className="border border-[#E5E7EB] rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm text-[#0A0A0A]">{order.id}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#6B7280]">{order.date}</span>
                          <MBadge variant={order.status === "Selesai" ? "success" : "info"}>
                            {order.status}
                          </MBadge>
                        </div>
                      </div>

                      <div className="flex gap-1 my-2">
                        {order.items.slice(0, 5).map((_, idx) => (
                          <div key={idx} className="w-9 h-9 bg-gray-100 rounded-md" />
                        ))}
                      </div>

                      <p className="font-semibold text-[#0A0A0A]">{formatRupiah(order.total)}</p>

                      <button
                        onClick={() => toggleOrderExpand(order.id)}
                        className="flex items-center gap-1 text-sm text-[#6B7280] hover:text-[#0A0A0A] mt-2"
                      >
                        {expandedOrders.includes(order.id) ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            Sembunyikan Detail
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            Lihat Detail
                          </>
                        )}
                      </button>

                      {expandedOrders.includes(order.id) && (
                        <div className="mt-4 pt-4 border-t border-[#E5E7EB]">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-[#6B7280]">
                                <th className="pb-2">Produk</th>
                                <th className="pb-2">Ukuran</th>
                                <th className="pb-2">Warna</th>
                                <th className="pb-2">Qty</th>
                                <th className="pb-2 text-right">Harga</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item, idx) => (
                                <tr key={idx} className="border-t border-[#E5E7EB]">
                                  <td className="py-2">{item.name}</td>
                                  <td className="py-2">{item.size}</td>
                                  <td className="py-2">{item.color}</td>
                                  <td className="py-2">{item.qty}</td>
                                  <td className="py-2 text-right">{formatRupiah(item.price)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {order.hasReview && order.review && (
                            <div className="mt-4 p-3 bg-[#F9F9F9] rounded-lg">
                              <div className="flex items-center gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < order.review!.rating
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-sm text-[#6B7280]">{order.review.text}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Backdrop */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setSelectedCustomer(null)}
        />
      )}
    </SidebarLayout>
  )
}
