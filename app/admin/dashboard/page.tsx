"use client"

import { useState, useEffect, useMemo } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { StatCard } from "@/components/manola/StatCard"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MBadge } from "@/components/manola/MBadge"
import { LayoutDashboard, ShoppingBag, Archive, Truck, ClipboardList, MessageSquare, Settings, ShoppingCart, CheckCircle } from "lucide-react"
import { MLoader } from "@/components/manola/MLoader"

import { orderService, productService, authService } from "@/lib/services"
import type { Order } from "@/lib/services/orderService"
import type { Product } from "@/lib/services/productService"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Produk", href: "/admin/produk", icon: ShoppingBag },
  { label: "Stok", href: "/admin/stok", icon: Archive },
  { label: "Supplier", href: "/admin/supplier", icon: Truck },
  { label: "Pesanan", href: "/admin/pesanan", icon: ClipboardList },
  { label: "Ulasan", href: "/admin/ulasan", icon: MessageSquare },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
]

interface LowStockItem {
  id: number
  productName: string
  size: string
  color: string
  stock: number
}

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [ordersData, productsData] = await Promise.all([
        orderService.getAll(),
        productService.getAll(),
      ])
      setOrders(ordersData)
      setProducts(productsData)
    } catch (err) {
      console.error("Failed to load dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  // Count today's orders
  const todayOrderCount = useMemo(() => {
    const today = new Date().toDateString()
    return orders.filter((o) => new Date(o.createdAt).toDateString() === today).length
  }, [orders])

  // Find low stock variants (stock <= 3)
  const lowStockProducts = useMemo<LowStockItem[]>(() => {
    const items: LowStockItem[] = []
    products.forEach((product) => {
      product.variants?.forEach((variant) => {
        if (variant.stock <= 3) {
          items.push({
            id: variant.id,
            productName: product.name,
            size: variant.size,
            color: variant.color ?? "-",
            stock: variant.stock })
        }
      })
    })
    return items.sort((a, b) => a.stock - b.stock)
  }, [products])

  const columns = [
    {
      key: "name",
      label: "Nama Produk",
      render: (item: LowStockItem) => <span className="font-medium">{item.productName}</span> },
    { key: "size", label: "Ukuran", render: (item: LowStockItem) => item.size },
    { key: "color", label: "Warna", render: (item: LowStockItem) => item.color },
    {
      key: "stock",
      label: "Sisa Stok",
      render: (item: LowStockItem) => (
        <span className="text-red-500 font-semibold">{item.stock}</span>
      ) },
  ]

  const hasLowStock = lowStockProducts.length > 0

  return (
    <SidebarLayout navItems={navItems} userName={currentUser?.nama ?? "Admin"} userRole="Admin">
      <h1 className="text-2xl font-semibold text-[#0A0A0A] mb-6">Dashboard</h1>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <MLoader size="lg" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="max-w-xs mb-6">
            <StatCard
              label="Pesanan Masuk Hari Ini"
              value={String(todayOrderCount)}
              caption="pesanan baru"
              icon={ShoppingCart}
            />
          </div>

          {/* Low Stock Card */}
          <MCard className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#0A0A0A]">Stok Hampir Habis</h2>
              {hasLowStock && (
                <MBadge variant="danger">{lowStockProducts.length} varian</MBadge>
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
        </>
      )}
    </SidebarLayout>
  )
}
