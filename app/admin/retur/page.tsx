"use client";

import { useState, useEffect } from "react";
import { SidebarLayout } from "@/components/layouts/SidebarLayout";
import { adminNavItems } from "@/components/layouts/adminNav";
import { ownerNavItems } from "@/components/layouts/ownerNav";
import { authService } from "@/lib/services";
import { MButton } from "@/components/manola/MButton";
import { MBadge } from "@/components/manola/MBadge";
import { toast } from "sonner";
import { getImageUrl } from "@/lib/utils";

interface ReturnImage {
  id: number;
  url: string;
}

interface ReturnRequest {
  id: number;
  orderId: number;
  alasan: string;
  keterangan: string | null;
  bukti_url: string | null;
  resi: string | null;
  status: "MENUNGGU" | "DISETUJUI" | "DIKIRIM" | "SELESAI" | "DITOLAK";
  images: ReturnImage[];
  createdAt: string;
  order: {
    user: { nama: string; email: string; no_telepon: string };
    items: any[];
  };
}

export default function AdminReturPage() {
  const [returnReqs, setReturnReqs] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/returns`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("manola_token")}` }
      });
      const data = await res.json();
      if (res.ok) {
        setReturnReqs(data.data);
      } else {
        throw new Error(data.message || "Gagal memuat data retur");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: "DISETUJUI" | "DITOLAK") => {
    if (!confirm(`Apakah Anda yakin ingin mengubah status menjadi ${status}?`)) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/returns/${id}/status`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("manola_token")}`
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengupdate status");
      
      toast.success(`Pengajuan retur berhasil di${status.toLowerCase()}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleConfirmReceive = async (id: number) => {
    if (!confirm("Apakah paket retur sudah sampai di gudang? Stok akan otomatis dikembalikan.")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/returns/${id}/receive`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("manola_token")}`
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengkonfirmasi penerimaan");
      
      toast.success("Paket retur diterima! Stok telah dikembalikan.");
      loadData();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "MENUNGGU": return <MBadge variant="warning">Menunggu</MBadge>;
      case "DISETUJUI": return <MBadge variant="info">Disetujui</MBadge>;
      case "DIKIRIM": return <MBadge variant="info">Dikirim</MBadge>;
      case "SELESAI": return <MBadge variant="success">Selesai</MBadge>;
      case "DITOLAK": return <MBadge variant="danger">Ditolak</MBadge>;
      default: return <MBadge variant="gray">{status}</MBadge>;
    }
  };

  const navItems = currentUser?.role === "OWNER" ? ownerNavItems : adminNavItems;

  return (
    <SidebarLayout navItems={navItems} userName={currentUser?.nama ?? "Admin"} userRole={currentUser?.role ?? "Admin"}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--brand-black)] mb-1">Manajemen Retur</h1>
          <p className="text-[var(--brand-muted)]">Persetujuan pengembalian barang dari pelanggan</p>
        </div>
      </div>

      <div className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[var(--brand-gray)] border-b border-[var(--brand-border)]">
              <tr>
                <th className="px-6 py-4 font-semibold text-[var(--brand-black)]">Tanggal & Order ID</th>
                <th className="px-6 py-4 font-semibold text-[var(--brand-black)]">Pelanggan</th>
                <th className="px-6 py-4 font-semibold text-[var(--brand-black)]">Alasan & Keterangan</th>
                <th className="px-6 py-4 font-semibold text-[var(--brand-black)]">Foto Bukti</th>
                <th className="px-6 py-4 font-semibold text-[var(--brand-black)]">Resi Retur</th>
                <th className="px-6 py-4 font-semibold text-[var(--brand-black)]">Status</th>
                {currentUser?.role !== "OWNER" && (
                  <th className="px-6 py-4 font-semibold text-[var(--brand-black)] text-right">Aksi</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--brand-border)]">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-8">Memuat data...</td></tr>
              ) : returnReqs.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">Belum ada pengajuan retur</td></tr>
              ) : (
                returnReqs.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium">#{req.orderId}</div>
                      <div className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleDateString("id-ID")}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{req.order.user?.nama || "Guest"}</div>
                      <div className="text-xs text-gray-500">{req.order.user?.no_telepon || "-"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-red-600">{req.alasan}</div>
                      <div className="text-xs text-gray-500 mt-1 max-w-[200px] truncate" title={req.keterangan || ""}>
                        {req.keterangan || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {req.images && req.images.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {req.images.map((img, idx) => (
                            <a key={idx} href={getImageUrl(img.url)} target="_blank" rel="noreferrer">
                              <img src={getImageUrl(img.url)} alt={`Bukti ${idx + 1}`} className="w-14 h-14 object-cover rounded-lg border cursor-pointer hover:opacity-80" />
                            </a>
                          ))}
                        </div>
                      ) : req.bukti_url && !req.bukti_url.includes("placeholder") ? (
                        <a href={getImageUrl(req.bukti_url)} target="_blank" rel="noreferrer">
                          <img src={getImageUrl(req.bukti_url)} alt="Bukti" className="w-14 h-14 object-cover rounded-lg border cursor-pointer hover:opacity-80" />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">Tidak ada</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {req.resi ? (
                        <div>
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded border">{req.resi}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">
                          {req.status === "DISETUJUI" ? "Menunggu resi..." : "-"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(req.status)}
                    </td>
                    {currentUser?.role !== "OWNER" && (
                      <td className="px-6 py-4 text-right">
                        <>
                          {req.status === "MENUNGGU" && (
                            <div className="flex justify-end gap-2">
                              <MButton size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateStatus(req.id, "DISETUJUI")}>Setujui</MButton>
                              <MButton size="sm" variant="outline" className="text-red-600 hover:bg-red-50 border-red-200" onClick={() => handleUpdateStatus(req.id, "DITOLAK")}>Tolak</MButton>
                            </div>
                          )}
                          {req.status === "DISETUJUI" && (
                            <span className="text-xs text-blue-600 font-medium">Menunggu Resi Pelanggan</span>
                          )}
                          {req.status === "DIKIRIM" && (
                            <MButton size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => handleConfirmReceive(req.id)}>
                              Konfirmasi Paket Sampai
                            </MButton>
                          )}
                          {(req.status === "SELESAI" || req.status === "DITOLAK") && (
                            <span className="text-xs text-gray-400">- Selesai -</span>
                          )}
                        </>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SidebarLayout>
  );
}
