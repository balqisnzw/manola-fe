import { api } from "@/lib/api";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface ShippingLocation {
  id: number;
  name: string;
}

export interface ShippingCostDetail {
  name: string;
  code: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}

export interface CalculateCostPayload {
  destinationDistrictId: number;
  weight: number;
  courier: string;
}

export const shippingService = {
  /** GET /shipping/provinces - Ambil daftar provinsi */
  async getProvinces(): Promise<ShippingLocation[]> {
    const res = await api.get<ApiResponse<ShippingLocation[]>>("/shipping/provinces");
    return Array.isArray(res.data) ? res.data : [];
  },

  /** GET /shipping/cities/:provinceId - Ambil daftar kota */
  async getCities(provinceId: number): Promise<ShippingLocation[]> {
    const res = await api.get<ApiResponse<ShippingLocation[]>>(`/shipping/cities/${provinceId}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  /** GET /shipping/districts/:cityId - Ambil daftar kecamatan */
  async getDistricts(cityId: number): Promise<ShippingLocation[]> {
    const res = await api.get<ApiResponse<ShippingLocation[]>>(`/shipping/districts/${cityId}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  /** POST /shipping/calculate - Hitung biaya pengiriman */
  async calculateCost(payload: CalculateCostPayload): Promise<ShippingCostDetail[]> {
    const res = await api.post<ApiResponse<ShippingCostDetail[]>>("/shipping/calculate", payload);
    return Array.isArray(res.data) ? res.data : [];
  }
};
