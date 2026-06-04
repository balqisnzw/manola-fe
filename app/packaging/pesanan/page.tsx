"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

import { LogoutButton } from "@/components/auth/LogoutButton"

import { NavbarLayout } from "@/components/layouts/NavbarLayout"
import { StatCard } from "@/components/manola/StatCard"
import { MButton } from "@/components/manola/MButton"
import { MBadge } from "@/components/manola/MBadge"
import { MModal } from "@/components/manola/MModal"
import { MTable } from "@/components/manola/MTable"

import {
  Package,
  Globe,
  Store,
  Settings,
  CheckCircle } from "lucide-react"
import { MLoader } from "@/components/manola/MLoader"
import { toast } from "sonner"

import { orderService, authService } from "@/lib/services"
import type { Order, OrderItem } from "@/lib/services/orderService"

const navItems = [
  { label: "Pesanan", href: "/packaging/pesanan" },
]

export default function PackagingPesananPage() {
  const [activeTab, setActiveTab] = useState<"online" | "offline">("online")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [orderToConfirm, setOrderToConfirm] = useState<Order | null>(null)
  const [resiInput, setResiInput] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const user = authService.getCurrentUser()

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    setLoading(true)
    try {
      const allOrders = await orderService.getAll()
      // Only show orders that need packaging (DIPROSES or DIKEMAS)
      const pending = allOrders.filter(
        (o) => o.status === "DIPROSES" || o.status === "DIKEMAS"
      )
      setOrders(pending)
    } catch (err) {
      console.error("Failed to load orders:", err)
    } finally {
      setLoading(false)
    }
  }

  const onlineOrders = orders.filter((o) => o.jenis === "ONLINE")
  const offlineOrders = orders.filter((o) => o.jenis === "OFFLINE")
  const displayOrders = activeTab === "online" ? onlineOrders : offlineOrders

  const handleComplete = async (order: Order) => {
    if (order.jenis === "ONLINE" && !resiInput.trim()) {
      toast.error("Harap masukkan nomor resi pengiriman terlebih dahulu")
      return
    }

    setSubmitting(true)
    try {
      const newStatus = order.jenis === "ONLINE" ? "DIKIRIM" : "SELESAI"
      await orderService.updateStatus(order.id, newStatus)
      setOrders(orders.filter((o) => o.id !== order.id))
      setShowConfirmModal(false)

      if (order.jenis === "ONLINE") {
        toast.success(`Pesanan berhasil dikirim dengan Resi: ${resiInput}`)
      } else {
        toast.success("Pesanan offline berhasil diselesaikan")
      }

      setResiInput("")
      setOrderToConfirm(null)
      setSelectedOrder(null)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal memperbarui status"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const rightContent = (
    <div className="flex items-center gap-4">
      <span className="text-sm text-[#6B7280]">{user?.nama ?? "Packaging"}</span>

      <Link
        href="/packaging/pengaturan"
        className="text-[#6B7280] hover:text-[#0A0A0A]"
      >
        <Settings className="w-5 h-5" />
      </Link>

      <LogoutButton />
    </div>
  )

  const getProductSummary = (order: Order) => {
    if (!order.items || order.items.length === 0) return "-"
    return order.items
      .slice(0, 3)
      .map((item) => `${item.variant?.product?.name ?? "?"} (${item.variant?.size}) ×${item.jumlah}`)
      .join(" · ") + (order.items.length > 3 ? ` +${order.items.length - 3} lainnya` : "")
  }

  const itemColumns = [
    {
      key: "name",
      label: "Nama Produk",
      render: (item: OrderItem) => <span className="font-medium">{item.variant?.product?.name ?? "-"}</span> },
    { key: "size", label: "Ukuran", render: (item: OrderItem) => item.variant?.size || "-" },
    { key: "color", label: "Warna", render: (item: OrderItem) => item.variant?.color || "-" },
    { key: "qty", label: "Jumlah", render: (item: OrderItem) => item.jumlah },
  ]

  return (
    <NavbarLayout navItems={navItems} rightContent={rightContent}>
      <div className="p-4 sm:p-8">
        <h1 className="text-2xl font-semibold text-[#0A0A0A] mb-6">Pesanan</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Harus Dikemas" value={orders.length.toString()} icon={Package} />
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
        {loading ? (
          <MLoader />
        ) : (
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
                    <span className="font-mono text-sm text-[#0A0A0A]">#{order.id}</span>
                    <span className="text-xs text-[#6B7280]">
                      {new Date(order.createdAt).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="font-medium text-[#0A0A0A] mt-1">
                    {order.user?.nama ?? "Walk-in Customer"}
                  </p>
                  <p className="text-sm text-[#6B7280] mt-1 truncate">{getProductSummary(order)}</p>
                  <div className="flex items-center justify-between mt-3">
                    <MBadge variant="warning">{order.status === "DIKEMAS" ? "Sedang Dikemas" : "Menunggu Dikemas"}</MBadge>
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
        )}
      </div>

      {/* Detail Modal */}
      <MModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Pesanan #${selectedOrder?.id ?? ""}`}
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
              <p className="font-medium">{selectedOrder.user?.nama ?? "Walk-in Customer"}</p>
              {selectedOrder.alamat_pengiriman && (
                <p className="text-sm text-[#6B7280] mt-1">{selectedOrder.alamat_pengiriman}</p>
              )}
              {selectedOrder.catatan && (
                <p className="text-sm text-[#6B7280] mt-1">Catatan: {selectedOrder.catatan}</p>
              )}
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#0A0A0A] mb-2">Detail Produk</h3>
              <MTable columns={itemColumns} data={selectedOrder.items ?? []} />
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
          setResiInput("")
        }}
        maxWidth="xs"
        footer={
          <>
            <MButton
              variant="ghost"
              onClick={() => {
                setShowConfirmModal(false)
                setOrderToConfirm(null)
                setResiInput("")
              }}
            >
              Batal
            </MButton>
            <MButton
              variant="primary"
              disabled={(orderToConfirm?.jenis === "ONLINE" && !resiInput.trim()) || submitting}
              onClick={() => orderToConfirm && handleComplete(orderToConfirm)}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <MLoader inline size="sm" text="Memproses..." />
                </span>
              ) : (
                "Konfirmasi"
              )}
            </MButton>
          </>
        }
      >
        <div className="py-2">
          <div className="text-center">
            <p className="font-semibold text-[#0A0A0A]">Konfirmasi Pengemasan</p>
            <p className="text-sm text-[#6B7280] mt-2">
              Tandai pesanan <span className="font-mono">#{orderToConfirm?.id}</span> sebagai selesai dikemas?
            </p>
            <p className="text-xs text-[#6B7280] mt-1">
              {orderToConfirm?.jenis === "ONLINE"
                ? "Status akan berubah menjadi 'Dikirim'"
                : "Status akan berubah menjadi 'Selesai' (Offline)"}
            </p>
          </div>

          {orderToConfirm?.jenis === "ONLINE" && (
            <div className="mt-4 text-left">
              <label className="block text-xs font-semibold text-[#0A0A0A] mb-1.5">
                Nomor Resi Pengiriman *
              </label>
              <input
                type="text"
                required
                placeholder="Masukkan No. Resi (misal: JP12345678)"
                value={resiInput}
                onChange={(e) => setResiInput(e.target.value)}
                className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] focus:border-transparent transition-all"
              />
            </div>
          )}
        </div>
      </MModal>

    </NavbarLayout>
  )
}
