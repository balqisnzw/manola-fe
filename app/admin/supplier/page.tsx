"use client"

import { useState, useEffect } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MButton } from "@/components/manola/MButton"
import { MInput } from "@/components/manola/MInput"
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
  X,
  Loader2,
} from "lucide-react"
import { supplierService, type Supplier } from "@/lib/services/supplierService"
import { AddSupplierModal } from "./components/AddSupplierModal"
import { EditSupplierModal } from "./components/EditSupplierModal"
import { DeleteSupplierModal } from "./components/DeleteSupplierModal"
import {
  DEFAULT_SUPPLIER_FORM,
  toSupplierPayload,
  type SupplierFormState,
} from "./components/types"

// ─── Nav ──────────────────────────────────────────────────────────────────────

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Produk", href: "/admin/produk", icon: ShoppingBag },
  { label: "Stok", href: "/admin/stok", icon: Archive },
  { label: "Supplier", href: "/admin/supplier", icon: Truck },
  { label: "Pesanan", href: "/admin/pesanan", icon: ClipboardList },
  { label: "Ulasan", href: "/admin/ulasan", icon: MessageSquare },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
]

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-white text-sm transition-all
        ${type === "success" ? "bg-green-600" : "bg-red-600"}`}
    >
      {type === "success" ? <CheckCircle className="w-4 h-4" /> : <X className="w-4 h-4" />}
      {message}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminSupplierPage() {
  // Data
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // Filter
  const [searchQuery, setSearchQuery] = useState("")

  // Modal visibility
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Selected supplier (untuk edit & delete)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)

  // Form state
  const [formData, setFormData] = useState<SupplierFormState>(DEFAULT_SUPPLIER_FORM)

  // ─── Load data ────────────────────────────────────────────────────────────────

  const loadSuppliers = async () => {
    try {
      setLoading(true)
      const data = await supplierService.getAll()
      setSuppliers(data)
    } catch (err) {
      console.error(err)
      showToast("Gagal memuat data supplier", "error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSuppliers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ─── Toast ────────────────────────────────────────────────────────────────────

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ─── Filter ───────────────────────────────────────────────────────────────────

  const filteredSuppliers = suppliers.filter((s) =>
    s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.no_telepon.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.alamat ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  // ─── Open modals ──────────────────────────────────────────────────────────────

  const openAddModal = () => {
    setFormData(DEFAULT_SUPPLIER_FORM)
    setShowAddModal(true)
  }

  const openEditModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setFormData({
      nama: supplier.nama,
      no_telepon: supplier.no_telepon,
      alamat: supplier.alamat ?? "",
    })
    setShowEditModal(true)
  }

  const openDeleteModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setShowDeleteModal(true)
  }

  // ─── Submit handlers ──────────────────────────────────────────────────────────

  const handleAddSupplier = async () => {
    if (!formData.nama || !formData.no_telepon) {
      showToast("Nama dan nomor telepon wajib diisi", "error")
      return
    }
    try {
      setSubmitting(true)
      await supplierService.create(toSupplierPayload(formData))
      showToast("Supplier berhasil ditambahkan", "success")
      setShowAddModal(false)
      await loadSuppliers()
    } catch (err) {
      console.error(err)
      showToast("Gagal menambah supplier", "error")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSupplier = async () => {
    if (!selectedSupplier) return
    if (!formData.nama || !formData.no_telepon) {
      showToast("Nama dan nomor telepon wajib diisi", "error")
      return
    }
    try {
      setSubmitting(true)
      await supplierService.update(selectedSupplier.id, toSupplierPayload(formData))
      showToast("Supplier berhasil diperbarui", "success")
      setShowEditModal(false)
      await loadSuppliers()
    } catch (err) {
      console.error(err)
      showToast("Gagal memperbarui supplier", "error")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSupplier = async () => {
    if (!selectedSupplier) return
    try {
      setSubmitting(true)
      await supplierService.delete(selectedSupplier.id)
      showToast("Supplier berhasil dihapus", "success")
      setShowDeleteModal(false)
      setSelectedSupplier(null)
      await loadSuppliers()
    } catch (err) {
      console.error(err)
      showToast("Gagal menghapus supplier", "error")
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Table columns ────────────────────────────────────────────────────────────

  const columns = [
    {
      key: "nama",
      label: "Nama Supplier",
      render: (item: Supplier) => <span className="font-medium">{item.nama}</span>,
    },
    {
      key: "no_telepon",
      label: "No. Telepon",
      render: (item: Supplier) => <span className="text-sm">{item.no_telepon}</span>,
    },
    {
      key: "alamat",
      label: "Alamat",
      render: (item: Supplier) => (
        <span className="text-sm text-[#6B7280]">{item.alamat ?? "-"}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Terdaftar",
      render: (item: Supplier) => (
        <span className="text-sm text-[#6B7280]">
          {new Date(item.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "action",
      label: "Aksi",
      render: (item: Supplier) => (
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

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <SidebarLayout navItems={navItems} userName="Admin" userRole="Admin">
      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="w-64">
          <MInput
            placeholder="Cari supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <MButton variant="primary" onClick={openAddModal}>
          + Tambah Supplier
        </MButton>
      </div>

      {/* Table */}
      <MCard padding="sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-[#6B7280]">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Memuat data supplier...</span>
          </div>
        ) : (
          <MTable columns={columns} data={filteredSuppliers} />
        )}
      </MCard>

      {/* ── Modal Tambah ─────────────────────────────────────────────────────── */}
      <AddSupplierModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleAddSupplier}
        submitting={submitting}
      />

      {/* ── Modal Edit ───────────────────────────────────────────────────────── */}
      <EditSupplierModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        supplier={selectedSupplier}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleEditSupplier}
        submitting={submitting}
      />

      {/* ── Modal Hapus ──────────────────────────────────────────────────────── */}
      <DeleteSupplierModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        supplier={selectedSupplier}
        onConfirm={handleDeleteSupplier}
        submitting={submitting}
      />
    </SidebarLayout>
  )
}
