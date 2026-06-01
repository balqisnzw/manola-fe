"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingCart, User, Menu, X, Star } from "lucide-react";
import { MButton } from "@/components/manola/MButton";
import { MInput } from "@/components/manola/MInput";
import { MBadge } from "@/components/manola/MBadge";
import { authService, type User as AuthUser } from "@/lib/services/authService";
import { useCart } from "@/lib/CartContext";
import { formatPrice } from "@/lib/utils";

const categories = [
  { id: "tshirt", name: "T-Shirt", count: 24 },
  { id: "hoodie", name: "Hoodie", count: 18 },
  { id: "jacket", name: "Jacket", count: 12 },
  { id: "pants", name: "Pants", count: 15 },
  { id: "accessories", name: "Accessories", count: 30 },
];

const products = [
  { id: 1, name: "Urban Shadow Tee", price: 299000, originalPrice: 399000, image: "/placeholder.svg", category: "T-Shirt", rating: 4.8, reviews: 124, isNew: true },
  { id: 2, name: "Street Phantom Hoodie", price: 549000, originalPrice: null, image: "/placeholder.svg", category: "Hoodie", rating: 4.9, reviews: 89, isNew: false },
  { id: 3, name: "Midnight Cargo Pants", price: 459000, originalPrice: 559000, image: "/placeholder.svg", category: "Pants", rating: 4.7, reviews: 56, isNew: false },
  { id: 4, name: "Neo Tokyo Jacket", price: 899000, originalPrice: null, image: "/placeholder.svg", category: "Jacket", rating: 4.9, reviews: 201, isNew: true },
  { id: 5, name: "Rebel Classic Tee", price: 279000, originalPrice: null, image: "/placeholder.svg", category: "T-Shirt", rating: 4.6, reviews: 78, isNew: false },
  { id: 6, name: "Dark Matter Hoodie", price: 599000, originalPrice: 699000, image: "/placeholder.svg", category: "Hoodie", rating: 4.8, reviews: 145, isNew: false },
  { id: 7, name: "Stealth Cap", price: 189000, originalPrice: null, image: "/placeholder.svg", category: "Accessories", rating: 4.5, reviews: 67, isNew: true },
  { id: 8, name: "Urban Warrior Jacket", price: 799000, originalPrice: 899000, image: "/placeholder.svg", category: "Jacket", rating: 4.7, reviews: 92, isNew: false },
];

// formatPrice is now imported from @/lib/utils

export default function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { cartCount } = useCart();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    try {
      setCurrentUser(authService.getCurrentUser());
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || product.category.toLowerCase().replace("-", "") === selectedCategory;
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

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {categories.slice(0, 4).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  className={`text-sm font-medium transition-colors ${
                    selectedCategory === cat.id ? "text-[var(--brand-black)]" : "text-[var(--brand-muted)] hover:text-[var(--brand-black)]"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </nav>

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
                        KASIR: "/kasir/dashboard",
                        PACKAGING: "/packaging/dashboard",
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
              <nav className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(selectedCategory === cat.id ? null : cat.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === cat.id ? "bg-[var(--brand-black)] text-[var(--brand-white)]" : "hover:bg-[var(--brand-gray)]"
                    }`}
                  >
                    {cat.name} ({cat.count})
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative bg-[var(--brand-black)] text-[var(--brand-white)] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
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
            <div className="flex flex-wrap gap-4">
              <MButton size="lg" className="bg-[var(--brand-white)] text-[var(--brand-black)] hover:bg-gray-100">
                Lihat Koleksi
              </MButton>
              <MButton variant="outline" size="lg" className="border-[var(--brand-white)] text-[var(--brand-white)] hover:bg-[var(--brand-white)] hover:text-[var(--brand-black)]">
                Tentang Kami
              </MButton>
            </div>
          </div>
        </div>
        <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-gray-800 to-transparent opacity-50" />
      </section>

      {/* Categories */}
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

      {/* Products Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[var(--brand-black)]">
              {selectedCategory ? categories.find((c) => c.id === selectedCategory)?.name : "Produk Terbaru"}
            </h2>
            <p className="text-sm text-[var(--brand-muted)]">{filteredProducts.length} produk</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/produk/${product.id}`}
                className="group bg-[var(--brand-white)] rounded-xl overflow-hidden border border-[var(--brand-border)] hover:shadow-lg transition-all"
              >
                <div className="aspect-square bg-[var(--brand-gray)] relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.isNew && (
                    <MBadge className="absolute top-3 left-3 bg-[var(--brand-black)] text-[var(--brand-white)]">
                      NEW
                    </MBadge>
                  )}
                  {product.originalPrice && (
                    <MBadge variant="destructive" className="absolute top-3 right-3">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </MBadge>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs text-[var(--brand-muted)] mb-1">{product.category}</p>
                  <h3 className="font-semibold text-[var(--brand-black)] mb-2 line-clamp-1">{product.name}</h3>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium">{product.rating}</span>
                    <span className="text-xs text-[var(--brand-muted)]">({product.reviews})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--brand-black)]">{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-[var(--brand-muted)] line-through">{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {filteredProducts.length === 0 && (
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
