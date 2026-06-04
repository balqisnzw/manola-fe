"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, ShoppingCart, Heart, Star, Truck, Shield, RefreshCw, Loader2 } from "lucide-react";
import { MButton } from "@/components/manola/MButton";
import { MBadge } from "@/components/manola/MBadge";
import { authService, type User as AuthUser } from "@/lib/services/authService";
import { productService, type Product, type ProductVariant } from "@/lib/services/productService";
import { reviewService, type Review } from "@/lib/services/miscServices";
import { useCart } from "@/lib/CartContext";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      setCurrentUser(authService.getCurrentUser());
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [productData, reviewData] = await Promise.all([
          productService.getById(productId),
          reviewService.getProductReviews(productId),
        ]);
        setProduct(productData);
        setReviews(reviewData);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    if (productId) loadData();
  }, [productId]);

  const { cartCount, addItem } = useCart();

  // Derive unique sizes and colors from variants
  const sizes = Array.from(new Set(product?.variants?.map((v) => v.size) ?? []));
  const availableColors = product?.variants
    ?.filter((v) => !selectedSize || v.size === selectedSize)
    .map((v) => v.color)
    .filter(Boolean) as string[] ?? [];
  const uniqueColors = Array.from(new Set(availableColors));

  // Find the selected variant
  const selectedVariant: ProductVariant | undefined = product?.variants?.find(
    (v) => v.size === selectedSize && (v.color === selectedColor || (!v.color && !selectedColor))
  );

  const totalStock = product?.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0";

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) {
      toast.error("Pilih ukuran terlebih dahulu");
      return;
    }
    if (uniqueColors.length > 0 && !selectedColor) {
      toast.error("Pilih warna terlebih dahulu");
      return;
    }
    if (!selectedVariant) {
      toast.error("Varian tidak ditemukan");
      return;
    }
    if (selectedVariant.stock < quantity) {
      toast.error(`Stok tidak cukup. Tersedia: ${selectedVariant.stock}`);
      return;
    }
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0]?.url ?? "",
      size: selectedSize,
      color: selectedColor ?? "-",
      quantity,
      stock: selectedVariant.stock,
    });
    toast.success(`${product.name} (${selectedSize}${selectedColor ? `, ${selectedColor}` : ""}) ditambahkan ke keranjang`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--brand-gray)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-muted)]" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[var(--brand-gray)] flex flex-col items-center justify-center">
        <p className="text-[var(--brand-muted)] mb-4">Produk tidak ditemukan</p>
        <MButton onClick={() => router.push("/")}>Kembali ke Beranda</MButton>
      </div>
    );
  }

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
            {currentUser?.role === "USER" && (
              <Link href="/cart" className="relative p-2 hover:bg-[var(--brand-gray)] rounded-lg transition-colors">
                <ShoppingCart className="w-5 h-5 text-[var(--brand-black)]" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--brand-black)] text-[var(--brand-white)] text-xs font-medium rounded-full flex items-center justify-center">{cartCount}</span>
                )}
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-[var(--brand-white)] rounded-2xl overflow-hidden border border-[var(--brand-border)]">
              {product.images?.[selectedImage]?.url ? (
                <img
                  src={getImageUrl(product.images[selectedImage].url)}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--brand-muted)]">No Image</div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === idx ? "border-[var(--brand-black)]" : "border-[var(--brand-border)]"
                    }`}
                  >
                    <img src={getImageUrl(img.url)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MBadge variant="secondary">{product.category ?? "-"}</MBadge>
              </div>
              <h1 className="text-3xl font-bold text-[var(--brand-black)] mb-2">{product.name}</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{avgRating}</span>
                </div>
                <span className="text-[var(--brand-muted)]">({reviews.length} ulasan)</span>
                <span className="text-[var(--brand-muted)]">•</span>
                <span className="text-[var(--brand-muted)]">Stok: {totalStock}</span>
              </div>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-[var(--brand-black)]">{formatPrice(product.price)}</span>
            </div>

            <p className="text-[var(--brand-muted)] leading-relaxed">{product.description}</p>

            {/* Size Selection */}
            {sizes.length > 0 && (
              <div>
                <p className="text-sm font-medium text-[var(--brand-black)] mb-3">Ukuran</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setSelectedColor(null);
                      }}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
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
            )}

            {/* Color Selection */}
            {uniqueColors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-[var(--brand-black)] mb-3">
                  Warna {selectedColor && <span className="font-normal text-[var(--brand-muted)]">— {selectedColor}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {uniqueColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
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
            )}

            {/* Variant stock info */}
            {selectedVariant && (
              <p className="text-sm text-[var(--brand-muted)]">
                Stok varian ini: <span className={selectedVariant.stock <= 3 ? "text-red-500 font-semibold" : "text-green-600 font-semibold"}>{selectedVariant.stock}</span>
              </p>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-[var(--brand-border)] rounded-lg">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-[var(--brand-gray)] transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-[var(--brand-gray)] transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              {currentUser?.role === "USER" && (
                <MButton className="flex-1" size="lg" onClick={handleAddToCart} disabled={totalStock <= 0}>
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {totalStock <= 0 ? "Stok Habis" : "Tambah ke Keranjang"}
                </MButton>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[var(--brand-border)]">
              <div className="text-center">
                <Truck className="w-6 h-6 mx-auto mb-2 text-[var(--brand-muted)]" />
                <p className="text-xs text-[var(--brand-muted)]">Free Ongkir</p>
              </div>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-2 text-[var(--brand-muted)]" />
                <p className="text-xs text-[var(--brand-muted)]">Garansi Asli</p>
              </div>
              <div className="text-center">
                <RefreshCw className="w-6 h-6 mx-auto mb-2 text-[var(--brand-muted)]" />
                <p className="text-xs text-[var(--brand-muted)]">30 Hari Return</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-[var(--brand-black)] mb-6">Ulasan ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <div className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-8 text-center">
              <p className="text-[var(--brand-muted)]">Belum ada ulasan untuk produk ini</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--brand-gray)] flex items-center justify-center font-semibold text-[var(--brand-muted)]">
                        {review.user?.nama?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--brand-black)]">{review.user?.nama ?? "Anonim"}</p>
                        <p className="text-xs text-[var(--brand-muted)]">{new Date(review.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.komentar && <p className="text-sm text-[var(--brand-muted)]">{review.komentar}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
