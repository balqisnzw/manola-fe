"use client"

import { useState, useEffect } from "react"
import { shiftService, authService } from "@/lib/services"
import type { CashierShift } from "@/lib/services/miscServices"
import { MLoader } from "@/components/manola/MLoader"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { adminNavItems } from "@/components/layouts/adminNav"
import { toast } from "sonner"

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`
}

export default function AdminShiftPage() {
  const [shifts, setShifts] = useState<CashierShift[]>([])
  const [loading, setLoading] = useState(true)
  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    loadShiftHistory()
  }, [])

  async function loadShiftHistory() {
    setLoading(true)
    try {
      const data = await shiftService.getAll()
      setShifts(data)
    } catch (err) {
      console.error("Failed to load shift history:", err)
      toast.error("Gagal memuat riwayat shift")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarLayout navItems={adminNavItems} userName={currentUser?.nama ?? "Admin"} userRole={currentUser?.role ?? "Admin"}>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#0A0A0A]">Riwayat Shift Kasir (Audit)</h1>
        <p className="text-sm text-gray-500 mt-1">Pantau seluruh aktivitas buka-tutup shift dan rekonsiliasi kas dari semua kasir.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
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
    </SidebarLayout>
  )
}
