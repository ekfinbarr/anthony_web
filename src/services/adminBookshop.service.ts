/**
 * Admin Bookshop API Service
 *
 * Backend admin routes (AnthonyServer):
 * - /api/bookshop-categories (CRUD)
 * - /api/bookshop-products  (CRUD)
 * - /api/bookshop-orders    (index/show + status transitions)
 *
 * This service is used by admin pages under /admin/shop.
 */

import { apiClient } from "@/lib/apiClient";

export interface LaravelResourceCollection<T> {
  data: T[];
  meta?: unknown;
  links?: unknown;
}

export type AdminQueryParams = Record<string, string | number | boolean | null | undefined>;

export interface BookshopCategoryAdmin {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  is_active?: boolean;
}

export interface BookshopProductAdmin {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  full_description?: string | null;
  price?: string | number | null;
  currency?: string;
  image_url?: string | null;
  variants?: string[] | null;
  stock_quantity?: number | null;
  is_active: boolean;
  is_featured: boolean;
  sort_order?: number;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface UpsertBookshopProductPayload {
  category_id: string;
  title: string;
  description?: string | null;
  full_description?: string | null;
  price?: number | null;
  currency?: string;
  image_url?: string | null;
  variants?: string[] | null;
  stock_quantity?: number | null;
  is_active?: boolean;
  is_featured?: boolean;
  sort_order?: number;
  slug?: string;
}

export const listCategories = async (params?: AdminQueryParams): Promise<LaravelResourceCollection<BookshopCategoryAdmin>> => {
  const res = await apiClient.get<LaravelResourceCollection<BookshopCategoryAdmin>>("bookshop-categories", params);
  return res.data;
};

export const listProducts = async (params?: AdminQueryParams): Promise<LaravelResourceCollection<BookshopProductAdmin>> => {
  const res = await apiClient.get<LaravelResourceCollection<BookshopProductAdmin>>("bookshop-products", params);
  return res.data;
};

export const getProduct = async (slug: string): Promise<{ data: BookshopProductAdmin }> => {
  const res = await apiClient.get<{ data: BookshopProductAdmin }>(`bookshop-products/${slug}`);
  return res.data;
};

export const createProduct = async (payload: UpsertBookshopProductPayload) => {
  const res = await apiClient.post("bookshop-products", payload);
  return res.data;
};

export const updateProduct = async (slug: string, payload: Partial<UpsertBookshopProductPayload>) => {
  const res = await apiClient.put(`bookshop-products/${slug}`, payload);
  return res.data;
};

export const deleteProduct = async (slug: string) => {
  const res = await apiClient.delete(`bookshop-products/${slug}`);
  return res.data;
};

export default {
  listCategories,
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};


