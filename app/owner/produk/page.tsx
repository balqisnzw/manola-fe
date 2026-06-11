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
import type { Product } from "@/lib/services/productService"

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

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))

  const flatVariants = filtered.flatMap(p => p.variants.map(v => ({
    id: v.id,
    productName: p.name,
    category: p.category || "-",
    price: p.price,
    size: v.size,
    color: v.color || "-",
    stock: v.stock
  })))

  const columns = [
    { key: "productName", label: "Nama Produk", render: (item: any) => <span className="font-semibold">{item.productName}</span> },
    { key: "size", label: "Ukuran", render: (item: any) => item.size },
    { key: "color", label: "Warna", render: (item: any) => item.color },
    { key: "price", label: "Harga", render: (item: any) => formatRupiah(item.price) },
    { key: "stock", label: "Sisa Stok", render: (item: any) => (
      <span className={`font-bold ${item.stock < 5 ? "text-red-600" : "text-gray-700"}`}>
        {item.stock} pcs
      </span>
    )},
    { key: "status", label: "Status Stok", render: (item: any) => (
      item.stock < 5
        ? <MBadge variant="warning">Hampir Habis</MBadge>
        : <MBadge variant="success">Tersedia</MBadge>
    )}
  ]

  return (
    <SidebarLayout navItems={navItems} userName={currentUser?.nama ?? "Owner"} userRole="Owner">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-bold text-[#0A0A0A] tracking-tight">Katalog & Sisa Stok</h1>
        <div className="w-full sm:w-72">
          <MInput
            placeholder="Cari nama produk..."
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
