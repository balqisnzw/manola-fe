import type { CreateVariantPayload } from "@/lib/services/productService"

// ─── Shared constants ────────────────────────────────────────────────────────

export const SIZES = ["S", "M", "L", "XL", "XXL"]

// ─── Shared types ────────────────────────────────────────────────────────────

/** Satu baris variant di dalam form (string agar mudah di-bind ke input) */
export interface VariantRow {
  size: string
  color: string
  stock: string
}

/** State lengkap form tambah / edit produk */
export interface ProductFormState {
  sku: string
  name: string
  description: string
  price: string
  promoPrice: string
  category: string
  categoryId: string
  supplierId: string
  variants: VariantRow[]
  descriptionImage?: File | null
  removeDescriptionImage?: boolean
  removeImageIds?: number[]
}

export const DEFAULT_FORM: ProductFormState = {
  sku: "",
  name: "",
  description: "",
  price: "",
  promoPrice: "",
  category: "",
  categoryId: "",
  supplierId: "",
  variants: [{ size: "", color: "", stock: "" }],
  descriptionImage: null,
  removeDescriptionImage: false,
  removeImageIds: [],
}

// ─── Helper ──────────────────────────────────────────────────────────────────

/** Konversi baris-variant form ke payload API */
export function toVariantPayload(rows: VariantRow[]): CreateVariantPayload[] {
  return rows
    .filter((v) => v.stock)
    .map((v) => ({
      size: v.size || "-",
      color: v.color || undefined,
      stock: parseInt(v.stock, 10),
    }))
}
