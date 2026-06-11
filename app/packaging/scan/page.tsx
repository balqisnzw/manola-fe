"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { orderService } from "@/lib/services"
import type { Order } from "@/lib/services/orderService"
import { MLoader } from "@/components/manola/MLoader"
import { MButton } from "@/components/manola/MButton"
import { MInput } from "@/components/manola/MInput"
import { NavbarLayout } from "@/components/layouts/NavbarLayout"
import { LogoutButton } from "@/components/auth/LogoutButton"
import { toast } from "sonner"
import { Check, AlertTriangle, Scan, Play, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

const navItems = [
  { label: "Pesanan", href: "/packaging/pesanan" },
]

interface ScanHistoryItem {
  timestamp: Date;
  variantId: string;
  name: string;
  status: "success" | "error";
  message: string;
}

export default function QCScanPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [selectedOrderId, setSelectedOrderId] = useState<number | "">("")
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  
  // Scan quantities maps variantId (number) -> count (number)
  const [scannedQtys, setScannedQtys] = useState<Record<number, number>>({})
  const [scanInput, setScanInput] = useState("")
  const [resiInput, setResiInput] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [scanHistory, setScanHistory] = useState<ScanHistoryItem[]>([])
  
  const scanInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadActiveOrders()
  }, [])

  useEffect(() => {
    if (selectedOrderId) {
      const ord = orders.find(o => o.id === selectedOrderId)
      if (ord) {
        setCurrentOrder(ord)
        // Reset scanned quantities
        const initialQtys: Record<number, number> = {}
        ord.items.forEach(item => {
          initialQtys[item.productVariantId] = 0
        })
        setScannedQtys(initialQtys)
        setScanHistory([])
        setResiInput("")
        // Focus the scanner input
        setTimeout(() => {
          scanInputRef.current?.focus()
        }, 300)
      }
    } else {
      setCurrentOrder(null)
      setScannedQtys({})
      setScanHistory([])
    }
  }, [selectedOrderId, orders])

  async function loadActiveOrders() {
    setLoadingOrders(true)
    try {
      const data = await orderService.getAll()
      // Filter orders needing packing
      const active = data.filter(o => o.status === "DIPROSES" || o.status === "DIKEMAS")
      setOrders(active)
    } catch (err) {
      console.error("Failed to load orders:", err)
      toast.error("Gagal memuat daftar pesanan aktif")
    } finally {
      setLoadingOrders(false)
    }
  }

  // Play audio beep sound using Web Audio API
  const playBeep = (type: "success" | "error") => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)

      if (type === "success") {
        osc.type = "sine"
        osc.frequency.setValueAtTime(800, ctx.currentTime)
        gain.gain.setValueAtTime(0.08, ctx.currentTime)
        osc.start()
        osc.stop(ctx.currentTime + 0.1)
      } else {
        osc.type = "sawtooth"
        osc.frequency.setValueAtTime(150, ctx.currentTime)
        gain.gain.setValueAtTime(0.15, ctx.currentTime)
        osc.start()
        osc.stop(ctx.currentTime + 0.25)
      }
    } catch (e) {
      console.error("Audio error", e)
    }
  }

  const handleScanSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!scanInput.trim() || !currentOrder) return

    const scannedIdStr = scanInput.trim()
    const scannedVariantId = parseInt(scannedIdStr)
    setScanInput("")

    // Check if variant exists in current order items
    const orderItem = currentOrder.items.find(item => item.productVariantId === scannedVariantId)

    if (!orderItem) {
      playBeep("error")
      setScanHistory(prev => [
        {
          timestamp: new Date(),
          variantId: scannedIdStr,
          name: "Item Mismatch",
          status: "error",
          message: "Kode Varian tidak termasuk dalam pesanan ini!",
        },
        ...prev
      ])
      toast.error(`Error: Varian #${scannedIdStr} tidak cocok dengan pesanan ini!`)
      return
    }

    const currentQty = scannedQtys[scannedVariantId] || 0
    if (currentQty >= orderItem.jumlah) {
      playBeep("error")
      setScanHistory(prev => [
        {
          timestamp: new Date(),
          variantId: scannedIdStr,
          name: orderItem.variant?.product?.name || "Produk",
          status: "error",
          message: "Jumlah scan melebihi jumlah yang dipesan!",
        },
        ...prev
      ])
      toast.error(`Error: Scan untuk varian #${scannedIdStr} sudah penuh!`)
      return
    }

    // Success scan
    playBeep("success")
    setScannedQtys(prev => ({
      ...prev,
      [scannedVariantId]: currentQty + 1
    }))
    
    setScanHistory(prev => [
      {
        timestamp: new Date(),
        variantId: scannedIdStr,
        name: `${orderItem.variant?.product?.name} (${orderItem.variant?.size})`,
        status: "success",
        message: "Item berhasil diverifikasi.",
      },
      ...prev
    ])
    toast.success(`Verified: ${orderItem.variant?.product?.name} (${orderItem.variant?.size})`)
  }

  // Check if all items are scanned
  const isQCComplete = () => {
    if (!currentOrder) return false
    return currentOrder.items.every(item => scannedQtys[item.productVariantId] === item.jumlah)
  }

  const handleFinishQC = async () => {
    if (!currentOrder) return
    if (!isQCComplete()) {
      toast.error("QC belum selesai. Semua item harus di-scan terlebih dahulu!")
      return
    }
    if (currentOrder.jenis === "ONLINE" && !resiInput.trim()) {
      toast.error("Pesanan online wajib memasukkan nomor resi sebelum dikirim!")
      return
    }

    setSubmitting(true)
    try {
      const newStatus = currentOrder.jenis === "ONLINE" ? "DIKIRIM" : "SELESAI"
      const extraPayload = currentOrder.jenis === "ONLINE" ? { resi: resiInput } : undefined
      
      await orderService.updateStatus(currentOrder.id, newStatus, extraPayload)
      toast.success(`Pesanan #${currentOrder.id} berhasil diproses dengan status: ${newStatus}`)
      
      // Remove completed order from lists
      setOrders(prev => prev.filter(o => o.id !== currentOrder.id))
      setSelectedOrderId("")
      setCurrentOrder(null)
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui status pesanan")
    } finally {
      setSubmitting(false)
    }
  }

  const rightContent = (
    <div className="flex items-center gap-4">
      <Link href="/packaging/pesanan" className="text-sm font-semibold text-gray-700 hover:text-black transition">
        Kembali ke Pesanan
      </Link>
      <LogoutButton />
    </div>
  )

  return (
    <NavbarLayout navItems={navItems} rightContent={rightContent}>
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        {/* Back navigation link */}
        <div className="mb-4">
          <Link href="/packaging/pesanan" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Halaman Pesanan
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left panel: Order selection and Scanner */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h1 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Scan className="w-5 h-5 text-gray-500" /> Quality Control (Scan QC)
              </h1>

              {/* Order Select */}
              <div className="space-y-2 mb-6">
                <label className="text-xs font-semibold text-gray-700 block">Pilih Nomor Pesanan untuk QC</label>
                {loadingOrders ? (
                  <MLoader inline size="sm" />
                ) : (
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value ? parseInt(e.target.value) : "")}
                    className="w-full h-11 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0A0A0A] focus:border-transparent transition"
                  >
                    <option value="">-- Pilih Pesanan (DIPROSES / DIKEMAS) --</option>
                    {orders.map((ord) => (
                      <option key={ord.id} value={ord.id}>
                        Pesanan #{ord.id} - {ord.user?.nama || "Walk-in"} ({ord.jenis}) - {ord.items.length} item
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Scanner Emulation Box */}
              {currentOrder ? (
                <form onSubmit={handleScanSubmit} className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Laci Scanner</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse"></span> Scanner Siap
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <MInput
                        ref={scanInputRef}
                        placeholder="Scan Barcode / Ketik Variant ID (contoh: 1, 2, dll)"
                        value={scanInput}
                        onChange={(e) => setScanInput(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <MButton type="submit" variant="primary">
                      Scan
                    </MButton>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Tips: Klik input box di atas agar terfokus, lalu gunakan barcode scanner fisik Anda atau ketik ID Varian secara manual dan tekan Enter.
                  </p>
                </form>
              ) : (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                  <Scan className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium">Silakan pilih pesanan terlebih dahulu untuk memulai verifikasi QC</p>
                </div>
              )}
            </div>

            {/* Checklist items table */}
            {currentOrder && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-bold text-gray-900">Checklist Verifikasi Item</h2>
                  <span className="text-xs font-semibold text-gray-500 font-mono">
                    #{currentOrder.id} ({currentOrder.jenis})
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                        <th className="py-2.5">Variant ID</th>
                        <th className="py-2.5">Nama Produk</th>
                        <th className="py-2.5 text-center">Ukuran / Warna</th>
                        <th className="py-2.5 text-center">Qty Dipesan</th>
                        <th className="py-2.5 text-center">Qty Ter-scan</th>
                        <th className="py-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentOrder.items.map((item) => {
                        const scanned = scannedQtys[item.productVariantId] || 0
                        const isMatch = scanned === item.jumlah
                        return (
                          <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                            <td className="py-3 font-mono text-xs text-gray-500">{item.productVariantId}</td>
                            <td className="py-3 font-medium text-gray-900">{item.variant?.product?.name}</td>
                            <td className="py-3 text-center text-gray-600">
                              {item.variant?.size} {item.variant?.color ? ` / ${item.variant.color}` : ""}
                            </td>
                            <td className="py-3 text-center font-bold text-gray-700">{item.jumlah}</td>
                            <td className={`py-3 text-center font-bold ${isMatch ? "text-green-600" : "text-amber-500"}`}>
                              {scanned}
                            </td>
                            <td className="py-3 text-right">
                              {isMatch ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                                  <Check className="w-3.5 h-3.5" /> Cocok
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-500">
                                  Belum Selesai
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Confirm Completion Box */}
                {isQCComplete() && (
                  <div className="mt-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-bold">Verifikasi QC Berhasil!</p>
                        <p className="text-xs text-green-700">Semua item telah ter-scan dengan benar dan jumlahnya sesuai dengan pesanan.</p>
                      </div>
                    </div>

                    {currentOrder.jenis === "ONLINE" && (
                      <div className="bg-white p-3 rounded-lg border border-green-100 space-y-2">
                        <label className="text-xs font-semibold text-gray-700 block">Masukkan Nomor Resi Kurir *</label>
                        <input
                          type="text"
                          required
                          placeholder="Masukkan No. Resi (contoh: JP812377189)"
                          value={resiInput}
                          onChange={(e) => setResiInput(e.target.value)}
                          className="w-full h-10 px-3 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-black transition"
                        />
                      </div>
                    )}

                    <MButton
                      variant="primary"
                      fullWidth
                      disabled={submitting || (currentOrder.jenis === "ONLINE" && !resiInput.trim())}
                      onClick={handleFinishQC}
                    >
                      {submitting ? (
                        <MLoader inline size="sm" text="Menyimpan..." />
                      ) : (
                        currentOrder.jenis === "ONLINE"
                          ? "Selesaikan QC & Tandai Dikirim (Kurir)"
                          : "Selesaikan QC & Selesaikan Pesanan"
                      )}
                    </MButton>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right panel: Live Scan History Log */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm min-h-[400px] flex flex-col">
              <h2 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Log Histori Scan (Live)
              </h2>

              <div className="flex-1 overflow-y-auto space-y-3 max-h-[500px] pr-2">
                {scanHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                    <Scan className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-xs">Scan item untuk merekam log</p>
                  </div>
                ) : (
                  scanHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border text-xs space-y-1 transition-all ${
                        item.status === "success"
                          ? "bg-green-50/50 border-green-100 text-green-900"
                          : "bg-red-50/50 border-red-100 text-red-900"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold uppercase font-mono">
                          VARIANT ID: #{item.variantId}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {item.timestamp.toLocaleTimeString("id-ID")}
                        </span>
                      </div>
                      <p className="font-bold truncate">{item.name}</p>
                      <p className="text-[11px] opacity-75">{item.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </NavbarLayout>
  )
}
