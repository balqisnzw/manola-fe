"use client"

import { useState, useEffect } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { MButton } from "@/components/manola/MButton"
import { MInput } from "@/components/manola/MInput"
import { MModal } from "@/components/manola/MModal"
import { MBadge } from "@/components/manola/MBadge"
import { MLoader } from "@/components/manola/MLoader"
import {
  LayoutDashboard, ShoppingBag, Archive, Truck, ClipboardList,
  MessageSquare, Settings, Pencil, Trash2, Tag, Image as ImageIcon, FileText,
  FolderTree,
} from "lucide-react"
import { bannerService, type Banner } from "@/lib/services/miscServices"
import { toast } from "sonner"
import { getImageUrl } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Produk", href: "/admin/produk", icon: ShoppingBag },
  { label: "Kategori", href: "/admin/kategori", icon: FolderTree },
  { label: "Stok", href: "/admin/stok", icon: Archive },
  { label: "Supplier", href: "/admin/supplier", icon: Truck },
  { label: "Pesanan", href: "/admin/pesanan", icon: ClipboardList },
  { label: "Promo", href: "/admin/promo", icon: Tag },
  { label: "Banner", href: "/admin/banner", icon: ImageIcon },
  { label: "Laporan", href: "/admin/laporan", icon: FileText },
  { label: "Ulasan", href: "/admin/ulasan", icon: MessageSquare },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
]

export default function AdminBannerPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null)

  const [judul, setJudul] = useState("")
  const [link, setLink] = useState("")
  const [urutan, setUrutan] = useState("0")
  const [aktif, setAktif] = useState(true)
  const [file, setFile] = useState<File | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try { setBanners(await bannerService.getAll()) }
    catch { toast.error("Gagal memuat banner") }
    finally { setLoading(false) }
  }

  function resetForm() {
    setJudul(""); setLink(""); setUrutan("0"); setAktif(true); setFile(null)
  }

  function openAdd() {
    setEditingBanner(null); resetForm(); setShowModal(true)
  }

  function openEdit(b: Banner) {
    setEditingBanner(b)
    setJudul(b.judul); setLink(b.link || ""); setUrutan(String(b.urutan)); setAktif(b.aktif); setFile(null)
    setShowModal(true)
  }

  async function handleSubmit() {
    if (!judul) { toast.error("Judul wajib diisi"); return }
    if (!editingBanner && !file) { toast.error("Gambar wajib diupload"); return }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append("judul", judul)
      fd.append("link", link)
      fd.append("urutan", urutan)
      fd.append("aktif", String(aktif))
      if (file) fd.append("gambar", file)

      if (editingBanner) {
        await bannerService.update(editingBanner.id, fd)
        toast.success("Banner berhasil diperbarui")
      } else {
        await bannerService.create(fd)
        toast.success("Banner berhasil dibuat")
      }
      setShowModal(false)
      await loadData()
    } catch (err: any) { toast.error(err.message || "Gagal menyimpan banner") }
    finally { setSubmitting(false) }
  }

  async function handleDelete() {
    if (!selectedBanner) return
    setSubmitting(true)
    try {
      await bannerService.delete(selectedBanner.id)
      toast.success("Banner berhasil dihapus")
      setShowDeleteModal(false)
      await loadData()
    } catch (err: any) { toast.error(err.message || "Gagal menghapus banner") }
    finally { setSubmitting(false) }
  }

  const columns = [
    { key: "gambar", label: "Preview", render: (b: Banner) => (
      <img src={getImageUrl(b.gambar)} alt={b.judul} className="w-24 h-12 object-cover rounded-md border border-[#E5E7EB]" />
    )},
    { key: "judul", label: "Judul", render: (b: Banner) => <span className="font-medium">{b.judul}</span> },
    { key: "urutan", label: "Urutan", render: (b: Banner) => b.urutan },
    { key: "status", label: "Status", render: (b: Banner) => b.aktif ? <MBadge variant="success">Aktif</MBadge> : <MBadge variant="gray">Nonaktif</MBadge> },
    { key: "action", label: "Aksi", render: (b: Banner) => (
      <div className="flex gap-1">
        <MButton variant="ghost" size="sm" onClick={() => openEdit(b)}><Pencil className="w-3.5 h-3.5" /></MButton>
        <MButton variant="ghost" size="sm" className="text-red-500" onClick={() => { setSelectedBanner(b); setShowDeleteModal(true) }}><Trash2 className="w-3.5 h-3.5" /></MButton>
      </div>
    )},
  ]

  return (
    <SidebarLayout navItems={navItems} userName="Admin" userRole="Admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#0A0A0A]">Banner Halaman Depan</h1>
        <MButton onClick={openAdd}>+ Tambah Banner</MButton>
      </div>

      <MCard padding="sm">
        {loading ? <MLoader text="Memuat banner..." /> : <MTable columns={columns} data={banners} />}
      </MCard>

      {/* Add/Edit Modal */}
      <MModal isOpen={showModal} onClose={() => setShowModal(false)} title={editingBanner ? "Edit Banner" : "Tambah Banner"} maxWidth="md">
        <div className="space-y-4">
          <MInput label="Judul Banner" value={judul} onChange={(e) => setJudul(e.target.value)} placeholder="Promo Akhir Tahun" />
          <MInput label="Link (Opsional)" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://..." />
          <MInput label="Urutan" type="number" value={urutan} onChange={(e) => setUrutan(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-1">Gambar Banner</label>
            {editingBanner && !file && (
              <img src={getImageUrl(editingBanner.gambar)} alt="" className="w-full h-32 object-cover rounded-lg mb-2 border" />
            )}
            {file && (
              <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-2 border" />
            )}
            <input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} className="text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={aktif} onChange={(e) => setAktif(e.target.checked)} />
            Banner aktif (tampil di halaman depan)
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <MButton variant="secondary" onClick={() => setShowModal(false)}>Batal</MButton>
          <MButton onClick={handleSubmit} disabled={submitting}>{submitting ? "Menyimpan..." : "Simpan"}</MButton>
        </div>
      </MModal>

      {/* Delete Modal */}
      <MModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Hapus Banner" maxWidth="sm">
        <p className="text-sm text-[#6B7280] mb-6">Yakin ingin menghapus banner <strong>{selectedBanner?.judul}</strong>?</p>
        <div className="flex justify-end gap-3">
          <MButton variant="secondary" onClick={() => setShowDeleteModal(false)}>Batal</MButton>
          <MButton className="bg-red-500 hover:bg-red-600" onClick={handleDelete} disabled={submitting}>{submitting ? "Menghapus..." : "Hapus"}</MButton>
        </div>
      </MModal>
    </SidebarLayout>
  )
}
