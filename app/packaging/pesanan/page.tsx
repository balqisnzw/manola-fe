"use client"

import { useState } from "react"
import Link from "next/link"
import { NavbarLayout } from "@/components/layouts/NavbarLayout"
import { StatCard } from "@/components/manola/StatCard"
import { MButton } from "@/components/manola/MButton"
import { MBadge } from "@/components/manola/MBadge"
import { MModal } from "@/components/manola/MModal"
import { MTable } from "@/components/manola/MTable"
import { Package, Globe, Store, Settings, LogOut, CheckCircle } from "lucide-react"

const navItems = [
  { label: "Pesanan", href: "/packaging/pesanan" },
]

interface OrderItem {
  name: string
  size: string
  color: string
  qty: number
}

interface Order {
  id: string
  customerName: string
  city?: string
  productSummary: string
  timestamp: string
  status: "Menunggu Dikemas"
  items: OrderItem[]
  address?: string
  phone: string
  type: "online" | "offline"
}

const initialOrders: Order[] = [
  { id: "ORD-2024-0891", customerName: "Ahmad Rizky", city: "Jakarta Selatan", productSummary: "Kaos Hitam (M) ×2 · Celana (L) ×1", timestamp: "10 menit lalu", status: "Menunggu Dikemas", items: [{ name: "Kaos Oversize Black", size: "M", color: "Hitam", qty: 2 }, { name: "Celana Cargo Olive", size: "L", color: "Olive", qty: 1 }], address: "Jl. Merdeka No. 45, Jakarta Selatan 12345", phone: "081234567890", type: "online" },
  { id: "ORD-2024-0890", customerName: "Siti Nurhaliza", city: "Bandung", productSummary: "Hoodie (M) ×1 · Kaos (M) ×1", timestamp: "15 menit lalu", status: "Menunggu Dikemas", items: [{ name: "Hoodie Essential Gray", size: "M", color: "Abu-abu", qty: 1 }, { name: "Kaos Graphic White", size: "M", color: "Putih", qty: 1 }], address: "Jl. Sudirman No. 88, Bandung 40115", phone: "082345678901", type: "online" },
  { id: "ORD-2024-0889", customerName: "Dewi Lestari", city: "Surabaya", productSummary: "Jaket Bomber (L) ×1", timestamp: "25 menit lalu", status: "Menunggu Dikemas", items: [{ name: "Jaket Bomber Navy", size: "L", color: "Navy", qty: 1 }], address: "Jl. Gatot Subroto No. 12, Surabaya 60123", phone: "084567890123", type: "online" },
  { id: "ORD-2024-0888", customerName: "Eko Saputra", city: "Semarang", productSummary: "Kaos Polo (L) ×1 · Topi (Free) ×1", timestamp: "32 menit lalu", status: "Menunggu Dikemas", items: [{ name: "Kaos Polo Navy", size: "L", color: "Navy", qty: 1 }, { name: "Topi Snapback Black", size: "-", color: "Hitam", qty: 1 }], address: "Jl. Diponegoro No. 56, Semarang 50132", phone: "085678901234", type: "online" },
  { id: "ORD-2024-0887", customerName: "Fitri Handayani", city: "Yogyakarta", productSummary: "Celana Jogger (M) ×2", timestamp: "45 menit lalu", status: "Menunggu Dikemas", items: [{ name: "Celana Jogger Black", size: "M", color: "Hitam", qty: 2 }], address: "Jl. Malioboro No. 78, Yogyakarta 55122", phone: "086789012345", type: "online" },
  { id: "ORD-2024-0886", customerName: "Gunawan Wibowo", city: "Malang", productSummary: "Hoodie Zip (L) ×1 · Kaos (L) ×2", timestamp: "52 menit lalu", status: "Menunggu Dikemas", items: [{ name: "Hoodie Zip Brown", size: "L", color: "Coklat", qty: 1 }, { name: "Kaos Basic White", size: "L", color: "Putih", qty: 2 }], address: "Jl. Ahmad Yani No. 34, Malang 65112", phone: "087890123456", type: "online" },
  { id: "ORD-2024-0885", customerName: "Hana Pertiwi", city: "Solo", productSummary: "Jaket Denim (S) ×1", timestamp: "1 jam lalu", status: "Menunggu Dikemas", items: [{ name: "Jaket Denim Blue", size: "S", color: "Biru", qty: 1 }], address: "Jl. Pahlawan No. 90, Solo 57111", phone: "088901234567", type: "online" },
  { id: "ORD-2024-0884", customerName: "Irfan Hakim", city: "Bekasi", productSummary: "Celana Chino (32) ×1 · Kaos (M) ×1", timestamp: "1 jam lalu", status: "Menunggu Dikemas", items: [{ name: "Celana Chino Beige", size: "32", color: "Beige", qty: 1 }, { name: "Kaos Oversize Black", size: "M", color: "Hitam", qty: 1 }], address: "Jl. Raya Bekasi No. 45, Bekasi 17111", phone: "089012345678", type: "online" },
  // Offline orders
  { id: "ORD-2024-0883", customerName: "Julia Putri", productSummary: "Kaos Basic (S) ×3", timestamp: "20 menit lalu", status: "Menunggu Dikemas", items: [{ name: "Kaos Basic White", size: "S", color: "Putih", qty: 3 }], phone: "081122334455", type: "offline" },
  { id: "ORD-2024-0882", customerName: "Kevin Pratama", productSummary: "Topi (Free) ×2", timestamp: "35 menit lalu", status: "Menunggu Dikemas", items: [{ name: "Topi Snapback Black", size: "-", color: "Hitam", qty: 2 }], phone: "082233445566", type: "offline" },
  { id: "ORD-2024-0881", customerName: "Linda Sari", productSummary: "Kaos Polo (M) ×1", timestamp: "50 menit lalu", status: "Menunggu Dikemas", items: [{ name: "Kaos Polo Navy", size: "M", color: "Navy", qty: 1 }], phone: "083344556677", type: "offline" },
  { id: "ORD-2024-0880", customerName: "Mario Gunawan", productSummary: "Hoodie (L) ×1", timestamp: "1 jam lalu", status: "Menunggu Dikemas", items: [{ name: "Hoodie Essential Gray", size: "L", color: "Abu-abu", qty: 1 }], phone: "084455667788", type: "offline" },
]

