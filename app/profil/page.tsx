"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Heart, Settings, LogOut, ChevronRight, Clock, Trash2, MapPin, Plus, Star, Edit2, RefreshCw, CreditCard } from "lucide-react"
import { MLoader } from "@/components/manola/MLoader";
import { MButton } from "@/components/manola/MButton";
import { MBadge } from "@/components/manola/MBadge";
import { authService, orderService, wishlistService, paymentService, addressService, shippingService } from "@/lib/services";
import type { Address, CreateAddressPayload, ShippingLocation } from "@/lib/services";
import type { Order, OrderItem } from "@/lib/services/orderService";
import { reviewService } from "@/lib/services/miscServices";
import type { Wishlist } from "@/lib/services/miscServices";
import { toast } from "sonner";
import { getImageUrl, formatPrice } from "@/lib/utils";
import Script from "next/script";
import { Upload } from "lucide-react";
import { NotificationBell } from "@/components/manola/NotificationBell";

function getStatusVariant(order: Order) {
  if (order.payment?.status_pembayaran === "GAGAL") return "danger";
  switch (order.status) {
    case "DIPROSES": return "warning";
    case "DIKEMAS": return "warning";
    case "DIKIRIM": return "info";
    case "SELESAI": return "success";
    default: return "gray";
  }
}

