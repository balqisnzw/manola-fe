"use client"


import { useState } from "react"
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
  Settings,
} from "lucide-react"


const navItems = [
  { label: "Transaksi", href: "/kasir/transaksi" },
  { label: "Riwayat", href: "/kasir/riwayat" },
]

const products = [
  { id: 1, name: "Kaos Oversize Black", category: "Kaos", price: 200000, sizes: [{ size: "S", colors: [{ color: "Hitam", stock: 10 }] }, { size: "M", colors: [{ color: "Hitam", stock: 15 }] }, { size: "L", colors: [{ color: "Hitam", stock: 12 }] }, { size: "XL", colors: [{ color: "Hitam", stock: 8 }] }] },
  { id: 2, name: "Hoodie Essential Gray", category: "Hoodie", price: 350000, sizes: [{ size: "S", colors: [{ color: "Abu-abu", stock: 5 }] }, { size: "M", colors: [{ color: "Abu-abu", stock: 8 }] }, { size: "L", colors: [{ color: "Abu-abu", stock: 10 }] }] },
  { id: 3, name: "Celana Cargo Olive", category: "Celana", price: 250000, sizes: [{ size: "30", colors: [{ color: "Olive", stock: 6 }] }, { size: "32", colors: [{ color: "Olive", stock: 8 }] }, { size: "34", colors: [{ color: "Olive", stock: 4 }] }] },
  { id: 4, name: "Jaket Bomber Navy", category: "Jaket", price: 450000, sizes: [{ size: "M", colors: [{ color: "Navy", stock: 5 }] }, { size: "L", colors: [{ color: "Navy", stock: 7 }] }, { size: "XL", colors: [{ color: "Navy", stock: 3 }] }] },
  { id: 5, name: "Kaos Graphic White", category: "Kaos", price: 180000, sizes: [{ size: "S", colors: [{ color: "Putih", stock: 12 }] }, { size: "M", colors: [{ color: "Putih", stock: 18 }] }, { size: "L", colors: [{ color: "Putih", stock: 15 }] }] },
  { id: 6, name: "Celana Jogger Black", category: "Celana", price: 220000, sizes: [{ size: "S", colors: [{ color: "Hitam", stock: 8 }] }, { size: "M", colors: [{ color: "Hitam", stock: 10 }] }, { size: "L", colors: [{ color: "Hitam", stock: 12 }] }] },
  { id: 7, name: "Hoodie Zip Brown", category: "Hoodie", price: 380000, sizes: [{ size: "M", colors: [{ color: "Coklat", stock: 6 }] }, { size: "L", colors: [{ color: "Coklat", stock: 8 }] }, { size: "XL", colors: [{ color: "Coklat", stock: 4 }] }] },
  { id: 8, name: "Kaos Polo Navy", category: "Kaos", price: 250000, sizes: [{ size: "S", colors: [{ color: "Navy", stock: 7 }] }, { size: "M", colors: [{ color: "Navy", stock: 10 }] }, { size: "L", colors: [{ color: "Navy", stock: 8 }] }] },
  { id: 9, name: "Topi Snapback Black", category: "Aksesoris", price: 150000, sizes: [{ size: "-", colors: [{ color: "Hitam", stock: 20 }] }] },
  { id: 10, name: "Celana Chino Beige", category: "Celana", price: 280000, sizes: [{ size: "30", colors: [{ color: "Beige", stock: 5 }] }, { size: "32", colors: [{ color: "Beige", stock: 7 }] }, { size: "34", colors: [{ color: "Beige", stock: 6 }] }] },
]

interface CartItem {
  productId: number
  name: string
  size: string
  color: string
  qty: number
  price: number
}

function formatRupiah(value: number) {
  return `Rp ${value.toLocaleString("id-ID")}`
}

