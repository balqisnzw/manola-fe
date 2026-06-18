"use client"

import { useState, useEffect } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MLoader } from "@/components/manola/MLoader"
import { MBadge } from "@/components/manola/MBadge"
import { MInput } from "@/components/manola/MInput"
import { LayoutDashboard, Users, UserCog, Settings, Package, ClipboardList, Sliders, Search } from "lucide-react"
import { authService, productService } from "@/lib/services"
import { getImageUrl } from "@/lib/utils"
import type { Product } from "@/lib/services/productService"

import { ownerNavItems as navItems } from "@/components/layouts/ownerNav"

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`
}

export default function OwnerProdukPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    setLoading(true)
    try {
      const data = await productService.getAll()
      setProducts(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = products.filter(p => {
    return p.name.toLowerCase().includes(search.toLowerCase()) || 
           p.sku?.toLowerCase().includes(search.toLowerCase())
  })

  const flatVariants = filtered.flatMap(p => p.variants.map(v => ({
    id: v.id,
    foto: p.images?.[0]?.url,
    kode: p.sku || "-",
    productName: p.name,
    category: p.category || "-",
    supplier: p.supplier?.nama || "-",
    price: p.price,
    size: v.size,
    color: v.color || "-",
    stock: v.stock
  })))

  const columns = [
    { key: "foto", label: "Foto", render: (item: any) => (
      item.foto ? <img src={getImageUrl(item.foto)} alt="Foto" className="w-12 h-12 object-cover rounded border border-gray-200" /> : <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">No Img</div>
    )},
    { key: "kode", label: "Kode Produk", render: (item: any) => <span className="text-gray-600 font-medium">{item.kode}</span> },
    { key: "productName", label: "Nama Produk", render: (item: any) => <span className="font-semibold text-[#0A0A0A]">{item.productName}</span> },
    { key: "category", label: "Kategori", render: (item: any) => <span className="text-gray-600">{item.category}</span> },
    { key: "supplier", label: "Supplier", render: (item: any) => <span className="text-gray-600">{item.supplier}</span> },
    { key: "size", label: "Ukuran", render: (item: any) => item.size },
    { key: "color", label: "Warna", render: (item: any) => item.color },
    { key: "price", label: "Harga", render: (item: any) => formatRupiah(item.price) },
    { key: "stock", label: "Stok", render: (item: any) => (
      <div className="flex items-center gap-2">
        <span className={`font-bold ${item.stock < 5 ? "text-red-600" : "text-gray-700"}`}>
          {item.stock} pcs
        </span>
        {item.stock === 0
          ? <MBadge variant="danger">Habis</MBadge>
          : item.stock < 5
            ? <MBadge variant="warning">Hampir Habis</MBadge>
            : <MBadge variant="success">Tersedia</MBadge>
        }
      </div>
    )}
  ]

  return (
    <SidebarLayout navItems={navItems} userName={currentUser?.nama ?? "Owner"} userRole="Owner">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Produk</h1>
        <div className="w-full sm:w-72">
          <MInput
            placeholder="Cari produk"
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {loading ? (
        <MLoader />
      ) : (
        <MCard padding="sm">
          <MTable columns={columns} data={flatVariants} />
        </MCard>
      )}
    </SidebarLayout>
  )
}
