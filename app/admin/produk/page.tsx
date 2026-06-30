"use client"

import { useState, useEffect } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MButton } from "@/components/manola/MButton"
import { MInput } from "@/components/manola/MInput"
import { MModal } from "@/components/manola/MModal"
import { MBadge } from "@/components/manola/MBadge"
import {
  LayoutDashboard,
  ShoppingBag,
  Archive,
  Truck,
  ClipboardList,
  MessageSquare,
  Settings,
  Search,
  Pencil,
  Trash2,
  CheckCircle,
  FolderTree,
  Tag,
  Image,
  FileText,
} from "lucide-react"
import {
  productService,
  buildProductFormData,
  type Product,
} from "@/lib/services/productService"
import { supplierService, type Supplier } from "@/lib/services/supplierService"
import { categoryService, type Category } from "@/lib/services/miscServices"
import { AddProductModal } from "./components/AddProductModal"
import { EditProductModal } from "./components/EditProductModal"
import { DeleteProductModal } from "./components/DeleteProductModal"
import { DEFAULT_FORM, toVariantPayload, type ProductFormState } from "./components/types"
import { getImageUrl } from "@/lib/utils"
import { toast } from "sonner"
import { MLoader } from "@/components/manola/MLoader"
import { adminNavItems } from "@/components/layouts/adminNav"
import { authService } from "@/lib/services/authService"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`
}

function getTotalStock(product: Product): number {
  return product.variants.reduce((sum, v) => sum + v.stock, 0)
}


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminProdukPage() {
  // Data
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Filter
  const [searchQuery, setSearchQuery] = useState("")
  const [filterKategori, setFilterKategori] = useState("")
  const [filterStok, setFilterStok] = useState("")

  // Modal visibility
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showKategoriModal, setShowKategoriModal] = useState(false)

  // Selected product (untuk edit & delete)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  // Form state (shared antara Add & Edit)
  const [formData, setFormData] = useState<ProductFormState>(DEFAULT_FORM)
  const [photos, setPhotos] = useState<File[]>([])

  // Kategori (dikelola client-side, diambil dari data produk)
  const [categoryList, setCategoryList] = useState<string[]>([])
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState("")

  const currentUser = authService.getCurrentUser()

  // ─── Load produk ────────────────────────────────────────────────────────────

  const loadData = async () => {
    try {
      setLoading(true)
      const [productData, supplierData, categoryData] = await Promise.all([
        productService.getAll(),
        supplierService.getAll(),
        categoryService.getAll(),
      ])
      setProducts(productData)
      setSuppliers(supplierData)
      setCategories(categoryData)
      const cats = Array.from(new Set(productData.map((p) => p.category).filter(Boolean) as string[]))
      setCategoryList(cats)
    } catch (err) {
      console.error(err)
      showToast("Gagal memuat data produk atau supplier", "error")
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await productService.getAll()
      setProducts(data)
      const categoryData = await categoryService.getAll()
      setCategories(categoryData)
      const cats = Array.from(new Set(data.map((p) => p.category).filter(Boolean) as string[]))
      setCategoryList(cats)
    } catch (err) {
      console.error(err)
      showToast("Gagal memuat data produk", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Toast ──────────────────────────────────────────────────────────────────

  const showToast = (message: string, type: "success" | "error") => {
    if (type === "success") {
      toast.success(message)
    } else {
      toast.error(message)
    }
  }

  // ─── Filter ─────────────────────────────────────────────────────────────────

  const filteredProducts = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCategory = !filterKategori || p.category === filterKategori
    const total = getTotalStock(p)
    const matchStock =
      !filterStok ||
      (filterStok === "aman" && total > 3) ||
      (filterStok === "hampir-habis" && total <= 3)
    return matchSearch && matchCategory && matchStock
  })

  // ─── Open modals ────────────────────────────────────────────────────────────

  const openAddModal = () => {
    setFormData(DEFAULT_FORM)
    setPhotos([])
    setShowAddModal(true)
  }

  const openEditModal = (product: Product) => {
    setSelectedProduct(product)
    setFormData({
      sku: product.sku || "",
      name: product.name,
      description: product.description ?? "",
      removeImageIds: [],
      price: product.price.toString(),
      promoPrice: product.promoPrice ? product.promoPrice.toString() : "",
      category: product.category ?? "",
      categoryId: product.categoryId?.toString() ?? "",
      supplierId: product.supplierId?.toString() ?? "",
      variants:
        product.variants.length > 0
          ? product.variants.map((v) => ({
              size: v.size,
              color: v.color ?? "",
              stock: v.stock.toString(),
            }))
          : [{ size: "M", color: "", stock: "" }],
      colorTags: product.colorTags ?? "",
    })
    setPhotos([])
    setShowEditModal(true)
  }

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product)
    setShowDeleteModal(true)
  }

  // ─── Submit handlers ────────────────────────────────────────────────────────

  const handleAddProduct = async () => {
    if (!formData.name || !formData.price || !formData.sku || !formData.supplierId || photos.length === 0) {
      showToast("Foto produk, kode, nama, harga, dan supplier wajib diisi", "error")
      return
    }
    const variantSet = new Set()
    for (const v of formData.variants) {
      const key = `${v.size}-${(v.color || "").trim().toLowerCase()}`
      if (variantSet.has(key)) {
        showToast("Terdapat variasi produk yang duplikat (ukuran dan warna sama)", "error")
        return
      }
      variantSet.add(key)
    }

    const fd = buildProductFormData(
      {
        name: formData.name,
        description: formData.description || undefined,
        price: parseInt(formData.price),
        promoPrice: formData.promoPrice ? parseInt(formData.promoPrice) : null,
        category: formData.category || undefined,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
        supplierId: formData.supplierId ? parseInt(formData.supplierId) : undefined,
        sku: formData.sku || undefined,
        colorTags: formData.colorTags || undefined,
      },
      toVariantPayload(formData.variants),
      photos.length > 0 ? photos : undefined,
      formData.descriptionImage,
      formData.removeDescriptionImage
    )
    try {
      setSubmitting(true)
      await productService.create(fd)
      showToast("Produk berhasil ditambahkan", "success")
      setShowAddModal(false)
      await loadProducts()
    } catch (err: any) {
      console.error(err)
      const msg = err?.response?.data?.message || err?.message || "Gagal menambah produk"
      showToast(msg, "error")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditProduct = async () => {
    if (!selectedProduct) return
    if (!formData.name || !formData.price) {
      showToast("Nama produk dan harga wajib diisi", "error")
      return
    }
    const variantSet = new Set()
    for (const v of formData.variants) {
      const key = `${v.size}-${(v.color || "").trim().toLowerCase()}`
      if (variantSet.has(key)) {
        showToast("Terdapat variasi produk yang duplikat (ukuran dan warna sama)", "error")
        return
      }
      variantSet.add(key)
    }

    const fd = buildProductFormData(
      {
        name: formData.name,
        description: formData.description || undefined,
        price: parseInt(formData.price),
        promoPrice: formData.promoPrice ? parseInt(formData.promoPrice) : null,
        category: formData.category || undefined,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : undefined,
        supplierId: formData.supplierId ? parseInt(formData.supplierId) : undefined,
        sku: formData.sku || undefined,
        colorTags: formData.colorTags || undefined,
      },
      toVariantPayload(formData.variants),
      photos.length > 0 ? photos : undefined,
      formData.descriptionImage,
      formData.removeDescriptionImage,
      formData.removeImageIds
    )
    try {
      setSubmitting(true)
      await productService.update(selectedProduct.id, fd)
      showToast("Produk berhasil diperbarui", "success")
      setShowEditModal(false)
      await loadProducts()
    } catch (err: any) {
      console.error(err)
      const msg = err?.response?.data?.message || err?.message || "Gagal memperbarui produk"
      showToast(msg, "error")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return
    try {
      setSubmitting(true)
      await productService.delete(selectedProduct.id)
      showToast("Produk berhasil dihapus", "success")
      setShowDeleteModal(false)
      setSelectedProduct(null)
      await loadProducts()
    } catch (err: any) {
      console.error(err)
      showToast(err?.message || "Gagal menghapus produk", "error")
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Table columns ──────────────────────────────────────────────────────────

  const columns = [
    {
      key: "photo",
      label: "Foto",
      render: (item: Product) => {
        const firstImg = item.images?.[0]?.url
        return firstImg ? (
          <img src={getImageUrl(firstImg)} alt={item.name} className="w-12 h-12 object-cover rounded-md" />
        ) : (
          <div className="w-12 h-12 bg-gray-100 rounded-md" />
        )
      },
    },
    {
      key: "sku",
      label: "Kode Produk",
      render: (item: Product) => (
        <span className="text-sm text-[#6B7280] font-mono">{item.sku || "-"}</span>
      ),
    },
    {
      key: "name",
      label: "Nama Produk",
      render: (item: Product) => <span className="font-medium">{item.name}</span>,
    },
    {
      key: "category",
      label: "Kategori",
      render: (item: Product) => (
        <span className="text-sm text-[#6B7280]">{item.category ?? "-"}</span>
      ),
    },
    {
      key: "supplier",
      label: "Supplier",
      render: (item: Product) => (
        <span className="text-sm text-[#6B7280]">{item.supplier?.nama ?? "-"}</span>
      ),
    },
    {
      key: "price",
      label: "Harga",
      render: (item: Product) => (
        <div className="flex flex-col">
          {item.promoPrice ? (
            <>
              <span className="text-xs text-red-500 font-semibold">{formatRupiah(item.promoPrice)}</span>
              <span className="text-xs text-[#6B7280] line-through">{formatRupiah(item.price)}</span>
            </>
          ) : (
            <span className="text-sm font-medium">{formatRupiah(item.price)}</span>
          )}
        </div>
      ),
    },
    {
      key: "stock",
      label: "Stok",
      render: (item: Product) => {
        const total = getTotalStock(item)
        return (
          <div className="flex items-center gap-2">
            <span className={total <= 3 ? "text-red-500 font-semibold" : "text-green-600"}>
              {total}
            </span>
            {total === 0 ? (
              <MBadge variant="danger">Habis</MBadge>
            ) : total <= 3 ? (
              <MBadge variant="warning">Hampir Habis</MBadge>
            ) : (
              <MBadge variant="success">Tersedia</MBadge>
            )}
          </div>
        )
      },
    },
    {
      key: "action",
      label: "Aksi",
      render: (item: Product) => (
        <div className="flex gap-2">
          <MButton variant="ghost" size="sm" onClick={() => openEditModal(item)}>
            <Pencil className="w-3.5 h-3.5 mr-1" />
            Edit
          </MButton>
          <MButton
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => openDeleteModal(item)}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Hapus
          </MButton>
        </div>
      ),
    },
  ]

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <SidebarLayout navItems={adminNavItems} userName={currentUser?.nama ?? "Admin"} userRole={currentUser?.role ?? "Admin"}>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-full sm:w-64">
            <MInput
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Filter kategori — input teks bebas */}
          <input
            type="text"
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
            placeholder="Filter kategori..."
            list="filter-kategori-list"
            className="h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-white w-full sm:w-44 focus:outline-none focus:border-[#0A0A0A]"
          />
          <datalist id="filter-kategori-list">
            {categoryList.map((cat) => (
              <option key={cat} value={cat} />
            ))}
          </datalist>

          <select
            value={filterStok}
            onChange={(e) => setFilterStok(e.target.value)}
            className="h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-white w-full sm:w-auto focus:outline-none focus:border-[#0A0A0A]"
          >
            <option value="">Semua Stok</option>
            <option value="aman">Aman</option>
            <option value="hampir-habis">Hampir Habis</option>
          </select>
        </div>

        <div className="flex gap-2 w-full lg:w-auto">
          <MButton variant="primary" onClick={openAddModal} className="flex-1 lg:flex-none">
            + Tambah
          </MButton>
        </div>
      </div>

      {/* Table */}
      <MCard padding="sm">
        {loading ? (
          <MLoader text="Memuat data produk..." />
        ) : (
          <MTable columns={columns} data={filteredProducts} />
        )}
      </MCard>

      {/* ── Modal Tambah ──────────────────────────────────────────────────────── */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        formData={formData}
        onChange={setFormData}
        photos={photos}
        onPhotosChange={setPhotos}
        onSubmit={handleAddProduct}
        submitting={submitting}
        suppliers={suppliers}
        categories={categories}
      />

      {/* ── Modal Edit ────────────────────────────────────────────────────────── */}
      <EditProductModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        product={selectedProduct}
        formData={formData}
        onChange={setFormData}
        photos={photos}
        onPhotosChange={setPhotos}
        onSubmit={handleEditProduct}
        submitting={submitting}
        suppliers={suppliers}
        categories={categories}
      />

      {/* ── Modal Hapus ───────────────────────────────────────────────────────── */}
      <DeleteProductModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        product={selectedProduct}
        onConfirm={handleDeleteProduct}
        submitting={submitting}
      />

      {/* ── Modal Kelola Kategori (client-side) ───────────────────────────────── */}
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

        {/* Form tambah kategori — input teks bebas */}
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            placeholder="Nama kategori baru"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newCategoryName && !categoryList.includes(newCategoryName)) {
                setCategoryList([...categoryList, newCategoryName])
                setNewCategoryName("")
              }
            }}
            className="flex-1 h-10 border border-[#E5E7EB] rounded-md px-3 text-sm focus:outline-none focus:border-[#0A0A0A]"
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
    </SidebarLayout>
  )
}
