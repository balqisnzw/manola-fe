"use client"

import { useRef } from "react"
import { MModal } from "@/components/manola/MModal"
import { MButton } from "@/components/manola/MButton"
import { MInput } from "@/components/manola/MInput"
import { Upload, X } from "lucide-react"
import { MLoader } from "@/components/manola/MLoader"
import { SIZES, type ProductFormState, type VariantRow } from "./types"
import { getImageUrl } from "@/lib/utils"
import type { Product } from "@/lib/services/productService"
import type { Supplier } from "@/lib/services/supplierService"
import type { Category } from "@/lib/services/miscServices"

interface EditProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  formData: ProductFormState
  onChange: (data: ProductFormState) => void
  photos: File[]
  onPhotosChange: (files: File[]) => void
  onSubmit: () => void
  submitting: boolean
  suppliers: Supplier[]
  categories: Category[]
}

export function EditProductModal({
  isOpen,
  onClose,
  product,
  formData,
  onChange,
  photos,
  onPhotosChange,
  onSubmit,
  submitting,
  suppliers,
  categories,
}: EditProductModalProps) {
  const photoInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      onPhotosChange([...photos, ...newFiles].slice(0, 5))
    }
  }

  const addVariantRow = () =>
    onChange({ ...formData, variants: [...formData.variants, { size: "M", color: "", stock: "" }] })

  const removeVariantRow = (index: number) =>
    onChange({ ...formData, variants: formData.variants.filter((_, i) => i !== index) })

  const updateVariantRow = (index: number, field: keyof VariantRow, value: string) => {
    const updated = [...formData.variants]
    updated[index] = { ...updated[index], [field]: value }
    onChange({ ...formData, variants: updated })
  }

  return (
    <MModal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Produk"
      maxWidth="2xl"
      footer={
        <>
          <MButton variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </MButton>
          <MButton variant="primary" onClick={onSubmit} disabled={submitting}>
            {submitting ? (
              <MLoader inline size="sm" text="Menyimpan..." />
            ) : (
              "Simpan Perubahan"
            )}
          </MButton>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kolom Kiri — Foto */}
        <div>
          <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Foto Produk</label>
          <div
            className="border-2 border-dashed border-[#E5E7EB] rounded-lg h-48 flex flex-col items-center justify-center cursor-pointer hover:border-[#0A0A0A] transition"
            onClick={() => photoInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-[#6B7280] mb-2" />
            <p className="text-sm text-[#6B7280]">Klik untuk mengganti foto</p>
            <p className="text-xs text-[#9CA3AF]">PNG, JPG maks 5MB</p>
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoChange}
          />

          {/* Preview foto baru yang dipilih */}
          {photos.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {photos.map((file, i) => (
                <div key={i} className="relative w-14 h-14">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`foto-${i}`}
                    className="w-14 h-14 object-cover rounded-md"
                  />
                  <button
                    className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow text-red-500"
                    onClick={() => onPhotosChange(photos.filter((_, idx) => idx !== i))}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Preview foto lama dari server jika belum ada foto baru */}
          {photos.length === 0 && product && product.images.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {product.images.map((img) => (
                <img
                  key={img.id}
                  src={getImageUrl(img.url)}
                  alt="foto produk"
                  className="w-14 h-14 object-cover rounded-md border"
                />
              ))}
            </div>
          )}
        </div>

        {/* Kolom Kanan — Form */}
        <div className="space-y-4">
          <MInput
            label="Nama Produk"
            value={formData.name}
            onChange={(e) => onChange({ ...formData, name: e.target.value })}
            placeholder="Contoh: Kaos Oversize"
          />

          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">Deskripsi</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => onChange({ ...formData, description: e.target.value })}
              className="w-full border border-[#E5E7EB] rounded-md px-3 py-2 text-sm focus:border-[#0A0A0A] focus:outline-none"
              placeholder="Deskripsi produk (opsional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">Harga</label>
            <div className="flex items-center border border-[#E5E7EB] rounded-md">
              <span className="px-3 text-[#6B7280] text-sm">Rp</span>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => onChange({ ...formData, price: e.target.value })}
                placeholder="0"
                min={0}
                className="flex-1 h-10 px-2 text-sm focus:outline-none"
              />
            </div>
          </div>

          {/* Kategori — dropdown */}
          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">Kategori</label>
            <select
              value={formData.categoryId}
              onChange={(e) => {
                const catId = e.target.value
                const catName = categories.find((c) => c.id === parseInt(catId))?.nama || ""
                onChange({ ...formData, categoryId: catId, category: catName })
              }}
              className="w-full h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-white focus:outline-none focus:border-[#0A0A0A]"
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
              Supplier <span className="text-[#9CA3AF] font-normal">(opsional)</span>
            </label>
            <select
              value={formData.supplierId}
              onChange={(e) => onChange({ ...formData, supplierId: e.target.value })}
              className="w-full h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-white focus:outline-none focus:border-[#0A0A0A]"
            >
              <option value="">-- Pilih Supplier --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Baris Variant */}
          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-2">Variasi Produk</label>
            <div className="space-y-2">
              {formData.variants.map((variant, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={variant.size}
                    onChange={(e) => updateVariantRow(index, "size", e.target.value)}
                    className="w-20 h-8 border border-[#E5E7EB] rounded-md px-2 text-sm bg-white"
                  >
                    {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input
                    placeholder="Warna"
                    value={variant.color}
                    onChange={(e) => updateVariantRow(index, "color", e.target.value)}
                    className="flex-1 h-8 border border-[#E5E7EB] rounded-md px-2 text-sm"
                  />
                  <input
                    placeholder="Stok"
                    type="number"
                    value={variant.stock}
                    onChange={(e) => updateVariantRow(index, "stock", e.target.value)}
                    min={0}
                    className="w-16 h-8 border border-[#E5E7EB] rounded-md px-2 text-sm"
                  />
                  {formData.variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariantRow(index)}
                      className="p-1 text-[#6B7280] hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <MButton variant="ghost" size="sm" onClick={addVariantRow} className="mt-2">
              + Tambah Variant
            </MButton>
          </div>
        </div>
      </div>
    </MModal>
  )
}
