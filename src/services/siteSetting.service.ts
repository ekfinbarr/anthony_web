/**
 * Site Settings (Admin) API Service
 *
 * Backend routes (AnthonyServer):
 * - Public: GET /api/settings/public
 * - Admin : GET /api/settings
 * - Admin : POST /api/settings/bulk-update
 * - Admin : PUT /api/settings/{id}
 */

import { apiClient } from "@/lib/apiClient";

export type SiteSettingType = "string" | "text" | "number" | "boolean" | "json" | "image" | "url";

export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  typed_value: string | number | boolean | Record<string, unknown> | unknown[] | null;
  type: SiteSettingType;
  group: string;
  label: string;
  description?: string | null;
  is_public: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** Typed value for a public setting key (booleans/numbers/json already decoded). */
export type PublicSettingValue = string | number | boolean | Record<string, unknown> | unknown[] | null;

/** Public settings grouped by `group` → key → typed value. */
export type PublicSiteSettingsGrouped = Record<string, Record<string, PublicSettingValue>>;

export const list = async (params?: { group?: string }): Promise<{ data: Record<string, SiteSetting[]> | SiteSetting[] }> => {
  const res = await apiClient.get<{ data: Record<string, SiteSetting[]> | SiteSetting[] }>("settings", params);
  return res.data;
};

/**
 * Public site settings (no auth). Used by the contact page and other public surfaces
 * that should reflect Admin Settings.
 */
export const getPublic = async (): Promise<PublicSiteSettingsGrouped> => {
  const res = await apiClient.get<{ data: PublicSiteSettingsGrouped }>("settings/public");
  return res.data.data;
};

export const bulkUpdate = async (
  settings: Array<{ key: string; value: string | null }>
): Promise<{ message: string; data: SiteSetting[] }> => {
  const res = await apiClient.post<{ message: string; data: SiteSetting[] }>("settings/bulk-update", {
    settings,
  });
  return res.data;
};

export const update = async (
  id: string,
  payload: Partial<Pick<SiteSetting, "value" | "is_public" | "group" | "label" | "description" | "sort_order" | "type">>
): Promise<{ message: string; data: SiteSetting }> => {
  const res = await apiClient.put<{ message: string; data: SiteSetting }>(`settings/${id}`, payload);
  return res.data;
};

export default {
  list,
  getPublic,
  bulkUpdate,
  update,
};


