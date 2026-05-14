import { api } from "@/lib/api";
import type { User, UserRole } from "./authService";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type EmployeeRole = "ADMIN" | "KASIR" | "PACKAGING";

export interface CreateEmployeePayload {
  email: string;
  password: string;
  nama: string;
  foto?: string;
  role: EmployeeRole;
}

// ─── Employee service ──────────────────────────────────────────────────────────

export const employeeService = {
  /** GET /employees */
  async getAll(): Promise<User[]> {
    return api.get<User[]>("/employees");
  },

  /** POST /employees */
  async create(payload: CreateEmployeePayload): Promise<User> {
    return api.post<User>("/employees", payload);
  },

  /** DELETE /employees/:id */
  async delete(id: number): Promise<{ message: string }> {
    return api.delete(`/employees/${id}`);
  },
};

// ─── Restock service ───────────────────────────────────────────────────────────

export interface Restock {
  id: number;
  productVariantId: number;
  supplierId: number | null;
  jumlah: number;
  createdAt: string;
}

export interface GetRestocksParams {
  productVariantId?: number;
  supplierId?: number;
}

export interface CreateRestockPayload {
  productVariantId: number;
  supplierId?: number;
  jumlah: number;
}

export const restockService = {
  /** GET /restocks */
  async getAll(params?: GetRestocksParams): Promise<Restock[]> {
    const query = new URLSearchParams();
    if (params?.productVariantId !== undefined)
      query.set("productVariantId", String(params.productVariantId));
    if (params?.supplierId !== undefined) query.set("supplierId", String(params.supplierId));
    const qs = query.toString() ? `?${query}` : "";
    return api.get<Restock[]>(`/restocks${qs}`);
  },

  /** POST /restocks */
  async create(payload: CreateRestockPayload): Promise<Restock> {
    return api.post<Restock>("/restocks", payload);
  },
};

// ─── Wishlist service ──────────────────────────────────────────────────────────

export interface Wishlist {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
}

export const wishlistService = {
  /** GET /wishlists */
  async getAll(): Promise<Wishlist[]> {
    return api.get<Wishlist[]>("/wishlists");
  },

  /** POST /wishlists */
  async add(productId: number): Promise<Wishlist> {
    return api.post<Wishlist>("/wishlists", { productId });
  },

  /** DELETE /wishlists/:id */
  async remove(id: number): Promise<{ message: string }> {
    return api.delete(`/wishlists/${id}`);
  },
};

// ─── Review service ────────────────────────────────────────────────────────────

export interface Review {
  id: number;
  userId: number;
  productId: number;
  orderId: number;
  rating: number;
  komentar: string | null;
  createdAt: string;
}

export interface CreateReviewPayload {
  productId: number;
  orderId: number;
  rating: number;
  komentar?: string;
}

export const reviewService = {
  /** POST /reviews */
  async create(payload: CreateReviewPayload): Promise<Review> {
    return api.post<Review>("/reviews", payload);
  },
};
