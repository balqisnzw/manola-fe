import { api } from "@/lib/api";
import type { Product, ProductVariant, ProductImage } from "./productService";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type OrderStatus = "DIPROSES" | "DIKEMAS" | "DIKIRIM" | "SELESAI";
export type OrderJenis = "ONLINE" | "OFFLINE";
export type PaymentMetode = "CASH" | "QRIS" | "MIDTRANS";
export type PaymentStatus = "MENUNGGU" | "BERHASIL" | "GAGAL";

/** BE returns variant with nested product inside each order item */
export interface OrderItemVariant extends ProductVariant {
  product?: Product & { images?: ProductImage[] };
}

export interface OrderItem {
  id: number;
  orderId: number;
  productVariantId: number;
  jumlah: number;
  harga_satuan: number;
  variant?: OrderItemVariant;
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
  userId: number | null;
  kasirId: number | null;
  total_harga: number;
  ongkos_kirim: number | null;
  status: OrderStatus;
  jenis: OrderJenis;
  alamat_pengiriman: string | null;
  catatan: string | null;
  items: OrderItem[];
  payment: Payment | null;
  user?: { id: number; nama: string; email: string } | null;
  kasir?: { id: number; nama: string } | null;
  createdAt: string;
}

export interface CreateOrderPayload {
  jenis: OrderJenis;
  alamat_pengiriman?: string;
  ongkos_kirim?: number;
  catatan?: string;
  metode_pembayaran?: PaymentMetode;
  items: {
    variantId: number;
    jumlah: number;
  }[];
}

export interface GetOrdersParams {
  status?: OrderStatus;
  jenis?: OrderJenis;
}

// ─── Order service ─────────────────────────────────────────────────────────────

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const orderService = {
  /**
   * GET /orders
   */
  async getAll(params?: GetOrdersParams): Promise<Order[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.jenis) query.set("jenis", params.jenis);
    const qs = query.toString() ? `?${query}` : "";
    const res = await api.get<ApiResponse<Order[]>>(`/orders${qs}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  /**
   * GET /orders/:id
   */
  async getById(id: number): Promise<Order> {
    const res = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return res.data;
  },

  /**
   * POST /orders
   */
  async create(payload: CreateOrderPayload): Promise<Order> {
    const res = await api.post<ApiResponse<Order>>("/orders", payload);
    return res.data;
  },

  /**
   * PUT /orders/:id/status
   */
  async updateStatus(id: number, status: OrderStatus, extra?: { resi?: string; ekspedisi?: string }): Promise<Order> {
    const res = await api.put<ApiResponse<Order>>(`/orders/${id}/status`, { status, ...extra });
    return res.data;
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
