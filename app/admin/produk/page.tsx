"use client"

import { useState } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MButton } from "@/components/manola/MButton"
import { MInput } from "@/components/manola/MInput"
import { MModal } from "@/components/manola/MModal"
import { MBadge } from "@/components/manola/MBadge"
import { LayoutDashboard, ShoppingBag, Archive, Truck, ClipboardList, MessageSquare, Settings, Search, Upload, X, Pencil, Trash2 } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Produk", href: "/admin/produk", icon: ShoppingBag },
  { label: "Stok", href: "/admin/stok", icon: Archive },
  { label: "Supplier", href: "/admin/supplier", icon: Truck },
  { label: "Pesanan", href: "/admin/pesanan", icon: ClipboardList },
  { label: "Ulasan", href: "/admin/ulasan", icon: MessageSquare },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
]

const initialProducts = [
  { id: 1, name: "Kaos Oversize Black", category: "Kaos", price: 200000, totalStock: 45 },
  { id: 2, name: "Hoodie Essential Gray", category: "Hoodie", price: 350000, totalStock: 28 },
  { id: 3, name: "Celana Cargo Olive", category: "Celana", price: 250000, totalStock: 2 },
  { id: 4, name: "Jaket Bomber Navy", category: "Jaket", price: 450000, totalStock: 15 },
  { id: 5, name: "Kaos Graphic White", category: "Kaos", price: 180000, totalStock: 1 },
  { id: 6, name: "Celana Jogger Black", category: "Celana", price: 220000, totalStock: 32 },
  { id: 7, name: "Hoodie Zip Brown", category: "Hoodie", price: 380000, totalStock: 3 },
  { id: 8, name: "Kaos Polo Navy", category: "Kaos", price: 250000, totalStock: 18 },
  { id: 9, name: "Topi Snapback Black", category: "Aksesoris", price: 150000, totalStock: 50 },
  { id: 10, name: "Celana Chino Beige", category: "Celana", price: 280000, totalStock: 22 },
  { id: 11, name: "Jaket Denim Blue", category: "Jaket", price: 420000, totalStock: 12 },
  { id: 12, name: "Kaos Basic White", category: "Kaos", price: 150000, totalStock: 60 },
]

