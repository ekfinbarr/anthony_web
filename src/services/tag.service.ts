/**
 * Tag API Service
 *
 * Minimal service for listing Tags (used by MultiSelect in PostFormPage).
 *
 * Backend endpoint:
 * - GET /api/tags?search=&active=true
 *
 * Response shape:
 * - { data: Tag[] }
 *
 * @package Lovable/src/services
 */

import { apiClient } from "../lib/apiClient";

export interface Tag {
  id: string;
  label: string;
  slug: string;
  color?: string | null;
  is_active?: boolean;
}

export interface TagListParams {
  search?: string;
  active?: boolean;
}

/**
 * Convert optional params into a plain Record (matches `apiClient.get` typing).
 */
const toQueryParams = (params?: TagListParams): Record<string, string | number | boolean> | undefined => {
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

export const list = async (params?: TagListParams): Promise<{ data: Tag[] }> => {
  const response = await apiClient.get<{ data: Tag[] }>("tags", toQueryParams(params));
  return response.data;
};

const tagService = { list };
export default tagService;