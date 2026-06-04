"use client"

import { MModal } from "@/components/manola/MModal"
import { MButton } from "@/components/manola/MButton"
import { Trash2 } from "lucide-react"
import { MLoader } from "@/components/manola/MLoader"
import type { Product } from "@/lib/services/productService"

interface DeleteProductModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
  onConfirm: () => void
  submitting: boolean
}

export function DeleteProductModal({
  isOpen,
  onClose,
  product,
  onConfirm,
  submitting,
}: DeleteProductModalProps) {
  return (
    <MModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="xs"
      footer={
        <>
          <MButton variant="ghost" onClick={onClose} disabled={submitting}>
            Batal
          </MButton>
          <MButton variant="danger" onClick={onConfirm} disabled={submitting}>
            {submitting ? (
              <MLoader inline size="sm" text="Menghapus..." />
            ) : (
              "Hapus"
            )}
          </MButton>
        </>
      }
    >
      <div className="text-center py-4">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
        </div>
        <p className="text-[#0A0A0A] font-medium">Hapus Produk?</p>
        <p className="text-sm text-[#6B7280] mt-1">
          Produk <span className="font-semibold text-[#0A0A0A]">{product?.name}</span> akan dihapus secara permanen.
        </p>
        <p className="text-xs text-red-500 mt-2">Tindakan ini tidak dapat dibatalkan.</p>
      </div>
    </MModal>
  )
}
