"use client"

import { useState, useEffect } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MButton } from "@/components/manola/MButton"
import { MInput } from "@/components/manola/MInput"
import { LayoutDashboard, ShoppingBag, Archive, Truck, ClipboardList, MessageSquare, Settings, Search, FolderTree, Tag, Image, FileText } from "lucide-react"
import { AddRestockModal } from "./components/AddRestockModal"
import { stockService, type RestockItem } from "@/lib/services/restockService"
import { productService, type Product } from "@/lib/services/productService"
import { supplierService, type Supplier } from "@/lib/services/supplierService"
import { EMPTY_RESTOCK_FORM, type RestockFormState } from "./components/types"
import { authService } from "@/lib/services/authService"
import { adminNavItems } from "@/components/layouts/adminNav"

export default function AdminStokPage() {
  const [restocks, setRestocks] = useState<RestockItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)

  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState<RestockFormState>(EMPTY_RESTOCK_FORM)
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const currentUser = authService.getCurrentUser()

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

    if (formData.tipe === "KELUAR" && !formData.catatan?.trim()) {
      alert("Catatan wajib diisi untuk koreksi barang keluar")
      return
    }

    setSubmitting(true)
    try {
      await stockService.create({
        productVariantId: Number(formData.productVariantId),
        jumlah: Number(formData.jumlah),
        tipe: formData.tipe,
        catatan: formData.tipe === "KELUAR" ? formData.catatan : undefined,
        supplierId: formData.supplierId ? Number(formData.supplierId) : undefined,
      })
      await fetchData()
      setShowAddModal(false)
      setFormData(EMPTY_RESTOCK_FORM)
    } catch (err: any) {
      console.error("Gagal input restock:", err)
      const msg = err?.response?.data?.message || err?.message || "Terjadi kesalahan"
      alert(msg)
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
      key: "sku",
      label: "Kode Produk",
      render: (item: RestockItem) => (
        <span className="text-sm text-[#6B7280] font-mono">{item.variant.product.sku || "-"}</span>
      ),
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
      label: "Perubahan",
      render: (item: RestockItem) => (
        <span className={`font-medium ${item.tipe === "MASUK" ? "text-green-600" : "text-red-600"}`}>
          {item.tipe === "MASUK" ? "+" : "-"}{item.jumlah}
        </span>
      ),
    },
    {
      key: "supplier",
      label: "Supplier",
      render: (item: RestockItem) => item.supplier?.nama ?? "-",
    },
    {
      key: "catatan",
      label: "Catatan",
      render: (item: RestockItem) => (
        <span className="text-sm text-gray-500">{item.catatan || "-"}</span>
      ),
    },
  ]

  return (
    <SidebarLayout navItems={adminNavItems} userName={currentUser?.nama ?? "Admin"} userRole={currentUser?.role ?? "Admin"}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#0A0A0A]">Stok</h1>
        <MButton variant="primary" onClick={() => setShowAddModal(true)}>
          + Restock
        </MButton>
      </div>

      <MCard>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
          <h2 className="font-semibold text-[#0A0A0A]">Riwayat Restock</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 flex-1 sm:flex-none border border-[#E5E7EB] rounded-md px-2 text-sm"
              />
              <span className="text-[#6B7280]">—</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 flex-1 sm:flex-none border border-[#E5E7EB] rounded-md px-2 text-sm"
              />
            </div>
            <div className="w-full sm:w-64">
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
    </SidebarLayout>
  )
}
