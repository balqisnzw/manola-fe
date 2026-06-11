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
  MessageSquare, Settings, Pencil, Trash2, Tag, Image, FileText,
  FolderTree,
} from "lucide-react"
import { voucherService, type Voucher, type CreateVoucherPayload } from "@/lib/services/miscServices"
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

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

const DEFAULT_FORM: CreateVoucherPayload = {
  kode: "", nama: "", tipe_diskon: "PERSENTASE", nilai_diskon: 0,
  min_pembelian: undefined, max_diskon: undefined, kuota: 0,
  tanggal_mulai: "", tanggal_berakhir: "", aktif: true,
}

export default function AdminPromoPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null)
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const [form, setForm] = useState<CreateVoucherPayload>(DEFAULT_FORM)

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      setVouchers(await voucherService.getAll())
    } catch { toast.error("Gagal memuat data voucher") }
    finally { setLoading(false) }
  }

  function openAdd() {
    setEditingVoucher(null)
    setForm(DEFAULT_FORM)
    setShowModal(true)
  }

  function openEdit(v: Voucher) {
    setEditingVoucher(v)
    setForm({
      kode: v.kode, nama: v.nama, tipe_diskon: v.tipe_diskon, nilai_diskon: v.nilai_diskon,
      min_pembelian: v.min_pembelian ?? undefined, max_diskon: v.max_diskon ?? undefined,
      kuota: v.kuota, tanggal_mulai: v.tanggal_mulai.slice(0, 10),
      tanggal_berakhir: v.tanggal_berakhir.slice(0, 10), aktif: v.aktif,
    })
    setShowModal(true)
  }

  async function handleSubmit() {
    if (!form.kode || !form.nama || !form.tanggal_mulai || !form.tanggal_berakhir) {
      toast.error("Kode, nama, dan tanggal wajib diisi"); return
    }
    setSubmitting(true)
    try {
      if (editingVoucher) {
        await voucherService.update(editingVoucher.id, form)
        toast.success("Voucher berhasil diperbarui")
      } else {
        await voucherService.create(form)
        toast.success("Voucher berhasil dibuat")
      }
      setShowModal(false)
      await loadData()
    } catch (err: any) { toast.error(err.message || "Gagal menyimpan voucher") }
    finally { setSubmitting(false) }
  }

  async function handleDelete() {
    if (!selectedVoucher) return
    setSubmitting(true)
    try {
      await voucherService.delete(selectedVoucher.id)
      toast.success("Voucher berhasil dihapus")
      setShowDeleteModal(false)
      await loadData()
    } catch (err: any) { toast.error(err.message || "Gagal menghapus voucher") }
    finally { setSubmitting(false) }
  }

  const columns = [
    { key: "kode", label: "Kode", render: (v: Voucher) => <span className="font-mono font-semibold">{v.kode}</span> },
    { key: "nama", label: "Nama", render: (v: Voucher) => v.nama },
    { key: "diskon", label: "Diskon", render: (v: Voucher) => v.tipe_diskon === "PERSENTASE" ? `${v.nilai_diskon}%` : formatRupiah(v.nilai_diskon) },
    { key: "kuota", label: "Kuota", render: (v: Voucher) => `${v.terpakai}/${v.kuota || "∞"}` },
    { key: "periode", label: "Periode", render: (v: Voucher) => `${formatDate(v.tanggal_mulai)} - ${formatDate(v.tanggal_berakhir)}` },
    { key: "status", label: "Status", render: (v: Voucher) => {
      const now = new Date()
      const expired = now > new Date(v.tanggal_berakhir)
      if (!v.aktif) return <MBadge variant="gray">Nonaktif</MBadge>
      if (expired) return <MBadge variant="danger">Expired</MBadge>
      return <MBadge variant="success">Aktif</MBadge>
    }},
    { key: "action", label: "Aksi", render: (v: Voucher) => (
      <div className="flex gap-1">
        <MButton variant="ghost" size="sm" onClick={() => openEdit(v)}><Pencil className="w-3.5 h-3.5" /></MButton>
        <MButton variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => { setSelectedVoucher(v); setShowDeleteModal(true) }}><Trash2 className="w-3.5 h-3.5" /></MButton>
      </div>
    )},
  ]

  return (
    <SidebarLayout navItems={navItems} userName="Admin" userRole="Admin">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#0A0A0A]">Promo & Voucher</h1>
        <MButton onClick={openAdd}>+ Tambah Voucher</MButton>
      </div>

      <MCard padding="sm">
        {loading ? <MLoader text="Memuat voucher..." /> : <MTable columns={columns} data={vouchers} />}
      </MCard>

      {/* Add/Edit Modal */}
      <MModal isOpen={showModal} onClose={() => setShowModal(false)} title={editingVoucher ? "Edit Voucher" : "Tambah Voucher"} maxWidth="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <MInput label="Kode Voucher" value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value.toUpperCase() })} placeholder="PROMO2026" disabled={!!editingVoucher} />
            <MInput label="Nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Diskon Akhir Tahun" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0A0A0A] mb-1">Tipe Diskon</label>
              <select value={form.tipe_diskon} onChange={(e) => setForm({ ...form, tipe_diskon: e.target.value })} className="w-full h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-white">
                <option value="PERSENTASE">Persentase (%)</option>
                <option value="NOMINAL">Nominal (Rp)</option>
              </select>
            </div>
            <MInput label="Nilai Diskon" type="number" value={String(form.nilai_diskon)} onChange={(e) => setForm({ ...form, nilai_diskon: parseInt(e.target.value) || 0 })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <MInput label="Min. Pembelian (Rp)" type="number" value={String(form.min_pembelian ?? "")} onChange={(e) => setForm({ ...form, min_pembelian: parseInt(e.target.value) || undefined })} />
            <MInput label="Maks. Diskon (Rp)" type="number" value={String(form.max_diskon ?? "")} onChange={(e) => setForm({ ...form, max_diskon: parseInt(e.target.value) || undefined })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <MInput label="Kuota" type="number" value={String(form.kuota ?? 0)} onChange={(e) => setForm({ ...form, kuota: parseInt(e.target.value) || 0 })} />
            <MInput label="Tanggal Mulai" type="date" value={form.tanggal_mulai} onChange={(e) => setForm({ ...form, tanggal_mulai: e.target.value })} />
            <MInput label="Tanggal Berakhir" type="date" value={form.tanggal_berakhir} onChange={(e) => setForm({ ...form, tanggal_berakhir: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.aktif} onChange={(e) => setForm({ ...form, aktif: e.target.checked })} />
            Voucher aktif
          </label>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <MButton variant="secondary" onClick={() => setShowModal(false)}>Batal</MButton>
          <MButton onClick={handleSubmit} disabled={submitting}>{submitting ? "Menyimpan..." : "Simpan"}</MButton>
        </div>
      </MModal>

      {/* Delete Modal */}
      <MModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Hapus Voucher" maxWidth="sm">
        <p className="text-sm text-[#6B7280] mb-6">Yakin ingin menghapus voucher <strong>{selectedVoucher?.kode}</strong>?</p>
        <div className="flex justify-end gap-3">
          <MButton variant="secondary" onClick={() => setShowDeleteModal(false)}>Batal</MButton>
          <MButton className="bg-red-500 hover:bg-red-600" onClick={handleDelete} disabled={submitting}>{submitting ? "Menghapus..." : "Hapus"}</MButton>
        </div>
      </MModal>
    </SidebarLayout>
  )
}
