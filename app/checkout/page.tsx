"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, CreditCard, Truck, MapPin } from "lucide-react"
import { MLoader } from "@/components/manola/MLoader";
import { MButton } from "@/components/manola/MButton";
import { MInput } from "@/components/manola/MInput";
import { useCart } from "@/lib/CartContext";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { orderService } from "@/lib/services/orderService";

// Cart items are now provided by CartContext below

const shippingOptions = [
  { id: "jne-reg", name: "JNE Reguler", price: 25000, eta: "3-5 hari" },
  { id: "jne-yes", name: "JNE YES", price: 45000, eta: "1-2 hari" },
  { id: "sicepat", name: "SiCepat REG", price: 22000, eta: "2-4 hari" },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items: cartItems, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0].id);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    notes: "" });

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingOption = shippingOptions.find((s) => s.id === selectedShipping);
  const shipping = shippingOption?.price || 0;
  const total = subtotal + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (cartItems.length === 0) {
      toast.error("Keranjang kosong");
      return;
    }
    if (!formData.address || !formData.name) {
      toast.error("Harap lengkapi data alamat pengiriman");
      return;
    }
    setSubmitting(true);
    try {
      const fullAddress = `${formData.address}, ${formData.city} ${formData.postalCode}`.trim();
      await orderService.create({
        jenis: "ONLINE",
        alamat_pengiriman: fullAddress,
        ongkos_kirim: shipping,
        catatan: formData.notes || undefined,
        items: cartItems.map((item) => ({
          variantId: item.variantId,
          jumlah: item.quantity })) });
      toast.success("Pesanan berhasil dibuat! Anda akan diarahkan ke halaman utama.");
      clearCart();
      setTimeout(() => router.push("/"), 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal membuat pesanan";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--brand-gray)]">
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
                <div className="grid sm:grid-cols-2 gap-4">
                  <MInput label="Nama Lengkap" name="name" value={formData.name} onChange={handleInputChange} placeholder="Masukkan nama lengkap" />
                  <MInput label="Nomor Telepon" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="08xxxxxxxxxx" />
                  <MInput label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="email@example.com" className="sm:col-span-2" />
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-[var(--brand-black)] mb-1.5">Alamat Lengkap</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)] focus:border-transparent resize-none"
                      placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                    />
                  </div>
                  <MInput label="Kota / Kabupaten" name="city" value={formData.city} onChange={handleInputChange} placeholder="Masukkan kota" />
                  <MInput label="Kode Pos" name="postalCode" value={formData.postalCode} onChange={handleInputChange} placeholder="12345" />
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-[var(--brand-black)] mb-1.5">Catatan (Opsional)</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)] focus:border-transparent resize-none"
                      placeholder="Catatan untuk kurir (opsional)"
                    />
                  </div>
                </div>
                <MButton className="w-full mt-6" onClick={() => setStep(2)}>
                  Lanjut ke Pengiriman
                </MButton>
              </div>
            )}

            {/* Step 2: Shipping */}
            {step === 2 && (
              <div className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Truck className="w-5 h-5 text-[var(--brand-black)]" />
                  <h2 className="text-lg font-semibold text-[var(--brand-black)]">Metode Pengiriman</h2>
                </div>
                <div className="space-y-3">
                  {shippingOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedShipping(option.id)}
                      className={`w-full p-4 rounded-lg border text-left transition-all ${
                        selectedShipping === option.id
                          ? "border-[var(--brand-black)] bg-[var(--brand-gray)]"
                          : "border-[var(--brand-border)] hover:border-[var(--brand-black)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-[var(--brand-black)]">{option.name}</p>
                          <p className="text-sm text-[var(--brand-muted)]">Estimasi: {option.eta}</p>
                        </div>
                        <p className="font-semibold text-[var(--brand-black)]">{formatPrice(option.price)}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-4 mt-6">
                  <MButton variant="outline" className="flex-1" onClick={() => setStep(1)}>
                    Kembali
                  </MButton>
                  <MButton className="flex-1" onClick={handleSubmit} disabled={submitting}>
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
                {cartItems.map((item) => (
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
              <div className="border-t border-[var(--brand-border)] pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--brand-muted)]">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
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
