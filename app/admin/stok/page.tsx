"use client"

import { useState } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MButton } from "@/components/manola/MButton"
import { MInput } from "@/components/manola/MInput"
import { MModal } from "@/components/manola/MModal"
import { LayoutDashboard, ShoppingBag, Archive, Truck, ClipboardList, MessageSquare, Settings, Search } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Produk", href: "/admin/produk", icon: ShoppingBag },
  { label: "Stok", href: "/admin/stok", icon: Archive },
  { label: "Supplier", href: "/admin/supplier", icon: Truck },
  { label: "Pesanan", href: "/admin/pesanan", icon: ClipboardList },
  { label: "Ulasan", href: "/admin/ulasan", icon: MessageSquare },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
]

const restockHistory = [
  { id: 1, date: "20 Apr 2024", product: "Kaos Oversize Black", size: "M", color: "Hitam", qty: 50, supplier: "PT Tekstil Jaya", recordedBy: "Rina Dewi" },
  { id: 2, date: "18 Apr 2024", product: "Hoodie Essential Gray", size: "L", color: "Abu-abu", qty: 30, supplier: "CV Garmen Indo", recordedBy: "Andi Pratama" },
  { id: 3, date: "15 Apr 2024", product: "Celana Cargo Olive", size: "32", color: "Olive", qty: 25, supplier: "PT Tekstil Jaya", recordedBy: "Rina Dewi" },
  { id: 4, date: "12 Apr 2024", product: "Jaket Bomber Navy", size: "L", color: "Navy", qty: 20, supplier: "CV Garmen Indo", recordedBy: "Rina Dewi" },
  { id: 5, date: "10 Apr 2024", product: "Kaos Graphic White", size: "M", color: "Putih", qty: 40, supplier: "PT Tekstil Jaya", recordedBy: "Andi Pratama" },
  { id: 6, date: "8 Apr 2024", product: "Celana Jogger Black", size: "L", color: "Hitam", qty: 35, supplier: "CV Garmen Indo", recordedBy: "Rina Dewi" },
  { id: 7, date: "5 Apr 2024", product: "Hoodie Zip Brown", size: "XL", color: "Coklat", qty: 25, supplier: "PT Tekstil Jaya", recordedBy: "Andi Pratama" },
  { id: 8, date: "3 Apr 2024", product: "Kaos Polo Navy", size: "M", color: "Navy", qty: 30, supplier: "CV Garmen Indo", recordedBy: "Rina Dewi" },
  { id: 9, date: "1 Apr 2024", product: "Topi Snapback Black", size: "-", color: "Hitam", qty: 60, supplier: "PT Aksesoris Keren", recordedBy: "Rina Dewi" },
  { id: 10, date: "28 Mar 2024", product: "Celana Chino Beige", size: "32", color: "Beige", qty: 20, supplier: "PT Tekstil Jaya", recordedBy: "Andi Pratama" },
  { id: 11, date: "25 Mar 2024", product: "Jaket Denim Blue", size: "M", color: "Biru", qty: 15, supplier: "CV Garmen Indo", recordedBy: "Rina Dewi" },
  { id: 12, date: "22 Mar 2024", product: "Kaos Basic White", size: "S", color: "Putih", qty: 50, supplier: "PT Tekstil Jaya", recordedBy: "Andi Pratama" },
  { id: 13, date: "20 Mar 2024", product: "Kaos Oversize Black", size: "L", color: "Hitam", qty: 45, supplier: "PT Tekstil Jaya", recordedBy: "Rina Dewi" },
  { id: 14, date: "18 Mar 2024", product: "Hoodie Essential Gray", size: "M", color: "Abu-abu", qty: 25, supplier: "CV Garmen Indo", recordedBy: "Andi Pratama" },
  { id: 15, date: "15 Mar 2024", product: "Celana Cargo Olive", size: "30", color: "Olive", qty: 20, supplier: "PT Tekstil Jaya", recordedBy: "Rina Dewi" },
]

const products = [
  "Kaos Oversize Black",
  "Hoodie Essential Gray",
  "Celana Cargo Olive",
  "Jaket Bomber Navy",
  "Kaos Graphic White",
]

const suppliers = ["PT Tekstil Jaya", "CV Garmen Indo", "PT Aksesoris Keren"]

export default function AdminStokPage() {
  const [showModal, setShowModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const [formData, setFormData] = useState({
    product: "",
    size: "",
    color: "",
    qty: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    supplier: "",
  })

  const filteredHistory = restockHistory.filter((item) =>
    item.product.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const columns = [
    { key: "date", label: "Tanggal" },
    { key: "product", label: "Produk", render: (item: typeof restockHistory[0]) => <span className="font-medium">{item.product}</span> },
    { key: "size", label: "Ukuran" },
    { key: "color", label: "Warna" },
    { key: "qty", label: "Jumlah Masuk", render: (item: typeof restockHistory[0]) => <span className="text-green-600 font-medium">+{item.qty}</span> },
    { key: "supplier", label: "Supplier" },
    { key: "recordedBy", label: "Dicatat Oleh" },
  ]

  const handleSave = () => {
    // Handle save logic
    setShowModal(false)
    setFormData({
      product: "",
      size: "",
      color: "",
      qty: "",
      date: new Date().toISOString().split("T")[0],
      notes: "",
      supplier: "",
    })
  }

  return (
    <SidebarLayout navItems={navItems} userName="Rina Dewi" userRole="Admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#0A0A0A]">Stok</h1>
        <MButton variant="primary" onClick={() => setShowModal(true)}>
          + Input Restock
        </MButton>
      </div>

      {/* Restock History */}
      <MCard>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#0A0A0A]">Riwayat Restock</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 border border-[#E5E7EB] rounded-md px-3 text-sm"
              />
              <span className="text-[#6B7280]">-</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 border border-[#E5E7EB] rounded-md px-3 text-sm"
              />
            </div>
            <div className="w-64">
              <MInput
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>
        <MTable columns={columns} data={filteredHistory} />
      </MCard>

      {/* Input Restock Modal */}
      <MModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Input Barang Masuk"
        maxWidth="md"
        footer={
          <>
            <MButton variant="ghost" onClick={() => setShowModal(false)}>
              Batal
            </MButton>
            <MButton variant="primary" onClick={handleSave}>
              Simpan
            </MButton>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">Produk</label>
            <select
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              className="w-full h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-white"
            >
              <option value="">Pilih produk...</option>
              {products.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">Ukuran</label>
              <select
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-white"
              >
                <option value="">Pilih ukuran</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">Warna</label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-white"
              >
                <option value="">Pilih warna</option>
                <option value="Hitam">Hitam</option>
                <option value="Putih">Putih</option>
                <option value="Abu-abu">Abu-abu</option>
              </select>
            </div>
          </div>
          <MInput
            label="Jumlah Masuk"
            type="number"
            value={formData.qty}
            onChange={(e) => setFormData({ ...formData, qty: e.target.value })}
          />
          <MInput
            label="Tanggal Masuk"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">Catatan (Opsional)</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-sm focus:border-[#0A0A0A] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">Supplier</label>
            <select
              value={formData.supplier}
              onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              className="w-full h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-white"
            >
              <option value="">Pilih supplier...</option>
              {suppliers.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </MModal>
    </SidebarLayout>
  )
}
