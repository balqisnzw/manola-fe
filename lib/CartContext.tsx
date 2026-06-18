"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { cartService } from "./services/cartService";
import { getStoredUser } from "./api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: number;
  cartId: number;
  variantId: number;
  productId: number;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  stock: number;
}

interface CartContextValue {
  items: CartItem[];
  cartCount: number;
  loading: boolean;
  reloadCart: () => Promise<void>;
  addItem: (variantId: number, quantity: number) => Promise<void>;
  removeItem: (variantId: number) => Promise<void>;
  updateQuantity: (variantId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

// ─── Context ────────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextValue | undefined>(undefined);

// ─── Provider ───────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const reloadCart = useCallback(async () => {
    try {
      const user = getStoredUser();
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await cartService.getCart();
      setItems(data);
    } catch (error) {
      console.error("Failed to load cart:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reloadCart();
  }, [reloadCart]);

  const checkAuth = () => {
    const user = getStoredUser();
    if (!user) {
      toast.error("Silakan login terlebih dahulu untuk menambah ke keranjang.");
      router.push("/login");
      return false;
    }
    return true;
  };

  const addItem = useCallback(async (variantId: number, quantity: number) => {
    if (!checkAuth()) return;
    try {
      const updatedCart = await cartService.addToCart(variantId, quantity);
      setItems(updatedCart);
      toast.success("Berhasil ditambahkan ke keranjang!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Gagal menambahkan item");
      throw error;
    }
  }, []);

  const removeItem = useCallback(async (variantId: number) => {
    if (!checkAuth()) return;
    try {
      const updatedCart = await cartService.removeItem(variantId);
      setItems(updatedCart);
      toast.success("Barang dihapus dari keranjang");
    } catch (error: any) {
      toast.error("Gagal menghapus item");
    }
  }, []);

  const updateQuantity = useCallback(async (variantId: number, quantity: number) => {
    if (!checkAuth()) return;
    try {
      const updatedCart = await cartService.updateQuantity(variantId, quantity);
      setItems(updatedCart);
    } catch (error: any) {
      toast.error("Gagal memperbarui jumlah barang");
    }
  }, []);

  const clearCart = useCallback(async () => {
    if (!checkAuth()) return;
    try {
      await cartService.clearCart();
      setItems([]);
    } catch (error: any) {
      toast.error("Gagal mengosongkan keranjang");
    }
  }, []);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        loading,
        reloadCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a <CartProvider>");
  }
  return ctx;
}
