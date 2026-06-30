"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Minus, Plus, ShoppingCart, Heart, Star, Truck, Shield, RefreshCw, Loader2, User, X, Sparkles, Award } from "lucide-react";
import { MButton } from "@/components/manola/MButton";
import { MBadge } from "@/components/manola/MBadge";
import { authService, type User as AuthUser } from "@/lib/services/authService";
import { productService, type Product, type ProductVariant } from "@/lib/services/productService";
import { reviewService, wishlistService, type Review } from "@/lib/services/miscServices";
import { useCart } from "@/lib/CartContext";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { toast } from "sonner";
import { NotificationBell } from "@/components/manola/NotificationBell";

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

  const [showSizeCalc, setShowSizeCalc] = useState(false);
  const [sizeCalcBB, setSizeCalcBB] = useState("");
  const [sizeCalcTB, setSizeCalcTB] = useState("");
  const [sizeResult, setSizeResult] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"detail" | "panduan">("detail");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    try {
      setCurrentUser(authService.getCurrentUser());
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  }, []);

  const [wishlistId, setWishlistId] = useState<number | null>(null);
  const isInWishlist = wishlistId !== null;

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

        // Check if in wishlist if user is logged in
        if (authService.getCurrentUser()) {
          const wishlists = await wishlistService.getAll();
          const found = wishlists.find((w) => w.productId === productId);
          setWishlistId(found ? found.id : null);
        }
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
  const allSizes = Array.from(new Set(product?.variants?.map((v) => v.size) ?? []));
  const sizes = allSizes.filter((s) => s !== "-"); // Sembunyikan "-" dari tampilan user
  const hasRealSizes = sizes.length > 0;
  const effectiveSize = hasRealSizes ? selectedSize : "-";
  const availableColors = product?.variants
    ?.filter((v) => !effectiveSize || v.size === effectiveSize)
    .map((v) => v.color)
    .filter(Boolean) as string[] ?? [];
  const uniqueColors = Array.from(new Set(availableColors));

  // Find the selected variant
  const selectedVariant: ProductVariant | undefined = product?.variants?.find(
    (v) => v.size === effectiveSize && (v.color === selectedColor || (!v.color && !selectedColor))
  );

  const totalStock = product?.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0";

  const handleAddToCart = async () => {
    if (!product) return;
    if (hasRealSizes && !selectedSize) {
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
    
    try {
      await addItem(selectedVariant.id, quantity);
    } catch (e) {
      // Error handled by CartContext toast
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (hasRealSizes && !selectedSize) {
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
    if (!currentUser) {
      toast.error("Silakan login terlebih dahulu untuk checkout");
      router.push("/login");
      return;
    }
    const buyNowItem = {
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      price: product.promoPrice ?? product.price,
      image: product.images?.[0]?.url ?? "",
      size: hasRealSizes ? (selectedSize ?? "") : "",
      color: selectedColor ?? "-",
      quantity,
      stock: selectedVariant.stock,
    };
    sessionStorage.setItem("buyNowItem", JSON.stringify([buyNowItem]));
    router.push("/checkout?buy_now=true");
  };

  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const handleAddToWishlist = async () => {
    if (!currentUser) {
      toast.error("Masuk untuk menyimpan ke wishlist");
      router.push("/login");
      return;
    }
    try {
      setAddingToWishlist(true);
      if (wishlistId !== null) {
        await wishlistService.remove(wishlistId);
        setWishlistId(null);
        toast.success(`${product!.name} dihapus dari wishlist`);
      } else {
        const added = await wishlistService.add(product!.id);
        setWishlistId(added.id);
        toast.success(`${product!.name} ditambahkan ke wishlist`);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Gagal mengupdate wishlist";
      if (msg.toLowerCase().includes("sudah ada") && wishlistId === null) {
        toast.error("Produk ini sudah ada di wishlist kamu. Muat ulang halaman.");
      } else {
        toast.error(msg);
      }
    } finally {
      setAddingToWishlist(false);
    }
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
            <div className="flex items-center gap-4">
              {currentUser?.role === "USER" && (
                <>
                  <NotificationBell />
                  <Link href="/cart" className="relative p-2 hover:bg-[var(--brand-gray)] rounded-lg transition-colors">
                    <ShoppingCart className="w-5 h-5 text-[var(--brand-black)]" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--brand-black)] text-[var(--brand-white)] text-xs font-medium rounded-full flex items-center justify-center">{cartCount}</span>
                    )}
                  </Link>
                </>
              )}
              {currentUser ? (
                <Link
                  href={
                    {
                      OWNER: "/owner/dashboard",
                      ADMIN: "/admin/dashboard",
                      KASIR: "/kasir/transaksi",
                      PACKAGING: "/packaging/pesanan",
                      USER: "/profil",
                    }[currentUser.role] || "/profil"
                  }
                  className="p-2 hover:bg-[var(--brand-gray)] rounded-lg transition-colors"
                >
                  <User className="w-5 h-5 text-[var(--brand-black)]" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-[var(--brand-black)] hover:bg-[var(--brand-gray)] rounded-lg transition-colors border border-[var(--brand-border)]"
                >
                  Masuk
                </Link>
              )}
            </div>
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
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx ? "border-[var(--brand-black)]" : "border-[var(--brand-border)]"
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
                <Link href={`/?category=${encodeURIComponent(product.category ?? "")}`}>
                  <MBadge variant="secondary" className="cursor-pointer hover:bg-gray-200 transition-colors">{product.category ?? "-"}</MBadge>
                </Link>
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
              {product.promoPrice ? (
                <>
                  <span className="text-3xl font-bold text-red-500">{formatPrice(product.promoPrice)}</span>
                  <span className="text-lg text-[var(--brand-muted)] line-through">{formatPrice(product.price)}</span>
                </>
              ) : (
                <span className="text-3xl font-bold text-[var(--brand-black)]">{formatPrice(product.price)}</span>
              )}
            </div>

            {/* Size Selection */}
            {hasRealSizes && (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <p className="text-sm font-medium text-[var(--brand-black)]">Ukuran</p>
                  <button
                    onClick={() => { setShowSizeCalc(true); setSizeResult(null); setSizeCalcBB(""); setSizeCalcTB(""); }}
                    className="text-xs text-[var(--brand-muted)] hover:text-[var(--brand-black)] underline transition-colors"
                  >
                    Bingung pilih ukuran?
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setSelectedColor(null);
                      }}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedSize === size
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
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${selectedColor === color
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

            {/* Tabs Detail & Panduan */}
            <div className="border-b border-[var(--brand-border)] mb-4">
              <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab("detail")}
                  className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "detail"
                      ? "border-[var(--brand-black)] text-[var(--brand-black)]"
                      : "border-transparent text-[var(--brand-muted)] hover:text-[var(--brand-black)] hover:border-[var(--brand-border)]"
                    }`}
                >
                  Deskripsi Produk
                </button>
                {product.descriptionImageUrl && (
                  <button
                    onClick={() => setActiveTab("panduan")}
                    className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === "panduan"
                        ? "border-[var(--brand-black)] text-[var(--brand-black)]"
                        : "border-transparent text-[var(--brand-muted)] hover:text-[var(--brand-black)] hover:border-[var(--brand-border)]"
                      }`}
                  >
                    Tentang Produk
                  </button>
                )}
              </nav>
            </div>

            <div className="mb-6">
              {activeTab === "detail" && (
                <p className="text-[var(--brand-muted)] leading-relaxed whitespace-pre-line text-sm">
                  {product.description || "Tidak ada deskripsi."}
                </p>
              )}
              {activeTab === "panduan" && product.descriptionImageUrl && (
                <div
                  className="rounded-xl overflow-hidden border border-[var(--brand-border)] max-w-[250px] bg-[var(--brand-white)] cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setPreviewImage(getImageUrl(product.descriptionImageUrl!))}
                >
                  <img
                    src={getImageUrl(product.descriptionImageUrl)}
                    alt="Panduan Produk"
                    className="w-full h-auto object-contain"
                  />
                </div>
              )}
            </div>

            {/* Quantity & Add to Cart & Wishlist */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="flex items-center border border-[var(--brand-border)] rounded-lg w-max">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-[var(--brand-gray)] transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-[var(--brand-gray)] transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-1 items-center gap-2">
                {!currentUser ? (
                  <MButton className="flex-1" size="lg" onClick={() => router.push("/login")}>
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Masuk untuk Membeli
                  </MButton>
                ) : currentUser?.role === "USER" ? (
                  <>
                    <MButton variant="outline" className="flex-1 border-[var(--brand-black)] text-[var(--brand-black)] hover:bg-[var(--brand-gray)]" size="lg" onClick={handleAddToCart} disabled={totalStock <= 0}>
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {totalStock <= 0 ? "Habis" : "Keranjang"}
                    </MButton>
                    <MButton className="flex-1" size="lg" onClick={handleBuyNow} disabled={totalStock <= 0}>
                      {totalStock <= 0 ? "Stok Habis" : "Beli Sekarang"}
                    </MButton>
                  </>
                ) : null}

                <MButton
                  variant="outline"
                  size="lg"
                  className="px-4 shrink-0 border-[var(--brand-border)] hover:bg-gray-50"
                  onClick={handleAddToWishlist}
                  disabled={addingToWishlist}
                >
                  {addingToWishlist ? <Loader2 className="w-5 h-5 animate-spin" /> : <Heart className={`w-5 h-5 transition-colors ${isInWishlist ? "fill-red-500 text-red-500" : ""}`} />}
                </MButton>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-y border-[var(--brand-border)] mt-6">
              <div className="text-center">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-[var(--brand-muted)]" />
                <p className="text-xs text-[var(--brand-muted)]">Bahan Premium</p>
              </div>
              <div className="text-center">
                <Heart className="w-6 h-6 mx-auto mb-2 text-[var(--brand-muted)]" />
                <p className="text-xs text-[var(--brand-muted)]">Local Pride</p>
              </div>
              <div className="text-center">
                <Award className="w-6 h-6 mx-auto mb-2 text-[var(--brand-muted)]" />
                <p className="text-xs text-[var(--brand-muted)]">Berkualitas</p>
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
                  {review.komentar && <p className="text-sm text-[var(--brand-black)] mb-3">{review.komentar}</p>}
                  {review.images && review.images.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {review.images.map((img) => (
                        <div key={img.id} className="w-16 h-16 rounded-lg border border-[var(--brand-border)] overflow-hidden cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setPreviewImage(getImageUrl(img.url))}>
                          <img src={getImageUrl(img.url)} alt="Review" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Size Calculator Modal */}
      {showSizeCalc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={() => setShowSizeCalc(false)}>
          <div className="bg-[var(--brand-white)] rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[var(--brand-black)] text-center">Rekomendasi Ukuran</h3>
            <p className="text-sm text-[var(--brand-muted)] text-center">Masukkan data tubuhmu untuk mendapatkan saran ukuran yang pas</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--brand-black)] mb-1">Berat Badan (kg)</label>
                <input
                  type="number"
                  value={sizeCalcBB}
                  onChange={(e) => setSizeCalcBB(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)]"
                  placeholder="Contoh: 65"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--brand-black)] mb-1">Tinggi Badan (cm)</label>
                <input
                  type="number"
                  value={sizeCalcTB}
                  onChange={(e) => setSizeCalcTB(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)]"
                  placeholder="Contoh: 170"
                />
              </div>
            </div>
            <button
              onClick={() => {
                const bb = parseFloat(sizeCalcBB);
                const tb = parseFloat(sizeCalcTB);
                if (!bb || !tb || bb <= 0 || tb <= 0) {
                  setSizeResult("Mohon isi berat dan tinggi badan yang valid.");
                  return;
                }
                let recommended = "XL";
                if (tb <= 160 && bb <= 55) recommended = "S";
                else if (tb <= 170 && bb <= 65) recommended = "M";
                else if (tb <= 175 && bb <= 75) recommended = "L";
                setSizeResult(recommended);
              }}
              className="w-full bg-[var(--brand-black)] text-[var(--brand-white)] py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Cek Ukuran
            </button>
            {sizeResult && (
              <div className="text-center p-4 bg-[var(--brand-gray)] rounded-xl">
                {sizeResult.length <= 2 ? (
                  <>
                    <p className="text-sm text-[var(--brand-muted)] mb-1">Berdasarkan BB & TB kamu, kami menyarankan:</p>
                    <p className="text-3xl font-bold text-[var(--brand-black)]">{sizeResult}</p>
                    <button
                      onClick={() => {
                        setSelectedSize(sizeResult);
                        setSelectedColor(null);
                        setShowSizeCalc(false);
                      }}
                      className="mt-3 text-sm underline text-[var(--brand-muted)] hover:text-[var(--brand-black)] transition-colors"
                    >
                      Pilih ukuran {sizeResult}
                    </button>
                  </>
                ) : (
                  <p className="text-sm text-red-500">{sizeResult}</p>
                )}
              </div>
            )}
            <button
              onClick={() => setShowSizeCalc(false)}
              className="w-full text-sm text-[var(--brand-muted)] hover:text-[var(--brand-black)] transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 sm:-right-10 text-white hover:text-gray-300 transition-colors p-2"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
