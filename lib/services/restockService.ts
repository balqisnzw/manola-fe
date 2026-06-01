import { api } from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface RestockItem {
  id: number;
  jumlah: number;
  createdAt: string;
  variant: {
    id: number;
    size: string;
    color: string | null;
    stock: number;
    product: {
      id: number;
      name: string;
    };
  };
  supplier: {
    id: number;
    nama: string;
  } | null;
}

export interface RestockPayload {
  productVariantId: number;
  jumlah: number;
  supplierId?: number;
}

// Response backend
interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// ─── Restock service ────────────────────────────────────────────────────────────

export const stockService = {
  /**
   * GET /restocks
   */
  async getAll(): Promise<RestockItem[]> {
    const res = await api.get<ApiResponse<RestockItem[]>>(
      "/restocks"
    );

    return Array.isArray(res.data)
      ? res.data
      : [];
  },

  /**
   * POST /restocks
   */
  async create(payload: RestockPayload): Promise<RestockItem> {
    const res = await api.post<ApiResponse<RestockItem>>(
      "/restocks",
      payload
    );

    return res.data;
  },

  /**
   * DELETE /restocks/:id
   */
  async delete(id: number): Promise<string> {
    const res = await api.delete<ApiResponse<RestockItem>>(
      `/restocks/${id}`
    );

    return res.message;
  },
};