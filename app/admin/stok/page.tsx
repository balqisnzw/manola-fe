"use client"

import { useState, useEffect } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MButton } from "@/components/manola/MButton"
import { MInput } from "@/components/manola/MInput"
import { LayoutDashboard, ShoppingBag, Archive, Truck, ClipboardList, MessageSquare, Settings, Search, Trash2 } from "lucide-react"
import { AddRestockModal } from "./components/AddRestockModal"
import { DeleteRestockModal } from "./components/DeleteRestockModal"
import { stockService, type RestockItem } from "@/lib/services/restockService"
import { productService, type Product } from "@/lib/services/productService"
import { supplierService, type Supplier } from "@/lib/services/supplierService"
import { EMPTY_RESTOCK_FORM, type RestockFormState } from "./components/types"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Produk", href: "/admin/produk", icon: ShoppingBag },
  { label: "Stok", href: "/admin/stok", icon: Archive },
  { label: "Supplier", href: "/admin/supplier", icon: Truck },
  { label: "Pesanan", href: "/admin/pesanan", icon: ClipboardList },
  { label: "Ulasan", href: "/admin/ulasan", icon: MessageSquare },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
]

export default function AdminStokPage() {
  const [restocks, setRestocks] = useState<RestockItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedRestock, setSelectedRestock] = useState<RestockItem | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState<RestockFormState>(EMPTY_RESTOCK_FORM)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)

    try {
      const restockData = await stockService.getAll()
      setRestocks(restockData)

      const productData = await productService.getAll()
      setProducts(productData)

      const supplierData = await supplierService.getAll()
      setSuppliers(supplierData)

    } catch (err) {
      console.error("Gagal memuat data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!formData.productVariantId || !formData.jumlah) return
    setSubmitting(true)
    try {
      await stockService.create({
        productVariantId: Number(formData.productVariantId),
        jumlah: Number(formData.jumlah),
        supplierId: formData.supplierId ? Number(formData.supplierId) : undefined,
      })
      await fetchData()
      setShowAddModal(false)
      setFormData(EMPTY_RESTOCK_FORM)
    } catch (err) {
      console.error("Gagal input restock:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedRestock) return
    setSubmitting(true)
    try {
      await stockService.delete(selectedRestock.id)
      await fetchData()
      setShowDeleteModal(false)
      setSelectedRestock(null)
    } catch (err) {
      console.error("Gagal hapus restock:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredRestocks = restocks.filter((item) => {
    const itemDate = new Date(item.createdAt)
    const from = dateFrom ? new Date(dateFrom) : null
    const to = dateTo ? new Date(dateTo + "T23:59:59") : null

    if (from && itemDate < from) return false
    if (to && itemDate > to) return false

    const productName = item.variant.product.name.toLowerCase()
    return productName.includes(searchQuery.toLowerCase())
  })

  const columns = [
    {
      key: "createdAt",
      label: "Tanggal",
      render: (item: RestockItem) =>
        new Date(item.createdAt).toLocaleDateString("id-ID", {
          day: "numeric", month: "short", year: "numeric"
        }),
    },
    {
      key: "product",
      label: "Produk",
      render: (item: RestockItem) => (
        <span className="font-medium">{item.variant.product.name}</span>
      ),
    },
    {
      key: "size",
      label: "Ukuran",
      render: (item: RestockItem) => item.variant.size,
    },
    {
      key: "color",
      label: "Warna",
      render: (item: RestockItem) => item.variant.color ?? "-",
    },
    {
      key: "jumlah",
      label: "Jumlah Masuk",
      render: (item: RestockItem) => (
        <span className="text-green-600 font-medium">+{item.jumlah}</span>
      ),
    },
    {
      key: "supplier",
      label: "Supplier",
      render: (item: RestockItem) => item.supplier?.nama ?? "-",
    },
    {
      key: "actions",
      label: "",
      render: (item: RestockItem) => (
        <button
          onClick={() => { setSelectedRestock(item); setShowDeleteModal(true) }}
          className="p-1.5 text-[#6B7280] hover:text-red-500 transition"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ]

  return (
    <SidebarLayout navItems={navItems} userName="Admin" userRole="Admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#0A0A0A]">Stok</h1>
        <MButton variant="primary" onClick={() => setShowAddModal(true)}>
          + Input Restock
        </MButton>
      </div>

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
              <span className="text-[#6B7280]">—</span>
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
        <MTable columns={columns} data={filteredRestocks} />
      </MCard>

      <AddRestockModal
        isOpen={showAddModal}
        onClose={() => { setShowAddModal(false); setFormData(EMPTY_RESTOCK_FORM) }}
        formData={formData}
        onChange={setFormData}
        products={products}
        suppliers={suppliers}
        onSubmit={handleAdd}
        submitting={submitting}
      />

      <DeleteRestockModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedRestock(null) }}
        restock={selectedRestock}
        onConfirm={handleDelete}
        submitting={submitting}
      />
    </SidebarLayout>
  )
}
