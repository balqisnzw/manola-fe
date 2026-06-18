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
import { bannerService, settingService, type Banner } from "@/lib/services/miscServices"
import { authService } from "@/lib/services"
import { toast } from "sonner"
import { getImageUrl } from "@/lib/utils"
import { adminNavItems } from "@/components/layouts/adminNav"

export default function AdminBannerPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const currentUser = authService.getCurrentUser()

  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null)

  const [urutan, setUrutan] = useState("1")
  const [file, setFile] = useState<File | null>(null)

  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [showLogoModal, setShowLogoModal] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try { 
      const [bData, sData] = await Promise.all([
        bannerService.getAll(),
        settingService.get()
      ])
      setBanners(bData)
      if (sData.logo_url) setLogoUrl(sData.logo_url)
    }
    catch { toast.error("Gagal memuat data") }
    finally { setLoading(false) }
  }

  function resetForm() {
    let firstAvailable = 1;
    for (let i = 1; i <= 5; i++) {
      if (!banners.some(b => Number(b.urutan) === i)) {
        firstAvailable = i;
        break;
      }
    }
    setUrutan(String(firstAvailable)); setFile(null)
  }

  function openAdd() {
    if (banners.length >= 5) {
      toast.error("Maksimal hanya boleh ada 5 banner")
      return
    }
    setEditingBanner(null); resetForm(); setShowModal(true)
  }

  function openEdit(b: Banner) {
    setEditingBanner(b)
    setUrutan(String(b.urutan)); setFile(null)
    setShowModal(true)
  }

  async function handleSubmit() {
    if (!editingBanner && !file) { toast.error("Gambar wajib diupload"); return }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append("urutan", urutan)
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

  async function handleLogoSubmit() {
    if (!logoFile) { toast.error("Gambar logo wajib diupload"); return }
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append("logo", logoFile)
      await settingService.uploadLogo(fd)
      toast.success("Logo berhasil diperbarui")
      setShowLogoModal(false)
      setLogoFile(null)
      await loadData()
      // Force reload layout or window to update logo in sidebar instantly
      window.location.reload()
    } catch (err: any) { toast.error(err.message || "Gagal menyimpan logo") }
    finally { setSubmitting(false) }
  }

  const columns = [
    { key: "gambar", label: "Preview", render: (b: Banner) => (
      <img src={getImageUrl(b.gambar)} alt="Banner" className="w-24 h-12 object-cover rounded-md border border-[#E5E7EB]" />
    )},
    { key: "urutan", label: "Urutan", render: (b: Banner) => b.urutan },
    { key: "action", label: "Aksi", render: (b: Banner) => (
      <div className="flex gap-1">
        <MButton variant="ghost" size="sm" onClick={() => openEdit(b)}><Pencil className="w-3.5 h-3.5" /></MButton>
        <MButton variant="ghost" size="sm" className="text-red-500" onClick={() => { setSelectedBanner(b); setShowDeleteModal(true) }}><Trash2 className="w-3.5 h-3.5" /></MButton>
      </div>
    )},
  ]

  return (
    <SidebarLayout navItems={adminNavItems} userName={currentUser?.nama ?? "Admin"} userRole={currentUser?.role ?? "Admin"}>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#0A0A0A]">Logo & Banner</h1>
      </div>

      <div className="flex items-center justify-between mb-4 mt-8">
        <h2 className="text-lg font-semibold text-[#0A0A0A]">Logo Toko</h2>
        <MButton onClick={() => setShowLogoModal(true)} variant="outline">
          <ImageIcon className="w-4 h-4 mr-2" />
          Ubah Logo
        </MButton>
      </div>

      <MCard padding="sm" className="mb-8 flex justify-center items-center py-8">
        {loading ? <MLoader text="Memuat logo..." /> : (
          logoUrl ? (
            <img src={getImageUrl(logoUrl)} alt="Logo" className="max-h-24 object-contain" />
          ) : (
            <div className="text-[#6B7280] flex flex-col items-center">
              <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
              <p>Belum ada logo khusus (Menggunakan teks MANOLA)</p>
            </div>
          )
        )}
      </MCard>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-[#0A0A0A]">Banner Halaman Depan</h2>
        <MButton onClick={openAdd}>+ Tambah Banner</MButton>
      </div>

      <MCard padding="sm">
        {loading ? <MLoader text="Memuat banner..." /> : <MTable columns={columns} data={banners} />}
      </MCard>

      {/* Add/Edit Modal */}
      <MModal isOpen={showModal} onClose={() => setShowModal(false)} title={editingBanner ? "Edit Banner" : "Tambah Banner"} maxWidth="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-1">Pilih Slide (1-5)</label>
            <select 
              value={urutan} 
              onChange={(e) => setUrutan(e.target.value)} 
              className="w-full text-sm border border-[#E5E7EB] rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#0A0A0A]"
            >
              {[1, 2, 3, 4, 5].map(num => {
                const isTaken = banners.some(b => Number(b.urutan) === num && b.id !== editingBanner?.id);
                return (
                  <option key={num} value={num} disabled={isTaken}>
                    Slide {num} {isTaken ? "(Sudah Terisi)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-1">Gambar Banner</label>
            {editingBanner && !file && (
              <img src={getImageUrl(editingBanner.gambar)} alt="" className="w-full h-32 object-cover rounded-lg mb-2 border" />
            )}
            {file && (
              <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-32 object-cover rounded-lg mb-2 border" />
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} 
              className="block w-full text-sm text-[#6B7280] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#0A0A0A] file:text-white hover:file:bg-[#262626] file:cursor-pointer cursor-pointer border border-[#E5E7EB] rounded-lg p-1" 
            />
          </div>

        </div>
        <div className="flex justify-end gap-3 mt-6">
          <MButton variant="secondary" onClick={() => setShowModal(false)}>Batal</MButton>
          <MButton onClick={handleSubmit} disabled={submitting}>{submitting ? "Menyimpan..." : "Simpan"}</MButton>
        </div>
      </MModal>

      {/* Upload Logo Modal */}
      <MModal isOpen={showLogoModal} onClose={() => setShowLogoModal(false)} title="Upload Logo" maxWidth="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-1">Pilih Gambar Logo</label>
            {logoFile && (
              <img src={URL.createObjectURL(logoFile)} alt="Preview" className="w-full h-32 object-contain rounded-lg mb-2 border p-2 bg-gray-50" />
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => e.target.files?.[0] && setLogoFile(e.target.files[0])} 
              className="block w-full text-sm text-[#6B7280] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#0A0A0A] file:text-white hover:file:bg-[#262626] file:cursor-pointer cursor-pointer border border-[#E5E7EB] rounded-lg p-1 mt-2" 
            />
            <p className="text-xs text-[#6B7280] mt-2">Gunakan gambar transparan (PNG) dengan aspek rasio memanjang atau kotak agar pas di navbar.</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <MButton variant="secondary" onClick={() => setShowLogoModal(false)}>Batal</MButton>
          <MButton onClick={handleLogoSubmit} disabled={submitting || !logoFile}>{submitting ? "Menyimpan..." : "Simpan Logo"}</MButton>
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
