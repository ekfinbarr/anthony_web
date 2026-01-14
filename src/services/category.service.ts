/**
 * Category API Service
 *
 * Minimal service for listing Categories (used by MultiSelect in PostFormPage).
 *
 * Backend endpoint:
 * - GET /api/categories?search=&active=true
 *
 * Response shape:
 * - { data: Category[] }
 *
 * @package Lovable/src/services
 */

import { apiClient } from "../lib/apiClient";

export interface Category {
  id: string;
  label: string;
  slug: string;
  color?: string | null;
  parent_id?: string | null;
  is_active?: boolean;
}

export interface CategoryListParams {
  search?: string;
  active?: boolean;
}

/**
 * Convert optional params into a plain Record (matches `apiClient.get` typing).
 */
const toQueryParams = (params?: CategoryListParams): Record<string, string | number | boolean> | undefined => {
  if (!params) return undefined;
  const out: Record<string, string | number | boolean> = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (typeof v === "boolean" || typeof v === "number") {
      out[k] = v;
    } else {
      out[k] = String(v);
    }
  });
  return out;
};

export const list = async (params?: CategoryListParams): Promise<{ data: Category[] }> => {
  const response = await apiClient.get<{ data: Category[] }>("categories", toQueryParams(params));
  return response.data;
};

const categoryService = { list };
export default categoryService;


