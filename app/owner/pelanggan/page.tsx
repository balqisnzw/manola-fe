"use client"

import { useState, useEffect } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MInput } from "@/components/manola/MInput"
import { MDrawer } from "@/components/manola/MDrawer"
import { MLoader } from "@/components/manola/MLoader"
import { LayoutDashboard, Users, UserCog, Settings, Package, ClipboardList, Sliders, Search } from "lucide-react"
import { userService, authService, orderService } from "@/lib/services"
import type { UserData } from "@/lib/services/miscServices"
import type { Order } from "@/lib/services/orderService"
import { formatPrice } from "@/lib/utils"

import { ownerNavItems as navItems } from "@/components/layouts/ownerNav"

export default function OwnerPelangganPage() {
  const [customers, setCustomers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<UserData | null>(null)
  const [customerOrders, setCustomerOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    loadCustomers()
  }, [])

  useEffect(() => {
    if (selectedCustomer) {
      loadCustomerOrders(selectedCustomer.id)
    } else {
      setCustomerOrders([])
    }
  }, [selectedCustomer])

  async function loadCustomerOrders(userId: number) {
    setLoadingOrders(true)
    try {
      const data = await orderService.getAll({ userId })
      setCustomerOrders(data)
    } catch (err) {
      console.error("Failed to load customer orders:", err)
    } finally {
      setLoadingOrders(false)
    }
  }

  async function loadCustomers() {
    setLoading(true)
    try {
      const data = await userService.getCustomers()
      setCustomers(data)
    } catch (err) {
      console.error("Failed to load customers:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter(
    (c) =>
      c.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns = [
    { key: "name", label: "Nama", render: (item: UserData) => <span className="font-medium">{item.nama}</span> },
    { key: "email", label: "Email", render: (item: UserData) => item.email },
    {
      key: "joinDate",
      label: "Tanggal Daftar",
      render: (item: UserData) =>
        new Date(item.createdAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
    },
    {
      key: "action",
      label: "Aksi",
      render: (item: UserData) => (
        <button
          onClick={() => setSelectedCustomer(item)}
          className="text-sm text-[#6B7280] hover:text-[#0A0A0A] font-medium"
        >
          Lihat Detail
        </button>
      ),
    },
  ]

  return (
    <SidebarLayout navItems={navItems} userName={currentUser?.nama ?? "Owner"} userRole="Owner">
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
      {loading ? (
        <MLoader />
      ) : (
        <MCard padding="sm">
          <MTable columns={columns} data={filteredCustomers} />
        </MCard>
      )}

      {/* Slide-over Panel */}
      <MDrawer
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.nama}
      >
        {selectedCustomer && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">Informasi Akun</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-[#0A0A0A] text-white flex items-center justify-center text-lg font-medium">
                {selectedCustomer.nama.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-[#0A0A0A]">{selectedCustomer.nama}</p>
                <p className="text-sm text-[#6B7280]">{selectedCustomer.email}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm mb-8">
              <p>
                <span className="text-[#6B7280]">No. Telepon:</span>{" "}
                {selectedCustomer.no_telepon || "-"}
              </p>
              <p>
                <span className="text-[#6B7280]">Bergabung:</span>{" "}
                {new Date(selectedCustomer.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

            <h3 className="text-sm font-semibold text-[#0A0A0A] mb-4">Riwayat Pesanan</h3>
            {loadingOrders ? (
              <div className="flex justify-center p-4"><MLoader /></div>
            ) : customerOrders.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Belum ada riwayat pesanan.</p>
            ) : (
              <div className="space-y-3">
                {customerOrders.map(order => {
                  const computedStatus = order.payment?.status_pembayaran === "GAGAL" ? "DIBATALKAN" : order.status;
                  return (
                  <div key={order.id} className="border border-gray-100 rounded-lg p-3 text-sm flex flex-col gap-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold">#{order.id}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-medium text-blue-600">{formatPrice(order.total_harga)}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        computedStatus === "SELESAI" ? "bg-green-100 text-green-700" :
                        computedStatus === "DIBATALKAN" ? "bg-red-100 text-red-700" :
                        "bg-amber-100 text-amber-700"
                      }`}>
                        {computedStatus}
                      </span>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </div>
        )}
      </MDrawer>
    </SidebarLayout>
  )
}
