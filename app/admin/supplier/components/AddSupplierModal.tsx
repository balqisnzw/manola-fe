"use client"

import { MModal } from "@/components/manola/MModal"
import { MButton } from "@/components/manola/MButton"
import { MInput } from "@/components/manola/MInput"
import { Loader2 } from "lucide-react"
import type { SupplierFormState } from "./types"

interface AddSupplierModalProps {
  isOpen: boolean
  onClose: () => void
  formData: SupplierFormState
  onChange: (data: SupplierFormState) => void
  onSubmit: () => void
  submitting: boolean
}

export function AddSupplierModal({
  isOpen,
  onClose,
  formData,
  onChange,
  onSubmit,
  submitting,
}: AddSupplierModalProps) {
  return (
    <MModal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Supplier"
      maxWidth="md"
      footer={
        <>
          <MButton variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </MButton>
          <MButton variant="primary" onClick={onSubmit} disabled={submitting}>
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-1 inline" />Menyimpan...</>
            ) : (
              "Simpan Supplier"
            )}
          </MButton>
        </>
      }
    >
      <div className="space-y-4">
        <MInput
          label="Nama Supplier"
          value={formData.nama}
          onChange={(e) => onChange({ ...formData, nama: e.target.value })}
          placeholder="Contoh: PT Tekstil Jaya"
        />
        <MInput
          label="Nomor Telepon"
          value={formData.no_telepon}
          onChange={(e) => onChange({ ...formData, no_telepon: e.target.value })}
          placeholder="Contoh: 021-5551234"
        />
        <div>
          <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
            Alamat <span className="text-[#9CA3AF] font-normal">(opsional)</span>
          </label>
          <textarea
            rows={3}
            value={formData.alamat}
            onChange={(e) => onChange({ ...formData, alamat: e.target.value })}
            placeholder="Alamat lengkap supplier"
            className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-sm focus:border-[#0A0A0A] focus:outline-none resize-none"
          />
        </div>
      </div>
    </MModal>
  )
}
