"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { MButton } from "@/components/manola/MButton";
import { useCart } from "@/lib/CartContext";
import { formatPrice, getImageUrl } from "@/lib/utils";


export default function CartPage() {
  const router = useRouter();
  const { items: cartItems, updateQuantity, removeItem } = useCart();

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 500000 ? 0 : 25000;
  const total = subtotal + shipping;

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
        <h1 className="text-2xl font-bold text-[var(--brand-black)] mb-8">Keranjang Belanja</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)]">
            <ShoppingBag className="w-16 h-16 mx-auto text-[var(--brand-muted)] mb-4" />
            <h2 className="text-xl font-semibold text-[var(--brand-black)] mb-2">Keranjang Kosong</h2>
            <p className="text-[var(--brand-muted)] mb-6">Belum ada produk di keranjang belanja Anda</p>
            <MButton onClick={() => router.push("/")}>Mulai Belanja</MButton>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.variantId} className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-4 sm:p-6">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-[var(--brand-gray)] rounded-lg overflow-hidden flex-shrink-0">
                      <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-[var(--brand-black)] line-clamp-1">{item.name}</h3>
                          <p className="text-sm text-[var(--brand-muted)] mt-1">
                            {item.size} • {item.color}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.variantId)}
                          className="p-2 text-[var(--brand-muted)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="flex items-end justify-between mt-4">
                        <div className="flex items-center border border-[var(--brand-border)] rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            className="p-2 hover:bg-[var(--brand-gray)] transition-colors rounded-l-lg"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            className="p-2 hover:bg-[var(--brand-gray)] transition-colors rounded-r-lg"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="font-bold text-[var(--brand-black)]">{formatPrice(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-6 sticky top-24">
                <h2 className="text-lg font-semibold text-[var(--brand-black)] mb-4">Ringkasan Pesanan</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--brand-muted)]">Subtotal ({cartItems.reduce((sum, i) => sum + i.quantity, 0)} item)</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--brand-muted)]">Ongkos Kirim</span>
                    <span className="font-medium">{shipping === 0 ? "Gratis" : formatPrice(shipping)}</span>
                  </div>
                  {subtotal < 500000 && (
                    <p className="text-xs text-[var(--brand-muted)] bg-[var(--brand-gray)] p-2 rounded">
                      Tambah {formatPrice(500000 - subtotal)} lagi untuk gratis ongkir!
                    </p>
                  )}
                  <div className="border-t border-[var(--brand-border)] pt-3 mt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-[var(--brand-black)]">Total</span>
                      <span className="font-bold text-lg text-[var(--brand-black)]">{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
                <MButton className="w-full mt-6" size="lg" onClick={() => router.push("/checkout")}>
                  Checkout
                </MButton>
                <MButton variant="outline" className="w-full mt-3" onClick={() => router.push("/")}>
                  Lanjut Belanja
                </MButton>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
