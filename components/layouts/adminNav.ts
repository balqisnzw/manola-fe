import { LayoutDashboard, ShoppingBag, Archive, Truck, ClipboardList, MessageSquare, Settings, Tag, Image, FileText, FolderTree, Wallet, RefreshCcw } from "lucide-react"

export const adminNavItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Logo & Banner", href: "/admin/banner", icon: Image },
  { label: "Produk", href: "/admin/produk", icon: ShoppingBag },
  { label: "Kategori", href: "/admin/kategori", icon: FolderTree },
  { label: "Stok", href: "/admin/stok", icon: Archive },
  { label: "Supplier", href: "/admin/supplier", icon: Truck },
  { label: "Pesanan", href: "/admin/pesanan", icon: ClipboardList },
  { label: "Promo", href: "/admin/promo", icon: Tag },
  { label: "Laporan", href: "/admin/laporan", icon: FileText },
  { label: "Ulasan", href: "/admin/ulasan", icon: MessageSquare },
  { label: "Retur", href: "/admin/retur", icon: RefreshCcw },
  { label: "Riwayat Shift", href: "/admin/shift", icon: Wallet },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
]