const categories = ["Kaos", "Celana", "Jaket", "Hoodie", "Aksesoris"]
const sizes = ["S", "M", "L", "XL"]

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`
}

export default function AdminProdukPage() {
  const [products, setProducts] = useState(initialProducts)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterKategori, setFilterKategori] = useState("")
  const [filterStok, setFilterStok] = useState("")
  const [showProductModal, setShowProductModal] = useState(false)
  const [showKategoriModal, setShowKategoriModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null)
  const [isEdit, setIsEdit] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Kaos",
    selectedSizes: [] as string[],
    sizeStocks: {} as Record<string, string>,
    colors: [{ color: "#000000", name: "", stock: "" }],
  })

  const [categoryList, setCategoryList] = useState(categories)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCategory = !filterKategori || p.category === filterKategori
    const matchStock = !filterStok || 
      (filterStok === "aman" && p.totalStock > 3) || 
      (filterStok === "hampir-habis" && p.totalStock <= 3)
    return matchSearch && matchCategory && matchStock
  })

  const openAddModal = () => {
    setIsEdit(false)
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "Kaos",
      selectedSizes: [],
      sizeStocks: {},
      colors: [{ color: "#000000", name: "", stock: "" }],
    })
    setShowProductModal(true)
  }

  const openEditModal = (product: typeof products[0]) => {
    setIsEdit(true)
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      description: "",
      price: product.price.toString(),
      category: product.category,
      selectedSizes: ["M", "L"],
      sizeStocks: { M: "10", L: "15" },
      colors: [{ color: "#000000", name: "Hitam", stock: "20" }],
    })
    setShowProductModal(true)
  }

  const handleSaveProduct = () => {
    if (isEdit && selectedProduct) {
      setProducts(products.map((p) =>
        p.id === selectedProduct.id
          ? { ...p, name: formData.name, price: parseInt(formData.price), category: formData.category }
          : p
      ))
    } else {
      const newProduct = {
        id: products.length + 1,
        name: formData.name,
        category: formData.category,
        price: parseInt(formData.price),
        totalStock: 0,
      }
      setProducts([...products, newProduct])
    }
    setShowProductModal(false)
  }

  const handleDeleteProduct = () => {
    if (selectedProduct) {
      setProducts(products.filter((p) => p.id !== selectedProduct.id))
      setShowDeleteModal(false)
      setSelectedProduct(null)
    }
  }

  const toggleSize = (size: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedSizes: prev.selectedSizes.includes(size)
        ? prev.selectedSizes.filter((s) => s !== size)
        : [...prev.selectedSizes, size],
    }))
  }

  const addColor = () => {
    setFormData((prev) => ({
      ...prev,
      colors: [...prev.colors, { color: "#000000", name: "", stock: "" }],
    }))
  }

  const removeColor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index),
    }))
  }

  const columns = [
    {
      key: "photo",
      label: "Foto",
      render: () => <div className="w-12 h-12 bg-gray-100 rounded-md" />,
    },
    {
      key: "name",
      label: "Nama Produk",
      render: (item: typeof products[0]) => <span className="font-medium">{item.name}</span>,
    },
    {
      key: "category",
      label: "Kategori",
      render: (item: typeof products[0]) => <span className="text-sm text-[#6B7280]">{item.category}</span>,
    },
    {
      key: "price",
      label: "Harga",
      render: (item: typeof products[0]) => formatRupiah(item.price),
    },
    {
      key: "stock",
      label: "Stok",
      render: (item: typeof products[0]) => (
        <div className="flex items-center gap-2">
          <span className={item.totalStock <= 3 ? "text-red-500 font-semibold" : "text-green-600"}>
            {item.totalStock}
          </span>
          {item.totalStock <= 3 && <MBadge variant="warning">Hampir Habis</MBadge>}
        </div>
      ),
    },
    {
      key: "action",
      label: "Aksi",
      render: (item: typeof products[0]) => (
        <div className="flex gap-2">
          <MButton variant="ghost" size="sm" onClick={() => openEditModal(item)}>
            Edit
          </MButton>
          <MButton
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => {
              setSelectedProduct(item)
              setShowDeleteModal(true)
            }}
          >
            Hapus
          </MButton>
        </div>
      ),
    },
  ]

  return (
    <SidebarLayout navItems={navItems} userName="Rina Dewi" userRole="Admin">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-64">
            <MInput
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <select
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            className="h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-white"
          >
            <option value="">Semua Kategori</option>
            {categoryList.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={filterStok}
            onChange={(e) => setFilterStok(e.target.value)}
            className="h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-white"
          >
            <option value="">Semua Stok</option>
            <option value="aman">Aman</option>
            <option value="hampir-habis">Hampir Habis</option>
          </select>
        </div>
        <div className="flex gap-2">
          <MButton variant="secondary" onClick={() => setShowKategoriModal(true)}>
            Kelola Kategori
          </MButton>
          <MButton variant="primary" onClick={openAddModal}>
            + Tambah Produk
          </MButton>
        </div>
      </div>

      {/* Table */}
      <MCard padding="sm">
        <MTable columns={columns} data={filteredProducts} />
      </MCard>

      {/* Add/Edit Product Modal */}
      <MModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        title={isEdit ? "Edit Produk" : "Tambah Produk"}
        maxWidth="2xl"
        footer={
          <>
            <MButton variant="ghost" onClick={() => setShowProductModal(false)}>
              Batal
            </MButton>
            <MButton variant="primary" onClick={handleSaveProduct}>
              Simpan Produk
            </MButton>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column */}
          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Foto Produk</label>
            <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg h-48 flex flex-col items-center justify-center cursor-pointer hover:border-[#0A0A0A] transition">
              <Upload className="w-8 h-8 text-[#6B7280] mb-2" />
              <p className="text-sm text-[#6B7280]">Klik atau drag foto produk</p>
              <p className="text-xs text-[#9CA3AF]">PNG, JPG maks 5MB</p>
            </div>
            <div className="flex gap-2 mt-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-14 h-14 bg-gray-100 rounded-md" />
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <MInput
              label="Nama Produk"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">Deskripsi</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-sm focus:border-[#0A0A0A] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">Harga</label>
              <div className="flex items-center border border-[#E5E7EB] rounded-md">
                <span className="px-3 text-[#6B7280] text-sm">Rp</span>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="0"
                  className="flex-1 h-10 px-2 text-sm focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">Kategori</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-white"
              >
                {categoryList.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Size Variants */}
            <div>
              <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Variasi Ukuran</label>
              <div className="flex gap-2 flex-wrap">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={`border rounded-md px-3 py-1 text-sm transition ${
                      formData.selectedSizes.includes(size)
                        ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                        : "border-[#E5E7EB] hover:border-[#0A0A0A]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {formData.selectedSizes.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {formData.selectedSizes.map((size) => (
                    <div key={size} className="flex items-center gap-2">
                      <span className="text-sm text-[#6B7280]">Stok {size}:</span>
                      <input
                        type="number"
                        value={formData.sizeStocks[size] || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sizeStocks: { ...formData.sizeStocks, [size]: e.target.value },
                          })
                        }
                        className="w-16 h-8 border border-[#E5E7EB] rounded-md px-2 text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Color Variants */}
            <div>
              <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Variasi Warna</label>
              {formData.colors.map((colorItem, index) => (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <input
                    type="color"
                    value={colorItem.color}
                    onChange={(e) => {
                      const newColors = [...formData.colors]
                      newColors[index].color = e.target.value
                      setFormData({ ...formData, colors: newColors })
                    }}
                    className="w-8 h-8 rounded cursor-pointer border"
                  />
                  <input
                    placeholder="Nama warna (e.g. Hitam)"
                    value={colorItem.name}
                    onChange={(e) => {
                      const newColors = [...formData.colors]
                      newColors[index].name = e.target.value
                      setFormData({ ...formData, colors: newColors })
                    }}
                    className="w-32 h-8 border border-[#E5E7EB] rounded-md px-2 text-sm"
                  />
                  <input
                    placeholder="Stok"
                    type="number"
                    value={colorItem.stock}
                    onChange={(e) => {
                      const newColors = [...formData.colors]
                      newColors[index].stock = e.target.value
                      setFormData({ ...formData, colors: newColors })
                    }}
                    className="w-16 h-8 border border-[#E5E7EB] rounded-md px-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => removeColor(index)}
                    className="p-1 text-[#6B7280] hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <MButton variant="ghost" size="sm" onClick={addColor}>
                + Tambah Warna
              </MButton>
            </div>
          </div>
        </div>
      </MModal>

      {/* Kelola Kategori Modal */}
      <MModal
        isOpen={showKategoriModal}
        onClose={() => setShowKategoriModal(false)}
        title="Kategori Produk"
        maxWidth="sm"
      >
        <div className="space-y-1">
          {categoryList.map((cat) => (
            <div key={cat} className="flex items-center justify-between py-2 border-b border-[#E5E7EB]">
              {editingCategory === cat ? (
                <input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 h-8 border border-[#E5E7EB] rounded-md px-2 text-sm mr-2"
                  autoFocus
                />
              ) : (
                <span className="text-sm">{cat}</span>
              )}
              <div className="flex gap-1">
                {editingCategory === cat ? (
                  <button
                    onClick={() => {
                      setCategoryList(categoryList.map((c) => (c === cat ? newCategoryName : c)))
                      setEditingCategory(null)
                    }}
                    className="p-1 text-green-500 hover:bg-green-50 rounded"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setEditingCategory(cat)
                      setNewCategoryName(cat)
                    }}
                    className="p-1 text-[#6B7280] hover:text-[#0A0A0A] hover:bg-[#F9F9F9] rounded"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setCategoryList(categoryList.filter((c) => c !== cat))}
                  className="p-1 text-[#6B7280] hover:text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <input
            placeholder="Nama kategori baru"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className="flex-1 h-10 border border-[#E5E7EB] rounded-md px-3 text-sm"
          />
          <MButton
            variant="primary"
            size="sm"
            onClick={() => {
              if (newCategoryName && !categoryList.includes(newCategoryName)) {
                setCategoryList([...categoryList, newCategoryName])
                setNewCategoryName("")
              }
            }}
          >
            Tambah
          </MButton>
        </div>
      </MModal>

      {/* Delete Confirmation Modal */}
      <MModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        maxWidth="xs"
        footer={
          <>
            <MButton variant="ghost" onClick={() => setShowDeleteModal(false)}>
              Batal
            </MButton>
            <MButton variant="danger" onClick={handleDeleteProduct}>
              Hapus
            </MButton>
          </>
        }
      >
        <div className="text-center py-2">
          <p className="text-[#0A0A0A]">
            Hapus produk <span className="font-semibold">{selectedProduct?.name}</span>?
          </p>
        </div>
      </MModal>
    </SidebarLayout>
  )
}

// Helper component for CheckCircle used in category editing
function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}
