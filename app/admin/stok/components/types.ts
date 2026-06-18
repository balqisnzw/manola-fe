export interface RestockFormState {
  productId: string
  productVariantId: string
  jumlah: string | number
  tipe: "MASUK" | "KELUAR"
  catatan: string
  supplierId: string
}

export const EMPTY_RESTOCK_FORM: RestockFormState = {
  productId: "",
  productVariantId: "",
  jumlah: "",
  tipe: "MASUK",
  catatan: "",
  supplierId: "",
}