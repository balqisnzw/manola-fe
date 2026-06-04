"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

import { LogoutButton } from "@/components/auth/LogoutButton"

import { NavbarLayout } from "@/components/layouts/NavbarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MButton } from "@/components/manola/MButton"
import { MInput } from "@/components/manola/MInput"
import { MModal } from "@/components/manola/MModal"
import { MBadge } from "@/components/manola/MBadge"

import {
  Search,
  Settings } from "lucide-react"
import { MLoader } from "@/components/manola/MLoader"

import { orderService, authService } from "@/lib/services"
import type { Order } from "@/lib/services/orderService"

const navItems = [
  { label: "Transaksi", href: "/kasir/transaksi" },
  { label: "Riwayat", href: "/kasir/riwayat" },
]

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`
}

export default function KasirRiwayatPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const user = authService.getCurrentUser()

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    setLoading(true)
    try {
      const data = await orderService.getAll({ jenis: "OFFLINE" })
      setOrders(data)
    } catch (err) {
      console.error("Failed to load orders:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter((t) =>
    String(t.id).includes(searchQuery) ||
    (t.user?.nama ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns = [
    { key: "id", label: "ID Transaksi", render: (item: Order) => <span className="font-mono text-sm">#{item.id}</span> },
    {
      key: "datetime",
      label: "Tanggal & Jam",
      render: (item: Order) =>
        new Date(item.createdAt).toLocaleString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit" }) },
    { key: "items", label: "Items", render: (item: Order) => <span className="text-[#6B7280]">{item.items?.length ?? 0} item</span> },
    {
      key: "method",
      label: "Metode",
      render: (item: Order) => (
        <MBadge variant={item.payment?.metode_pembayaran === "CASH" ? "gray" : "info"}>
          {item.payment?.metode_pembayaran ?? "-"}
        </MBadge>
      ) },
    { key: "total", label: "Total", render: (item: Order) => <span className="font-medium">{formatRupiah(item.total_harga)}</span> },
    { key: "action", label: "Aksi", render: (item: Order) => <MButton variant="ghost" size="sm" onClick={() => setSelectedOrder(item)}>Lihat Detail</MButton> },
  ]

  const rightContent = (
    <div className="flex items-center gap-4">
      <span className="text-sm text-[#6B7280]">{user?.nama ?? "Kasir"}</span>

      <Link
        href="/kasir/pengaturan"
        className="text-[#6B7280] hover:text-[#0A0A0A]"
      >
        <Settings className="w-5 h-5" />
      </Link>

      <LogoutButton />
    </div>
  )

  return (
    <NavbarLayout navItems={navItems} rightContent={rightContent}>
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-[#0A0A0A] mb-6">Riwayat Transaksi</h1>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-64">
            <MInput
              placeholder="Cari ID atau nama..."
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
      </div>

      {/* Detail Modal */}
      <MModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Transaksi #${selectedOrder?.id ?? ""}`}
        maxWidth="md"
      >
        {selectedOrder && (
          <div>
            <p className="text-sm text-[#6B7280] mb-4">
              {new Date(selectedOrder.createdAt).toLocaleString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit" })}
            </p>

            <table className="w-full text-sm mb-4">
              <thead>
                <tr className="text-left text-[#6B7280] text-xs border-b border-[#E5E7EB]">
                  <th className="pb-2">Produk</th>
                  <th className="pb-2">Ukuran</th>
                  <th className="pb-2">Warna</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder.items?.map((item) => (
                  <tr key={item.id} className="border-b border-[#E5E7EB]">
                    <td className="py-2 font-medium">{item.variant?.product?.name ?? "-"}</td>
                    <td className="py-2">{item.variant?.size ?? "-"}</td>
                    <td className="py-2">{item.variant?.color ?? "-"}</td>
                    <td className="py-2">{item.jumlah}</td>
                    <td className="py-2 text-right">{formatRupiah(item.harga_satuan * item.jumlah)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-[#E5E7EB] pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Total</span>
                <span className="font-bold">{formatRupiah(selectedOrder.total_harga)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Metode Pembayaran</span>
                <MBadge variant={selectedOrder.payment?.metode_pembayaran === "CASH" ? "gray" : "info"}>
                  {selectedOrder.payment?.metode_pembayaran ?? "-"}
                </MBadge>
              </div>
            </div>
          </div>
        )}
      </MModal>
    </NavbarLayout>
  )
}
