"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

import { LogoutButton } from "@/components/auth/LogoutButton"

import { NavbarLayout } from "@/components/layouts/NavbarLayout"
import { MInput } from "@/components/manola/MInput"
import { MButton } from "@/components/manola/MButton"
import { MModal } from "@/components/manola/MModal"

import {
  Search,
  Plus,
  Minus,
  X,
  ShoppingCart,
  CheckCircle,
  Settings } from "lucide-react"
import { MLoader } from "@/components/manola/MLoader"

import { productService, orderService, authService, shiftService, paymentService } from "@/lib/services"
import type { Product } from "@/lib/services/productService"
import { getImageUrl } from "@/lib/utils"
import { toast } from "sonner"
import type { CashierShift } from "@/lib/services/miscServices"

const navItems = [
  { label: "Transaksi", href: "/kasir/transaksi" },
  { label: "Riwayat", href: "/kasir/riwayat" },
]

interface CartItem {
  variantId: number
  productId: number
  name: string
  size: string
  color: string
  qty: number
  price: number
  image: string
}

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`
}

export default function KasirTransaksiPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash")
  const [cashAmount, setCashAmount] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [mobileView, setMobileView] = useState<"products" | "cart">("products")

  // Cashier shift state
  const [activeShift, setActiveShift] = useState<CashierShift | null>(null)
  const [modalAwalInput, setModalAwalInput] = useState("")
  const [loadingShift, setLoadingShift] = useState(true)

  // Variant selection state
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedQty, setSelectedQty] = useState(1)

  const user = authService.getCurrentUser()

  useEffect(() => {
    loadProducts()
    checkActiveShift()
  }, [])

  async function loadProducts() {
    setLoadingProducts(true)
    try {
      const data = await productService.getAll()
      setProducts(data)
    } catch (err) {
      console.error("Failed to load products:", err)
    } finally {
      setLoadingProducts(false)
    }
  }

  async function checkActiveShift() {
    setLoadingShift(true)
    try {
      const shift = await shiftService.getActive()
      setActiveShift(shift)
    } catch (err) {
      console.error("Failed to check active shift:", err)
    } finally {
      setLoadingShift(false)
    }
  }

  async function handleStartShift() {
    if (!modalAwalInput) {
      toast.error("Modal awal wajib diisi")
      return
    }
    try {
      const shift = await shiftService.start(parseInt(modalAwalInput))
      setActiveShift(shift)
      toast.success("Shift berhasil dibuka")
    } catch (err: any) {
      toast.error(err.message || "Gagal membuka shift")
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const change = cashAmount ? Math.max(0, parseInt(cashAmount) - cartTotal) : 0

  const handleExpandProduct = (productId: number) => {
    const product = products.find((p) => p.id === productId)
    if (product && product.variants.length > 0) {
      setExpandedProduct(productId)
      const firstVariant = product.variants[0]
      setSelectedVariantId(firstVariant.id)
      setSelectedSize(firstVariant.size)
      setSelectedColor(firstVariant.color ?? "")
      setSelectedQty(1)
    }
  }

  const handleAddToCart = (product: Product) => {
    if (!selectedVariantId) return

    const existingItem = cart.find((item) => item.variantId === selectedVariantId)

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.variantId === selectedVariantId ? { ...item, qty: item.qty + selectedQty } : item
        )
      )
    } else {
      setCart([
        ...cart,
        {
          variantId: selectedVariantId,
          productId: product.id,
          name: product.name,
          size: selectedSize,
          color: selectedColor,
          qty: selectedQty,
          price: product.price,
          image: product.images?.[0]?.url ?? "" },
      ])
    }
    setExpandedProduct(null)
  }

  const updateCartQty = (index: number, delta: number) => {
    setCart(
      cart.map((item, i) =>
        i === index ? { ...item, qty: Math.max(1, Math.min(99, item.qty + delta)) } : item
      )
    )
  }

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const clearCart = () => {
    setCart([])
    setCashAmount("")
  }

  const handleComplete = async () => {
    if (cart.length === 0) return

    setSubmitting(true)
    try {
      const order = await orderService.create({
        jenis: "OFFLINE",
        items: cart.map((item) => ({
          variantId: item.variantId,
          jumlah: item.qty })) })
      
      await paymentService.create(order.id, paymentMethod === "cash" ? "CASH" : "QRIS")
      setShowSuccessModal(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menyelesaikan transaksi"
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleNewTransaction = () => {
    clearCart()
    setShowSuccessModal(false)
    // Reload products to get updated stock
    loadProducts()
  }

  const rightContent = (
    <div className="flex items-center gap-4">
      <Link
        href="/kasir/shift"
        className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-black border border-gray-300 rounded px-2.5 py-1.5 bg-white hover:bg-gray-50 transition"
      >
        Shift & Petty Cash
      </Link>
      <span className="text-sm text-[#6B7280]">{user?.nama ?? "Kasir"}</span>

      <Link
        href="/kasir/pengaturan"
        className="text-[#6B7280] hover:text-[#0A0A0A]"
      >
        <Settings className="w-5 h-5" />
      </Link>

      <LogoutButton />
    </div>
  )

  return (
    <NavbarLayout navItems={navItems} rightContent={rightContent}>
      {/* Shift Guard Overlay */}
      {!activeShift && !loadingShift && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-6 border border-gray-100 animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Shift Kasir Belum Dibuka</h2>
            <p className="text-sm text-gray-500 mb-6">Silakan masukkan jumlah modal awal (petty cash) untuk membuka laci kasir dan memulai transaksi hari ini.</p>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Modal Awal (Rupiah)</label>
                <MInput
                  placeholder="Contoh: 100000"
                  type="number"
                  value={modalAwalInput}
                  onChange={(e) => setModalAwalInput(e.target.value)}
                />
              </div>
              <MButton
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleStartShift}
              >
                Buka Shift & Mulai Kerja
              </MButton>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col h-[calc(100vh-56px)]">
        {/* Mobile Tabs */}
        <div className="lg:hidden flex border-b border-[#E5E7EB] bg-white flex-shrink-0">
          <button
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              mobileView === "products" 
                ? "border-b-2 border-[#0A0A0A] text-[#0A0A0A]" 
                : "text-[#6B7280] border-b-2 border-transparent"
            }`}
            onClick={() => setMobileView("products")}
          >
            Produk
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
              mobileView === "cart" 
                ? "border-b-2 border-[#0A0A0A] text-[#0A0A0A]" 
                : "text-[#6B7280] border-b-2 border-transparent"
            }`}
            onClick={() => setMobileView("cart")}
          >
            Keranjang
            {cart.length > 0 && (
              <span className="bg-[#0A0A0A] text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {cart.reduce((sum, item) => sum + item.qty, 0)}
              </span>
            )}
          </button>
        </div>

        {/* Desktop Split / Mobile Tab Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel - Products */}
          <div className={`flex-[3] lg:border-r border-[#E5E7EB] overflow-hidden flex flex-col bg-white w-full ${
            mobileView === "products" ? "flex" : "hidden lg:flex"
          }`}>
          <div className="p-4 border-b border-[#E5E7EB]">
            <MInput
              placeholder="Cari nama produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingProducts ? (
              <MLoader />
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-[#6B7280]">
                <p className="text-sm">Tidak ada produk ditemukan</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id} className="border-b border-[#E5E7EB] px-4 py-3">
                  <div className="flex items-center gap-3 cursor-pointer">
                    <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={getImageUrl(product.images?.[0]?.url)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#0A0A0A]">{product.name}</p>
                      <p className="text-xs text-[#6B7280]">{product.category ?? "-"}</p>
                    </div>
                    <p className="text-sm font-semibold">{formatRupiah(product.price)}</p>
                    <MButton
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        expandedProduct === product.id
                          ? setExpandedProduct(null)
                          : handleExpandProduct(product.id)
                      }
                    >
                      <Plus className="w-4 h-4" />
                    </MButton>
                  </div>

                  {/* Variant Selector */}
                  {expandedProduct === product.id && (
                    <div className="bg-[#F9F9F9] rounded-lg p-3 mt-2">
                      {/* Size selection */}
                      <div className="mb-3">
                        <span className="text-xs text-[#6B7280]">Pilih Varian:</span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {product.variants.map((v) => (
                            <button
                              key={v.id}
                              onClick={() => {
                                setSelectedVariantId(v.id)
                                setSelectedSize(v.size)
                                setSelectedColor(v.color ?? "")
                              }}
                              className={`border rounded px-3 py-1 text-xs transition ${
                                selectedVariantId === v.id
                                  ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                                  : "border-[#E5E7EB] hover:border-[#0A0A0A]"
                              }`}
                            >
                              {v.size}{v.color ? ` · ${v.color}` : ""} ({v.stock})
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#6B7280]">Jumlah:</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                              className="p-1 text-[#6B7280] hover:text-[#0A0A0A]"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center text-sm">{selectedQty}</span>
                            <button
                              onClick={() => setSelectedQty(Math.min(99, selectedQty + 1))}
                              className="p-1 text-[#6B7280] hover:text-[#0A0A0A]"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <MButton
                          variant="primary"
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                        >
                          Tambah ke Transaksi
                        </MButton>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Cart */}
        <div className={`flex-[2] overflow-hidden flex flex-col bg-white w-full ${
          mobileView === "cart" ? "flex" : "hidden lg:flex"
        }`}>
          <div className="flex items-center justify-between p-4 border-b border-[#E5E7EB]">
            <h2 className="font-semibold text-[#0A0A0A]">Transaksi Baru</h2>
            <MButton variant="ghost" size="sm" onClick={clearCart} className="text-[#6B7280]">
              Bersihkan
            </MButton>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[#6B7280]">
                <ShoppingCart className="w-12 h-12 mb-3" />
                <p className="text-sm">Pilih produk dari kiri</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 py-3 border-b border-[#E5E7EB]">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-[#6B7280]">
                        {item.size}{item.color ? ` · ${item.color}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateCartQty(index, -1)}
                        className="p-1 text-[#6B7280] hover:text-[#0A0A0A]"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center text-sm">{item.qty}</span>
                      <button
                        onClick={() => updateCartQty(index, 1)}
                        className="p-1 text-[#6B7280] hover:text-[#0A0A0A]"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold w-24 text-right">
                      {formatRupiah(item.price * item.qty)}
                    </p>
                    <button
                      onClick={() => removeFromCart(index)}
                      className="p-1 text-[#6B7280] hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-[#E5E7EB] bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Total</span>
              <span className="text-lg font-bold">{formatRupiah(cartTotal)}</span>
            </div>

            {/* Payment Method Toggle */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`py-2 rounded-md text-sm font-medium transition ${
                  paymentMethod === "cash"
                    ? "bg-[#0A0A0A] text-white"
                    : "border border-[#E5E7EB] text-[#6B7280]"
                }`}
              >
                Cash
              </button>
              <button
                onClick={() => setPaymentMethod("qris")}
                className={`py-2 rounded-md text-sm font-medium transition ${
                  paymentMethod === "qris"
                    ? "bg-[#0A0A0A] text-white"
                    : "border border-[#E5E7EB] text-[#6B7280]"
                }`}
              >
                QRIS
              </button>
            </div>

            {paymentMethod === "cash" ? (
              <div className="mb-4">
                <div className="flex items-center border border-[#E5E7EB] rounded-md">
                  <span className="px-3 text-[#6B7280] text-sm">Rp</span>
                  <input
                    type="number"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    placeholder="Nominal Dibayar"
                    className="flex-1 h-10 px-2 text-sm focus:outline-none"
                  />
                </div>
                {cashAmount && parseInt(cashAmount) >= cartTotal && (
                  <p className="mt-2 text-sm">
                    Kembalian: <span className="text-green-600 font-semibold">{formatRupiah(change)}</span>
                  </p>
                )}
              </div>
            ) : (
              <div className="mb-4">
                <div className="border border-dashed border-[#E5E7EB] rounded-lg aspect-square max-w-[140px] mx-auto flex items-center justify-center">
                  <span className="text-[#6B7280] text-sm">QR Code</span>
                </div>
                <p className="text-xs text-[#6B7280] text-center mt-2">
                  QR Code akan tampil di sini
                </p>
              </div>
            )}

            <MButton
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleComplete}
              disabled={cart.length === 0 || submitting}
            >
              {submitting ? (
                <span className="flex items-center gap-2 justify-center">
                  <MLoader inline size="sm" text="Memproses..." />
                </span>
              ) : (
                "Selesaikan Transaksi"
              )}
            </MButton>
          </div>
        </div>
        </div>
      </div>

      {/* Success Modal */}
      <MModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} maxWidth="sm">
        <div className="text-center py-4">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-[#0A0A0A] mb-2">Transaksi Berhasil!</h2>
          <div className="text-sm text-[#6B7280] mb-4">
            <p>Total: {formatRupiah(cartTotal)}</p>
            <p>Metode: {paymentMethod === "cash" ? "Cash" : "QRIS"}</p>
            {paymentMethod === "cash" && cashAmount && (
              <p>Kembalian: {formatRupiah(change)}</p>
            )}
          </div>
          <MButton variant="primary" fullWidth onClick={handleNewTransaction}>
            Transaksi Baru
          </MButton>
        </div>
      </MModal>
    </NavbarLayout>
  )
}
