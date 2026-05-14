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
  createdAt: string;
}

export interface GetProductsParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
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
    return api.get<Product[]>(`/products${qs}`);
  },

  /**
   * GET /products/:id
   */
  async getById(id: number): Promise<Product> {
    return api.get<Product>(`/products/${id}`);
  },

  /**
   * POST /products  (multipart/form-data)
   * variants should be a JSON-serialised string of CreateVariantPayload[]
   */
  async create(formData: FormData): Promise<Product> {
    return api.upload<Product>("/products", formData, "POST");
  },

  /**
   * PUT /products/:id  (multipart/form-data)
   */
  async update(id: number, formData: FormData): Promise<Product> {
    return api.upload<Product>(`/products/${id}`, formData, "PUT");
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
   */
  async addVariant(productId: number, payload: CreateVariantPayload): Promise<ProductVariant> {
    return api.post<ProductVariant>(`/products/${productId}/variants`, payload);
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
