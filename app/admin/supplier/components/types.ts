import type { CreateSupplierPayload } from "@/lib/services/supplierService"

// ─── Shared form state ────────────────────────────────────────────────────────

export interface SupplierFormState {
  nama: string
  no_telepon: string
  alamat: string
}

export const DEFAULT_SUPPLIER_FORM: SupplierFormState = {
  nama: "",
  no_telepon: "",
  alamat: "",
}

// ─── Helper ───────────────────────────────────────────────────────────────────

/** Konversi form state ke payload API */
export function toSupplierPayload(form: SupplierFormState): CreateSupplierPayload {
  return {
    nama: form.nama,
    no_telepon: form.no_telepon,
    alamat: form.alamat || undefined,
  }
}
