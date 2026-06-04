"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingCart, User, Menu, X, Star, Loader2 } from "lucide-react";
import { MButton } from "@/components/manola/MButton";
import { MBadge } from "@/components/manola/MBadge";
import { authService, type User as AuthUser } from "@/lib/services/authService";
import { productService, type Product } from "@/lib/services/productService";
import { useCart } from "@/lib/CartContext";
import { formatPrice, getImageUrl } from "@/lib/utils";
import { ProductCardSkeleton } from "@/components/manola/Skeleton";

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { cartCount } = useCart();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Real data from API
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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
        const data = await productService.getAll();
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Derive categories from real products
  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean) as string[])
  ).map((cat) => ({
    id: cat.toLowerCase().replace(/\s+/g, ""),
    name: cat,
    count: products.filter((p) => p.category === cat).length,
  }));

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory ||
      product.category?.toLowerCase().replace(/\s+/g, "") === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[var(--brand-gray)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--brand-white)] border-b border-[var(--brand-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-[var(--brand-black)]">MANOLA</span>
            </Link>



            {/* Search & Actions */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:block relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--brand-muted)]" />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 text-sm bg-[var(--brand-gray)] border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)]"
                />
              </div>

              {currentUser?.role === "USER" && (
                <Link href="/cart" className="relative p-2 hover:bg-[var(--brand-gray)] rounded-lg transition-colors">
                  <ShoppingCart className="w-5 h-5 text-[var(--brand-black)]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--brand-black)] text-[var(--brand-white)] text-xs font-medium rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}

              <Link
                href={
                  currentUser
                    ? {
                        OWNER: "/owner/dashboard",
                        ADMIN: "/admin/dashboard",
                        KASIR: "/kasir/transaksi",
                        PACKAGING: "/packaging/pesanan",
                        USER: "/profil",
                      }[currentUser.role] || "/profil"
                    : "/login"
                }
                className="p-2 hover:bg-[var(--brand-gray)] rounded-lg transition-colors"
              >
                <User className="w-5 h-5 text-[var(--brand-black)]" />
              </Link>

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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--brand-muted)]" />
                <input
                  type="text"
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-[var(--brand-gray)] border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)]"
                />
              </div>

            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative bg-[var(--brand-black)] text-[var(--brand-white)] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-2xl">
            <MBadge variant="outline" className="mb-4 border-[var(--brand-white)] text-[var(--brand-white)]">
              New Collection 2026
            </MBadge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Street Culture.<br />Local Pride.
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-lg">
              Koleksi streetwear lokal yang menggabungkan kenyamanan, gaya, dan identitas Indonesia untuk setiap momen.
            </p>
            <div className="flex flex-wrap gap-4">
              <MButton variant="outline" size="lg" className="bg-transparent border-[var(--brand-white)] text-[var(--brand-white)] hover:bg-[var(--brand-white)] hover:text-[var(--brand-black)]">
                Tentang Kami
              </MButton>

            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-gray-800 to-transparent opacity-50" />
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="py-12 bg-[var(--brand-white)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[var(--brand-black)]">Kategori</h2>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-sm text-[var(--brand-muted)] hover:text-[var(--brand-black)] transition-colors"
              >
                Lihat Semua
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className={`p-6 rounded-xl border transition-all text-center ${
                    selectedCategory === cat.id
                      ? "border-[var(--brand-black)] bg-[var(--brand-black)] text-[var(--brand-white)]"
                      : "border-[var(--brand-border)] bg-[var(--brand-white)] hover:border-[var(--brand-black)]"
                  }`}
                >
                  <p className="font-semibold">{cat.name}</p>
                  <p className={`text-sm mt-1 ${selectedCategory === cat.id ? "text-gray-300" : "text-[var(--brand-muted)]"}`}>
                    {cat.count} produk
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[var(--brand-black)]">
              {selectedCategory ? categories.find((c) => c.id === selectedCategory)?.name : "Produk Terbaru"}
            </h2>
            {!loading && <p className="text-sm text-[var(--brand-muted)]">{filteredProducts.length} produk</p>}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--brand-muted)] text-sm">
                          No Image
                        </div>
                      )}
                      {totalStock <= 0 && (
                        <MBadge variant="destructive" className="absolute top-3 left-3">
                          Habis
                        </MBadge>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-[var(--brand-muted)] mb-1">{product.category ?? "-"}</p>
                      <h3 className="font-semibold text-[var(--brand-black)] mb-2 line-clamp-1">{product.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--brand-black)]">{formatPrice(product.price)}</span>
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
              <MButton variant="outline" className="mt-4" onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}>
                Reset Filter
              </MButton>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--brand-black)] text-[var(--brand-white)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <span className="text-2xl font-bold">MANOLA</span>
              <p className="mt-4 text-gray-400 text-sm">
                Streetwear lokal untuk setiap gaya. Dibuat dengan cinta di Indonesia.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produk</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">T-Shirt</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Hoodie</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Jacket</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pants</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Bantuan</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pengiriman</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pengembalian</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Kontak</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Ikuti Kami</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="#" className="hover:text-white transition-colors">Instagram</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">TikTok</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Twitter</Link></li>
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
