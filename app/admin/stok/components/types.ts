export interface RestockFormState {
  productId: string
  productVariantId: string
  jumlah: string
  supplierId: string
}

export const EMPTY_RESTOCK_FORM: RestockFormState = {
  productId: "",
  productVariantId: "",
  jumlah: "",
  supplierId: "",
}