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
      onChange({
        ...formData,
        productVariantId: "",
        supplierId: selectedProduct?.supplierId ? String(selectedProduct.supplierId) : ""
      })
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
                [{p.sku || "-"}] {p.name}
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

        {/* Jenis Penyesuaian */}
        <div>
          <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">Jenis Penyesuaian</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tipe"
                value="MASUK"
                checked={formData.tipe === "MASUK"}
                onChange={() => onChange({ ...formData, tipe: "MASUK", catatan: "" })}
                className="accent-black w-4 h-4"
              />
              <span className="text-sm">Barang Masuk (Restock)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tipe"
                value="KELUAR"
                checked={formData.tipe === "KELUAR"}
                onChange={() => onChange({ ...formData, tipe: "KELUAR" })}
                className="accent-black w-4 h-4"
              />
              <span className="text-sm">Barang Keluar (Koreksi)</span>
            </label>
          </div>
        </div>

        {/* Jumlah */}
        <div>
          <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
            {formData.tipe === "MASUK" ? "Jumlah Masuk" : "Jumlah Keluar"}
          </label>
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
            Supplier <span className="text-[#9CA3AF] font-normal">(otomatis terisi)</span>
          </label>
          <select
            value={formData.supplierId}
            disabled
            className="w-full h-10 border border-[#E5E7EB] rounded-md px-3 text-sm bg-gray-100 focus:outline-none cursor-not-allowed"
          >
            <option value="">-- Tidak ada supplier --</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Catatan (Hanya untuk Barang Keluar) */}
        {formData.tipe === "KELUAR" && (
          <div>
            <label className="block text-sm font-medium text-[#0A0A0A] mb-1.5">
              Catatan <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.catatan}
              onChange={(e) => onChange({ ...formData, catatan: e.target.value })}
              placeholder="Contoh: Barang rusak ketumpahan kopi"
              className="w-full h-10 border border-[#E5E7EB] rounded-md px-3 text-sm focus:outline-none focus:border-[#0A0A0A]"
            />
          </div>
        )}
      </div>
    </MModal>
  )
}