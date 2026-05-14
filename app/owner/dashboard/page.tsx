"use client"

import { useState } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { StatCard } from "@/components/manola/StatCard"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { LayoutDashboard, Users, UserCog, Settings, TrendingUp, Calendar, Clock, Package } from "lucide-react"
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts"

const navItems = [
  { label: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
  { label: "Pelanggan", href: "/owner/pelanggan", icon: Users },
  { label: "Karyawan", href: "/owner/karyawan", icon: UserCog },
  { label: "Pengaturan", href: "/owner/pengaturan", icon: Settings },
]

const monthlyData = [
  { month: "Jan", value: 18500000 },
  { month: "Feb", value: 22000000 },
  { month: "Mar", value: 19800000 },
  { month: "Apr", value: 24500000 },
  { month: "May", value: 21000000 },
  { month: "Jun", value: 26800000 },
  { month: "Jul", value: 23500000 },
  { month: "Aug", value: 28000000 },
  { month: "Sep", value: 25600000 },
  { month: "Oct", value: 27200000 },
  { month: "Nov", value: 30100000 },
  { month: "Dec", value: 32500000 },
]

const topProducts = [
  { rank: 1, name: "Kaos Oversize Black", category: "Kaos", sold: 156, revenue: 31200000 },
  { rank: 2, name: "Hoodie Essential Gray", category: "Hoodie", sold: 124, revenue: 37200000 },
  { rank: 3, name: "Celana Cargo Olive", category: "Celana", sold: 98, revenue: 24500000 },
  { rank: 4, name: "Jaket Bomber Navy", category: "Jaket", sold: 87, revenue: 34800000 },
  { rank: 5, name: "Kaos Graphic White", category: "Kaos", sold: 82, revenue: 16400000 },
  { rank: 6, name: "Celana Jogger Black", category: "Celana", sold: 76, revenue: 15200000 },
  { rank: 7, name: "Hoodie Zip Brown", category: "Hoodie", sold: 71, revenue: 21300000 },
  { rank: 8, name: "Kaos Polo Navy", category: "Kaos", sold: 65, revenue: 16250000 },
  { rank: 9, name: "Topi Snapback Black", category: "Aksesoris", sold: 58, revenue: 8700000 },
  { rank: 10, name: "Celana Chino Beige", category: "Celana", sold: 54, revenue: 13500000 },
]

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`
}

function RankBadge({ rank }: { rank: number }) {
  const bgColors: Record<number, string> = {
    1: "bg-amber-400",
    2: "bg-gray-300",
    3: "bg-amber-700/60",
  }

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
  const [chartView, setChartView] = useState<"monthly" | "yearly">("monthly")

  const columns = [
    {
      key: "rank",
      label: "No",
      render: (item: typeof topProducts[0]) => <RankBadge rank={item.rank} />,
    },
    {
      key: "name",
      label: "Produk",
      render: (item: typeof topProducts[0]) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-100 rounded-md" />
          <span className="font-medium">{item.name}</span>
        </div>
      ),
    },
    { key: "category", label: "Kategori" },
    {
      key: "sold",
      label: "Terjual",
      render: (item: typeof topProducts[0]) => `${item.sold} pcs`,
    },
    {
      key: "revenue",
      label: "Revenue",
      render: (item: typeof topProducts[0]) => formatRupiah(item.revenue),
    },
  ]

  return (
    <SidebarLayout navItems={navItems} userName="Budi Santoso" userRole="Owner">
      <h1 className="text-2xl font-semibold text-[#0A0A0A] mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Penjualan Tahunan"
          value="Rp 248.500.000"
          caption="↑ 12% dari tahun lalu"
          icon={TrendingUp}
        />
        <StatCard
          label="Penjualan Bulan Ini"
          value="Rp 18.200.000"
          icon={Calendar}
        />
        <StatCard
          label="Penjualan Hari Ini"
          value="Rp 1.450.000"
          icon={Clock}
        />
        <StatCard
          label="Total Produk"
          value="134 item"
          icon={Package}
        />
      </div>

      {/* Sales Chart */}
      <MCard className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#0A0A0A]">Grafik Penjualan</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setChartView("monthly")}
              className={`rounded-full px-4 py-1 text-sm transition-colors ${
                chartView === "monthly"
                  ? "bg-[#0A0A0A] text-white"
                  : "border border-[#E5E7EB] text-[#6B7280] hover:border-[#0A0A0A]"
              }`}
            >
              Per Bulan
            </button>
            <button
              onClick={() => setChartView("yearly")}
              className={`rounded-full px-4 py-1 text-sm transition-colors ${
                chartView === "yearly"
                  ? "bg-[#0A0A0A] text-white"
                  : "border border-[#E5E7EB] text-[#6B7280] hover:border-[#0A0A0A]"
              }`}
            >
              Per Tahun
            </button>
          </div>
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
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
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
        <MTable columns={columns} data={topProducts} />
      </MCard>
    </SidebarLayout>
  )
}