export default function KasirTransaksiPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "qris">("cash")
  const [cashAmount, setCashAmount] = useState("")
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Variant selection state
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedQty, setSelectedQty] = useState(1)

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const change = cashAmount ? Math.max(0, parseInt(cashAmount) - cartTotal) : 0

  const handleExpandProduct = (productId: number) => {
    const product = products.find((p) => p.id === productId)
    if (product && product.sizes.length > 0) {
      setExpandedProduct(productId)
      setSelectedSize(product.sizes[0].size)
      setSelectedColor(product.sizes[0].colors[0].color)
      setSelectedQty(1)
    }
  }

  const handleAddToCart = (product: typeof products[0]) => {
    const existingItem = cart.find(
      (item) =>
        item.productId === product.id &&
        item.size === selectedSize &&
        item.color === selectedColor
    )

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item === existingItem ? { ...item, qty: item.qty + selectedQty } : item
        )
      )
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          size: selectedSize,
          color: selectedColor,
          qty: selectedQty,
          price: product.price,
        },
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

  const handleComplete = () => {
    setShowSuccessModal(true)
  }

  const handleNewTransaction = () => {
    clearCart()
    setShowSuccessModal(false)
  }

  const rightContent = (
  <div className="flex items-center gap-4">
    <span className="text-sm text-[#6B7280]">Maya Sari</span>

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
      {/* Summary Bar */}
      <div className="bg-[#F9F9F9] border-b border-[#E5E7EB] px-8 py-2 text-sm text-[#6B7280]">
        Hari ini: <span className="font-semibold text-[#0A0A0A]">8 transaksi</span> | Total Pendapatan: <span className="font-semibold text-[#0A0A0A]">Rp 3.240.000</span>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-56px-44px)]">
        {/* Left Panel - Products */}
        <div className="flex-[3] border-r border-[#E5E7EB] overflow-hidden flex flex-col bg-white">
          <div className="p-4 border-b border-[#E5E7EB]">
            <MInput
              placeholder="Cari nama produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredProducts.map((product) => (
              <div key={product.id} className="border-b border-[#E5E7EB] px-4 py-3">
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="w-12 h-12 bg-gray-100 rounded-md" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#0A0A0A]">{product.name}</p>
                    <p className="text-xs text-[#6B7280]">{product.category}</p>
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
                    <div className="mb-3">
                      <span className="text-xs text-[#6B7280]">Pilih Ukuran:</span>
                      <div className="flex gap-2 mt-1">
                        {product.sizes.map((s) => (
                          <button
                            key={s.size}
                            onClick={() => {
                              setSelectedSize(s.size)
                              setSelectedColor(s.colors[0].color)
                            }}
                            className={`border rounded px-3 py-1 text-xs transition ${
                              selectedSize === s.size
                                ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                                : "border-[#E5E7EB] hover:border-[#0A0A0A]"
                            }`}
                          >
                            {s.size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <span className="text-xs text-[#6B7280]">Pilih Warna:</span>
                      <div className="flex gap-2 mt-1">
                        {product.sizes
                          .find((s) => s.size === selectedSize)
                          ?.colors.map((c) => (
                            <button
                              key={c.color}
                              onClick={() => setSelectedColor(c.color)}
                              className={`w-6 h-6 rounded-full border-2 ${
                                selectedColor === c.color
                                  ? "ring-2 ring-[#0A0A0A] ring-offset-1"
                                  : ""
                              }`}
                              style={{
                                backgroundColor:
                                  c.color === "Hitam"
                                    ? "#1a1a1a"
                                    : c.color === "Abu-abu"
                                    ? "#9CA3AF"
                                    : c.color === "Olive"
                                    ? "#6B8E23"
                                    : c.color === "Navy"
                                    ? "#1e3a5f"
                                    : c.color === "Putih"
                                    ? "#ffffff"
                                    : c.color === "Coklat"
                                    ? "#8B4513"
                                    : c.color === "Beige"
                                    ? "#F5F5DC"
                                    : "#ccc",
                              }}
                              title={c.color}
                            />
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
            ))}
          </div>
        </div>

        {/* Right Panel - Cart */}
        <div className="flex-[2] overflow-hidden flex flex-col bg-white">
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
                        {item.size} · {item.color}
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
              disabled={cart.length === 0}
            >
              Selesaikan Transaksi
            </MButton>
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
