import { LayoutDashboard, Users, UserCog, Settings, Package, ClipboardList, Sliders, Wallet, Truck, FileText, ShoppingBag, RefreshCcw } from "lucide-react"

export const ownerNavItems = [
  { label: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
  { label: "Karyawan", href: "/owner/karyawan", icon: UserCog },
  { label: "Pelanggan", href: "/owner/pelanggan", icon: Users },
  { label: "Produk", href: "/owner/produk", icon: Package },
  { label: "Riwayat Restock", href: "/owner/restock", icon: ClipboardList },
  { label: "Supplier", href: "/owner/supplier", icon: Truck },
  { label: "Pesanan", href: "/owner/pesanan", icon: ShoppingBag },
  { label: "Laporan", href: "/owner/laporan", icon: FileText },
  { label: "Retur", href: "/admin/retur", icon: RefreshCcw },
  { label: "Riwayat Shift", href: "/owner/shift", icon: Wallet },
  { label: "Konfigurasi Toko", href: "/owner/konfigurasi", icon: Sliders },
  { label: "Pengaturan Profil", href: "/owner/pengaturan", icon: Settings },
]
