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
  images?: { id: number; url: string }[];
}

export interface CreateReviewPayload {
  productId: number;
  orderId: number;
  rating: number;
  komentar?: string;
  images?: File[];
}

export const reviewService = {
  /** POST /reviews */
  async create(payload: CreateReviewPayload): Promise<Review> {
    const formData = new FormData();
    formData.append("productId", String(payload.productId));
    formData.append("orderId", String(payload.orderId));
    formData.append("rating", String(payload.rating));
    if (payload.komentar) {
      formData.append("komentar", payload.komentar);
    }
    if (payload.images && payload.images.length > 0) {
      payload.images.forEach(file => formData.append("images", file));
    }

    const res = await api.post<ApiResponse<Review>>("/reviews", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  /** GET /reviews/products/:productId */
  async getProductReviews(productId: number): Promise<Review[]> {
    const res = await api.get<ApiResponse<Review[]>>(`/reviews/products/${productId}`);
    return Array.isArray(res.data) ? res.data : [];
  },
};

// ─── Notification service ────────────────────────────────────────────────────────
export interface Notification {
  id: number;
  userId: number;
  judul: string;
  pesan: string;
  is_read: boolean;
  link?: string | null;
  createdAt: string;
}

export const notificationService = {
  /** GET /notifications */
  async getAll(): Promise<Notification[]> {
    const res = await api.get<ApiResponse<Notification[]>>("/notifications");
    return Array.isArray(res.data) ? res.data : [];
  },

  /** PUT /notifications/read-all */
  async markAllAsRead(): Promise<{ status: string; message: string }> {
    const res = await api.put<{ status: string; message: string }>("/notifications/read-all");
    return res;
  },

  /** PUT /notifications/:id/read */
  async markAsRead(id: number): Promise<{ status: string; message: string }> {
    const res = await api.put<{ status: string; message: string }>(`/notifications/${id}/read`);
    return res;
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

// ─── Voucher service ────────────────────────────────────────────────────────────

export interface Voucher {
  id: number;
  kode: string;
  nama: string;
  tipe_diskon: string;
  nilai_diskon: number;
  min_pembelian: number | null;
  max_diskon: number | null;
  kuota: number;
  terpakai: number;
  tanggal_mulai: string;
  tanggal_berakhir: string;
  aktif: boolean;
  createdAt: string;
}

export interface CreateVoucherPayload {
  kode: string;
  nama: string;
  tipe_diskon: string;
  nilai_diskon: number;
  min_pembelian?: number;
  max_diskon?: number;
  kuota?: number;
  tanggal_mulai: string;
  tanggal_berakhir: string;
  aktif?: boolean;
}

export const voucherService = {
  async getAll(): Promise<Voucher[]> {
    const res = await api.get<ApiResponse<Voucher[]>>("/vouchers");
    return Array.isArray(res.data) ? res.data : [];
  },
  async create(payload: CreateVoucherPayload): Promise<Voucher> {
    const res = await api.post<ApiResponse<Voucher>>("/vouchers", payload);
    return res.data;
  },
  async update(id: number, payload: Partial<CreateVoucherPayload>): Promise<Voucher> {
    const res = await api.put<ApiResponse<Voucher>>(`/vouchers/${id}`, payload);
    return res.data;
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/vouchers/${id}`);
  },
  async validate(kode: string, total_belanja: number): Promise<{ voucher: Voucher; diskon: number }> {
    const res = await api.post<ApiResponse<{ voucher: Voucher; diskon: number }>>("/vouchers/validate", { kode, total_belanja });
    return res.data;
  },
};

// ─── Category service ───────────────────────────────────────────────────────────

export interface Category {
  id: number;
  nama: string;
  _count?: { products: number };
  createdAt: string;
}

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const res = await api.get<ApiResponse<Category[]>>("/categories");
    return Array.isArray(res.data) ? res.data : [];
  },
  async create(nama: string): Promise<Category> {
    const res = await api.post<ApiResponse<Category>>("/categories", { nama });
    return res.data;
  },
  async update(id: number, nama: string): Promise<Category> {
    const res = await api.put<ApiResponse<Category>>(`/categories/${id}`, { nama });
    return res.data;
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};

// ─── Banner service ─────────────────────────────────────────────────────────────

export interface Banner {
  id: number;
  judul: string;
  gambar: string;
  link: string | null;
  urutan: number;
  aktif: boolean;
  createdAt: string;
}

export const bannerService = {
  async getAll(onlyActive = false): Promise<Banner[]> {
    const qs = onlyActive ? "?active=true" : "";
    const res = await api.get<ApiResponse<Banner[]>>(`/banners${qs}`);
    return Array.isArray(res.data) ? res.data : [];
  },
  async create(formData: FormData): Promise<Banner> {
    const res = await api.upload<ApiResponse<Banner>>("/banners", formData, "POST");
    return res.data;
  },
  async update(id: number, formData: FormData): Promise<Banner> {
    const res = await api.upload<ApiResponse<Banner>>(`/banners/${id}`, formData, "PUT");
    return res.data;
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/banners/${id}`);
  },
};

// ─── Cashier Shift service ──────────────────────────────────────────────────────
export interface PettyCash {
  id: number;
  shiftId: number;
  jumlah: number;
  keterangan: string;
  createdAt: string;
}

export interface CashierShift {
  id: number;
  kasirId: number;
  modal_awal: number;
  total_cash: number;
  total_qris: number;
  pengeluaran: number;
  modal_akhir: number | null;
  catatan: string | null;
  mulai: string;
  selesai: string | null;
  kasir?: { id: number; nama: string };
  expenses?: PettyCash[];
}

export const shiftService = {
  async getActive(): Promise<CashierShift | null> {
    const res = await api.get<ApiResponse<CashierShift | null>>("/shifts/active");
    return res.data;
  },
  async start(modal_awal: number): Promise<CashierShift> {
    const res = await api.post<ApiResponse<CashierShift>>("/shifts/start", { modal_awal });
    return res.data;
  },
  async close(id: number, modal_akhir: number, catatan?: string): Promise<CashierShift> {
    const res = await api.post<ApiResponse<CashierShift>>(`/shifts/${id}/close`, { modal_akhir, catatan });
    return res.data;
  },
  async addPettyCash(shiftId: number, jumlah: number, keterangan: string): Promise<PettyCash> {
    const res = await api.post<ApiResponse<PettyCash>>("/shifts/petty-cash", { shiftId, jumlah, keterangan });
    return res.data;
  },
  async getAll(): Promise<CashierShift[]> {
    const res = await api.get<ApiResponse<CashierShift[]>>("/shifts");
    return Array.isArray(res.data) ? res.data : [];
  },
};

// ─── Settings service ────────────────────────────────────────────────────────────
export const settingService = {
  async get(): Promise<Record<string, string>> {
    const res = await api.get<ApiResponse<Record<string, string>>>("/settings");
    return res.data;
  },
  async update(payload: Record<string, string>): Promise<any> {
    const res = await api.put<ApiResponse<any>>("/settings", payload);
    return res.data;
  }
};

