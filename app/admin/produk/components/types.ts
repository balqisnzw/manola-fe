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
  name: string
  description: string
  price: string
  category: string
  supplierId: string
  variants: VariantRow[]
}

export const DEFAULT_FORM: ProductFormState = {
  name: "",
  description: "",
  price: "",
  category: "",
  supplierId: "",
  variants: [{ size: "M", color: "", stock: "" }],
}

// ─── Helper ──────────────────────────────────────────────────────────────────

/** Konversi baris-variant form ke payload API */
export function toVariantPayload(rows: VariantRow[]): CreateVariantPayload[] {
  return rows
    .filter((v) => v.size && v.stock)
    .map((v) => ({
      size: v.size,
      color: v.color || undefined,
      stock: parseInt(v.stock, 10),
    }))
}
