"use client"

import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { LayoutDashboard, ShoppingBag, Archive, Truck, ClipboardList, MessageSquare, Settings, Star } from "lucide-react"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Produk", href: "/admin/produk", icon: ShoppingBag },
  { label: "Stok", href: "/admin/stok", icon: Archive },
  { label: "Supplier", href: "/admin/supplier", icon: Truck },
  { label: "Pesanan", href: "/admin/pesanan", icon: ClipboardList },
  { label: "Ulasan", href: "/admin/ulasan", icon: MessageSquare },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
]

const reviews = [
  { id: 1, customer: "Ahmad Rizky", product: "Kaos Oversize Black", rating: 5, review: "Kualitas produknya bagus banget, sesuai ekspektasi! Pengiriman juga cepat dan packaging rapi.", hasPhoto: true, date: "20 Apr 2024" },
  { id: 2, customer: "Siti Nurhaliza", product: "Hoodie Essential Gray", rating: 4, review: "Hoodienya nyaman dipakai, bahannya tebal. Cuma ukurannya agak kebesaran.", hasPhoto: false, date: "18 Apr 2024" },
  { id: 3, customer: "Dewi Lestari", product: "Celana Cargo Olive", rating: 5, review: "Celana cargo favoritku! Banyak kantong dan cocok untuk daily wear.", hasPhoto: true, date: "17 Apr 2024" },
  { id: 4, customer: "Eko Saputra", product: "Jaket Bomber Navy", rating: 4, review: "Jaketnya keren dan berkualitas. Worth the price!", hasPhoto: false, date: "15 Apr 2024" },
  { id: 5, customer: "Gunawan Wibowo", product: "Kaos Graphic White", rating: 3, review: "Desainnya bagus tapi bahannya agak tipis.", hasPhoto: false, date: "14 Apr 2024" },
  { id: 6, customer: "Hana Pertiwi", product: "Celana Jogger Black", rating: 5, review: "Sangat nyaman untuk olahraga dan santai. Recommended!", hasPhoto: true, date: "12 Apr 2024" },
  { id: 7, customer: "Irfan Hakim", product: "Hoodie Zip Brown", rating: 4, review: "Warnanya sesuai foto, bahannya juga bagus.", hasPhoto: false, date: "10 Apr 2024" },
  { id: 8, customer: "Julia Putri", product: "Kaos Polo Navy", rating: 5, review: "Polo shirt yang elegan dan berkualitas premium.", hasPhoto: true, date: "8 Apr 2024" },
  { id: 9, customer: "Kevin Pratama", product: "Topi Snapback Black", rating: 4, review: "Topinya keren, cocok untuk gaya streetwear.", hasPhoto: false, date: "5 Apr 2024" },
  { id: 10, customer: "Linda Sari", product: "Celana Chino Beige", rating: 5, review: "Celana chino yang stylish dan nyaman. Bisa untuk formal dan casual.", hasPhoto: true, date: "3 Apr 2024" },
  { id: 11, customer: "Mario Gunawan", product: "Jaket Denim Blue", rating: 4, review: "Jaket denim klasik yang timeless. Bahannya tebal dan awet.", hasPhoto: false, date: "1 Apr 2024" },
  { id: 12, customer: "Nina Anggraeni", product: "Kaos Basic White", rating: 5, review: "Basic tee yang wajib punya! Simple tapi berkualitas.", hasPhoto: false, date: "28 Mar 2024" },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  )
}

export default function AdminUlasanPage() {
  const columns = [
    { key: "customer", label: "Pelanggan", render: (item: typeof reviews[0]) => <span className="font-medium">{item.customer}</span> },
    { key: "product", label: "Produk" },
    { key: "rating", label: "Rating", render: (item: typeof reviews[0]) => <StarRating rating={item.rating} /> },
    {
      key: "review",
      label: "Ulasan",
      render: (item: typeof reviews[0]) => (
        <span
          className="text-sm text-[#6B7280] truncate max-w-xs block"
          title={item.review}
        >
          {item.review.length > 80 ? item.review.slice(0, 80) + "..." : item.review}
        </span>
      ),
    },
    {
      key: "photo",
      label: "Foto",
      render: (item: typeof reviews[0]) =>
        item.hasPhoto ? (
          <div className="w-10 h-10 bg-gray-100 rounded-md" />
        ) : (
          <span className="text-[#6B7280]">-</span>
        ),
    },
    { key: "date", label: "Tanggal" },
  ]

  return (
    <SidebarLayout navItems={navItems} userName="Rina Dewi" userRole="Admin">
      <h1 className="text-2xl font-semibold text-[#0A0A0A] mb-6">Ulasan Pelanggan</h1>

      <MCard padding="sm">
        <MTable columns={columns} data={reviews} />
      </MCard>
    </SidebarLayout>
  )
}
