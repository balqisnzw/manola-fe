"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Heart, Settings, LogOut, ChevronRight, Clock, Trash2 } from "lucide-react"
import { MLoader } from "@/components/manola/MLoader";
import { MButton } from "@/components/manola/MButton";
import { MBadge } from "@/components/manola/MBadge";
import { authService, orderService, wishlistService } from "@/lib/services";
import type { Order } from "@/lib/services/orderService";
import type { Wishlist } from "@/lib/services/miscServices";
import { getImageUrl, formatPrice } from "@/lib/utils";

function getStatusVariant(status: string) {
  switch (status) {
    case "DIPROSES": return "warning";
    case "DIKEMAS": return "warning";
    case "DIKIRIM": return "info";
    case "SELESAI": return "success";
    default: return "gray";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "DIPROSES": return "Diproses";
    case "DIKEMAS": return "Dikemas";
    case "DIKIRIM": return "Dikirim";
    case "SELESAI": return "Selesai";
    default: return status;
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"orders" | "wishlist" | "settings">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);

  const user = authService.getCurrentUser();

  const [formData, setFormData] = useState({
    nama: user?.nama || "",
    email: user?.email || "",
    passwordLama: "",
    passwordBaru: "",
    konfirmasiPassword: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadData() {
    setLoading(true);
    try {
      const [ordersData, wishlistData] = await Promise.all([
        orderService.getAll(),
        wishlistService.getAll(),
      ]);
      setOrders(ordersData);
      setWishlists(wishlistData);
    } catch (err) {
      console.error("Failed to load profile data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveWishlist(wishlistId: number) {
    try {
      await wishlistService.remove(wishlistId);
      setWishlists((prev) => prev.filter((w) => w.id !== wishlistId));
    } catch (err) {
      console.error("Failed to remove wishlist item:", err);
    }
  }

  async function handleSaveSettings() {
    setIsSaving(true);
    try {
      let updated = false;
      if (formData.nama !== user?.nama || formData.email !== user?.email) {
        await authService.updateProfile({ nama: formData.nama, email: formData.email });
        updated = true;
      }
      if (formData.passwordLama && formData.passwordBaru) {
        if (formData.passwordBaru !== formData.konfirmasiPassword) {
          alert("Konfirmasi password baru tidak cocok.");
          setIsSaving(false);
          return;
        }
        await authService.changePassword(formData.passwordLama, formData.passwordBaru);
        setFormData(prev => ({ ...prev, passwordLama: "", passwordBaru: "", konfirmasiPassword: "" }));
        alert("Password berhasil diubah.");
        updated = true;
      } else if (updated) {
        alert("Profil berhasil diperbarui.");
      }
      
      if (updated) {
        window.location.reload();
      }
    } catch (err: any) {
      alert("Gagal menyimpan perubahan: " + (err.message || "Terjadi kesalahan"));
    } finally {
      setIsSaving(false);
    }
  }

  const menuItems = [
    { id: "orders", label: "Pesanan Saya", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ] as const;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--brand-gray)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--brand-white)] border-b border-[var(--brand-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-[var(--brand-black)]">MANOLA</Link>
            <button
              onClick={() => {
                authService.logout();
                router.push("/login");
              }}
              className="flex items-center gap-2 text-[var(--brand-muted)] hover:text-[var(--brand-black)] transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-[var(--brand-black)] text-white flex items-center justify-center text-xl font-semibold">
                  {user.nama?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--brand-black)]">{user.nama}</h2>
                  <p className="text-sm text-[var(--brand-muted)]">{user.email}</p>
                </div>
              </div>
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? "bg-[var(--brand-black)] text-[var(--brand-white)]"
                        : "hover:bg-[var(--brand-gray)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-24">
                <MLoader size="lg" />
              </div>
            ) : (
              <>
                {activeTab === "orders" && (
                  <div className="space-y-4">
                    <h1 className="text-2xl font-bold text-[var(--brand-black)]">Pesanan Saya</h1>
                    {orders.length === 0 ? (
                      <div className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-8 text-center">
                        <Package className="w-12 h-12 text-[var(--brand-muted)] mx-auto mb-3" />
                        <p className="text-[var(--brand-muted)]">Belum ada pesanan</p>
                      </div>
                    ) : (
                      orders.map((order) => (
                        <div key={order.id} className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-6">
                          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                            <div>
                              <p className="font-semibold text-[var(--brand-black)]">Pesanan #{order.id}</p>
                              <div className="flex items-center gap-2 text-sm text-[var(--brand-muted)] mt-1">
                                <Clock className="w-4 h-4" />
                                <span>{new Date(order.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
                              </div>
                            </div>
                            <MBadge variant={getStatusVariant(order.status) as "warning" | "info" | "success" | "gray"}>
                              {getStatusLabel(order.status)}
                            </MBadge>
                          </div>
                          {/* Items preview */}
                          <div className="space-y-2 mb-4">
                            {order.items?.slice(0, 3).map((item) => (
                              <div key={item.id} className="flex items-center gap-3 text-sm">
                                <div className="w-10 h-10 rounded-md bg-[var(--brand-gray)] overflow-hidden flex-shrink-0">
                                  <img
                                    src={getImageUrl(item.variant?.product?.images?.[0]?.url)}
                                    alt={item.variant?.product?.name ?? "Produk"}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-[var(--brand-black)] truncate">{item.variant?.product?.name}</p>
                                  <p className="text-xs text-[var(--brand-muted)]">{item.variant?.size}{item.variant?.color ? ` · ${item.variant.color}` : ""} × {item.jumlah}</p>
                                </div>
                                <p className="text-sm font-medium">{formatPrice(item.harga_satuan * item.jumlah)}</p>
                              </div>
                            ))}
                            {(order.items?.length ?? 0) > 3 && (
                              <p className="text-xs text-[var(--brand-muted)]">+{(order.items?.length ?? 0) - 3} item lainnya</p>
                            )}
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-[var(--brand-border)]">
                            <div>
                              <p className="text-sm text-[var(--brand-muted)]">{order.items?.length ?? 0} item</p>
                              <p className="font-semibold text-[var(--brand-black)]">{formatPrice(order.total_harga)}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "wishlist" && (
                  <div className="space-y-4">
                    <h1 className="text-2xl font-bold text-[var(--brand-black)]">Wishlist</h1>
                    {wishlists.length === 0 ? (
                      <div className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-8 text-center">
                        <Heart className="w-12 h-12 text-[var(--brand-muted)] mx-auto mb-3" />
                        <p className="text-[var(--brand-muted)]">Wishlist masih kosong</p>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {wishlists.map((wl) => (
                          <div key={wl.id} className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-4">
                            <div className="flex gap-4">
                              <div className="w-20 h-20 bg-[var(--brand-gray)] rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={getImageUrl(wl.product?.images?.[0]?.url)}
                                  alt={wl.product?.name ?? "Produk"}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-[var(--brand-black)] truncate">{wl.product?.name ?? "Produk"}</h3>
                                <p className="font-bold mt-1">{formatPrice(wl.product?.price ?? 0)}</p>
                                <div className="flex gap-2 mt-2">
                                  <Link href={`/produk/${wl.productId}`}>
                                    <MButton size="sm">Lihat Produk</MButton>
                                  </Link>
                                  <MButton
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-600"
                                    onClick={() => handleRemoveWishlist(wl.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </MButton>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="space-y-4">
                    <h1 className="text-2xl font-bold text-[var(--brand-black)]">Pengaturan Akun</h1>
                    <div className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-6 space-y-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold border-b border-[var(--brand-border)] pb-2">Informasi Profil</h3>
                        <div>
                          <label className="block text-sm font-medium text-[var(--brand-black)] mb-1.5">Nama Lengkap</label>
                          <input
                            type="text"
                            value={formData.nama}
                            onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                            className="w-full px-4 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[var(--brand-black)] mb-1.5">Email</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)]"
                          />
                        </div>
                      </div>

                      <div className="space-y-4 pt-4">
                        <h3 className="text-lg font-semibold border-b border-[var(--brand-border)] pb-2">Ubah Kata Sandi</h3>
                        <div>
                          <label className="block text-sm font-medium text-[var(--brand-black)] mb-1.5">Kata Sandi Saat Ini</label>
                          <input
                            type="password"
                            placeholder="Biarkan kosong jika tidak ingin mengubah"
                            value={formData.passwordLama}
                            onChange={(e) => setFormData({ ...formData, passwordLama: e.target.value })}
                            className="w-full px-4 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)]"
                          />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[var(--brand-black)] mb-1.5">Kata Sandi Baru</label>
                            <input
                              type="password"
                              placeholder="Minimal 6 karakter"
                              value={formData.passwordBaru}
                              onChange={(e) => setFormData({ ...formData, passwordBaru: e.target.value })}
                              className="w-full px-4 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)]"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[var(--brand-black)] mb-1.5">Konfirmasi Kata Sandi Baru</label>
                            <input
                              type="password"
                              placeholder="Ketik ulang kata sandi baru"
                              value={formData.konfirmasiPassword}
                              onChange={(e) => setFormData({ ...formData, konfirmasiPassword: e.target.value })}
                              className="w-full px-4 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)]"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <MButton onClick={handleSaveSettings} disabled={isSaving}>
                          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                        </MButton>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
