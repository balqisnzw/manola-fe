"use client"

import { useEffect, useState } from "react"
import { MModal } from "@/components/manola/MModal"
import { MButton } from "@/components/manola/MButton"
import { MLoader } from "@/components/manola/MLoader"
import type { RestockFormState } from "./types"
import type { Product, ProductVariant } from "@/lib/services/productService"
import type { Supplier } from "@/lib/services/supplierService"

interface AddRestockModalProps {
  isOpen: boolean
  onClose: () => void
  formData: RestockFormState
  onChange: (data: RestockFormState) => void
  products: Product[]
  suppliers: Supplier[]
  onSubmit: () => void
  submitting: boolean
}

export function AddRestockModal({
  isOpen,
  onClose,
  formData,
  onChange,
  products,
  suppliers,
  onSubmit,
  submitting }: AddRestockModalProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([])

  // Ketika produk dipilih, tampilkan variannya
  useEffect(() => {
    if (formData.productId) {
      const selectedProduct = products.find((p) => String(p.id) === formData.productId)
      setVariants(selectedProduct?.variants ?? [])
      onChange({ ...formData, productVariantId: "" })
    } else {
      setVariants([])
    }
  }, [formData.productId])

  return (
    <MModal
      isOpen={isOpen}
      onClose={onClose}
      title="Input Restock"
      maxWidth="md"
      footer={
        <>
          <MButton variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </MButton>
          <MButton variant="primary" onClick={onSubmit} disabled={submitting}>
            {submitting ? (
              <MLoader inline size="sm" text="Menyimpan..." />
            ) : (
              "Simpan Restock"
            )}
          </MButton>
        </>
      }
    >
      <div className="space-y-4">
        {/* Pilih Produk */}
        <div>
          <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">Produk</label>
          <select
            value={formData.productId}
            onChange={(e) => onChange({ ...formData, productId: e.target.value })}
            className="w-full h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-white focus:outline-none focus:border-[#0A0A0A]"
          >
            <option value="">Pilih produk...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Pilih Varian (muncul setelah produk dipilih) */}
        {variants.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">Varian</label>
            <select
              value={formData.productVariantId}
              onChange={(e) => onChange({ ...formData, productVariantId: e.target.value })}
              className="w-full h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-white focus:outline-none focus:border-[#0A0A0A]"
            >
              <option value="">Pilih varian...</option>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.size}{v.color ? ` — ${v.color}` : ""} (stok: {v.stock})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Jumlah Restock */}
        <div>
          <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">Jumlah Restock</label>
          <input
            type="number"
            min={1}
            value={formData.jumlah}
            onChange={(e) => onChange({ ...formData, jumlah: e.target.value })}
            placeholder="Contoh: 50"
            className="w-full h-10 border border-[#E5E7EB] rounded-md px-3 text-sm focus:outline-none focus:border-[#0A0A0A]"
          />
        </div>

        {/* Pilih Supplier */}
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
      </div>
    </MModal>
  )
}