/**
 * Bookshop API Service
 *
 * Backend routes (AnthonyServer):
 * - GET  /api/bookshop/categories
 * - GET  /api/bookshop/products
 * - GET  /api/bookshop/categories/{category}/products
 * - GET  /api/bookshop/products/{product}
 * - POST /api/bookshop/orders
 * - GET  /api/bookshop/orders/mine (auth)
 */

import { apiClient } from "@/lib/apiClient";

export interface BookshopCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
}

export interface BookshopProduct {
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
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface LaravelResourceCollection<T> {
  data: T[];
}

export interface CreateBookshopOrderPayload {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  notes?: string;
  items: Array<{
    product_id: string;
    quantity?: number;
    variant?: string;
  }>;
}

export const listCategories = async (): Promise<LaravelResourceCollection<BookshopCategory>> => {
  const response = await apiClient.get<LaravelResourceCollection<BookshopCategory>>("bookshop/categories");
  return response.data;
};

export const listProducts = async (params?: { search?: string; category_slug?: string }): Promise<LaravelResourceCollection<BookshopProduct>> => {
  const response = await apiClient.get<LaravelResourceCollection<BookshopProduct>>("bookshop/products", params);
  return response.data;
};

export const listProductsByCategory = async (categorySlug: string, params?: { search?: string }): Promise<LaravelResourceCollection<BookshopProduct>> => {
  const response = await apiClient.get<LaravelResourceCollection<BookshopProduct>>(
    `bookshop/categories/${categorySlug}/products`,
    params
  );
  return response.data;
};

export const createOrder = async (payload: CreateBookshopOrderPayload) => {
  const response = await apiClient.post("bookshop/orders", payload);
  return response.data;
};

export default {
  listCategories,
  listProducts,
  listProductsByCategory,
  createOrder,
};


