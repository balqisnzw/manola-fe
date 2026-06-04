import { api } from "@/lib/api";
import type { User } from "./authService";

// ─── Shared API wrapper type ────────────────────────────────────────────────────

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

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
    const res = await api.get<ApiResponse<User[]>>("/employees");
    return Array.isArray(res.data) ? res.data : [];
  },

  /** POST /employees */
  async create(payload: CreateEmployeePayload): Promise<User> {
    const res = await api.post<ApiResponse<User>>("/employees", payload);
    return res.data;
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
    const res = await api.get<ApiResponse<Restock[]>>(`/restocks${qs}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  /** POST /restocks */
  async create(payload: CreateRestockPayload): Promise<Restock> {
    const res = await api.post<ApiResponse<Restock>>("/restocks", payload);
    return res.data;
  },
};

// ─── Wishlist service ──────────────────────────────────────────────────────────

export interface WishlistProduct {
  id: number;
  name: string;
  price: number;
  images: { id: number; url: string }[];
  variants: { id: number; size: string; color: string | null; stock: number }[];
}

export interface Wishlist {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  product?: WishlistProduct;
}

export const wishlistService = {
  /** GET /wishlists */
  async getAll(): Promise<Wishlist[]> {
    const res = await api.get<ApiResponse<Wishlist[]>>("/wishlists");
    return Array.isArray(res.data) ? res.data : [];
  },

  /** POST /wishlists */
  async add(productId: number): Promise<Wishlist> {
    const res = await api.post<ApiResponse<Wishlist>>("/wishlists", { productId });
    return res.data;
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
  user?: { id: number; nama: string };
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
    const res = await api.post<ApiResponse<Review>>("/reviews", payload);
    return res.data;
  },

  /** GET /reviews/products/:productId */
  async getProductReviews(productId: number): Promise<Review[]> {
    const res = await api.get<ApiResponse<Review[]>>(`/reviews/products/${productId}`);
    return Array.isArray(res.data) ? res.data : [];
  },
};

// ─── User service (for Owner pelanggan page) ───────────────────────────────────

export interface UserData {
  id: number;
  email: string;
  nama: string;
  foto: string | null;
  role: string;
  createdAt: string;
}

export const userService = {
  /** GET /auth/users?role=USER */
  async getCustomers(): Promise<UserData[]> {
    const res = await api.get<ApiResponse<UserData[]>>("/auth/users?role=USER");
    return Array.isArray(res.data) ? res.data : [];
  },
};
