"use client"

import { useState, useEffect } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MButton } from "@/components/manola/MButton"
import { MInput } from "@/components/manola/MInput"
import { MModal } from "@/components/manola/MModal"
import { MLoader } from "@/components/manola/MLoader"
import {
  LayoutDashboard, ShoppingBag, Archive, Truck, ClipboardList,
  MessageSquare, Settings, Pencil, Trash2, Tag, Image, FileText,
  FolderTree,
} from "lucide-react"
import { categoryService, type Category } from "@/lib/services/miscServices"
import { toast } from "sonner"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Produk", href: "/admin/produk", icon: ShoppingBag },
  { label: "Kategori", href: "/admin/kategori", icon: FolderTree },
  { label: "Stok", href: "/admin/stok", icon: Archive },
  { label: "Supplier", href: "/admin/supplier", icon: Truck },
  { label: "Pesanan", href: "/admin/pesanan", icon: ClipboardList },
  { label: "Promo", href: "/admin/promo", icon: Tag },
  { label: "Banner", href: "/admin/banner", icon: Image },
  { label: "Laporan", href: "/admin/laporan", icon: FileText },
  { label: "Ulasan", href: "/admin/ulasan", icon: MessageSquare },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
]

export default function AdminKategoriPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [nama, setNama] = useState("")

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      setCategories(await categoryService.getAll())
    } catch { toast.error("Gagal memuat kategori") }
    finally { setLoading(false) }
  }

  function openAdd() {
    setEditingCategory(null)
    setNama("")
    setShowModal(true)
  }

  function openEdit(cat: Category) {
    setEditingCategory(cat)
    setNama(cat.nama)
    setShowModal(true)
  }

  async function handleSubmit() {
    if (!nama.trim()) { toast.error("Nama kategori wajib diisi"); return }
    setSubmitting(true)
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, nama.trim())
        toast.success("Kategori berhasil diperbarui")
      } else {
        await categoryService.create(nama.trim())
        toast.success("Kategori berhasil dibuat")
      }
      setShowModal(false)
      await loadData()
    } catch (err: any) { toast.error(err.message || "Gagal menyimpan kategori") }
    finally { setSubmitting(false) }
  }

  async function handleDelete() {
    if (!selectedCategory) return
    setSubmitting(true)
    try {
      await categoryService.delete(selectedCategory.id)
      toast.success("Kategori berhasil dihapus")
      setShowDeleteModal(false)
      await loadData()
    } catch (err: any) { toast.error(err.message || "Gagal menghapus kategori") }
    finally { setSubmitting(false) }
  }

  const columns = [
    { key: "nama", label: "Nama Kategori", render: (c: Category) => <span className="font-medium">{c.nama}</span> },
    { key: "jumlah", label: "Jumlah Produk", render: (c: Category) => <span className="text-[#6B7280]">{c._count?.products ?? 0} produk</span> },
    { key: "action", label: "Aksi", render: (c: Category) => (
      <div className="flex gap-1">
        <MButton variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil className="w-3.5 h-3.5 mr-1" />Edit</MButton>
        <MButton variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => { setSelectedCategory(c); setShowDeleteModal(true) }}><Trash2 className="w-3.5 h-3.5 mr-1" />Hapus</MButton>
      </div>
    )},
  ]

  return (
    <SidebarLayout navItems={navItems} userName="Admin" userRole="Admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#0A0A0A]">Kategori Produk</h1>
        <MButton onClick={openAdd}>+ Tambah Kategori</MButton>
      </div>

      <MCard padding="sm">
        {loading ? <MLoader text="Memuat kategori..." /> : <MTable columns={columns} data={categories} />}
      </MCard>

      {/* Add/Edit Modal */}
      <MModal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCategory ? "Edit Kategori" : "Tambah Kategori"} maxWidth="sm">
        <div className="space-y-4">
          <MInput label="Nama Kategori" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: Kaos, Hoodie, Celana" autoFocus />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <MButton variant="secondary" onClick={() => setShowModal(false)}>Batal</MButton>
          <MButton onClick={handleSubmit} disabled={submitting}>{submitting ? "Menyimpan..." : "Simpan"}</MButton>
        </div>
      </MModal>

      {/* Delete Modal */}
      <MModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Hapus Kategori" maxWidth="sm">
        <p className="text-sm text-[#6B7280] mb-2">Yakin ingin menghapus kategori <strong>{selectedCategory?.nama}</strong>?</p>
        <p className="text-xs text-[#6B7280] mb-6">Produk yang menggunakan kategori ini akan kehilangan label kategorinya.</p>
        <div className="flex justify-end gap-3">
          <MButton variant="secondary" onClick={() => setShowDeleteModal(false)}>Batal</MButton>
          <MButton className="bg-red-500 hover:bg-red-600" onClick={handleDelete} disabled={submitting}>{submitting ? "Menghapus..." : "Hapus"}</MButton>
        </div>
      </MModal>
    </SidebarLayout>
  )
}
