"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { shiftService, authService } from "@/lib/services"
import type { CashierShift, PettyCash } from "@/lib/services/miscServices"
import { MLoader } from "@/components/manola/MLoader"
import { MButton } from "@/components/manola/MButton"
import { MInput } from "@/components/manola/MInput"
import { MModal } from "@/components/manola/MModal"
import { NavbarLayout } from "@/components/layouts/NavbarLayout"
import { LogoutButton } from "@/components/auth/LogoutButton"
import { toast } from "sonner"
import { Wallet, LogOut, ArrowLeftRight, TrendingDown, ClipboardList, Info, HelpCircle } from "lucide-react"
import Link from "next/link"

const navItems = [
  { label: "Transaksi", href: "/kasir/transaksi" },
  { label: "Riwayat", href: "/kasir/riwayat" },
]

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`
}

export default function KasirShiftPage() {
  const router = useRouter()
  const user = authService.getCurrentUser()
  const isManagement = user?.role === "ADMIN" || user?.role === "OWNER"

  const [activeTab, setActiveTab] = useState<"current" | "history">("current")
  const [activeShift, setActiveShift] = useState<CashierShift | null>(null)
  const [loadingActive, setLoadingActive] = useState(true)
  
  // Shift History
  const [shifts, setShifts] = useState<CashierShift[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  // Petty Cash Modal
  const [showPettyModal, setShowPettyModal] = useState(false)
  const [pettyJumlah, setPettyJumlah] = useState("")
  const [pettyKeterangan, setPettyKeterangan] = useState("")
  const [pettySubmitting, setPettySubmitting] = useState(false)

  // Close Shift Modal
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [closeModalAkhir, setCloseModalAkhir] = useState("")
  const [closeCatatan, setCloseCatatan] = useState("")
  const [closeSubmitting, setCloseSubmitting] = useState(false)

  useEffect(() => {
    loadActiveShift()
    if (isManagement) {
      loadShiftHistory()
    }
  }, [])

  async function loadActiveShift() {
    setLoadingActive(true)
    try {
      const shift = await shiftService.getActive()
      setActiveShift(shift)
    } catch (err) {
      console.error("Failed to load active shift:", err)
      toast.error("Gagal memuat shift aktif")
    } finally {
      setLoadingActive(false)
    }
  }

  async function loadShiftHistory() {
    setLoadingHistory(true)
    try {
      const data = await shiftService.getAll()
      // Hanya tampilkan shift milik kasir ini sendiri jika bukan admin/owner
      const filteredData = isManagement ? data : data.filter((s) => s.kasirId === user?.id)
      setShifts(filteredData)
    } catch (err) {
      console.error("Failed to load shift history:", err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleAddPettyCash = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeShift) return
    if (!pettyJumlah || !pettyKeterangan) {
      toast.error("Jumlah dan Keterangan wajib diisi")
      return
    }

    setPettySubmitting(true)
    try {
      await shiftService.addPettyCash(
        activeShift.id,
        parseInt(pettyJumlah),
        pettyKeterangan
      )
      toast.success("Pengeluaran petty cash berhasil dicatat")
      setShowPettyModal(false)
      setPettyJumlah("")
      setPettyKeterangan("")
      loadActiveShift()
    } catch (err: any) {
      toast.error(err.message || "Gagal menambah petty cash")
    } finally {
      setPettySubmitting(false)
    }
  }

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeShift) return
    if (!closeModalAkhir) {
      toast.error("Modal akhir wajib diisi")
      return
    }

    setCloseSubmitting(true)
    try {
      await shiftService.close(
        activeShift.id,
        parseInt(closeModalAkhir),
        closeCatatan
      )
      toast.success("Shift kasir berhasil ditutup")
      setShowCloseModal(false)
      setCloseModalAkhir("")
      setCloseCatatan("")
      setActiveShift(null)
      // Redirect to transaction page which will show shift guard overlay
      router.push("/kasir/transaksi")
    } catch (err: any) {
      toast.error(err.message || "Gagal menutup shift")
    } finally {
      setCloseSubmitting(false)
    }
  }

  // Calculate expected cash balance
  const getExpectedCash = () => {
    if (!activeShift) return 0
    return activeShift.modal_awal + activeShift.total_cash - activeShift.pengeluaran
  }

  const rightContent = (
    <div className="flex items-center gap-4">
      <Link href="/kasir/transaksi" className="text-sm font-semibold text-gray-700 hover:text-black transition">
        Kembali ke Transaksi
      </Link>
      <LogoutButton />
    </div>
  )

  return (
    <NavbarLayout navItems={navItems} rightContent={rightContent}>
      <div className="p-4 sm:p-8 max-w-6xl mx-auto">
        
        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manajemen Shift & Petty Cash</h1>

        {/* Tab Controls */}
        <div className="flex gap-6 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("current")}
              className={`pb-3 text-sm font-medium transition ${
                activeTab === "current"
                  ? "border-b-2 border-[#0A0A0A] text-[#0A0A0A]"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Shift Saat Ini
            </button>
            <button
              onClick={() => {
                setActiveTab("history")
                loadShiftHistory()
              }}
              className={`pb-3 text-sm font-medium transition ${
                activeTab === "history"
                  ? "border-b-2 border-[#0A0A0A] text-[#0A0A0A]"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Riwayat Shift (Audit)
            </button>
          </div>

        {activeTab === "current" ? (
          <div>
            {loadingActive ? (
              <MLoader />
            ) : activeShift ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Shift Info and Balances */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">JUMLAH UANG FISIK</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{formatRupiah(getExpectedCash())}</p>
                        </div>
                        <div className="p-2.5 bg-green-50 text-green-600 rounded-lg">
                          <Wallet className="w-5 h-5" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-3">Modal Awal + Omset Tunai - Pengeluaran</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pengeluaran Petty Cash</p>
                          <p className="text-2xl font-bold text-gray-900 mt-1">{formatRupiah(activeShift.pengeluaran)}</p>
                        </div>
                        <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
                          <TrendingDown className="w-5 h-5" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-3">Total kas keluar untuk operasional toko</p>
                    </div>
                  </div>

                  {/* Summary Details */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
                    <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100 uppercase tracking-wider">Rincian Saldo Shift</h2>
                    
                    <div className="grid grid-cols-2 gap-y-3.5 text-sm">
                      <span className="text-gray-500">Nama Kasir</span>
                      <span className="font-semibold text-gray-900 text-right">{user?.nama || "Kasir"}</span>

                      <span className="text-gray-500">Mulai Shift</span>
                      <span className="font-semibold text-gray-900 text-right">
                        {new Date(activeShift.mulai).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>

                      <span className="text-gray-500">Modal Awal (Laci Awal)</span>
                      <span className="font-semibold text-gray-900 text-right">{formatRupiah(activeShift.modal_awal)}</span>

                      <span className="text-gray-500">Total Pembayaran Tunai (CASH)</span>
                      <span className="font-semibold text-green-600 text-right">+ {formatRupiah(activeShift.total_cash)}</span>

                      <span className="text-gray-500">Total Pembayaran Non-Tunai (QRIS)</span>
                      <span className="font-semibold text-blue-600 text-right">+ {formatRupiah(activeShift.total_qris)}</span>

                      <span className="text-gray-500">Pengeluaran Toko</span>
                      <span className="font-semibold text-red-600 text-right">- {formatRupiah(activeShift.pengeluaran)}</span>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <MButton variant="secondary" className="flex-1" onClick={() => setShowPettyModal(true)}>
                        Catat Petty Cash Keluar
                      </MButton>
                      <MButton variant="primary" className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => setShowCloseModal(true)}>
                        Tutup Shift Kasir
                      </MButton>
                    </div>
                  </div>
                </div>

                {/* Petty Cash Log List */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-full flex flex-col">
                  <h2 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100 uppercase tracking-wider mb-4">Log Petty Cash Shift Ini</h2>
                  <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px]">
                    {!activeShift.expenses || activeShift.expenses.length === 0 ? (
                      <div className="text-center py-12 text-gray-400">
                        <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">Belum ada pengeluaran dicatat</p>
                      </div>
                    ) : (
                      activeShift.expenses.map((exp: PettyCash) => (
                        <div key={exp.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-start text-xs">
                          <div>
                            <p className="font-semibold text-gray-800">{exp.keterangan}</p>
                            <p className="text-gray-400 mt-0.5">
                              {new Date(exp.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <span className="font-bold text-red-600">{formatRupiah(exp.jumlah)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-gray-200 rounded-xl shadow-sm">
                <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Shift Belum Dibuka</h2>
                <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">Silakan buka halaman transaksi untuk membuka shift baru dan mengisi modal kas awal.</p>
                <Link href="/kasir/transaksi">
                  <MButton variant="primary">Buka Halaman Transaksi</MButton>
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Shift History for OWNER/ADMIN */
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {loadingHistory ? (
              <MLoader />
            ) : shifts.length === 0 ? (
              <div className="text-center py-12 text-gray-500">Tidak ada riwayat shift kasir ditemukan</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                      <th className="py-3 px-4">Kasir</th>
                      <th className="py-3 px-4">Waktu Mulai - Selesai</th>
                      <th className="py-3 px-4 text-right">Modal Awal</th>
                      <th className="py-3 px-4 text-right">CASH Omset</th>
                      <th className="py-3 px-4 text-right">QRIS Omset</th>
                      <th className="py-3 px-4 text-right">Pengeluaran</th>
                      <th className="py-3 px-4 text-right">Ekspektasi Uang</th>
                      <th className="py-3 px-4 text-right">Uang Aktual</th>
                      <th className="py-3 px-4 text-center">Selisih</th>
                      <th className="py-3 px-4">Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.map((sh) => {
                      const expected = sh.modal_awal + sh.total_cash - sh.pengeluaran
                      const actual = sh.modal_akhir !== null ? sh.modal_akhir : expected
                      const difference = sh.modal_akhir !== null ? sh.modal_akhir - expected : 0
                      const isClosed = sh.selesai !== null

                      return (
                        <tr key={sh.id} className="border-b border-gray-100 hover:bg-gray-50/50">
                          <td className="py-3.5 px-4 font-medium text-gray-900">{sh.kasir?.nama || "Kasir"}</td>
                          <td className="py-3.5 px-4 text-xs text-gray-600">
                            <div>
                              M: {new Date(sh.mulai).toLocaleDateString("id-ID")} {new Date(sh.mulai).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {isClosed ? (
                              <div>
                                S: {new Date(sh.selesai!).toLocaleDateString("id-ID")} {new Date(sh.selesai!).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            ) : (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-green-100 text-green-800 text-[10px] font-bold mt-0.5">AKTIF</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-xs">{formatRupiah(sh.modal_awal)}</td>
                          <td className="py-3.5 px-4 text-right font-mono text-xs text-green-600">+{formatRupiah(sh.total_cash)}</td>
                          <td className="py-3.5 px-4 text-right font-mono text-xs text-blue-600">+{formatRupiah(sh.total_qris)}</td>
                          <td className="py-3.5 px-4 text-right font-mono text-xs text-red-600">-{formatRupiah(sh.pengeluaran)}</td>
                          <td className="py-3.5 px-4 text-right font-mono text-xs font-semibold">{formatRupiah(expected)}</td>
                          <td className="py-3.5 px-4 text-right font-mono text-xs font-semibold">
                            {sh.modal_akhir !== null ? formatRupiah(sh.modal_akhir) : "-"}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {!isClosed ? (
                              <span className="text-gray-400">-</span>
                            ) : difference === 0 ? (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-bold">PAS</span>
                            ) : difference > 0 ? (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-green-100 text-green-800 text-[10px] font-bold">
                                +{formatRupiah(difference)}
                              </span>
                            ) : (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold">
                                {formatRupiah(difference)}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-gray-500 max-w-[150px] truncate">{sh.catatan || "-"}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Petty Cash Modal */}
      <MModal isOpen={showPettyModal} onClose={() => setShowPettyModal(false)} title="Catat Pengeluaran Petty Cash" maxWidth="sm">
        <form onSubmit={handleAddPettyCash} className="space-y-4 py-2">
          <p className="text-xs text-gray-500">Mencatat pengeluaran uang tunai dari laci kasir untuk kebutuhan operasional toko (misal: bayar kurir, beli sapu, air minum, dll).</p>
          <MInput
            label="Jumlah Uang Pengeluaran (Rp)"
            type="number"
            required
            placeholder="Contoh: 15000"
            value={pettyJumlah}
            onChange={(e) => setPettyJumlah(e.target.value)}
          />
          <MInput
            label="Keterangan Pengeluaran"
            type="text"
            required
            placeholder="Contoh: Beli plastik belanja"
            value={pettyKeterangan}
            onChange={(e) => setPettyKeterangan(e.target.value)}
          />
          <div className="flex gap-2 justify-end pt-2">
            <MButton type="button" variant="ghost" onClick={() => setShowPettyModal(false)}>Batal</MButton>
            <MButton type="submit" variant="primary" disabled={pettySubmitting}>
              {pettySubmitting ? <MLoader inline size="sm" /> : "Simpan Pengeluaran"}
            </MButton>
          </div>
        </form>
      </MModal>

      {/* Close Shift Modal */}
      <MModal isOpen={showCloseModal} onClose={() => setShowCloseModal(false)} title="Konfirmasi Tutup Shift Kasir" maxWidth="sm">
        <form onSubmit={handleCloseShift} className="space-y-4 py-2">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold">Penting Sebelum Menutup Shift:</p>
              <p className="mt-0.5">Silakan hitung total uang fisik tunai yang ada di dalam laci kasir secara manual, lalu masukkan jumlahnya di bawah. Sistem akan mencocokkannya secara otomatis untuk mendeteksi adanya selisih saldo.</p>
            </div>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-100 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Ekspektasi Uang Tunai di Laci:</span>
              <span className="font-bold text-gray-900">{formatRupiah(getExpectedCash())}</span>
            </div>
          </div>

          <MInput
            label="Total Uang Fisik Aktual di Laci (Rp) *"
            type="number"
            required
            placeholder="Hitung manual uang tunai laci lalu ketik di sini"
            value={closeModalAkhir}
            onChange={(e) => setCloseModalAkhir(e.target.value)}
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Catatan Tutup Shift (Opsional)</label>
            <textarea
              className="w-full min-h-[80px] p-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              placeholder="Sebutkan jika ada selisih uang atau alasan pengeluaran tertentu..."
              value={closeCatatan}
              onChange={(e) => setCloseCatatan(e.target.value)}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <MButton type="button" variant="ghost" onClick={() => setShowCloseModal(false)}>Batal</MButton>
            <MButton type="submit" variant="primary" disabled={closeSubmitting} className="bg-red-600 hover:bg-red-700 text-white border-transparent">
              {closeSubmitting ? <MLoader inline size="sm" /> : "Selesai & Tutup Shift"}
            </MButton>
          </div>
        </form>
      </MModal>

    </NavbarLayout>
  )
}
