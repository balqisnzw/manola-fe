"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Package, MapPin, Heart, Settings, LogOut, ChevronRight, Clock } from "lucide-react";
import { MButton } from "@/components/manola/MButton";
import { MBadge } from "@/components/manola/MBadge";
import { authService } from "@/lib/services";

const orders = [
  { id: "MNL-2026001", date: "20 Apr 2026", status: "Dikirim", total: 1497000, items: 3 },
  { id: "MNL-2026002", date: "15 Apr 2026", status: "Selesai", total: 549000, items: 1 },
  { id: "MNL-2026003", date: "10 Apr 2026", status: "Selesai", total: 758000, items: 2 },
];

const wishlistItems = [
  { id: 1, name: "Urban Shadow Tee", price: 299000, image: "/placeholder.svg" },
  { id: 2, name: "Street Phantom Hoodie", price: 549000, image: "/placeholder.svg" },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);
}

function getStatusColor(status: string) {
  switch (status) {
    case "Dikirim": return "bg-blue-100 text-blue-700";
    case "Selesai": return "bg-green-100 text-green-700";
    case "Dibatalkan": return "bg-red-100 text-red-700";
    default: return "bg-gray-100 text-gray-700";
  }
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"orders" | "wishlist" | "addresses" | "settings">("orders");

  const user = {
    name: "Budi Santoso",
    email: "budi.santoso@email.com",
    phone: "081234567890",
    avatar: "/placeholder.svg",
  };

  const menuItems = [
    { id: "orders", label: "Pesanan Saya", icon: Package },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "addresses", label: "Alamat", icon: MapPin },
    { id: "settings", label: "Pengaturan", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-[var(--brand-gray)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--brand-white)] border-b border-[var(--brand-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold text-[var(--brand-black)]">MANOLA</Link>
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
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-[var(--brand-gray)] overflow-hidden">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="font-semibold text-[var(--brand-black)]">{user.name}</h2>
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
            {activeTab === "orders" && (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-[var(--brand-black)]">Pesanan Saya</h1>
                {orders.map((order) => (
                  <div key={order.id} className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <div>
                        <p className="font-semibold text-[var(--brand-black)]">{order.id}</p>
                        <div className="flex items-center gap-2 text-sm text-[var(--brand-muted)] mt-1">
                          <Clock className="w-4 h-4" />
                          <span>{order.date}</span>
                        </div>
                      </div>
                      <MBadge className={getStatusColor(order.status)}>{order.status}</MBadge>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-[var(--brand-border)]">
                      <div>
                        <p className="text-sm text-[var(--brand-muted)]">{order.items} item</p>
                        <p className="font-semibold text-[var(--brand-black)]">{formatPrice(order.total)}</p>
                      </div>
                      <MButton variant="outline" size="sm">
                        Lihat Detail
                      </MButton>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "wishlist" && (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-[var(--brand-black)]">Wishlist</h1>
                <div className="grid sm:grid-cols-2 gap-4">
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-4">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-[var(--brand-gray)] rounded-lg overflow-hidden">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-[var(--brand-black)]">{item.name}</h3>
                          <p className="font-bold mt-1">{formatPrice(item.price)}</p>
                          <MButton size="sm" className="mt-2">Tambah ke Keranjang</MButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold text-[var(--brand-black)]">Alamat Tersimpan</h1>
                  <MButton>Tambah Alamat</MButton>
                </div>
                <div className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-semibold text-[var(--brand-black)]">Rumah</p>
                        <MBadge>Utama</MBadge>
                      </div>
                      <p className="text-[var(--brand-black)]">{user.name}</p>
                      <p className="text-[var(--brand-muted)]">{user.phone}</p>
                      <p className="text-[var(--brand-muted)] mt-2">
                        Jl. Sudirman No. 123, Kelurahan Menteng, Kecamatan Menteng, Jakarta Pusat, DKI Jakarta 10310
                      </p>
                    </div>
                    <MButton variant="outline" size="sm">Edit</MButton>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-4">
                <h1 className="text-2xl font-bold text-[var(--brand-black)]">Pengaturan Akun</h1>
                <div className="bg-[var(--brand-white)] rounded-xl border border-[var(--brand-border)] p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-[var(--brand-black)] mb-1.5">Nama Lengkap</label>
                    <input
                      type="text"
                      defaultValue={user.name}
                      className="w-full px-4 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--brand-black)] mb-1.5">Email</label>
                    <input
                      type="email"
                      defaultValue={user.email}
                      className="w-full px-4 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--brand-black)] mb-1.5">Nomor Telepon</label>
                    <input
                      type="tel"
                      defaultValue={user.phone}
                      className="w-full px-4 py-2.5 border border-[var(--brand-border)] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-black)]"
                    />
                  </div>
                  <MButton>Simpan Perubahan</MButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
