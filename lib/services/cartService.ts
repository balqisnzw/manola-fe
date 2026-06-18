import { api } from "@/lib/api";
import { CartItem } from "@/lib/CartContext";

export const cartService = {
  async getCart(): Promise<CartItem[]> {
    const res = await api.get<{ data: CartItem[] }>("/cart");
    return res.data;
  },

  async addToCart(variantId: number, quantity: number): Promise<CartItem[]> {
    const res = await api.post<{ data: CartItem[] }>("/cart/items", {
      variantId,
      quantity,
    });
    return res.data;
  },

  async updateQuantity(variantId: number, quantity: number): Promise<CartItem[]> {
    const res = await api.put<{ data: CartItem[] }>(`/cart/items/${variantId}`, {
      quantity,
    });
    return res.data;
  },

  async removeItem(variantId: number): Promise<CartItem[]> {
    const res = await api.delete<{ data: CartItem[] }>(`/cart/items/${variantId}`);
    return res.data;
  },

  async clearCart(): Promise<void> {
    await api.delete("/cart");
  },
};
