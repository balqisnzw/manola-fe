"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { orderService } from "@/lib/services"
import type { Order } from "@/lib/services/orderService"
import { MLoader } from "@/components/manola/MLoader"
import { MButton } from "@/components/manola/MButton"
import { ArrowLeft, Printer } from "lucide-react"

export default function CetakResiPage() {
  const params = useParams()
  const router = useRouter()
  const id = parseInt(params.id as string)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadOrder()
    }
  }, [id])

  async function loadOrder() {
    try {
      const data = await orderService.getById(id)
      setOrder(data)
    } catch (err) {
      console.error("Failed to load order:", err)
    } finally {
      setLoading(false)
    }
  }

  // Auto trigger print when loaded
  useEffect(() => {
    if (order) {
      const timer = setTimeout(() => {
        window.print()
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [order])

  if (loading) return <MLoader />
  if (!order) return <div className="p-8 text-center text-red-500">Pesanan tidak ditemukan</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 print:p-0 print:bg-white">
      {/* Back button and Print button, hidden on print */}
      <div className="max-w-xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <MButton variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </MButton>
        <MButton variant="primary" onClick={() => window.print()} className="flex items-center gap-2">
          <Printer className="w-4 h-4" /> Cetak Resi
        </MButton>
      </div>

      {/* Label Box */}
      <div className="max-w-xl mx-auto bg-white border-2 border-dashed border-gray-400 p-6 rounded-lg shadow-sm print:shadow-none print:border-solid print:border-black print:rounded-none">
        {/* Header */}
        <div className="border-b-2 border-black pb-4 mb-4 text-center">
          <h1 className="text-xl font-bold tracking-wider">MANOLA</h1>
          <p className="text-xs text-gray-500 print:text-black">Premium Apparel Store</p>
          <div className="mt-2 flex justify-between items-center text-xs font-mono">
            <span>ORDER ID: #{order.id}</span>
            <span>{new Date(order.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}</span>
          </div>
        </div>

        {/* Sender and Receiver */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-6 border-b border-gray-200 pb-4">
          <div>
            <p className="font-semibold text-gray-400 uppercase text-[10px] print:text-black">Pengirim</p>
            <p className="font-bold">MANOLA Store</p>
            <p className="text-xs text-gray-600 print:text-black">Kota Bandung, Jawa Barat</p>
            <p className="text-xs text-gray-600 print:text-black">Telp: 0812-3456-7890</p>
          </div>
          <div>
            <p className="font-semibold text-gray-400 uppercase text-[10px] print:text-black">Penerima</p>
            <p className="font-bold">{order.user?.nama || "Walk-in Customer"}</p>
            <p className="text-xs text-gray-600 print:text-black">{order.alamat_pengiriman || "Ambil di Toko (Offline)"}</p>
            <p className="text-xs text-gray-600 print:text-black mt-1">Jenis: {order.jenis}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-6">
          <p className="font-semibold text-gray-400 uppercase text-[10px] mb-2 print:text-black">Daftar Produk</p>
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-2 font-semibold">Nama Produk</th>
                <th className="py-2 font-semibold text-center">Qty</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-2">
                    <p className="font-medium">{item.variant?.product?.name}</p>
                    <p className="text-xs text-gray-500 print:text-black">
                      Ukuran: {item.variant?.size} {item.variant?.color ? ` · Warna: ${item.variant.color}` : ""}
                    </p>
                  </td>
                  <td className="py-2 text-center font-bold">×{item.jumlah}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Notes */}
        {order.catatan && (
          <div className="bg-gray-50 p-3 rounded text-xs border border-gray-100 print:bg-white print:border-black mb-4">
            <span className="font-semibold block mb-1">Catatan Pembeli:</span>
            {order.catatan}
          </div>
        )}

        <div className="text-center text-[10px] text-gray-400 print:text-black font-mono">
          Terima kasih telah berbelanja di MANOLA!
        </div>
      </div>
    </div>
  )
}
