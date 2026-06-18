"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package, Heart, Settings, LogOut, ChevronRight, Clock, Trash2, MapPin, Plus, Star, Edit2, RefreshCw, CreditCard, Truck, CheckCircle, X } from "lucide-react"
import { MLoader } from "@/components/manola/MLoader";
import { MButton } from "@/components/manola/MButton";
import { MBadge } from "@/components/manola/MBadge";
import { authService, orderService, wishlistService, paymentService, addressService, shippingService } from "@/lib/services";
import type { Address, CreateAddressPayload, ShippingLocation, User } from "@/lib/services";
import type { Order, OrderItem } from "@/lib/services/orderService";
import { reviewService, settingService } from "@/lib/services/miscServices";
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
    case "DIKEMBALIKAN": return "danger";
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
    case "DIKEMBALIKAN": return "Dikembalikan";
    default: return order.status;
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"orders" | "history" | "wishlist" | "addresses" | "settings">("orders");
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

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState<{ item: OrderItem, orderId: number, readonlyReview?: any } | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewKomentar, setReviewKomentar] = useState("");
  const [reviewImages, setReviewImages] = useState<File[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Return state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<Order | null>(null);
  const [returnAlasan, setReturnAlasan] = useState("Tidak lengkap");
  const [returnKeterangan, setReturnKeterangan] = useState("");
  const [returnImages, setReturnImages] = useState<File[]>([]);
  const [returnResi, setReturnResi] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [isSubmittingResi, setIsSubmittingResi] = useState(false);

  // Tracking & Confirm state
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [shopPhone, setShopPhone] = useState<string>("0821-1234-5678");

  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    no_telepon: "",
    passwordLama: "",
    passwordBaru: "",
    konfirmasiPassword: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);
    setFormData({
      nama: currentUser.nama || "",
      email: currentUser.email || "",
      no_telepon: currentUser.no_telepon || "",
      passwordLama: "",
      passwordBaru: "",
      konfirmasiPassword: "",
    });
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadData() {
    setLoading(true);
    try {
      const [ordersData, wishlistData, addressData, settingsData] = await Promise.all([
        orderService.getAll(),
        wishlistService.getAll(),
        addressService.getAll().catch(() => []),
        settingService.get().catch(() => ({} as Record<string, string>)),
      ]);
      setOrders(ordersData);
      setWishlists(wishlistData);
      setAddresses(addressData);
      if (settingsData.shop_phone) setShopPhone(settingsData.shop_phone);
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
    toast.loading("Memperbarui status dengan server Midtrans...", { id: "refresh" });
    try {
      const pendingMidtransOrders = orders.filter(o => o.payment?.status_pembayaran === "MENUNGGU" && o.payment?.metode_pembayaran === "MIDTRANS");
      for (const o of pendingMidtransOrders) {
        await paymentService.syncStatus(o.id).catch(() => {});
      }
      await loadData();
      toast.success("Status pesanan diperbarui", { id: "refresh" });
    } catch (err) {
      toast.error("Gagal memperbarui status", { id: "refresh" });
    }
  }

  function openReviewModal(item: OrderItem, orderId: number, existingReview?: any) {
    setSelectedReviewItem({ item, orderId, readonlyReview: existingReview });
    if (existingReview) {
      setReviewRating(existingReview.rating);
      setReviewKomentar(existingReview.komentar || "");
    } else {
      setReviewRating(5);
      setReviewKomentar("");
    }
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


  function openReturnModal(order: Order) {
    setSelectedReturnOrder(order);
    if (order.returnRequest) {
      setReturnAlasan(order.returnRequest.alasan);
      setReturnKeterangan(order.returnRequest.keterangan || "");
      setReturnResi(order.returnRequest.resi || "");
      setReturnImages([]);
    } else {
      setReturnAlasan("Barang sampai namun tidak lengkap");
      setReturnKeterangan("");
      setReturnResi("");
      setReturnImages([]);
    }
    setShowReturnModal(true);
  }

  async function handleSubmitReturn() {
    if (!selectedReturnOrder || returnImages.length === 0 || !returnAlasan) {
      toast.error("Alasan dan foto bukti wajib diisi (min. 1 foto)");
      return;
    }
    if (returnKeterangan.length > 500) {
      toast.error("Keterangan maksimal 500 karakter");
      return;
    }
    
    setIsSubmittingReturn(true);
    try {
      // Upload all images
      const formData = new FormData();
      returnImages.forEach((file) => formData.append("files", file));
      
      let imageUrls: string[] = [];
      const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/returns/upload-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("manola_token")}` },
        body: formData
      });
      if (uploadRes.ok) {
        const resData = await uploadRes.json();
        imageUrls = resData.data.urls;
      } else {
        throw new Error("Gagal mengunggah foto bukti");
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/returns`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("manola_token")}`
        },
        body: JSON.stringify({
          orderId: selectedReturnOrder.id,
          alasan: returnAlasan,
          keterangan: returnKeterangan,
          bukti_url: imageUrls[0] || null,
          imageUrls: imageUrls
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengajukan pengembalian");

      toast.success("Pengajuan pengembalian berhasil dikirim!");
      setShowReturnModal(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setIsSubmittingReturn(false);
    }
  }

  async function handleSubmitReturnResi() {
    if (!selectedReturnOrder?.returnRequest || !returnResi.trim()) {
      toast.error("Nomor resi wajib diisi");
      return;
    }
    setIsSubmittingResi(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/returns/${selectedReturnOrder.returnRequest.id}/resi`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("manola_token")}`
        },
        body: JSON.stringify({ resi: returnResi.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal mengirim resi");
      toast.success("Nomor resi berhasil dikirim!");
      setShowReturnModal(false);
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan");
    } finally {
      setIsSubmittingResi(false);
    }
  }

  function openTrackingModal(order: Order) {
    setTrackingOrder(order);
    setShowTrackingModal(true);
  }

  async function handleConfirmReceived(orderId: number) {
    if (!confirm("Apakah Anda yakin pesanan sudah diterima?")) return;
    setIsConfirming(true);
    try {
      await orderService.updateStatus(orderId, "SELESAI");
      toast.success("Pesanan dikonfirmasi telah diterima!");
      await loadData();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengonfirmasi pesanan");
    } finally {
      setIsConfirming(false);
    }
  }

  async function handleSaveSettings() {
    setIsSaving(true);
    try {
      let updated = false;
      if (formData.nama !== user?.nama || formData.email !== user?.email || formData.no_telepon !== user?.no_telepon) {
        await authService.updateProfile({ nama: formData.nama, email: formData.email, no_telepon: formData.no_telepon });
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

  // Pesanan Sedang Diproses: (Lunas/Menunggu) DIPROSES, DIKEMAS, DIKIRIM
  const ongoingOrders = orders.filter(o => o.payment?.status_pembayaran !== "GAGAL" && ["DIPROSES", "DIKEMAS", "DIKIRIM"].includes(o.status));
  const historyOrders = orders.filter(o => o.payment?.status_pembayaran === "GAGAL" || ["SELESAI", "DIBATALKAN", "DIKEMBALIKAN"].includes(o.status));

  const renderOrderList = (orderList: Order[], emptyMessage: string) => {
    if (orderList.length === 0) {
      return (
        <div className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-8 text-center">
          <Package className="w-12 h-12 text-[var(--brand-muted)] mx-auto mb-3" />
          <p className="text-[var(--brand-muted)]">{emptyMessage}</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {orderList.map((order) => (
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
                  <div className="w-12 h-12 bg-[var(--brand-gray)] rounded border border-[var(--brand-border)] overflow-hidden flex-shrink-0">
                    <img 
                      src={getImageUrl(item.variant?.product?.images?.[0]?.url)} 
                      alt="Product" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[var(--brand-black)] truncate font-medium">
                      {item.variant?.product?.name ?? "Produk Telah Dihapus"}
                    </p>
                    <p className="text-[var(--brand-muted)]">
                      {item.variant?.size ? `${item.variant.size} ${item.variant.color ? `· ${item.variant.color}` : ""}` : ""} × {item.jumlah}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[var(--brand-black)]">
                      {formatPrice(item.harga_satuan * item.jumlah)}
                    </p>
                  </div>
                </div>
              ))}
              {(order.items?.length ?? 0) > 3 && (
                <p className="text-sm text-[var(--brand-muted)] pl-15">
                  +{order.items!.length - 3} produk lainnya
                </p>
              )}
            </div>

            {/* Ekspedisi & Resi info */}
            {order.ekspedisi && (
              <div className="flex items-start gap-3 bg-[var(--brand-blue-light)]/30 border border-[var(--brand-blue-light)] p-3 rounded-lg mb-4 text-sm text-blue-800">
                <Truck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">{order.ekspedisi}</p>
                  {order.resi ? (
                    <p className="opacity-90 mt-0.5">{order.resi}</p>
                  ) : (
                    <p className="opacity-90 mt-0.5 text-xs">Resi belum diinput</p>
                  )}
                  {order.alamat_pengiriman && (
                    <p className="opacity-80 mt-1 mt-0.5 text-xs">{order.alamat_pengiriman}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[var(--brand-border)]">
              <div>
                <p className="text-sm text-[var(--brand-muted)]">{order.items?.length ?? 0} item</p>
                <p className="font-bold text-[var(--brand-black)]">
                  {formatPrice(order.total_harga)}
                </p>
                {order.payment?.metode_pembayaran && (
                  <p className="text-xs font-medium text-[var(--brand-muted)] mt-1">
                    Metode Pembayaran: {
                      order.payment.metode_pembayaran === "MIDTRANS" && (order.payment as any).midtrans_payment_type
                        ? (order.payment as any).midtrans_payment_type
                        : order.payment.metode_pembayaran
                    }
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 justify-end">
                {order.payment?.status_pembayaran === "MENUNGGU" && order.payment?.metode_pembayaran === "MIDTRANS" && order.status === "DIPROSES" && (
                  <>
                    <MButton variant="outline" size="sm" onClick={() => handleCancelOrder(order.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200">
                      <X className="w-4 h-4 mr-2" />
                      Batalkan
                    </MButton>
                    <MButton size="sm" onClick={() => handlePayNow(order)}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Bayar Sekarang
                    </MButton>
                  </>
                )}
                {order.jenis === "ONLINE" && (order.status === "DIKIRIM" || order.status === "DIKEMAS" || order.status === "SELESAI" || order.status === "DIKEMBALIKAN") && (
                  <MButton variant="outline" size="sm" onClick={() => openTrackingModal(order)}>
                    <Truck className="w-4 h-4 mr-2" />
                    {order.status === "SELESAI" || order.status === "DIKEMBALIKAN" ? "Riwayat Pengiriman" : "Lacak Pengiriman"}
                  </MButton>
                )}
                {order.status === "DIKIRIM" && (
                  <MButton size="sm" onClick={() => handleConfirmReceived(order.id)} disabled={isConfirming}
                    className="bg-green-600 hover:bg-green-700 text-white">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isConfirming ? "Memproses..." : "Pesanan Diterima"}
                  </MButton>
                )}
                {order.status === "SELESAI" && order.items[0]?.variant && (
                  <>
                    {order.reviews && order.reviews.length > 0 ? (
                      <MButton variant="outline" size="sm" onClick={() => openReviewModal(order.items[0]!, order.id, order.reviews![0])}>
                        <Star className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" />
                        Lihat Ulasan Anda
                      </MButton>
                    ) : (
                      <MButton variant="outline" size="sm" onClick={() => openReviewModal(order.items[0]!, order.id)}>
                        <Star className="w-4 h-4 mr-2" />
                        Beri Ulasan
                      </MButton>
                    )}
                  </>
                )}
                {(order.status === "SELESAI" || order.status === "DIKEMBALIKAN") && order.items[0]?.variant && (
                  <>
                    {order.returnRequest ? (
                      <div className="flex items-center gap-2">
                        <MButton variant="outline" size="sm" onClick={() => openReturnModal(order)} className="text-[var(--brand-black)] hover:bg-[var(--brand-gray)] border-[var(--brand-border)]">
                          {order.status === "DIKEMBALIKAN" ? "Riwayat Retur" : "Lihat Detail Retur"}
                        </MButton>
                      </div>
                    ) : (
                      new Date().getTime() - new Date(order.updatedAt || order.createdAt).getTime() <= 24 * 60 * 60 * 1000 && (
                        <MButton variant="outline" size="sm" onClick={() => openReturnModal(order)} className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200">
                          Ajukan Pengembalian
                        </MButton>
                      )
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const menuItems = [
    { id: "orders", label: "Pesanan Saya", icon: Package },
    { id: "history", label: "Riwayat Pesanan", icon: Clock },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "addresses", label: "Alamat", icon: MapPin },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ] as const;

  if (!mounted || !user) {
    return (
      <div className="min-h-screen bg-[var(--brand-gray)] flex items-center justify-center py-24">
        <MLoader size="lg" text="Memuat profil..." />
      </div>
    );
  }

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
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-bold text-[var(--brand-black)]">Pesanan Saya</h1>
                      <MButton variant="outline" size="sm" onClick={handleRefreshStatus}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Perbarui Status
                      </MButton>
                    </div>
                    {renderOrderList(ongoingOrders, "Belum ada pesanan aktif")}
                  </div>
                )}

                {activeTab === "history" && (
                  <div className="space-y-4">
                    <h1 className="text-2xl font-bold text-[var(--brand-black)]">Riwayat Pesanan</h1>
                    {renderOrderList(historyOrders, "Belum ada riwayat pesanan")}
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
                        {wishlists.map((wl) => {
                          const totalStock = wl.product?.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
                          return (
                            <div key={wl.id} className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-4 relative overflow-hidden">
                              <div className="flex gap-4">
                                <div className="w-20 h-20 bg-[var(--brand-gray)] rounded-lg overflow-hidden flex-shrink-0 relative">
                                  <img
                                    src={getImageUrl(wl.product?.images?.[0]?.url)}
                                    alt={wl.product?.name ?? "Produk"}
                                    className={`w-full h-full object-cover ${totalStock <= 0 ? "opacity-50 grayscale" : ""}`}
                                  />
                                  {totalStock <= 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                      <span className="text-white text-[10px] font-bold px-2 py-0.5 bg-red-600 rounded">HABIS</span>
                                    </div>
                                  )}
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
                          );
                        })}
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
                        <div>
                          <label className="block text-sm font-medium text-[var(--brand-black)] mb-1.5">No. Telepon</label>
                          <input
                            type="tel"
                            value={formData.no_telepon}
                            onChange={(e) => setFormData({ ...formData, no_telepon: e.target.value })}
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
                    <button 
                      key={star} 
                      type="button" 
                      onClick={() => !selectedReviewItem.readonlyReview && setReviewRating(star)}
                      className={selectedReviewItem.readonlyReview ? "cursor-default" : "cursor-pointer"}
                    >
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
                  readOnly={!!selectedReviewItem.readonlyReview}
                  onChange={(e) => setReviewKomentar(e.target.value)}
                  placeholder={selectedReviewItem.readonlyReview ? "Tidak ada komentar" : "Ceritakan kepuasanmu terhadap produk ini..."}
                  className="w-full px-4 py-3 border border-[var(--brand-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)] resize-none"
                />
              </div>

              {!selectedReviewItem.readonlyReview && (
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
              )}
            </div>

            <div className="flex gap-3 pt-4">
              {!selectedReviewItem.readonlyReview ? (
                <>
                  <MButton className="flex-1" onClick={handleSubmitReview} disabled={isSubmittingReview}>
                    {isSubmittingReview ? "Mengirim..." : "Kirim Ulasan"}
                  </MButton>
                  <MButton variant="outline" onClick={() => setShowReviewModal(false)} disabled={isSubmittingReview}>
                    Batal
                  </MButton>
                </>
              ) : (
                <MButton className="flex-1" onClick={() => setShowReviewModal(false)}>
                  Tutup
                </MButton>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tracking Modal (Simulasi Shopee) ── */}
      {showTrackingModal && trackingOrder && (() => {
        const orderDate = new Date(trackingOrder.createdAt);
        const updateDate = new Date(trackingOrder.updatedAt || trackingOrder.createdAt);
        const statusMap: { key: string; label: string; icon: React.ReactNode; detail: string }[] = [
          { key: "DIKEMAS", label: "Pesanan Dikemas", icon: <Package className="w-5 h-5" />, detail: "Pesanan sedang dikemas oleh tim packaging." },
          { key: "DIKIRIM", label: "Pesanan Dikirim", icon: <Truck className="w-5 h-5" />, detail: `Dikirim via ${trackingOrder.ekspedisi || "kurir"}${trackingOrder.resi ? ` · Resi: ${trackingOrder.resi}` : ""}.` },
          { key: "SELESAI", label: "Pesanan Selesai", icon: <CheckCircle className="w-5 h-5" />, detail: "Pesanan telah diterima oleh pelanggan." },
        ];
        const statusOrder = ["DIKEMAS", "DIKIRIM", "SELESAI"];
        const currentIdx = statusOrder.indexOf(trackingOrder.status);

        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowTrackingModal(false)}>
            <div className="bg-[var(--brand-white)] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="bg-[var(--brand-black)] text-[var(--brand-white)] p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">{trackingOrder.status === "SELESAI" ? "Riwayat Pengiriman" : "Lacak Pengiriman"}</h3>
                  <p className="text-sm text-gray-400">Pesanan #{trackingOrder.id}</p>
                </div>
                <button onClick={() => setShowTrackingModal(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Kurir & Resi Info */}
              {(trackingOrder.ekspedisi || trackingOrder.resi) && (
                <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 flex items-center gap-3">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-semibold text-blue-800">{trackingOrder.ekspedisi || "Kurir"}</p>
                    {trackingOrder.resi && <p className="text-xs text-blue-600">No. Resi: {trackingOrder.resi}</p>}
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="p-5 max-h-[60vh] overflow-y-auto">
                <div className="relative">
                  {statusMap.map((step, idx) => {
                    const isActive = idx <= currentIdx;
                    const isCurrent = idx === currentIdx;
                    
                    let stepTime = orderDate;
                    if (step.key === "DIKEMAS" && trackingOrder.dikemasAt) {
                      stepTime = new Date(trackingOrder.dikemasAt);
                    } else if (step.key === "DIKIRIM" && trackingOrder.dikirimAt) {
                      stepTime = new Date(trackingOrder.dikirimAt);
                    } else if (step.key === "SELESAI" && trackingOrder.selesaiAt) {
                      stepTime = new Date(trackingOrder.selesaiAt);
                    } else if (idx === currentIdx) {
                      stepTime = updateDate;
                    }

                    return (
                      <div key={step.key} className="flex gap-4 relative">
                        {/* Vertical line */}
                        {idx < statusMap.length - 1 && (
                          <div
                            className={`absolute left-[18px] top-[36px] w-0.5 h-[calc(100%-20px)] ${
                              idx < currentIdx ? "bg-green-500" : "bg-gray-200"
                            }`}
                          />
                        )}
                        {/* Dot */}
                        <div
                          className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                            isCurrent
                              ? "bg-green-500 text-white ring-4 ring-green-100"
                              : isActive
                              ? "bg-green-500 text-white"
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          {step.icon}
                        </div>
                        {/* Content */}
                        <div className={`pb-6 flex-1 ${!isActive ? "opacity-40" : ""}`}>
                          <p className={`text-sm font-semibold ${isCurrent ? "text-green-700" : "text-[var(--brand-black)]"}`}>
                            {step.label}
                          </p>
                          <p className="text-xs text-[var(--brand-muted)] mt-0.5">{step.detail}</p>
                          {isActive && (
                            <p className="text-[11px] text-[var(--brand-muted)] mt-1">
                              {stepTime.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}{" "}
                              {stepTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[var(--brand-border)]">
                {trackingOrder.status === "DIKIRIM" ? (
                  <MButton
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => { setShowTrackingModal(false); handleConfirmReceived(trackingOrder.id); }}
                    disabled={isConfirming}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isConfirming ? "Memproses..." : "Konfirmasi Pesanan Diterima"}
                  </MButton>
                ) : (
                  <MButton variant="outline" className="w-full" onClick={() => setShowTrackingModal(false)}>
                    Tutup
                  </MButton>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Return Modal ── */}
      {showReturnModal && selectedReturnOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => !isSubmittingReturn && !isSubmittingResi && setShowReturnModal(false)}>
          <div className="bg-[var(--brand-white)] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-[var(--brand-black)] text-[var(--brand-white)] p-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">
                  {selectedReturnOrder.returnRequest ? "Detail Pengajuan Retur" : "Ajukan Pengembalian"}
                </h3>
                <p className="text-sm text-gray-400">Pesanan #{selectedReturnOrder.id}</p>
              </div>
              <button onClick={() => !isSubmittingReturn && !isSubmittingResi && setShowReturnModal(false)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Status Badge */}
              {selectedReturnOrder.returnRequest && (
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium">Status Pengajuan:</span>
                  <span className={`text-sm font-bold px-3 py-1 rounded-md border ${
                    selectedReturnOrder.returnRequest.status === "SELESAI" ? "bg-green-100 text-green-700 border-green-200" :
                    selectedReturnOrder.returnRequest.status === "DISETUJUI" ? "bg-blue-100 text-blue-700 border-blue-200" :
                    selectedReturnOrder.returnRequest.status === "DIKIRIM" ? "bg-indigo-100 text-indigo-700 border-indigo-200" :
                    selectedReturnOrder.returnRequest.status === "DITOLAK" ? "bg-red-100 text-red-700 border-red-200" :
                    "bg-amber-100 text-amber-700 border-amber-200"
                  }`}>
                    {selectedReturnOrder.returnRequest.status === "MENUNGGU" ? "Menunggu Persetujuan" : 
                     selectedReturnOrder.returnRequest.status === "DISETUJUI" ? "Disetujui - Kirim Resi" :
                     selectedReturnOrder.returnRequest.status === "DIKIRIM" ? "Paket Dikirim" :
                     selectedReturnOrder.returnRequest.status === "SELESAI" ? "Selesai" : "Ditolak"}
                  </span>
                </div>
              )}

              {/* Alasan */}
              <div>
                <label className="block text-sm font-medium mb-2">Alasan Pengembalian <span className="text-red-500">*</span></label>
                <select 
                  className="w-full border border-[var(--brand-border)] rounded-lg px-4 py-2 disabled:bg-gray-50 disabled:text-gray-500"
                  value={returnAlasan}
                  onChange={(e) => setReturnAlasan(e.target.value)}
                  disabled={isSubmittingReturn || !!selectedReturnOrder.returnRequest}
                >
                  <option value="Barang sampai namun tidak lengkap">Barang sampai namun tidak lengkap</option>
                  <option value="Barang salah (ukuran/variasi)">Barang yang dikirim salah (ukuran/variasi)</option>
                  <option value="Produk rusak/cacat">Produk dalam kondisi rusak atau cacat produksi</option>
                </select>
              </div>

              {/* Keterangan with character counter */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Keterangan Tambahan</label>
                  {!selectedReturnOrder.returnRequest && (
                    <span className={`text-xs ${returnKeterangan.length > 500 ? "text-red-500 font-bold" : "text-gray-400"}`}>
                      {returnKeterangan.length}/500
                    </span>
                  )}
                </div>
                <textarea 
                  className={`w-full border rounded-lg px-4 py-2 disabled:bg-gray-50 disabled:text-gray-500 ${
                    returnKeterangan.length > 500 ? "border-red-500" : "border-[var(--brand-border)]"
                  }`}
                  rows={3}
                  placeholder="Jelaskan masalah barang... (Maks. 500 karakter)"
                  value={returnKeterangan}
                  onChange={(e) => { if (e.target.value.length <= 500 || !!selectedReturnOrder.returnRequest) setReturnKeterangan(e.target.value); }}
                  disabled={isSubmittingReturn || !!selectedReturnOrder.returnRequest}
                  maxLength={500}
                />
              </div>

              {/* Foto Bukti - Multi Photo */}
              <div>
                <label className="block text-sm font-medium mb-2">Foto Bukti <span className="text-red-500">*</span> <span className="text-xs text-gray-400 font-normal">(Maks. 3 foto, 2MB/foto)</span></label>
                
                {/* Show existing images from returnRequest (read-only mode) */}
                {selectedReturnOrder.returnRequest?.images && selectedReturnOrder.returnRequest.images.length > 0 ? (
                  <div className="flex gap-2 flex-wrap">
                    {selectedReturnOrder.returnRequest.images.map((img: any, idx: number) => (
                      <div key={idx} className="relative">
                        <img src={getImageUrl(img.url)} alt={`Bukti ${idx + 1}`} className="w-28 h-28 object-cover rounded-lg border border-[var(--brand-border)]" />
                      </div>
                    ))}
                  </div>
                ) : selectedReturnOrder.returnRequest?.bukti_url && !selectedReturnOrder.returnRequest.bukti_url.includes("placeholder") ? (
                  <div className="relative inline-block">
                    <img src={getImageUrl(selectedReturnOrder.returnRequest.bukti_url)} alt="Bukti" className="w-28 h-28 object-cover rounded-lg border border-[var(--brand-border)]" />
                  </div>
                ) : selectedReturnOrder.returnRequest ? (
                  <div className="w-full h-24 rounded-lg border border-[var(--brand-border)] bg-gray-50 flex items-center justify-center text-gray-400">
                    <span className="text-sm">Foto bukti tidak tersedia</span>
                  </div>
                ) : (
                  /* Upload mode for new return */
                  <div className="space-y-3">
                    {returnImages.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {returnImages.map((file, idx) => (
                          <div key={idx} className="relative">
                            <img src={URL.createObjectURL(file)} alt={`Bukti ${idx + 1}`} className="w-28 h-28 object-cover rounded-lg border border-[var(--brand-border)]" />
                            <button 
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                              onClick={() => setReturnImages(prev => prev.filter((_, i) => i !== idx))}
                              disabled={isSubmittingReturn}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {returnImages.length < 3 && (
                      <label className="w-full h-28 rounded-lg border-2 border-dashed border-[var(--brand-border)] flex flex-col items-center justify-center cursor-pointer hover:border-[var(--brand-black)] text-[var(--brand-muted)] hover:text-[var(--brand-black)] transition-colors">
                        <Upload className="w-5 h-5 mb-1" />
                        <span className="text-sm">Tambah Foto ({returnImages.length}/3)</span>
                        <span className="text-xs text-gray-400">Maks. 2MB per foto</span>
                        <input 
                          type="file" 
                          accept="image/jpeg,image/jpg,image/png,image/webp" 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              if (file.size > 2 * 1024 * 1024) {
                                toast.error("Ukuran file melebihi batas 2MB");
                                return;
                              }
                              if (returnImages.length >= 3) {
                                toast.error("Maksimal 3 foto bukti");
                                return;
                              }
                              setReturnImages(prev => [...prev, file]);
                            }
                            e.target.value = "";
                          }} 
                          disabled={isSubmittingReturn}
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>

              {/* Input Resi - shown when status DISETUJUI */}
              {selectedReturnOrder.returnRequest?.status === "DISETUJUI" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-blue-800 font-medium">Pengajuan retur Anda telah disetujui! Silakan kirim paket ke alamat toko dan masukkan nomor resi di bawah ini.</p>
                  <input 
                    type="text" 
                    className="w-full border border-blue-300 rounded-lg px-4 py-2 text-sm" 
                    placeholder="Masukkan nomor resi pengiriman..."
                    value={returnResi}
                    onChange={(e) => setReturnResi(e.target.value)}
                    disabled={isSubmittingResi}
                  />
                  <MButton 
                    className="w-full" 
                    onClick={handleSubmitReturnResi} 
                    disabled={isSubmittingResi || !returnResi.trim()}
                  >
                    {isSubmittingResi ? "Mengirim..." : "Kirim Nomor Resi"}
                  </MButton>
                </div>
              )}

              {/* Show Resi read-only for DIKIRIM / SELESAI */}
              {(selectedReturnOrder.returnRequest?.status === "DIKIRIM" || selectedReturnOrder.returnRequest?.status === "SELESAI") && selectedReturnOrder.returnRequest?.resi && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm font-medium mb-1">Nomor Resi Pengiriman Retur:</p>
                  <p className="text-sm font-mono bg-white px-3 py-2 rounded border border-gray-200">{selectedReturnOrder.returnRequest.resi}</p>
                  {selectedReturnOrder.returnRequest.status === "DIKIRIM" && (
                    <p className="text-xs text-gray-500 mt-2">Menunggu admin mengkonfirmasi penerimaan paket...</p>
                  )}
                  {selectedReturnOrder.returnRequest.status === "SELESAI" && (
                    <p className="text-xs text-green-600 mt-2 font-medium">✓ Paket telah diterima.</p>
                  )}
                </div>
              )}
              
              {/* WA Info */}
              {!selectedReturnOrder.returnRequest && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-1">
                  <p className="text-sm font-medium text-green-800">📱 Kirim Video Unboxing</p>
                  <p className="text-xs text-green-700">Untuk mempercepat proses persetujuan, kirim video unboxing tanpa jeda ke WhatsApp Admin: <strong>{shopPhone}</strong> dengan menyertakan Nomor Pesanan #{selectedReturnOrder.id}.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[var(--brand-border)] flex gap-3">
              {!selectedReturnOrder.returnRequest && (
                <MButton 
                  className="flex-1" 
                  onClick={handleSubmitReturn} 
                  disabled={isSubmittingReturn || returnImages.length === 0 || !returnAlasan}
                >
                  {isSubmittingReturn ? "Mengirim..." : "Kirim Pengajuan"}
                </MButton>
              )}
              <MButton 
                variant="outline" 
                onClick={() => setShowReturnModal(false)} 
                disabled={isSubmittingReturn || isSubmittingResi}
              >
                {selectedReturnOrder.returnRequest ? "Tutup" : "Batal"}
              </MButton>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
