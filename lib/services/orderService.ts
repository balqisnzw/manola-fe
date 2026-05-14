import { api } from "@/lib/api";
import type { Product, ProductVariant } from "./productService";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type OrderStatus = "DIPROSES" | "DIKIRIM" | "SELESAI";
export type OrderJenis = "ONLINE" | "OFFLINE";
export type PaymentMetode = "CASH" | "QRIS" | "MIDTRANS";
export type PaymentStatus = "MENUNGGU" | "BERHASIL" | "GAGAL";

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  variantId: number;
  jumlah: number;
  harga_satuan: number;
  product?: Product;
  variant?: ProductVariant;
}

export interface Payment {
  id: number;
  orderId: number;
  metode_pembayaran: PaymentMetode;
  status_pembayaran: PaymentStatus;
  midtrans_token: string | null;
  createdAt: string;
}

export interface Order {
  id: number;
  userId: number;
  total_harga: number;
  ongkos_kirim: number | null;
  status: OrderStatus;
  jenis: OrderJenis;
  alamat_pengiriman: string | null;
  catatan: string | null;
  items: OrderItem[];
  payment: Payment;
  createdAt: string;
}

export interface CreateOrderPayload {
  jenis: OrderJenis;
  alamat_pengiriman?: string;
  ongkos_kirim?: number;
  catatan?: string;
  items: {
    productId: number;
    variantId: number;
    jumlah: number;
  }[];
}

export interface GetOrdersParams {
  status?: OrderStatus;
  jenis?: OrderJenis;
}

// ─── Order service ─────────────────────────────────────────────────────────────

export const orderService = {
  /**
   * GET /orders
   */
  async getAll(params?: GetOrdersParams): Promise<Order[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.jenis) query.set("jenis", params.jenis);
    const qs = query.toString() ? `?${query}` : "";
    return api.get<Order[]>(`/orders${qs}`);
  },

  /**
   * GET /orders/:id
   */
  async getById(id: number): Promise<Order> {
    return api.get<Order>(`/orders/${id}`);
  },

  /**
   * POST /orders
   */
  async create(payload: CreateOrderPayload): Promise<Order> {
    return api.post<Order>("/orders", payload);
  },

  /**
   * PUT /orders/:id/status
   */
  async updateStatus(id: number, status: OrderStatus): Promise<Order> {
    return api.put<Order>(`/orders/${id}/status`, { status });
  },
};

// ─── Payment service ───────────────────────────────────────────────────────────

export interface GetPaymentsParams {
  status_pembayaran?: PaymentStatus;
  metode_pembayaran?: PaymentMetode;
}

export const paymentService = {
  /**
   * GET /payments
   */
  async getAll(params?: GetPaymentsParams): Promise<Payment[]> {
    const query = new URLSearchParams();
    if (params?.status_pembayaran) query.set("status_pembayaran", params.status_pembayaran);
    if (params?.metode_pembayaran) query.set("metode_pembayaran", params.metode_pembayaran);
    const qs = query.toString() ? `?${query}` : "";
    return api.get<Payment[]>(`/payments${qs}`);
  },

  /**
   * POST /payments
   */
  async create(orderId: number, metode_pembayaran: PaymentMetode): Promise<Payment> {
    return api.post<Payment>("/payments", { orderId, metode_pembayaran });
  },

  /**
   * PUT /payments/:id/status
   */
  async updateStatus(id: number, status_pembayaran: PaymentStatus): Promise<Payment> {
    return api.put<Payment>(`/payments/${id}/status`, { status_pembayaran });
  },
};
