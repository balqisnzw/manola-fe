"use client"

import { useState } from "react"
import Link from "next/link"
import { NavbarLayout } from "@/components/layouts/NavbarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MButton } from "@/components/manola/MButton"
import { MInput } from "@/components/manola/MInput"
import { MModal } from "@/components/manola/MModal"
import { MBadge } from "@/components/manola/MBadge"
import { Search, Settings, LogOut } from "lucide-react"

const navItems = [
  { label: "Transaksi", href: "/kasir/transaksi" },
  { label: "Riwayat", href: "/kasir/riwayat" },
]

const transactions = [
  { id: "TRX-2024-0108", datetime: "20 Apr 2024 14:32", items: [{ name: "Kaos Oversize Black", size: "M", color: "Hitam", qty: 2, subtotal: 400000 }, { name: "Topi Snapback Black", size: "-", color: "Hitam", qty: 1, subtotal: 150000 }], method: "Cash", total: 550000, paid: 600000, change: 50000 },
  { id: "TRX-2024-0107", datetime: "20 Apr 2024 13:45", items: [{ name: "Hoodie Essential Gray", size: "L", color: "Abu-abu", qty: 1, subtotal: 350000 }], method: "QRIS", total: 350000 },
  { id: "TRX-2024-0106", datetime: "20 Apr 2024 12:18", items: [{ name: "Celana Cargo Olive", size: "32", color: "Olive", qty: 1, subtotal: 250000 }, { name: "Kaos Graphic White", size: "M", color: "Putih", qty: 2, subtotal: 360000 }], method: "Cash", total: 610000, paid: 700000, change: 90000 },
  { id: "TRX-2024-0105", datetime: "20 Apr 2024 11:05", items: [{ name: "Jaket Bomber Navy", size: "L", color: "Navy", qty: 1, subtotal: 450000 }], method: "QRIS", total: 450000 },
  { id: "TRX-2024-0104", datetime: "20 Apr 2024 10:22", items: [{ name: "Kaos Polo Navy", size: "M", color: "Navy", qty: 1, subtotal: 250000 }], method: "Cash", total: 250000, paid: 300000, change: 50000 },
  { id: "TRX-2024-0103", datetime: "19 Apr 2024 16:45", items: [{ name: "Celana Jogger Black", size: "L", color: "Hitam", qty: 2, subtotal: 440000 }], method: "QRIS", total: 440000 },
  { id: "TRX-2024-0102", datetime: "19 Apr 2024 15:30", items: [{ name: "Hoodie Zip Brown", size: "M", color: "Coklat", qty: 1, subtotal: 380000 }, { name: "Topi Snapback Black", size: "-", color: "Hitam", qty: 1, subtotal: 150000 }], method: "Cash", total: 530000, paid: 550000, change: 20000 },
  { id: "TRX-2024-0101", datetime: "19 Apr 2024 14:12", items: [{ name: "Kaos Basic White", size: "S", color: "Putih", qty: 3, subtotal: 450000 }], method: "Cash", total: 450000, paid: 500000, change: 50000 },
  { id: "TRX-2024-0100", datetime: "19 Apr 2024 12:55", items: [{ name: "Celana Chino Beige", size: "32", color: "Beige", qty: 1, subtotal: 280000 }], method: "QRIS", total: 280000 },
  { id: "TRX-2024-0099", datetime: "19 Apr 2024 11:08", items: [{ name: "Jaket Denim Blue", size: "M", color: "Biru", qty: 1, subtotal: 420000 }, { name: "Kaos Oversize Black", size: "L", color: "Hitam", qty: 1, subtotal: 200000 }], method: "Cash", total: 620000, paid: 700000, change: 80000 },
  { id: "TRX-2024-0098", datetime: "18 Apr 2024 15:40", items: [{ name: "Kaos Graphic White", size: "L", color: "Putih", qty: 2, subtotal: 360000 }], method: "QRIS", total: 360000 },
  { id: "TRX-2024-0097", datetime: "18 Apr 2024 14:25", items: [{ name: "Hoodie Essential Gray", size: "M", color: "Abu-abu", qty: 1, subtotal: 350000 }], method: "Cash", total: 350000, paid: 400000, change: 50000 },
  { id: "TRX-2024-0096", datetime: "18 Apr 2024 12:10", items: [{ name: "Celana Cargo Olive", size: "30", color: "Olive", qty: 1, subtotal: 250000 }], method: "QRIS", total: 250000 },
  { id: "TRX-2024-0095", datetime: "18 Apr 2024 10:55", items: [{ name: "Topi Snapback Black", size: "-", color: "Hitam", qty: 2, subtotal: 300000 }], method: "Cash", total: 300000, paid: 300000, change: 0 },
  { id: "TRX-2024-0094", datetime: "17 Apr 2024 16:30", items: [{ name: "Kaos Polo Navy", size: "L", color: "Navy", qty: 1, subtotal: 250000 }, { name: "Kaos Basic White", size: "M", color: "Putih", qty: 1, subtotal: 150000 }], method: "QRIS", total: 400000 },
]

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`
}

export default function KasirRiwayatPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [selectedTransaction, setSelectedTransaction] = useState<typeof transactions[0] | null>(null)

  const filteredTransactions = transactions.filter((t) =>
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns = [
    { key: "id", label: "ID Transaksi", render: (item: typeof transactions[0]) => <span className="font-mono text-sm">{item.id}</span> },
    { key: "datetime", label: "Tanggal & Jam" },
    { key: "items", label: "Items", render: (item: typeof transactions[0]) => <span className="text-[#6B7280]">{item.items.length} item</span> },
    { key: "method", label: "Metode", render: (item: typeof transactions[0]) => <MBadge variant={item.method === "Cash" ? "gray" : "info"}>{item.method}</MBadge> },
    { key: "total", label: "Total", render: (item: typeof transactions[0]) => <span className="font-medium">{formatRupiah(item.total)}</span> },
    { key: "action", label: "Aksi", render: (item: typeof transactions[0]) => <MButton variant="ghost" size="sm" onClick={() => setSelectedTransaction(item)}>Lihat Detail</MButton> },
  ]

  const rightContent = (
    <div className="flex items-center gap-4">
      <span className="text-sm text-[#6B7280]">Maya Sari</span>
      <Link href="/kasir/pengaturan" className="text-[#6B7280] hover:text-[#0A0A0A]">
        <Settings className="w-5 h-5" />
      </Link>
      <button className="text-red-500 hover:text-red-600">
        <LogOut className="w-5 h-5" />
      </button>
    </div>
  )

  return (
    <NavbarLayout navItems={navItems} rightContent={rightContent}>
      <div className="p-8">
        <h1 className="text-2xl font-semibold text-[#0A0A0A] mb-6">Riwayat Transaksi</h1>

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#6B7280]">Dari:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-10 border border-[#E5E7EB] rounded-md px-3 text-sm"
            />
            <span className="text-sm text-[#6B7280]">Sampai:</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-10 border border-[#E5E7EB] rounded-md px-3 text-sm"
            />
          </div>
          <div className="w-64">
            <MInput
              placeholder="Cari ID transaksi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Table */}
        <MCard padding="sm">
          <MTable columns={columns} data={filteredTransactions} />
        </MCard>
      </div>

      {/* Detail Modal */}
      <MModal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        title={selectedTransaction?.id}
        maxWidth="md"
      >
        {selectedTransaction && (
          <div>
            <p className="text-sm text-[#6B7280] mb-4">{selectedTransaction.datetime}</p>
            
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
                {selectedTransaction.items.map((item, idx) => (
                  <tr key={idx} className="border-b border-[#E5E7EB]">
                    <td className="py-2 font-medium">{item.name}</td>
                    <td className="py-2">{item.size}</td>
                    <td className="py-2">{item.color}</td>
                    <td className="py-2">{item.qty}</td>
                    <td className="py-2 text-right">{formatRupiah(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="border-t border-[#E5E7EB] pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Total</span>
                <span className="font-bold">{formatRupiah(selectedTransaction.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280]">Metode Pembayaran</span>
                <MBadge variant={selectedTransaction.method === "Cash" ? "gray" : "info"}>
                  {selectedTransaction.method}
                </MBadge>
              </div>
              {selectedTransaction.method === "Cash" && selectedTransaction.paid && (
                <>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Nominal Bayar</span>
                    <span>{formatRupiah(selectedTransaction.paid)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6B7280]">Kembalian</span>
                    <span className="text-green-600">{formatRupiah(selectedTransaction.change || 0)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </MModal>
    </NavbarLayout>
  )
}
