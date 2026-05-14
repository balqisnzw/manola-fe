import { api } from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ProductImage {
  id: number;
  url: string;
}

export interface ProductVariant {
  id: number;
  size: string;
  color: string | null;
  stock: number;
  productId?: number;
}

export interface ProductSupplier {
  id: number;
  nama: string;
  no_telepon: string;
  alamat: string | null;
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  supplierId: number | null;
  images: ProductImage[];
  variants: ProductVariant[];
  supplier?: ProductSupplier | null;
  createdAt: string;
}

/** Wrapper untuk response API yang membungkus data dalam { status, message, data } */
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface GetProductsParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface CreateProductPayload {
  name: string;
  description?: string;
  price: number;
  category?: string;
  supplierId?: number;
  /** JSON string dari array variant, e.g. '[{"size":"M","color":"Merah","stock":10}]' */
  variants?: string;
}

export interface CreateVariantPayload {
  size: string;
  color?: string;
  stock: number;
}

// ─── Product service ────────────────────────────────────────────────────────────

export const productService = {
  /**
   * GET /products
   */
  async getAll(params?: GetProductsParams): Promise<Product[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set("category", params.category);
    if (params?.minPrice !== undefined) query.set("minPrice", String(params.minPrice));
    if (params?.maxPrice !== undefined) query.set("maxPrice", String(params.maxPrice));
    const qs = query.toString() ? `?${query}` : "";

    const res = await api.get<ApiResponse<Product[]>>(`/products${qs}`);
    return Array.isArray(res.data) ? res.data : [];
  },

  /**
   * GET /products/:id
   */
  async getById(id: number): Promise<Product> {
    return api.get<Product>(`/products/${id}`);
  },

  /**
   * POST /products  (multipart/form-data)
   * variants harus berupa JSON string dari array CreateVariantPayload[]
   * API mengembalikan { status, message, data: Product }
   */
  async create(formData: FormData): Promise<Product> {
    const res = await api.upload<ApiResponse<Product>>("/products", formData, "POST");
    return res.data;
  },

  /**
   * PUT /products/:id  (multipart/form-data)
   * API mengembalikan { status, message, data: Product }
   */
  async update(id: number, formData: FormData): Promise<Product> {
    const res = await api.upload<ApiResponse<Product>>(`/products/${id}`, formData, "PUT");
    return res.data;
  },

  /**
   * DELETE /products/:id
   */
  async delete(id: number): Promise<{ message: string }> {
    return api.delete(`/products/${id}`);
  },

  // ── Variants ──────────────────────────────────────────────────────────────────

  /**
   * POST /products/:id/variants
   * API mengembalikan { status, message, data: ProductVariant }
   */
  async addVariant(productId: number, payload: CreateVariantPayload): Promise<ProductVariant> {
    const res = await api.post<ApiResponse<ProductVariant>>(`/products/${productId}/variants`, payload);
    return res.data;
  },

  /**
   * PUT /products/variants/:variantId
   */
  async updateVariant(
    variantId: number,
    payload: Partial<CreateVariantPayload>
  ): Promise<ProductVariant> {
    return api.put<ProductVariant>(`/products/variants/${variantId}`, payload);
  },

  /**
   * DELETE /products/variants/:variantId
   */
  async deleteVariant(variantId: number): Promise<{ message: string }> {
    return api.delete(`/products/variants/${variantId}`);
  },
};

// ─── Helper ─────────────────────────────────────────────────────────────────────

/**
 * Membangun FormData untuk create/update produk.
 * `variantList` akan di-serialize menjadi JSON string sesuai spec API.
 */
export function buildProductFormData(
  payload: CreateProductPayload,
  variantList: CreateVariantPayload[],
  photos?: FileList | File[]
): FormData {
  const fd = new FormData();
  fd.append("name", payload.name);
  if (payload.description) fd.append("description", payload.description);
  fd.append("price", String(payload.price));
  if (payload.category) fd.append("category", payload.category);
  if (payload.supplierId !== undefined) fd.append("supplierId", String(payload.supplierId));
  if (variantList.length > 0) {
    fd.append("variants", JSON.stringify(variantList));
  }
  if (photos) {
    Array.from(photos).forEach((file) => fd.append("photos", file));
  }
  return fd;
}
