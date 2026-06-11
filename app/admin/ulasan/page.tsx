"use client"

import { useState, useEffect, useMemo } from "react"
import { SidebarLayout } from "@/components/layouts/SidebarLayout"
import { MCard } from "@/components/manola/MCard"
import { MTable } from "@/components/manola/MTable"
import { LayoutDashboard, ShoppingBag, Archive, Truck, ClipboardList, MessageSquare, Settings, Star, FolderTree, Tag, Image, FileText } from "lucide-react"
import { MLoader } from "@/components/manola/MLoader"

import { productService, authService } from "@/lib/services"
import { reviewService } from "@/lib/services/miscServices"
import type { Product } from "@/lib/services/productService"
import type { Review } from "@/lib/services/miscServices"

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Produk", href: "/admin/produk", icon: ShoppingBag },
  { label: "Kategori", href: "/admin/kategori", icon: FolderTree },
  { label: "Stok", href: "/admin/stok", icon: Archive },
  { label: "Supplier", href: "/admin/supplier", icon: Truck },
  { label: "Pesanan", href: "/admin/pesanan", icon: ClipboardList },
  { label: "Promo", href: "/admin/promo", icon: Tag },
  { label: "Banner", href: "/admin/banner", icon: Image },
  { label: "Laporan", href: "/admin/laporan", icon: FileText },
  { label: "Ulasan", href: "/admin/ulasan", icon: MessageSquare },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
]

interface ReviewRow {
  id: number
  customer: string
  product: string
  rating: number
  review: string
  date: string
}

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
  const [products, setProducts] = useState<Product[]>([])
  const [allReviews, setAllReviews] = useState<ReviewRow[]>([])
  const [loading, setLoading] = useState(true)

  const currentUser = authService.getCurrentUser()

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      // First load all products, then fetch reviews for each
      const productsData = await productService.getAll()
      setProducts(productsData)

      // Fetch reviews for all products in parallel
      const reviewPromises = productsData.map(async (product) => {
        try {
          const reviews = await reviewService.getProductReviews(product.id)
          return reviews.map((r: Review) => ({
            id: r.id,
            customer: r.user?.nama ?? "Anonim",
            product: product.name,
            rating: r.rating,
            review: r.komentar ?? "",
            date: new Date(r.createdAt).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric" }) }))
        } catch {
          return []
        }
      })

      const reviewResults = await Promise.all(reviewPromises)
      const flatReviews = reviewResults.flat().sort((a, b) => b.id - a.id)
      setAllReviews(flatReviews)
    } catch (err) {
      console.error("Failed to load reviews:", err)
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    { key: "customer", label: "Pelanggan", render: (item: ReviewRow) => <span className="font-medium">{item.customer}</span> },
    { key: "product", label: "Produk", render: (item: ReviewRow) => item.product },
    { key: "rating", label: "Rating", render: (item: ReviewRow) => <StarRating rating={item.rating} /> },
    {
      key: "review",
      label: "Ulasan",
      render: (item: ReviewRow) => (
        <span
          className="text-sm text-[#6B7280] truncate max-w-xs block"
          title={item.review}
        >
          {item.review.length > 80 ? item.review.slice(0, 80) + "..." : item.review || "-"}
        </span>
      ) },
    { key: "date", label: "Tanggal", render: (item: ReviewRow) => item.date },
  ]

  return (
    <SidebarLayout navItems={navItems} userName={currentUser?.nama ?? "Admin"} userRole="Admin">
      <h1 className="text-2xl font-semibold text-[#0A0A0A] mb-6">Ulasan Pelanggan</h1>

      {loading ? (
        <MLoader />
      ) : allReviews.length === 0 ? (
        <MCard>
          <div className="text-center py-12 text-[#6B7280]">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Belum ada ulasan dari pelanggan</p>
          </div>
        </MCard>
      ) : (
        <MCard padding="sm">
          <MTable columns={columns} data={allReviews} />
        </MCard>
      )}
    </SidebarLayout>
  )
}