function getStatusLabel(order: Order) {
  if (order.payment?.status_pembayaran === "GAGAL") return "Dibatalkan";
  switch (order.status) {
    case "DIPROSES": return "Diproses";
    case "DIKEMAS": return "Dikemas";
    case "DIKIRIM": return "Dikirim";
    case "SELESAI": return "Selesai";
    default: return order.status;
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"orders" | "wishlist" | "addresses" | "settings">("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<CreateAddressPayload>({
    label: "Rumah", penerima: "", no_telepon: "", alamat: "", kota: "", kode_pos: "", is_utama: false,
    provinceId: undefined, cityId: undefined, districtId: undefined, provinsi: "", kecamatan: ""
  });

  const [provinces, setProvinces] = useState<ShippingLocation[]>([]);
  const [cities, setCities] = useState<ShippingLocation[]>([]);
  const [districts, setDistricts] = useState<ShippingLocation[]>([]);

  useEffect(() => {
    if (showAddressForm) {
      loadProvinces();
      if (editingAddress) {
        if (editingAddress.provinceId) {
          loadCities(editingAddress.provinceId);
        }
        if (editingAddress.cityId) {
          loadDistricts(editingAddress.cityId);
        }
      } else {
        setCities([]);
        setDistricts([]);
      }
    }
  }, [showAddressForm, editingAddress]);

  async function loadProvinces() {
    try {
      const data = await shippingService.getProvinces();
      setProvinces(data);
    } catch (err) {
      console.error("Gagal memuat provinsi:", err);
    }
  }

  async function loadCities(provId: number) {
    try {
      const data = await shippingService.getCities(provId);
      setCities(data);
    } catch (err) {
      console.error("Gagal memuat kota:", err);
    }
  }

  async function loadDistricts(ctId: number) {
    try {
      const data = await shippingService.getDistricts(ctId);
      setDistricts(data);
    } catch (err) {
      console.error("Gagal memuat kecamatan:", err);
    }
  }

  // Review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<{ item: OrderItem, orderId: number } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewKomentar, setReviewKomentar] = useState("");
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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
      const [ordersData, wishlistData, addressData] = await Promise.all([
        orderService.getAll(),
        wishlistService.getAll(),
        addressService.getAll().catch(() => []),
      ]);
      setOrders(ordersData);
      setWishlists(wishlistData);
      setAddresses(addressData);
    } catch (err) {
      console.error("Failed to load profile data:", err);
    } finally {
      setLoading(false);
    }
  }

  function resetAddressForm() {
    setAddressForm({ 
      label: "Rumah", penerima: "", no_telepon: "", alamat: "", kota: "", kode_pos: "", is_utama: false,
      provinceId: undefined, cityId: undefined, districtId: undefined, provinsi: "", kecamatan: ""
    });
    setEditingAddress(null);
    setShowAddressForm(false);
  }

  function openEditAddress(addr: Address) {
    setAddressForm({ 
      label: addr.label, 
      penerima: addr.penerima, 
      no_telepon: addr.no_telepon, 
      alamat: addr.alamat, 
      kota: addr.kota, 
      kode_pos: addr.kode_pos, 
      is_utama: addr.is_utama,
      provinceId: addr.provinceId || undefined,
      cityId: addr.cityId || undefined,
      districtId: addr.districtId || undefined,
      provinsi: addr.provinsi || "",
      kecamatan: addr.kecamatan || ""
    });
    setEditingAddress(addr);
    setShowAddressForm(true);
  }

  async function handleSaveAddress() {
    if (!addressForm.penerima || !addressForm.no_telepon || !addressForm.alamat || !addressForm.provinceId || !addressForm.cityId || !addressForm.districtId || !addressForm.kode_pos) {
      toast.error("Semua field wajib diisi");
      return;
    }
    try {
      if (editingAddress) {
        await addressService.update(editingAddress.id, addressForm);
        toast.success("Alamat berhasil diperbarui");
      } else {
        await addressService.create(addressForm);
        toast.success("Alamat berhasil ditambahkan");
      }
      resetAddressForm();
      const addrs = await addressService.getAll();
      setAddresses(addrs);
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan alamat");
    }
  }

  async function handleDeleteAddress(id: number) {
    if (!confirm("Hapus alamat ini?")) return;
    try {
      await addressService.remove(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success("Alamat dihapus");
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus alamat");
    }
  }

  async function handleSetUtama(id: number) {
    try {
      await addressService.setUtama(id);
      const addrs = await addressService.getAll();
      setAddresses(addrs);
      toast.success("Alamat utama diperbarui");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah alamat utama");
    }
  }

  async function handleRemoveWishlist(wishlistId: number) {
    try {
      await wishlistService.remove(wishlistId);
      setWishlists((prev) => prev.filter((w) => w.id !== wishlistId));
      toast.success("Dihapus dari wishlist");
    } catch (err) {
      toast.error("Gagal menghapus wishlist");
    }
  }

  async function handlePayNow(order: Order) {
    if (!order.payment || order.payment.status_pembayaran !== "MENUNGGU") return;
    try {
      toast.loading("Memproses token pembayaran...", { id: "pay" });
      const newPayment = await paymentService.regenerateToken(order.id);
      const token = (newPayment as any).data?.midtrans_token || newPayment.midtrans_token;
      toast.dismiss("pay");
      
      if (token && (window as any).snap) {
        (window as any).snap.pay(token, {
          onSuccess: function() {
            toast.success("Pembayaran berhasil!");
            loadData(); // refresh status
          },
          onPending: function() {
            toast.success("Menunggu pembayaran diselesaikan.");
          },
          onError: function() {
            toast.error("Pembayaran gagal!");
          },
          onClose: function() {
            toast.error("Anda menutup pop-up tanpa menyelesaikan pembayaran.");
          }
        });
      } else {
        toast.error("Sistem pembayaran belum siap.");
      }
    } catch (err: any) {
      toast.dismiss("pay");
      toast.error(err.message || "Gagal membuat token pembayaran");
    }
  }

  async function handleCancelOrder(orderId: number) {
    if (!confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) return;
    try {
      toast.loading("Membatalkan pesanan...", { id: "cancel-order" });
      await paymentService.cancel(orderId);
      toast.success("Pesanan berhasil dibatalkan", { id: "cancel-order" });
      await loadData(); // refresh order list
    } catch (err: any) {
      toast.error(err.message || "Gagal membatalkan pesanan", { id: "cancel-order" });
    }
  }

  async function handleRefreshStatus() {
    toast.loading("Memperbarui status...", { id: "refresh" });
    await loadData();
    toast.success("Status pesanan diperbarui", { id: "refresh" });
  }

  function openReviewModal(item: OrderItem, orderId: number) {
    setSelectedReviewItem({ item, orderId });
    setReviewRating(5);
    setReviewKomentar("");
    setReviewImages([]);
    setShowReviewModal(true);
  }

  async function handleSubmitReview() {
    if (!selectedReviewItem) return;
    setIsSubmittingReview(true);
    try {
      await reviewService.create({
        productId: selectedReviewItem.item.variant?.product?.id as number,
        orderId: selectedReviewItem.orderId,
        rating: reviewRating,
        komentar: reviewKomentar,
        images: reviewImages,
      });
      toast.success("Ulasan berhasil dikirim!");
      setShowReviewModal(false);
    } catch (err: any) {
      toast.error(err.message || "Gagal mengirim ulasan");
    } finally {
      setIsSubmittingReview(false);
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
    { id: "addresses", label: "Alamat", icon: MapPin },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ] as const;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--brand-gray)]">
      <Script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} strategy="lazyOnload" />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--brand-white)] border-b border-[var(--brand-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-[var(--brand-black)]">MANOLA</Link>
            <div className="flex items-center gap-4">
              <NotificationBell />
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
                            <MBadge variant={getStatusVariant(order) as "warning" | "info" | "success" | "gray" | "danger"}>
                              {getStatusLabel(order)}
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
                            <div className="flex items-center gap-2">
                              {order.payment?.status_pembayaran === "MENUNGGU" && order.payment?.metode_pembayaran === "MIDTRANS" && (
                                <>
                                  <MButton variant="outline" size="sm" onClick={() => handleCancelOrder(order.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                    Batalkan
                                  </MButton>
                                  <MButton variant="outline" size="sm" onClick={handleRefreshStatus} title="Refresh Status">
                                    <RefreshCw className="w-4 h-4" />
                                  </MButton>
                                  <MButton size="sm" onClick={() => handlePayNow(order)}>
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Bayar Sekarang
                                  </MButton>
                                </>
                              )}
                              {order.status === "SELESAI" && (
                                <MButton variant="outline" size="sm" onClick={() => openReviewModal(order.items[0], order.id)}>
                                  <Star className="w-4 h-4 mr-2" />
                                  Beri Ulasan
                                </MButton>
                              )}
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

                {activeTab === "addresses" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-bold text-[var(--brand-black)]">Alamat Saya</h1>
                      <MButton size="sm" onClick={() => { resetAddressForm(); setShowAddressForm(true); }}>
                        <Plus className="w-4 h-4 mr-1" /> Tambah Alamat
                      </MButton>
                    </div>

                    {/* Form Tambah/Edit Alamat */}
                    {showAddressForm && (
                      <div className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-6 space-y-4">
                        <h3 className="text-lg font-semibold">{editingAddress ? "Edit Alamat" : "Tambah Alamat Baru"}</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[var(--brand-black)] mb-1.5">Label</label>
                            <select
                              value={addressForm.label}
                              onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                              className="w-full px-4 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)]"
                            >
                              <option value="Rumah">Rumah</option>
                              <option value="Kantor">Kantor</option>
                              <option value="Lainnya">Lainnya</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[var(--brand-black)] mb-1.5">Nama Penerima</label>
                            <input type="text" value={addressForm.penerima} onChange={(e) => setAddressForm({ ...addressForm, penerima: e.target.value })} className="w-full px-4 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)]" placeholder="Nama penerima" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[var(--brand-black)] mb-1.5">No Telepon</label>
                            <input type="text" value={addressForm.no_telepon} onChange={(e) => setAddressForm({ ...addressForm, no_telepon: e.target.value })} className="w-full px-4 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)]" placeholder="08xxxxxxxxxx" />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-[var(--brand-black)] mb-1.5">Alamat Lengkap</label>
                            <textarea value={addressForm.alamat} onChange={(e) => setAddressForm({ ...addressForm, alamat: e.target.value })} rows={2} className="w-full px-4 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)] resize-none" placeholder="Jl. Contoh No. 123" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[var(--brand-black)] mb-1.5">Provinsi</label>
                            <select
                              value={addressForm.provinceId || ""}
                              onChange={(e) => {
                                const val = e.target.value ? parseInt(e.target.value) : undefined;
                                const name = provinces.find(p => p.id === val)?.name || "";
                                setAddressForm({
                                  ...addressForm,
                                  provinceId: val,
                                  cityId: undefined,
                                  districtId: undefined,
                                  provinsi: name,
                                  kota: "",
                                  kecamatan: ""
                                });
                                setCities([]);
                                setDistricts([]);
                                if (val) loadCities(val);
                              }}
                              className="w-full px-4 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)]"
                            >
                              <option value="">Pilih Provinsi</option>
                              {provinces.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[var(--brand-black)] mb-1.5">Kota / Kabupaten</label>
                            <select
                              value={addressForm.cityId || ""}
                              disabled={!addressForm.provinceId}
                              onChange={(e) => {
                                const val = e.target.value ? parseInt(e.target.value) : undefined;
                                const name = cities.find(c => c.id === val)?.name || "";
                                setAddressForm({
                                  ...addressForm,
                                  cityId: val,
                                  districtId: undefined,
                                  kota: name,
                                  kecamatan: ""
                                });
                                setDistricts([]);
                                if (val) loadDistricts(val);
                              }}
                              className="w-full px-4 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)]"
                            >
                              <option value="">Pilih Kota / Kabupaten</option>
                              {cities.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[var(--brand-black)] mb-1.5">Kecamatan</label>
                            <select
                              value={addressForm.districtId || ""}
                              disabled={!addressForm.cityId}
                              onChange={(e) => {
                                const val = e.target.value ? parseInt(e.target.value) : undefined;
                                const name = districts.find(d => d.id === val)?.name || "";
                                setAddressForm({
                                  ...addressForm,
                                  districtId: val,
                                  kecamatan: name
                                });
                              }}
                              className="w-full px-4 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)]"
                            >
                              <option value="">Pilih Kecamatan</option>
                              {districts.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[var(--brand-black)] mb-1.5">Kode Pos</label>
                            <input type="text" value={addressForm.kode_pos} onChange={(e) => setAddressForm({ ...addressForm, kode_pos: e.target.value })} className="w-full px-4 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)]" placeholder="12345" />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={addressForm.is_utama || false} onChange={(e) => setAddressForm({ ...addressForm, is_utama: e.target.checked })} className="rounded" />
                          Jadikan alamat utama
                        </label>
                        <div className="flex gap-3">
                          <MButton onClick={handleSaveAddress}>Simpan</MButton>
                          <MButton variant="outline" onClick={resetAddressForm}>Batal</MButton>
                        </div>
                      </div>
                    )}

                    {/* Daftar Alamat */}
                    {addresses.length === 0 && !showAddressForm ? (
                      <div className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-8 text-center">
                        <MapPin className="w-12 h-12 text-[var(--brand-muted)] mx-auto mb-3" />
                        <p className="text-[var(--brand-muted)]">Belum ada alamat tersimpan</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {addresses.map((addr) => (
                          <div key={addr.id} className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-5">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-[var(--brand-black)]">{addr.label}</span>
                                  {addr.is_utama && (
                                    <span className="text-xs bg-[var(--brand-black)] text-[var(--brand-white)] px-2 py-0.5 rounded-full">Utama</span>
                                  )}
                                </div>
                                <p className="text-sm font-medium text-[var(--brand-black)]">{addr.penerima}</p>
                                <p className="text-sm text-[var(--brand-muted)]">{addr.no_telepon}</p>
                                <p className="text-sm text-[var(--brand-muted)] mt-1">
                                  {addr.alamat}, {addr.kecamatan ? `${addr.kecamatan}, ` : ""}{addr.kota}{addr.provinsi ? `, ${addr.provinsi}` : ""} {addr.kode_pos}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <MButton variant="ghost" size="sm" onClick={() => openEditAddress(addr)}>
                                  <Edit2 className="w-4 h-4" />
                                </MButton>
                                <MButton variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleDeleteAddress(addr.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </MButton>
                              </div>
                            </div>
                            {!addr.is_utama && (
                              <button onClick={() => handleSetUtama(addr.id)} className="text-xs text-[var(--brand-muted)] hover:text-[var(--brand-black)] mt-2 underline transition-colors">
                                Jadikan Alamat Utama
                              </button>
                            )}
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

      {/* Review Modal */}
      {showReviewModal && selectedReviewItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowReviewModal(false)}>
          <div className="bg-[var(--brand-white)] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[var(--brand-black)] text-center">Beri Ulasan</h3>
            
            <div className="flex gap-4 p-3 bg-[var(--brand-gray)] rounded-xl">
              <div className="w-16 h-16 rounded-lg bg-[var(--brand-white)] overflow-hidden">
                <img src={getImageUrl(selectedReviewItem.item.variant?.product?.images?.[0]?.url)} alt="Produk" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm line-clamp-2">{selectedReviewItem.item.variant?.product?.name}</p>
                <p className="text-xs text-[var(--brand-muted)]">{selectedReviewItem.item.variant?.size}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--brand-black)] mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setReviewRating(star)}>
                      <Star className={`w-8 h-8 ${star <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-[var(--brand-muted)]"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--brand-black)] mb-2">Komentar</label>
                <textarea
                  rows={3}
                  value={reviewKomentar}
                  onChange={(e) => setReviewKomentar(e.target.value)}
                  placeholder="Ceritakan kepuasanmu terhadap produk ini..."
                  className="w-full px-4 py-3 border border-[var(--brand-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)] resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--brand-black)] mb-2">Foto (Maks. 3, Opsional)</label>
                <div className="flex flex-wrap gap-2">
                  {reviewImages.map((file, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-lg border border-[var(--brand-border)] overflow-hidden">
                      <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                      <button 
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs"
                        onClick={() => setReviewImages(prev => prev.filter((_, i) => i !== idx))}
                      >×</button>
                    </div>
                  ))}
                  {reviewImages.length < 3 && (
                    <label className="w-20 h-20 rounded-lg border-2 border-dashed border-[var(--brand-border)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--brand-black)] text-[var(--brand-muted)] hover:text-[var(--brand-black)] transition-colors">
                      <Upload className="w-5 h-5 mb-1" />
                      <span className="text-[10px]">Upload</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            if (e.target.files[0].size > 2 * 1024 * 1024) {
                              toast.error("Ukuran maksimal file 2MB");
                              return;
                            }
                            setReviewImages(prev => [...prev, e.target.files![0]]);
                          }
                        }} 
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <MButton className="flex-1" onClick={handleSubmitReview} disabled={isSubmittingReview}>
                {isSubmittingReview ? "Mengirim..." : "Kirim Ulasan"}
              </MButton>
              <MButton variant="outline" onClick={() => setShowReviewModal(false)} disabled={isSubmittingReview}>
                Batal
              </MButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
