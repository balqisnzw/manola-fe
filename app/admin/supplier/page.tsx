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

const initialSuppliers = [
  { id: 1, name: "PT Tekstil Jaya", contact: "021-5551234", email: "info@tekstiljaya.com", address: "Jl. Industri No. 45, Bandung" },
  { id: 2, name: "CV Garmen Indo", contact: "022-6667890", email: "order@garmenindo.co.id", address: "Jl. Garment Raya No. 12, Jakarta Barat" },
  { id: 3, name: "PT Aksesoris Keren", contact: "021-7778901", email: "sales@aksessoriskeren.com", address: "Jl. Fashion No. 88, Surabaya" },
  { id: 4, name: "UD Kain Berkah", contact: "024-3334567", email: "kainberkah@gmail.com", address: "Jl. Tekstil No. 23, Semarang" },
  { id: 5, name: "PT Jahit Makmur", contact: "031-4445678", email: "info@jahitmakmur.co.id", address: "Jl. Konveksi No. 56, Surabaya" },
  { id: 6, name: "CV Bordir Indah", contact: "022-8889012", email: "bordirindah@yahoo.com", address: "Jl. Bordir No. 78, Bandung" },
]

export default function AdminSupplierPage() {
  const [suppliers, setSuppliers] = useState(initialSuppliers)
  const [searchQuery, setSearchQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState<typeof suppliers[0] | null>(null)
  const [isEdit, setIsEdit] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    email: "",
    address: "",
  })

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openAddModal = () => {
    setIsEdit(false)
    setFormData({ name: "", contact: "", email: "", address: "" })
    setShowModal(true)
  }

  const openEditModal = (supplier: typeof suppliers[0]) => {
    setIsEdit(true)
    setSelectedSupplier(supplier)
    setFormData({
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email,
      address: supplier.address,
    })
    setShowModal(true)
  }

  const handleSave = () => {
    if (isEdit && selectedSupplier) {
      setSuppliers(suppliers.map((s) =>
        s.id === selectedSupplier.id
          ? { ...s, ...formData }
          : s
      ))
    } else {
      const newSupplier = {
        id: suppliers.length + 1,
        ...formData,
      }
      setSuppliers([...suppliers, newSupplier])
    }
    setShowModal(false)
  }

  const handleDelete = () => {
    if (selectedSupplier) {
      setSuppliers(suppliers.filter((s) => s.id !== selectedSupplier.id))
      setShowDeleteModal(false)
      setSelectedSupplier(null)
    }
  }

  const columns = [
    { key: "name", label: "Nama Supplier", render: (item: typeof suppliers[0]) => <span className="font-medium">{item.name}</span> },
    { key: "contact", label: "Kontak" },
    { key: "email", label: "Email" },
    { key: "address", label: "Alamat", render: (item: typeof suppliers[0]) => <span className="text-sm text-[#6B7280]">{item.address}</span> },
    {
      key: "action",
      label: "Aksi",
      render: (item: typeof suppliers[0]) => (
        <div className="flex gap-2">
          <MButton variant="ghost" size="sm" onClick={() => openEditModal(item)}>
            Edit
          </MButton>
          <MButton
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => {
              setSelectedSupplier(item)
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

      <MCard padding="sm">
        <MTable columns={columns} data={filteredSuppliers} />
      </MCard>

      {/* Add/Edit Supplier Modal */}
      <MModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={isEdit ? "Edit Supplier" : "Tambah Supplier"}
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
          <MInput
            label="Nama Supplier"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <MInput
            label="Nomor Kontak"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          />
          <MInput
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">Alamat</label>
            <textarea
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-sm focus:border-[#0A0A0A] focus:outline-none"
            />
          </div>
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
            <MButton variant="danger" onClick={handleDelete}>
              Hapus
            </MButton>
          </>
        }
      >
        <div className="text-center py-2">
          <p className="text-[#0A0A0A]">
            Hapus supplier <span className="font-semibold">{selectedSupplier?.name}</span>?
          </p>
          <p className="text-sm text-[#6B7280] mt-2">
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
      </MModal>
    </SidebarLayout>
  )
}
