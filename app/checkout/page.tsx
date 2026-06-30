"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Check, CreditCard, Truck, MapPin, ChevronDown } from "lucide-react"
import { MLoader } from "@/components/manola/MLoader";
import { MButton } from "@/components/manola/MButton";
import { MInput } from "@/components/manola/MInput";
import { useCart } from "@/lib/CartContext";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { orderService, paymentService, authService, addressService, shippingService, voucherService } from "@/lib/services";
import type { Address, ShippingCostDetail } from "@/lib/services";
import Script from "next/script";

// Cart items are now provided by CartContext below



function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("buy_now") === "true";

  const { items: cartItems, clearCart } = useCart();
  const [checkoutItems, setCheckoutItems] = useState(cartItems);

  useEffect(() => {
    if (isBuyNow) {
      const stored = sessionStorage.getItem("buyNowItem");
      if (stored) {
        try {
          setCheckoutItems(JSON.parse(stored));
        } catch(e) {}
      }
    } else {
      setCheckoutItems(cartItems);
    }
  }, [isBuyNow, cartItems]);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  // Dynamic shipping states
  const [courier, setCourier] = useState<string>("jne");
  const [shippingOptions, setShippingOptions] = useState<ShippingCostDetail[]>([]);
  const [selectedShippingService, setSelectedShippingService] = useState<string>("");
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [isLoadingShipping, setIsLoadingShipping] = useState<boolean>(false);

  // Voucher states
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [isLoadingVoucher, setIsLoadingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState<string | null>(null);

  const subtotal = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = shippingCost;
  const total = Math.max(0, subtotal - discountAmount) + shipping;

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "" });

  // Auto-fill data user & fetch alamat tersimpan
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.nama || prev.name,
        email: user.email || prev.email,
      }));
    }

    // Fetch alamat tersimpan
    addressService
      .getAll()
      .then((addrs) => {
        setAddresses(addrs);
        // Otomatis pilih alamat utama jika ada
        const utama = addrs.find((a) => a.is_utama);
        if (utama) {
          setSelectedAddressId(utama.id);
          applyAddress(utama, user);
        }
      })
      .catch(() => {
        // User belum login atau belum punya alamat — tidak masalah
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /** Isi form dari objek Address */
  function applyAddress(addr: Address, user?: { nama: string; email: string } | null) {
    setFormData((prev) => ({
      ...prev,
      name: addr.penerima || prev.name,
      phone: addr.no_telepon || prev.phone,
      email: user?.email || prev.email,
      address: addr.alamat,
      city: addr.kota,
      postalCode: addr.kode_pos,
    }));
  }

  // Effect to automatically calculate shipping when address, courier, or checkoutItems change
  useEffect(() => {
    if (selectedAddressId && checkoutItems.length > 0) {
      updateShippingCost(selectedAddressId, courier);
    } else {
      setShippingOptions([]);
      setShippingCost(0);
      setSelectedShippingService("");
    }
  }, [selectedAddressId, courier, checkoutItems]);

  async function updateShippingCost(addrId: number, selectedCourier: string) {
    const addr = addresses.find((a) => a.id === addrId);
    if (!addr || !addr.districtId) {
      setShippingOptions([]);
      setShippingCost(0);
      setSelectedShippingService("");
      return;
    }

    setIsLoadingShipping(true);
    try {
      // 500 grams default weight per clothing item
      const totalWeight = checkoutItems.reduce((sum, item) => sum + 500 * item.quantity, 0);
      const data = await shippingService.calculateCost({
        destinationDistrictId: addr.districtId,
        weight: totalWeight,
        courier: selectedCourier
      });
      setShippingOptions(data);
      if (data.length > 0) {
        // Auto-select first service option
        const firstService = data[0];
        setSelectedShippingService(firstService.service);
        setShippingCost(firstService.cost);
      } else {
        setShippingCost(0);
        setSelectedShippingService("");
      }
    } catch (err) {
      console.error("Gagal menghitung ongkir:", err);
      toast.error("Gagal mendapatkan tarif pengiriman.");
      setShippingOptions([]);
      setShippingCost(0);
      setSelectedShippingService("");
    } finally {
      setIsLoadingShipping(false);
    }
  }

  const handleCourierChange = (newCourier: string) => {
    setCourier(newCourier);
  };

  const handleApplyVoucher = async () => {
    if (!voucherInput.trim()) return;
    setIsLoadingVoucher(true);
    setVoucherError(null);
    try {
      const res = await voucherService.validate(voucherInput.trim(), subtotal);
      setAppliedVoucher(res.voucher);
      setDiscountAmount(res.diskon);
      toast.success(`Voucher "${res.voucher.kode}" berhasil diterapkan!`);
    } catch (err: any) {
      console.error(err);
      setVoucherError(err.message || "Kode voucher tidak valid");
      toast.error(err.message || "Gagal menerapkan voucher");
    } finally {
      setIsLoadingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setDiscountAmount(0);
    setVoucherInput("");
    setVoucherError(null);
    toast.success("Voucher berhasil dihapus");
  };

  // Clear voucher if subtotal doesn't meet minimum requirement anymore
  useEffect(() => {
    if (appliedVoucher && appliedVoucher.min_pembelian && subtotal < appliedVoucher.min_pembelian) {
      setAppliedVoucher(null);
      setDiscountAmount(0);
      setVoucherInput("");
      setVoucherError(null);
      toast.error("Voucher dibatalkan karena total belanja tidak memenuhi syarat minimum pembelian.");
    }
  }, [subtotal, appliedVoucher]);

  function handleSelectAddress(addrId: number) {
    const addr = addresses.find((a) => a.id === addrId);
    if (addr) {
      setSelectedAddressId(addrId);
      applyAddress(addr);
      setShowAddressDropdown(false);
    }
  }



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (checkoutItems.length === 0) {
      toast.error("Ringkasan belanja kosong");
      return;
    }
    if (!formData.address || !formData.name) {
      toast.error("Harap lengkapi data alamat pengiriman");
      return;
    }
    if (!selectedAddressId) {
      toast.error("Harap pilih alamat tersimpan untuk pengiriman online");
      return;
    }
    if (!selectedShippingService) {
      toast.error("Harap pilih metode pengiriman");
      return;
    }
    
    setSubmitting(true);
    try {
      const addr = addresses.find(a => a.id === selectedAddressId);
      const fullAddress = `${formData.address}, ${addr?.kecamatan ? `${addr.kecamatan}, ` : ""}${formData.city}${addr?.provinsi ? `, ${addr.provinsi}` : ""} ${formData.postalCode}`.trim();
      
      const order = await orderService.create({
        jenis: "ONLINE",
        alamat_pengiriman: fullAddress,
        ongkos_kirim: shipping,
        ekspedisi: `${courier.toUpperCase()} - ${selectedShippingService}`,
        catatan: formData.notes || undefined,
        voucherCode: appliedVoucher ? appliedVoucher.kode : undefined,
        items: checkoutItems.map((item) => ({
          variantId: item.variantId,
          jumlah: item.quantity
        }))
      });
          
      const orderId = (order as any).id || (order as any).data?.id;
      const paymentRes = await paymentService.create(orderId, "MIDTRANS");
      const paymentData = (paymentRes as any).data || paymentRes;
      const token = paymentData?.midtrans_token;

      if (token && (window as any).snap) {
        (window as any).snap.pay(token, {
          onSuccess: function() {
            toast.success("Pembayaran berhasil! Pesanan Anda sedang diproses.");
            if (isBuyNow) sessionStorage.removeItem("buyNowItem");
            else clearCart();
            router.push("/");
          },
          onPending: function() {
            toast.success("Menunggu pembayaran Anda diselesaikan.");
            if (isBuyNow) sessionStorage.removeItem("buyNowItem");
            else clearCart();
            router.push("/");
          },
          onError: function() {
            toast.error("Pembayaran gagal!");
          },
          onClose: function() {
            toast.error("Anda menutup pop-up sebelum menyelesaikan pembayaran.");
          }
        });
      } else {
        toast.error("Gagal memuat sistem pembayaran.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal membuat pesanan";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--brand-gray)]">
      <Script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} strategy="lazyOnload" />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--brand-white)] border-b border-[var(--brand-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-[var(--brand-black)] hover:opacity-70 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Kembali</span>
            </button>
            <Link href="/" className="text-2xl font-bold text-[var(--brand-black)]">MANOLA</Link>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {["Alamat", "Pengiriman"].map((label, idx) => (
            <div key={label} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  step > idx + 1
                    ? "bg-[var(--brand-black)] text-[var(--brand-white)]"
                    : step === idx + 1
                    ? "bg-[var(--brand-black)] text-[var(--brand-white)]"
                    : "bg-[var(--brand-border)] text-[var(--brand-muted)]"
                }`}
              >
                {step > idx + 1 ? <Check className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`ml-2 text-sm hidden sm:inline ${step === idx + 1 ? "font-semibold text-[var(--brand-black)]" : "text-[var(--brand-muted)]"}`}>
                {label}
              </span>
              {idx < 1 && <div className={`w-12 sm:w-24 h-px mx-4 ${step > idx + 1 ? "bg-[var(--brand-black)]" : "bg-[var(--brand-border)]"}`} />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Address */}
            {step === 1 && (
              <div className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-5 h-5 text-[var(--brand-black)]" />
                  <h2 className="text-lg font-semibold text-[var(--brand-black)]">Alamat Pengiriman</h2>
                </div>

                {/* Dropdown Pilih Alamat Tersimpan */}
                {addresses.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[var(--brand-black)] mb-1.5">Pilih Alamat Tersimpan</label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowAddressDropdown(!showAddressDropdown)}
                        className="w-full px-4 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm text-left flex items-center justify-between hover:border-[var(--brand-black)] transition-colors"
                      >
                        <span>
                          {selectedAddressId
                            ? (() => {
                                const addr = addresses.find((a) => a.id === selectedAddressId);
                                return addr ? `${addr.label} — ${addr.penerima}, ${addr.kota}` : "Pilih alamat...";
                              })()
                            : "Pilih alamat..."}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showAddressDropdown ? "rotate-180" : ""}`} />
                      </button>
                      {showAddressDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-[var(--brand-white)] border border-[var(--brand-border)] rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {addresses.map((addr) => (
                            <button
                              key={addr.id}
                              type="button"
                              onClick={() => handleSelectAddress(addr.id)}
                              className={`w-full px-4 py-3 text-left text-sm hover:bg-[var(--brand-gray)] transition-colors border-b border-[var(--brand-border)] last:border-b-0 ${
                                selectedAddressId === addr.id ? "bg-[var(--brand-gray)] font-medium" : ""
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{addr.label}</span>
                                {addr.is_utama && (
                                  <span className="text-xs bg-[var(--brand-black)] text-[var(--brand-white)] px-2 py-0.5 rounded-full">Utama</span>
                                )}
                              </div>
                              <p className="text-xs text-[var(--brand-muted)] mt-0.5">{addr.penerima} • {addr.no_telepon}</p>
                              <p className="text-xs text-[var(--brand-muted)]">
                                {addr.alamat}, {addr.kecamatan ? `${addr.kecamatan}, ` : ""}{addr.kota}{addr.provinsi ? `, ${addr.provinsi}` : ""} {addr.kode_pos}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {addresses.length === 0 ? (
                  <div className="text-center py-6 bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-4 mt-4">
                    <p className="text-amber-700 text-sm">
                      Kamu belum memiliki alamat pengiriman tersimpan. Silakan tambahkan alamat pengiriman terlebih dahulu di halaman Profil untuk kalkulasi ongkos kirim RajaOngkir yang akurat.
                    </p>
                    <Link href="/profil">
                      <MButton>
                        Kelola Alamat di Profil
                      </MButton>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6 mt-4">
                    {selectedAddressId && (() => {
                      const addr = addresses.find(a => a.id === selectedAddressId);
                      if (!addr) return null;
                      return (
                        <div className="p-4 bg-[var(--brand-gray)] border border-[var(--brand-border)] rounded-xl space-y-1">
                          <p className="text-sm font-semibold text-[var(--brand-black)]">{addr.penerima} ({addr.label})</p>
                          <p className="text-sm text-[var(--brand-muted)]">{addr.no_telepon}</p>
                          <p className="text-sm text-[var(--brand-muted)]">
                            {addr.alamat}, {addr.kecamatan ? `${addr.kecamatan}, ` : ""}{addr.kota}{addr.provinsi ? `, ${addr.provinsi}` : ""} {addr.kode_pos}
                          </p>
                        </div>
                      );
                    })()}

                    <div>
                      <label className="block text-sm font-medium text-[var(--brand-black)] mb-1.5">Catatan untuk Kurir (Opsional)</label>
                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-4 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)] focus:border-transparent resize-none"
                        placeholder="Contoh: Titip di satpam, pagar warna hitam, dll."
                      />
                    </div>

                    <MButton className="w-full" onClick={() => setStep(2)} disabled={!selectedAddressId}>
                      Lanjut ke Pengiriman
                    </MButton>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Shipping */}
            {step === 2 && (
              <div className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="w-5 h-5 text-[var(--brand-black)]" />
                  <h2 className="text-lg font-semibold text-[var(--brand-black)]">Metode Pengiriman</h2>
                </div>

                {/* Pilih Kurir */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[var(--brand-black)] mb-2">Pilih Kurir</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: "jne", name: "JNE" },
                      { id: "tiki", name: "TIKI" }
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleCourierChange(c.id)}
                        className={`py-3 px-4 rounded-lg border font-semibold text-center text-sm transition-all ${
                          courier === c.id
                            ? "border-[var(--brand-black)] bg-[var(--brand-gray)] text-[var(--brand-black)]"
                            : "border-[var(--brand-border)] hover:border-[var(--brand-black)] text-[var(--brand-muted)]"
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pilih Layanan */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-[var(--brand-black)]">Pilih Layanan Pengiriman</label>
                  {isLoadingShipping ? (
                    <div className="flex justify-center py-6">
                      <MLoader size="sm" />
                    </div>
                  ) : shippingOptions.length === 0 ? (
                    <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg p-4">
                      Tidak ada opsi pengiriman tersedia. Pastikan alamat utama Anda sudah terisi dengan benar (Provinsi, Kota, Kecamatan).
                    </p>
                  ) : (
                    shippingOptions.map((option) => (
                      <button
                        key={option.service}
                        type="button"
                        onClick={() => {
                          setSelectedShippingService(option.service);
                          setShippingCost(option.cost);
                        }}
                        className={`w-full p-4 rounded-lg border text-left transition-all ${
                          selectedShippingService === option.service
                            ? "border-[var(--brand-black)] bg-[var(--brand-gray)]"
                            : "border-[var(--brand-border)] hover:border-[var(--brand-black)]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-[var(--brand-black)]">
                              {courier.toUpperCase()} {option.service}
                            </p>
                            <p className="text-xs text-[var(--brand-muted)] mb-1">{option.description}</p>
                            <p className="text-xs text-[var(--brand-muted)]">
                              Estimasi: {option.etd.toLowerCase().includes("day") ? option.etd.replace("day", "hari") : option.etd}
                            </p>
                          </div>
                          <p className="font-semibold text-[var(--brand-black)]">{formatPrice(option.cost)}</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="flex gap-4 mt-6">
                  <MButton variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    Kembali
                  </MButton>
                  <MButton 
                    className="flex-1" 
                    onClick={handleSubmit} 
                    disabled={submitting || isLoadingShipping || !selectedShippingService}
                  >
                    {submitting ? <MLoader inline size="sm" text="Memproses..." /> : "Buat Pesanan"}
                  </MButton>
                </div>
              </div>
            )}


          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-[var(--brand-black)] mb-4">Ringkasan Pesanan</h2>
              <div className="space-y-4 mb-4">
                {checkoutItems.map((item) => (
                  <div key={item.variantId} className="flex gap-3">
                    <div className="w-16 h-16 bg-[var(--brand-gray)] rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image ? getImageUrl(item.image) : "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[var(--brand-black)] text-sm line-clamp-1">{item.name}</p>
                      <p className="text-xs text-[var(--brand-muted)]">{item.size} • {item.color} • x{item.quantity}</p>
                      <p className="text-sm font-semibold mt-1">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Voucher Input */}
              <div className="border-t border-[var(--brand-border)] pt-4 pb-2">
                <label className="block text-xs font-semibold text-[var(--brand-black)] mb-1.5 uppercase tracking-wider">Voucher / Kode Promo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Masukkan kode..."
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                    disabled={!!appliedVoucher}
                    className="flex-1 px-3 py-1.5 border border-[var(--brand-border)] rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)]"
                  />
                  {appliedVoucher ? (
                    <MButton
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={handleRemoveVoucher}
                    >
                      Hapus
                    </MButton>
                  ) : (
                    <MButton
                      variant="primary"
                      size="sm"
                      disabled={isLoadingVoucher || !voucherInput.trim()}
                      onClick={handleApplyVoucher}
                    >
                      {isLoadingVoucher ? "..." : "Pakai"}
                    </MButton>
                  )}
                </div>
                {voucherError && <p className="text-xs text-red-500 mt-1">{voucherError}</p>}
                {appliedVoucher && (
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    Voucher "{appliedVoucher.kode}" berhasil digunakan!
                  </p>
                )}
              </div>

              <div className="border-t border-[var(--brand-border)] pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--brand-muted)]">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Diskon Voucher</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[var(--brand-muted)]">Pengiriman</span>
                  <span className="font-medium">{formatPrice(shipping)}</span>
                </div>
                <div className="border-t border-[var(--brand-border)] pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-[var(--brand-black)]">Total</span>
                    <span className="font-bold text-lg text-[var(--brand-black)]">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<MLoader />}>
      <CheckoutContent />
    </Suspense>
  );
}
