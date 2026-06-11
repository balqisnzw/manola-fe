"use client"

import { useState, useEffect, useMemo } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { StatCard } from "@/components/manola/StatCard"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { LayoutDashboard, Users, UserCog, Settings, TrendingUp, Calendar, Clock, Package, ClipboardList, Sliders } from "lucide-react"
import { MLoader } from "@/components/manola/MLoader"
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts"

import { authService, analyticsService } from "@/lib/services"
import type { DashboardData } from "@/lib/services/analyticsService"

const navItems = [
  { label: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
  { label: "Stok Barang", href: "/owner/produk", icon: Package },
  { label: "Riwayat Restock", href: "/owner/restock", icon: ClipboardList },
  { label: "Pelanggan", href: "/owner/pelanggan", icon: Users },
  { label: "Karyawan", href: "/owner/karyawan", icon: UserCog },
  { label: "Konfigurasi Toko", href: "/owner/konfigurasi", icon: Sliders },
  { label: "Pengaturan Profil", href: "/owner/pengaturan", icon: Settings },
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
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const dashboardData = await analyticsService.getDashboard()
      setData(dashboardData)
    } catch (err) {
      console.error("Failed to load dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      key: "rank",
      label: "No",
      render: (item: any) => <RankBadge rank={item.rank} /> },
    {
      key: "name",
      label: "Produk",
      render: (item: any) => (
        <span className="font-medium">{item.name}</span>
      ) },
    { key: "category", label: "Kategori", render: (item: any) => item.category },
    {
      key: "sold",
      label: "Terjual",
      render: (item: any) => `${item.sold} pcs` },
    {
      key: "revenue",
      label: "Revenue",
      render: (item: any) => formatRupiah(item.revenue) },
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
              value={formatRupiah(data?.yearlyTotal ?? 0)}
              icon={TrendingUp}
            />
            <StatCard
              label="Penjualan Bulan Ini"
              value={formatRupiah(data?.monthlyTotal ?? 0)}
              icon={Calendar}
            />
            <StatCard
              label="Penjualan Hari Ini"
              value={formatRupiah(data?.dailyTotal ?? 0)}
              icon={Clock}
            />
            <StatCard
              label="Total Produk"
              value={`${data?.totalProducts ?? 0} item`}
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
                <AreaChart data={data?.monthlyData ?? []}>
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
          <MCard className="mb-6">
            <h2 className="font-semibold text-[#0A0A0A] mb-4">10 Produk Terlaris</h2>
            {!data?.topProducts || data.topProducts.length === 0 ? (
              <p className="text-[#6B7280] text-center py-8">Belum ada data penjualan</p>
            ) : (
              <MTable columns={columns} data={data.topProducts} />
            )}
          </MCard>

        </>
      )}
    </SidebarLayout>
  )
}
