import { api } from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface Address {
  id: number;
  userId: number;
  label: string;
  penerima: string;
  no_telepon: string;
  alamat: string;
  kota: string;
  kode_pos: string;
  provinceId?: number | null;
  cityId?: number | null;
  districtId?: number | null;
  provinsi?: string | null;
  kecamatan?: string | null;
  is_utama: boolean;
  createdAt: string;
}

export interface CreateAddressPayload {
  label?: string;
  penerima: string;
  no_telepon: string;
  alamat: string;
  kota: string;
  kode_pos: string;
  provinceId?: number | null;
  cityId?: number | null;
  districtId?: number | null;
  provinsi?: string | null;
  kecamatan?: string | null;
  is_utama?: boolean;
}

export interface UpdateAddressPayload {
  label?: string;
  penerima?: string;
  no_telepon?: string;
  alamat?: string;
  kota?: string;
  kode_pos?: string;
  provinceId?: number | null;
  cityId?: number | null;
  districtId?: number | null;
  provinsi?: string | null;
  kecamatan?: string | null;
  is_utama?: boolean;
}

// ─── Address service ───────────────────────────────────────────────────────────

export const addressService = {
  /** GET /addresses — Ambil semua alamat milik user yang login */
  async getAll(): Promise<Address[]> {
    const res = await api.get<ApiResponse<Address[]>>("/addresses");
    return Array.isArray(res.data) ? res.data : [];
  },

  /** GET /addresses/:id */
  async getById(id: number): Promise<Address> {
    const res = await api.get<ApiResponse<Address>>(`/addresses/${id}`);
    return res.data;
  },

  /** POST /addresses */
  async create(payload: CreateAddressPayload): Promise<Address> {
    const res = await api.post<ApiResponse<Address>>("/addresses", payload);
    return res.data;
  },

  /** PUT /addresses/:id */
  async update(id: number, payload: UpdateAddressPayload): Promise<Address> {
    const res = await api.put<ApiResponse<Address>>(`/addresses/${id}`, payload);
    return res.data;
  },

  /** PUT /addresses/:id/utama — Set sebagai alamat utama */
  async setUtama(id: number): Promise<Address> {
    const res = await api.put<ApiResponse<Address>>(`/addresses/${id}/utama`);
    return res.data;
  },

  /** DELETE /addresses/:id */
  async remove(id: number): Promise<{ message: string }> {
    return api.delete(`/addresses/${id}`);
  },
};
