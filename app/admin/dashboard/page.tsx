"use client"

import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { StatCard } from "@/components/manola/StatCard"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MBadge } from "@/components/manola/MBadge"
import { LayoutDashboard, ShoppingBag, Archive, Truck, ClipboardList, MessageSquare, Settings, ShoppingCart, CheckCircle } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Produk", href: "/admin/produk", icon: ShoppingBag },
  { label: "Stok", href: "/admin/stok", icon: Archive },
  { label: "Supplier", href: "/admin/supplier", icon: Truck },
  { label: "Pesanan", href: "/admin/pesanan", icon: ClipboardList },
  { label: "Ulasan", href: "/admin/ulasan", icon: MessageSquare },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
]

const lowStockProducts = [
  { id: 1, name: "Kaos Oversize Black", size: "XL", color: "Hitam", stock: 2 },
  { id: 2, name: "Hoodie Essential Gray", size: "S", color: "Abu-abu", stock: 1 },
  { id: 3, name: "Celana Cargo Olive", size: "30", color: "Olive", stock: 3 },
  { id: 4, name: "Jaket Bomber Navy", size: "M", color: "Navy", stock: 2 },
  { id: 5, name: "Kaos Graphic White", size: "L", color: "Putih", stock: 1 },
  { id: 6, name: "Celana Jogger Black", size: "S", color: "Hitam", stock: 3 },
  { id: 7, name: "Hoodie Zip Brown", size: "XL", color: "Coklat", stock: 2 },
  { id: 8, name: "Topi Snapback Black", size: "-", color: "Hitam", stock: 1 },
]

export default function AdminDashboardPage() {
  const columns = [
    {
      key: "photo",
      label: "Foto",
      render: () => <div className="w-10 h-10 bg-gray-100 rounded-md" />,
    },
    {
      key: "name",
      label: "Nama Produk",
      render: (item: typeof lowStockProducts[0]) => <span className="font-medium">{item.name}</span>,
    },
    { key: "size", label: "Ukuran" },
    { key: "color", label: "Warna" },
    {
      key: "stock",
      label: "Sisa Stok",
      render: (item: typeof lowStockProducts[0]) => (
        <span className="text-red-500 font-semibold">{item.stock}</span>
      ),
    },
  ]

  const hasLowStock = lowStockProducts.length > 0

  return (
    <SidebarLayout navItems={navItems} userName="Rina Dewi" userRole="Admin">
      <h1 className="text-2xl font-semibold text-[#0A0A0A] mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="max-w-xs mb-6">
        <StatCard
          label="Pesanan Masuk Hari Ini"
          value="24"
          caption="pesanan baru"
          icon={ShoppingCart}
        />
      </div>

      {/* Low Stock Card */}
      <MCard className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#0A0A0A]">Stok Hampir Habis</h2>
          {hasLowStock && (
            <MBadge variant="danger">{lowStockProducts.length} produk</MBadge>
          )}
        </div>

        {hasLowStock ? (
          <MTable columns={columns} data={lowStockProducts} />
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
            <p className="text-[#6B7280]">Semua stok aman</p>
          </div>
        )}
      </MCard>
    </SidebarLayout>
  )
}