export default function PackagingPesananPage() {
  const [activeTab, setActiveTab] = useState<"online" | "offline">("online")
  const [orders, setOrders] = useState(initialOrders)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [orderToConfirm, setOrderToConfirm] = useState<Order | null>(null)
  const [showToast, setShowToast] = useState(false)

  const onlineOrders = orders.filter((o) => o.type === "online")
  const offlineOrders = orders.filter((o) => o.type === "offline")
  const displayOrders = activeTab === "online" ? onlineOrders : offlineOrders

  const handleComplete = (order: Order) => {
    setOrders(orders.filter((o) => o.id !== order.id))
    setShowConfirmModal(false)
    setOrderToConfirm(null)
    setSelectedOrder(null)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const rightContent = (
    <div className="flex items-center gap-4">
      <span className="text-sm text-[#6B7280]">Lisa Permata</span>
      <Link href="/packaging/pengaturan" className="text-[#6B7280] hover:text-[#0A0A0A]">
        <Settings className="w-5 h-5" />
      </Link>
      <button className="text-red-500 hover:text-red-600">
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  )

  const itemColumns = [
    { key: "photo", label: "Foto", render: () => <div className="w-10 h-10 bg-gray-100 rounded-md" /> },
    { key: "name", label: "Nama Produk", render: (item: OrderItem) => <span className="font-medium">{item.name}</span> },
    { key: "size", label: "Ukuran", render: (item: OrderItem) => item.size || "-" },
    { key: "color", label: "Warna", render: (item: OrderItem) => item.color || "-" },
    { key: "qty", label: "Jumlah", render: (item: OrderItem) => item.qty },
  ]

  return (
    <NavbarLayout navItems={navItems} rightContent={rightContent}>
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-[#0A0A0A] mb-6">Pesanan</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="Harus Dikemas Hari Ini" value={orders.length.toString()} icon={Package} />
          <StatCard label="Pesanan Online" value={onlineOrders.length.toString()} icon={Globe} />
          <StatCard label="Pesanan Offline" value={offlineOrders.length.toString()} icon={Store} />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-6 mb-4 border-b border-[#E5E7EB]">
          <button
            onClick={() => setActiveTab("online")}
            className={`pb-3 text-sm transition ${
              activeTab === "online"
                ? "border-b-2 border-[#0A0A0A] text-[#0A0A0A] font-medium"
                : "text-[#6B7280]"
            }`}
          >
            Pesanan Online
          </button>
          <button
            onClick={() => setActiveTab("offline")}
            className={`pb-3 text-sm transition ${
              activeTab === "offline"
                ? "border-b-2 border-[#0A0A0A] text-[#0A0A0A] font-medium"
                : "text-[#6B7280]"
            }`}
          >
            Pesanan Offline
          </button>
        </div>

        {/* Order List */}
        <div className="flex flex-col gap-3">
          {displayOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-[#6B7280]">
              <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
              <p>Semua pesanan sudah dikemas</p>
            </div>
          ) : (
            displayOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-[#E5E7EB] rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-[#0A0A0A]">{order.id}</span>
                  <span className="text-xs text-[#6B7280]">{order.timestamp}</span>
                </div>
                <p className="font-medium text-[#0A0A0A] mt-1">
                  {order.customerName}
                  {order.city && <span className="text-sm text-[#6B7280]"> · {order.city}</span>}
                </p>
                <p className="text-sm text-[#6B7280] mt-1 truncate">{order.productSummary}</p>
                <div className="flex items-center justify-between mt-3">
                  <MBadge variant="warning">Menunggu Dikemas</MBadge>
                  <div className="flex gap-2">
                    <MButton
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      Lihat Detail
                    </MButton>
                    <MButton
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setOrderToConfirm(order)
                        setShowConfirmModal(true)
                      }}
                    >
                      Selesai Dikemas
                    </MButton>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <MModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder?.id}
        maxWidth="lg"
        footer={
          <MButton
            variant="primary"
            fullWidth
            onClick={() => {
              if (selectedOrder) {
                setOrderToConfirm(selectedOrder)
                setSelectedOrder(null)
                setShowConfirmModal(true)
              }
            }}
          >
            Selesai Dikemas
          </MButton>
        }
      >
        {selectedOrder && (
          <div>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-[#0A0A0A] mb-2">Informasi Pengiriman</h3>
              <p className="font-medium">{selectedOrder.customerName}</p>
              <p className="text-sm text-[#6B7280]">{selectedOrder.phone}</p>
              {selectedOrder.address && (
                <p className="text-sm text-[#6B7280] mt-1">{selectedOrder.address}</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#0A0A0A] mb-2">Detail Produk</h3>
              <MTable columns={itemColumns} data={selectedOrder.items} />
            </div>
          </div>
        )}
      </MModal>

      {/* Confirmation Modal */}
      <MModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setOrderToConfirm(null)
        }}
        maxWidth="xs"
        footer={
          <>
            <MButton
              variant="ghost"
              onClick={() => {
                setShowConfirmModal(false)
                setOrderToConfirm(null)
              }}
            >
              Batal
            </MButton>
            <MButton
              variant="primary"
              onClick={() => orderToConfirm && handleComplete(orderToConfirm)}
            >
              Konfirmasi
            </MButton>
          </>
        }
      >
        <div className="text-center py-2">
          <p className="font-semibold text-[#0A0A0A]">Konfirmasi Pengemasan</p>
          <p className="text-sm text-[#6B7280] mt-2">
            Tandai pesanan <span className="font-mono">{orderToConfirm?.id}</span> sebagai selesai dikemas?
          </p>
          <p className="text-xs text-[#6B7280] mt-1">
            {`Status akan berubah menjadi 'Dikirim'`}
          </p>
        </div>
      </MModal>

      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm">Pesanan berhasil ditandai sebagai Dikirim</span>
        </div>
      )}
    </NavbarLayout>
  )
}
