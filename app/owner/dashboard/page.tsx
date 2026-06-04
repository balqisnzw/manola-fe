"use client"

import { useState, useEffect, useMemo } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { StatCard } from "@/components/manola/StatCard"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { LayoutDashboard, Users, UserCog, Settings, TrendingUp, Calendar, Clock, Package } from "lucide-react"
import { MLoader } from "@/components/manola/MLoader"
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts"

import { orderService, productService, authService } from "@/lib/services"
import type { Order } from "@/lib/services/orderService"
import type { Product } from "@/lib/services/productService"

const navItems = [
  { label: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
  { label: "Pelanggan", href: "/owner/pelanggan", icon: Users },
  { label: "Karyawan", href: "/owner/karyawan", icon: UserCog },
  { label: "Pengaturan", href: "/owner/pengaturan", icon: Settings },
]

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`
}

function RankBadge({ rank }: { rank: number }) {
  const bgColors: Record<number, string> = {
    1: "bg-amber-400",
    2: "bg-gray-300",
    3: "bg-amber-700/60" }

  if (rank <= 3) {
    return (
      <span className={`${bgColors[rank]} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center`}>
        {rank}
      </span>
    )
  }

  return <span className="text-sm text-[#6B7280]">{rank}</span>
}

export default function OwnerDashboardPage() {
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

  // Compute stats from real data
  const stats = useMemo(() => {
    const now = new Date()
    const thisYear = now.getFullYear()
    const thisMonth = now.getMonth()
    const today = now.toDateString()

    const completedOrders = orders.filter((o) => o.status === "SELESAI")

    const yearlyTotal = completedOrders
      .filter((o) => new Date(o.createdAt).getFullYear() === thisYear)
      .reduce((sum, o) => sum + o.total_harga, 0)

    const monthlyTotal = completedOrders
      .filter((o) => {
        const d = new Date(o.createdAt)
        return d.getFullYear() === thisYear && d.getMonth() === thisMonth
      })
      .reduce((sum, o) => sum + o.total_harga, 0)

    const dailyTotal = completedOrders
      .filter((o) => new Date(o.createdAt).toDateString() === today)
      .reduce((sum, o) => sum + o.total_harga, 0)

    const totalProducts = products.length

    return { yearlyTotal, monthlyTotal, dailyTotal, totalProducts }
  }, [orders, products])

  // Compute monthly chart data from real orders
  const monthlyData = useMemo(() => {
    const now = new Date()
    const thisYear = now.getFullYear()
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const completedOrders = orders.filter((o) => o.status === "SELESAI")

    return months.map((month, idx) => ({
      month,
      value: completedOrders
        .filter((o) => {
          const d = new Date(o.createdAt)
          return d.getFullYear() === thisYear && d.getMonth() === idx
        })
        .reduce((sum, o) => sum + o.total_harga, 0) }))
  }, [orders])

  // Compute top 10 products by sales quantity
  const topProducts = useMemo(() => {
    const completedOrders = orders.filter((o) => o.status === "SELESAI")
    const productSales: Record<string, { name: string; category: string; sold: number; revenue: number }> = {}

    completedOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const productName = item.variant?.product?.name ?? "Unknown"
        const category = item.variant?.product?.category ?? "-"
        const key = productName

        if (!productSales[key]) {
          productSales[key] = { name: productName, category, sold: 0, revenue: 0 }
        }
        productSales[key].sold += item.jumlah
        productSales[key].revenue += item.harga_satuan * item.jumlah
      })
    })

    return Object.values(productSales)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10)
      .map((item, idx) => ({ ...item, rank: idx + 1 }))
  }, [orders])

  const columns = [
    {
      key: "rank",
      label: "No",
      render: (item: typeof topProducts[0]) => <RankBadge rank={item.rank} /> },
    {
      key: "name",
      label: "Produk",
      render: (item: typeof topProducts[0]) => (
        <span className="font-medium">{item.name}</span>
      ) },
    { key: "category", label: "Kategori", render: (item: typeof topProducts[0]) => item.category },
    {
      key: "sold",
      label: "Terjual",
      render: (item: typeof topProducts[0]) => `${item.sold} pcs` },
    {
      key: "revenue",
      label: "Revenue",
      render: (item: typeof topProducts[0]) => formatRupiah(item.revenue) },
  ]

  return (
    <SidebarLayout navItems={navItems} userName={currentUser?.nama ?? "Owner"} userRole="Owner">
      <h1 className="text-2xl font-semibold text-[#0A0A0A] mb-6">Dashboard</h1>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <MLoader size="lg" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Total Penjualan Tahunan"
              value={formatRupiah(stats.yearlyTotal)}
              icon={TrendingUp}
            />
            <StatCard
              label="Penjualan Bulan Ini"
              value={formatRupiah(stats.monthlyTotal)}
              icon={Calendar}
            />
            <StatCard
              label="Penjualan Hari Ini"
              value={formatRupiah(stats.dailyTotal)}
              icon={Clock}
            />
            <StatCard
              label="Total Produk"
              value={`${stats.totalProducts} item`}
              icon={Package}
            />
          </div>

          {/* Sales Chart */}
          <MCard className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-[#0A0A0A]">Grafik Penjualan {new Date().getFullYear()}</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#6B7280" }}
                  />
                  <Tooltip
                    formatter={(value) => [formatRupiah(value as number), "Penjualan"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#0A0A0A"
                    strokeWidth={2}
                    fill="#0A0A0A"
                    fillOpacity={0.05}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </MCard>

          {/* Top Products */}
          <MCard>
            <h2 className="font-semibold text-[#0A0A0A] mb-4">10 Produk Terlaris</h2>
            {topProducts.length === 0 ? (
              <p className="text-[#6B7280] text-center py-8">Belum ada data penjualan</p>
            ) : (
              <MTable columns={columns} data={topProducts} />
            )}
          </MCard>
        </>
      )}
    </SidebarLayout>
  )
}
