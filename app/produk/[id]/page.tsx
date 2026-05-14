"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, ShoppingCart, Heart, Star, Truck, Shield, RefreshCw } from "lucide-react";
import { MButton } from "@/components/manola/MButton";
import { MBadge } from "@/components/manola/MBadge";

const products = [
  { id: 1, name: "Urban Shadow Tee", price: 299000, originalPrice: 399000, images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"], category: "T-Shirt", rating: 4.8, reviews: 124, isNew: true, description: "Kaos premium dengan bahan cotton combed 30s yang lembut dan nyaman. Desain minimalis dengan detail bordir yang presisi. Cocok untuk gaya kasual sehari-hari.", sizes: ["S", "M", "L", "XL", "XXL"], colors: ["Hitam", "Putih", "Abu-abu"], stock: 45 },
  { id: 2, name: "Street Phantom Hoodie", price: 549000, originalPrice: null, images: ["/placeholder.svg", "/placeholder.svg"], category: "Hoodie", rating: 4.9, reviews: 89, isNew: false, description: "Hoodie tebal dengan fleece premium untuk kenyamanan maksimal. Dilengkapi kangaroo pocket dan drawstring hood. Material anti-pilling untuk durabilitas tinggi.", sizes: ["S", "M", "L", "XL"], colors: ["Hitam", "Navy"], stock: 28 },
  { id: 3, name: "Midnight Cargo Pants", price: 459000, originalPrice: 559000, images: ["/placeholder.svg"], category: "Pants", rating: 4.7, reviews: 56, isNew: false, description: "Celana cargo dengan potongan modern dan detail pocket fungsional. Bahan twill stretch yang nyaman untuk aktivitas sehari-hari.", sizes: ["28", "30", "32", "34", "36"], colors: ["Hitam", "Olive", "Khaki"], stock: 33 },
  { id: 4, name: "Neo Tokyo Jacket", price: 899000, originalPrice: null, images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"], category: "Jacket", rating: 4.9, reviews: 201, isNew: true, description: "Jaket bomber dengan inspirasi futuristik. Bahan taslan waterproof dengan lining satin premium. Detail embroidery eksklusif.", sizes: ["S", "M", "L", "XL"], colors: ["Hitam"], stock: 15 },
];

const reviews = [
  { id: 1, name: "Budi Santoso", rating: 5, date: "2 hari lalu", comment: "Kualitas bahan sangat bagus, jahitan rapi. Ukuran pas sesuai chart. Recommended!", avatar: "/placeholder.svg" },
  { id: 2, name: "Dewi Lestari", rating: 4, date: "1 minggu lalu", comment: "Desainnya keren, pengiriman cepat. Cuma ukurannya agak kecil sedikit.", avatar: "/placeholder.svg" },
  { id: 3, name: "Agus Pratama", rating: 5, date: "2 minggu lalu", comment: "Sudah ke-3 kalinya beli di Manola, selalu puas dengan kualitasnya!", avatar: "/placeholder.svg" },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);
  const product = products.find((p) => p.id === productId) || products[0];

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      alert("Pilih ukuran dan warna terlebih dahulu");
      return;
    }
    router.push("/cart");
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
            <Link href="/cart" className="relative p-2 hover:bg-[var(--brand-gray)] rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5 text-[var(--brand-black)]" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--brand-black)] text-[var(--brand-white)] text-xs font-medium rounded-full flex items-center justify-center">2</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-[var(--brand-white)] rounded-2xl overflow-hidden border border-[var(--brand-border)]">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? "border-[var(--brand-black)]" : "border-[var(--brand-border)]"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MBadge variant="secondary">{product.category}</MBadge>
                {product.isNew && <MBadge>NEW</MBadge>}
              </div>
              <h1 className="text-3xl font-bold text-[var(--brand-black)] mb-2">{product.name}</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{product.rating}</span>
                </div>
                <span className="text-[var(--brand-muted)]">({product.reviews} ulasan)</span>
                <span className="text-[var(--brand-muted)]">•</span>
                <span className="text-[var(--brand-muted)]">Stok: {product.stock}</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[var(--brand-black)]">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-[var(--brand-muted)] line-through">{formatPrice(product.originalPrice)}</span>
                  <MBadge variant="destructive">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </MBadge>
                </>
              )}
            </div>

            <p className="text-[var(--brand-muted)] leading-relaxed">{product.description}</p>

            {/* Size Selection */}
            <div>
              <p className="font-semibold text-[var(--brand-black)] mb-3">Ukuran</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border font-medium transition-all ${
                      selectedSize === size
                        ? "border-[var(--brand-black)] bg-[var(--brand-black)] text-[var(--brand-white)]"
                        : "border-[var(--brand-border)] hover:border-[var(--brand-black)]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <p className="font-semibold text-[var(--brand-black)] mb-3">Warna</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg border font-medium transition-all ${
                      selectedColor === color
                        ? "border-[var(--brand-black)] bg-[var(--brand-black)] text-[var(--brand-white)]"
                        : "border-[var(--brand-border)] hover:border-[var(--brand-black)]"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="font-semibold text-[var(--brand-black)] mb-3">Jumlah</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-[var(--brand-border)] rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-[var(--brand-gray)] transition-colors rounded-l-lg"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-3 hover:bg-[var(--brand-gray)] transition-colors rounded-r-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-[var(--brand-muted)]">Maksimal {product.stock} pcs</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <MButton size="lg" className="flex-1" onClick={handleAddToCart}>
                <ShoppingCart className="w-5 h-5 mr-2" />
                Tambah ke Keranjang
              </MButton>
              <MButton
                variant="outline"
                size="lg"
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={isWishlisted ? "border-red-500 text-red-500" : ""}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500" : ""}`} />
              </MButton>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[var(--brand-border)]">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto mb-2 text-[var(--brand-black)]" />
                <p className="text-xs text-[var(--brand-muted)]">Gratis Ongkir</p>
                <p className="text-xs font-medium">Min. 500rb</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-[var(--brand-black)]" />
                <p className="text-xs text-[var(--brand-muted)]">Garansi</p>
                <p className="text-xs font-medium">100% Original</p>
              </div>
              <div className="text-center">
                <RefreshCw className="w-6 h-6 mx-auto mb-2 text-[var(--brand-black)]" />
                <p className="text-xs text-[var(--brand-muted)]">Return</p>
                <p className="text-xs font-medium">7 Hari</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-[var(--brand-black)] mb-6">Ulasan Pelanggan</h2>
          <div className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] divide-y divide-[var(--brand-border)]">
            {reviews.map((review) => (
              <div key={review.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[var(--brand-gray)] overflow-hidden">
                    <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-[var(--brand-black)]">{review.name}</p>
                      <span className="text-sm text-[var(--brand-muted)]">{review.date}</span>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                        />
                      ))}
                    </div>
                    <p className="text-[var(--brand-muted)]">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
