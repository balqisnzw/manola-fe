import { api } from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface Supplier {
  id: number;
  nama: string;
  no_telepon: string;
  alamat: string | null;
  createdAt: string;
}

export interface CreateSupplierPayload {
  nama: string;
  no_telepon: string;
  alamat?: string;
}

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// ─── Supplier service ──────────────────────────────────────────────────────────

export const supplierService = {
  /** GET /suppliers */
  async getAll(): Promise<Supplier[]> {
    const res = await api.get<ApiResponse<Supplier[]>>("/suppliers");
    return Array.isArray(res.data) ? res.data : [];
  },

  /** POST /suppliers */
  async create(payload: CreateSupplierPayload): Promise<Supplier> {
    return api.post<Supplier>("/suppliers", payload);
  },

  /** PUT /suppliers/:id */
  async update(id: number, payload: Partial<CreateSupplierPayload>): Promise<Supplier> {
    return api.put<Supplier>(`/suppliers/${id}`, payload);
  },

  /** DELETE /suppliers/:id */
  async delete(id: number): Promise<{ message: string }> {
    return api.delete(`/suppliers/${id}`);
  },
};
