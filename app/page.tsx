"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ShoppingCart, User, Menu, X, Star, Loader2, ChevronLeft, ChevronRight, ChevronDown, Filter, RotateCcw } from "lucide-react";
import { MButton } from "@/components/manola/MButton";
import { MBadge } from "@/components/manola/MBadge";
import { authService, type User as AuthUser } from "@/lib/services/authService";
import { productService, type Product } from "@/lib/services/productService";
import { useCart } from "@/lib/CartContext";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { ProductCardSkeleton } from "@/components/manola/Skeleton";
import { NotificationBell } from "@/components/manola/NotificationBell";
import { bannerService, settingService, type Banner } from "@/lib/services/miscServices";

function HomeContent() {
  const searchParams = useSearchParams();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { cartCount } = useCart();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Real data from API
  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [shopPhone, setShopPhone] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");
  // ── Filter sidebar states ────────────────────────────────────────────────────
  const [filterSize, setFilterSize] = useState<string | null>(null);
  const [filterColor, setFilterColor] = useState<string | null>(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [accordionOpen, setAccordionOpen] = useState<Record<string, boolean>>({
    category: false,
    size: false,
    color: false,
  });

  useEffect(() => {
    try {
      setCurrentUser(authService.getCurrentUser());
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const [prodData, bannerData, sData] = await Promise.all([
          productService.getAll(),
          bannerService.getAll(true),
          settingService.get()
        ]);
        setProducts(prodData);
        setBanners(bannerData);
        if (sData.logo_url) setLogoUrl(sData.logo_url);
        if (sData.shop_phone) setShopPhone(sData.shop_phone);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners]);

  // Derive categories from real products
  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean) as string[])
  ).map((cat) => ({
    id: cat.toLowerCase().replace(/\s+/g, ""),
    name: cat,
    count: products.filter((p) => p.category === cat).length,
  }));

  // Derive unique sizes and colors from all product variants
  const allSizes = Array.from(
    new Set(products.flatMap((p) => p.variants?.map((v) => v.size) ?? []).filter((s) => s && s !== "-"))
  ).sort();
  const allColors = Array.from(
    new Set(products.flatMap((p) => {
      const variantColors = p.variants?.map((v) => v.color).filter(Boolean) as string[] ?? [];
      const tagColors = p.colorTags ? p.colorTags.split(",").map((c) => c.trim()).filter(Boolean) : [];
      return [...variantColors, ...tagColors];
    }))
  ).sort();

  // Auto-select category from URL query param (e.g. from detail page badge click)
  useEffect(() => {
    const catParam = searchParams.get("category");
    if (catParam && products.length > 0) {
      const matchedCat = categories.find((c) => c.name === catParam);
      if (matchedCat) {
        setSelectedCategory(matchedCat.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, products]);

  const toggleAccordion = (key: string) => {
    setAccordionOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeFilterCount = [selectedCategory, filterSize, filterColor].filter(Boolean).length;

  const resetAllFilters = () => {
    setSelectedCategory(null);
    setFilterSize(null);
    setFilterColor(null);
    setSearchQuery("");
    setTempSearchQuery("");
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory ||
      product.category?.toLowerCase().replace(/\s+/g, "") === selectedCategory;
    const matchesSize =
      !filterSize ||
      product.variants?.some((v) => v.size.toLowerCase() === filterSize.toLowerCase());
    const matchesColor =
      !filterColor ||
      product.variants?.some((v) => v.color?.toLowerCase().includes(filterColor.toLowerCase())) ||
      product.colorTags?.toLowerCase().includes(filterColor.toLowerCase()) ||
      product.name?.toLowerCase().includes(filterColor.toLowerCase()) ||
      product.description?.toLowerCase().includes(filterColor.toLowerCase());
    return matchesSearch && matchesCategory && matchesSize && matchesColor;
  }).sort((a, b) => {
    const stockA = a.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
    const stockB = b.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
    if (stockA <= 0 && stockB > 0) return 1;
    if (stockA > 0 && stockB <= 0) return -1;
    
    if (sortBy === "termurah") return a.price - b.price;
    if (sortBy === "termahal") return b.price - a.price;
    if (sortBy === "terbaru") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "terlama") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === "terlaris") return (b.sold || 0) - (a.sold || 0);
    if (sortBy === "rating_tinggi") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "rating_rendah") return (a.rating || 0) - (b.rating || 0);
    
    return 0;
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(tempSearchQuery);
  };

  return (
    <div className="min-h-screen bg-[var(--brand-gray)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--brand-white)] border-b border-[var(--brand-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              {logoUrl ? (
                <img src={getImageUrl(logoUrl)} alt="MANOLA" className="h-8 object-contain" />
              ) : (
                <span className="text-2xl font-bold text-[var(--brand-black)]">MANOLA</span>
              )}
            </Link>



            {/* Search & Actions */}
            <div className="flex items-center gap-4">

              {currentUser?.role === "USER" && (
                <>
                  <NotificationBell />
                  <Link href="/cart" className="relative p-2 hover:bg-[var(--brand-gray)] rounded-lg transition-colors">
                    <ShoppingCart className="w-5 h-5 text-[var(--brand-black)]" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--brand-black)] text-[var(--brand-white)] text-xs font-medium rounded-full flex items-center justify-center">
                        {cartCount}
                      </span>
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

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-[var(--brand-gray)] rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[var(--brand-border)] bg-[var(--brand-white)]">
            <div className="px-4 py-4 space-y-4">
              <form onSubmit={handleSearch} className="relative">
                <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--brand-muted)] hover:text-[var(--brand-black)] transition-colors">
                  <Search className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={tempSearchQuery}
                  onChange={(e) => setTempSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-[var(--brand-gray)] border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)]"
                />
              </form>

            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className={`relative bg-[var(--brand-black)] text-[var(--brand-white)] overflow-hidden ${
        banners.length > 0 ? "h-[400px] sm:h-[500px]" : "min-h-[400px] sm:min-h-[500px] flex items-center"
      }`}>
        {banners.length > 0 ? (
          <div className="w-full relative h-full">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-1000 flex items-center ${
                  index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <div className="absolute inset-0">
                  <img
                    src={getImageUrl(banner.gambar)}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
            {banners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentSlide ? "bg-[var(--brand-white)] w-4" : "bg-gray-500"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 z-10 w-full">
            <div className="max-w-2xl">
              <MBadge variant="outline" className="mb-4 border-[var(--brand-white)] text-[var(--brand-white)]">
                New Collection 2026
              </MBadge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Street Culture.<br />Local Pride.
              </h1>
              <p className="text-lg text-gray-300 mb-8 max-w-lg">
                Koleksi streetwear lokal yang menggabungkan kenyamanan, gaya, dan identitas Indonesia untuk setiap momen.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Products Grid with Sidebar Filter */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8 sm:items-start">
            {/* ── Desktop Sidebar Filter ───────────────────────────────────────── */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 pb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-bold text-[var(--brand-black)] uppercase tracking-wider">Filter Produk</h3>
                  {activeFilterCount > 0 && (
                    <button onClick={resetAllFilters} className="text-xs text-[var(--brand-muted)] hover:text-[var(--brand-black)] transition-colors flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" /> Reset
                    </button>
                  )}
                </div>

                {/* Kategori */}
                <div className="border-t border-[var(--brand-border)]">
                  <button onClick={() => toggleAccordion("category")} className="flex items-center justify-between w-full py-4 text-sm font-semibold text-[var(--brand-black)] uppercase tracking-wide hover:opacity-70 transition-opacity">
                    Kategori
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${accordionOpen.category ? "rotate-180" : ""}`} />
                  </button>
                  {accordionOpen.category && (
                    <div className="pb-4 space-y-2 max-h-60 overflow-y-auto pr-1">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                          className={`block w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${selectedCategory === cat.id ? "bg-[var(--brand-black)] text-white font-medium" : "text-[var(--brand-muted)] hover:text-[var(--brand-black)] hover:bg-[var(--brand-gray)]"}`}
                        >
                          {cat.name} <span className="text-xs opacity-60">({cat.count})</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ukuran */}
                {allSizes.length > 0 && (
                  <div className="border-t border-[var(--brand-border)]">
                    <button onClick={() => toggleAccordion("size")} className="flex items-center justify-between w-full py-4 text-sm font-semibold text-[var(--brand-black)] uppercase tracking-wide hover:opacity-70 transition-opacity">
                      Ukuran
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${accordionOpen.size ? "rotate-180" : ""}`} />
                    </button>
                    {accordionOpen.size && (
                      <div className="pb-4 flex flex-wrap gap-2">
                        {allSizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setFilterSize(filterSize === size ? null : size)}
                            className={`px-3 py-1.5 text-sm border rounded transition-all ${filterSize === size ? "bg-[var(--brand-black)] text-white border-[var(--brand-black)]" : "border-[var(--brand-border)] text-[var(--brand-muted)] hover:border-[var(--brand-black)] hover:text-[var(--brand-black)]"}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Warna */}
                {allColors.length > 0 && (
                  <div className="border-t border-[var(--brand-border)]">
                    <button onClick={() => toggleAccordion("color")} className="flex items-center justify-between w-full py-4 text-sm font-semibold text-[var(--brand-black)] uppercase tracking-wide hover:opacity-70 transition-opacity">
                      Warna
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${accordionOpen.color ? "rotate-180" : ""}`} />
                    </button>
                    {accordionOpen.color && (
                      <div className="pb-4 space-y-1.5 max-h-64 overflow-y-auto pr-1">
                        {allColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setFilterColor(filterColor === color ? null : color)}
                            className={`block w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${filterColor === color ? "bg-[var(--brand-black)] text-white font-medium" : "text-[var(--brand-muted)] hover:text-[var(--brand-black)] hover:bg-[var(--brand-gray)]"}`}
                          >
                            {color}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="border-t border-[var(--brand-border)]" />
              </div>
            </aside>

            {/* ── Product Grid ─────────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">
              {/* Top bar: Title + Search + Sort */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-[var(--brand-black)]">
                    {selectedCategory ? categories.find((c) => c.id === selectedCategory)?.name : "Katalog Produk"}
                  </h2>
                  {activeFilterCount > 0 && (
                    <span className="text-xs bg-[var(--brand-black)] text-white px-2 py-0.5 rounded-full">
                      {activeFilterCount} filter
                    </span>
                  )}
                </div>
                {!loading && (
                  <div className="flex flex-row items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={() => setFilterDrawerOpen(true)}
                      className="lg:hidden flex items-center gap-2 px-4 py-2 border border-[var(--brand-border)] rounded-lg text-sm font-medium hover:bg-[var(--brand-gray)] transition-colors"
                    >
                      <Filter className="w-4 h-4" />
                      Filter
                      {activeFilterCount > 0 && (
                        <span className="w-5 h-5 bg-[var(--brand-black)] text-white text-xs rounded-full flex items-center justify-center">{activeFilterCount}</span>
                      )}
                    </button>
                    <p className="text-sm text-[var(--brand-muted)] whitespace-nowrap hidden sm:block">{filteredProducts.length} produk</p>
                    <form onSubmit={handleSearch} className="relative flex-1 sm:flex-none">
                      <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--brand-muted)] hover:text-[var(--brand-black)] transition-colors">
                        <Search className="w-4 h-4" />
                      </button>
                      <input
                        type="text"
                        placeholder="Cari produk..."
                        value={tempSearchQuery}
                        onChange={(e) => setTempSearchQuery(e.target.value)}
                        className="w-full sm:w-64 pl-10 pr-4 py-2 text-sm bg-white border border-[var(--brand-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)]"
                      />
                    </form>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-white border border-[var(--brand-border)] text-[var(--brand-black)] text-sm rounded-lg focus:ring-[var(--brand-black)] focus:border-[var(--brand-black)] block p-2 outline-none"
                    >
                      <option value="default">Default</option>
                      <option value="terbaru">Terbaru</option>
                      <option value="terlama">Terlama</option>
                      <option value="termurah">Harga: Terendah ke Tertinggi</option>
                      <option value="termahal">Harga: Tertinggi ke Terendah</option>
                      <option value="terlaris">Terlaris</option>
                      <option value="rating_tinggi">Rating: Tertinggi ke Terendah</option>
                      <option value="rating_rendah">Rating: Terendah ke Tertinggi</option>
                    </select>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {filteredProducts.map((product) => {
                    const firstImage = product.images?.[0]?.url;
                    const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
                    return (
                      <Link
                        key={product.id}
                        href={`/produk/${product.id}`}
                        className="group bg-[var(--brand-white)] rounded-xl overflow-hidden border border-[var(--brand-border)] hover:shadow-lg transition-all"
                      >
                        <div className="aspect-square bg-[var(--brand-gray)] relative overflow-hidden">
                          {firstImage ? (
                            <img
                              src={getImageUrl(firstImage)}
                              alt={product.name}
                              className={`w-full h-full object-cover transition-transform duration-300 ${totalStock <= 0 ? "opacity-50 grayscale" : "group-hover:scale-105"}`}
                            />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center text-[var(--brand-muted)] text-sm ${totalStock <= 0 ? "opacity-50 grayscale" : ""}`}>
                              No Image
                            </div>
                          )}
                          {totalStock <= 0 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 pointer-events-none">
                              <span className="text-white text-sm font-bold px-3 py-1 bg-red-600 rounded tracking-widest uppercase shadow-md">HABIS</span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-[var(--brand-muted)] mb-1">{product.category ?? "-"}</p>
                          <h3 className="font-semibold text-[var(--brand-black)] mb-2 line-clamp-1">{product.name}</h3>
                          {((product.rating !== undefined && product.rating > 0) || (product.sold !== undefined && product.sold > 0)) && (
                            <div className="flex items-center gap-2 mb-2 text-xs text-[var(--brand-muted)]">
                              {product.rating !== undefined && product.rating > 0 && (
                                <div className="flex items-center gap-1">
                                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                  <span className="font-medium text-[var(--brand-black)]">{product.rating}</span>
                                </div>
                              )}
                              {product.rating !== undefined && product.rating > 0 && product.sold !== undefined && product.sold > 0 && <span>|</span>}
                              {product.sold !== undefined && product.sold > 0 && <span>Terjual {product.sold}</span>}
                            </div>
                          )}
                          <div className="flex items-baseline gap-2">
                            {product.promoPrice ? (
                              <>
                                <span className="font-bold text-red-500">{formatPrice(product.promoPrice)}</span>
                                <span className="text-xs text-[var(--brand-muted)] line-through">{formatPrice(product.price)}</span>
                              </>
                            ) : (
                              <span className="font-bold text-[var(--brand-black)]">{formatPrice(product.price)}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {!loading && filteredProducts.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-[var(--brand-muted)]">Tidak ada produk ditemukan</p>
                  <MButton variant="outline" className="mt-4" onClick={resetAllFilters}>
                    Reset Filter
                  </MButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Mobile Filter Drawer ─────────────────────────────────────────────── */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFilterDrawerOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[var(--brand-border)] px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-lg font-bold text-[var(--brand-black)]">Filter Produk</h3>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button onClick={resetAllFilters} className="text-sm text-[var(--brand-muted)] hover:text-[var(--brand-black)] flex items-center gap-1">
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                )}
                <button onClick={() => setFilterDrawerOpen(false)} className="p-1 hover:bg-[var(--brand-gray)] rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              {/* Kategori */}
              <div className="border-b border-[var(--brand-border)]">
                <button onClick={() => toggleAccordion("category")} className="flex items-center justify-between w-full py-4 text-sm font-semibold text-[var(--brand-black)] uppercase tracking-wide">
                  Kategori
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${accordionOpen.category ? "rotate-180" : ""}`} />
                </button>
                {accordionOpen.category && (
                  <div className="pb-4 space-y-2 max-h-60 overflow-y-auto pr-1">
                    {categories.map((cat) => (
                      <button key={cat.id} onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)} className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${selectedCategory === cat.id ? "bg-[var(--brand-black)] text-white font-medium" : "text-[var(--brand-muted)] hover:bg-[var(--brand-gray)]"}`}>
                        {cat.name} <span className="text-xs opacity-60">({cat.count})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* Ukuran */}
              {allSizes.length > 0 && (
                <div className="border-b border-[var(--brand-border)]">
                  <button onClick={() => toggleAccordion("size")} className="flex items-center justify-between w-full py-4 text-sm font-semibold text-[var(--brand-black)] uppercase tracking-wide">
                    Ukuran
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${accordionOpen.size ? "rotate-180" : ""}`} />
                  </button>
                  {accordionOpen.size && (
                    <div className="pb-4 flex flex-wrap gap-2">
                      {allSizes.map((size) => (
                        <button key={size} onClick={() => setFilterSize(filterSize === size ? null : size)} className={`px-4 py-2 text-sm border rounded-lg transition-all ${filterSize === size ? "bg-[var(--brand-black)] text-white border-[var(--brand-black)]" : "border-[var(--brand-border)] text-[var(--brand-muted)]"}`}>
                          {size}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {/* Warna */}
              {allColors.length > 0 && (
                <div className="border-b border-[var(--brand-border)]">
                  <button onClick={() => toggleAccordion("color")} className="flex items-center justify-between w-full py-4 text-sm font-semibold text-[var(--brand-black)] uppercase tracking-wide">
                    Warna
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${accordionOpen.color ? "rotate-180" : ""}`} />
                  </button>
                  {accordionOpen.color && (
                    <div className="pb-4 space-y-1.5 max-h-64 overflow-y-auto pr-1">
                      {allColors.map((color) => (
                        <button key={color} onClick={() => setFilterColor(filterColor === color ? null : color)} className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${filterColor === color ? "bg-[var(--brand-black)] text-white font-medium" : "text-[var(--brand-muted)] hover:bg-[var(--brand-gray)]"}`}>
                          {color}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="sticky bottom-0 bg-white border-t border-[var(--brand-border)] px-6 py-4">
              <button onClick={() => setFilterDrawerOpen(false)} className="w-full bg-[var(--brand-black)] text-white py-3 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                Tampilkan {filteredProducts.length} Produk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[var(--brand-black)] text-[var(--brand-white)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              {logoUrl ? (
                <div className="bg-white inline-block p-1.5 rounded-lg mb-2">
                  <img src={getImageUrl(logoUrl)} alt="MANOLA" className="h-8 object-contain" />
                </div>
              ) : (
                <span className="text-2xl font-bold">MANOLA</span>
              )}
              <p className="mt-4 text-gray-400 text-sm">
                Streetwear lokal untuk setiap gaya. Dibuat dengan cinta di Indonesia.
              </p>
            </div>
            <div className="md:pl-12">
              <h4 className="font-semibold mb-4">Produk</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button 
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="hover:text-white transition-colors text-left"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Bantuan</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/bantuan/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/bantuan/pengiriman" className="hover:text-white transition-colors">Pengiriman</Link></li>
                <li><Link href="/bantuan/pengembalian" className="hover:text-white transition-colors">Pengembalian</Link></li>
                <li><Link href={shopPhone ? `https://wa.me/${shopPhone}` : "#"} target="_blank" className="hover:text-white transition-colors">Kontak</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ikuti Kami Melalui</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="https://www.instagram.com/manoladistro/" className="hover:text-white transition-colors flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                    </svg>
                    <span>Instagram</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>&copy; 2026 Manola. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
      <HomeContent />
    </Suspense>
  );
}
