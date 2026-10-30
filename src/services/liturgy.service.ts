/**
 * Order of Mass & Rites API Service
 *
 * Public:
 * - GET /api/liturgy-resources
 * - GET /api/liturgy-resources/{slug}?lang=yo
 *
 * Admin (admin | super_admin):
 * - GET/POST /api/admin/liturgy-resources
 * - GET/PUT/DELETE /api/admin/liturgy-resources/{id}
 * - PUT/DELETE /api/admin/liturgy-resources/{id}/texts/{language}
 */

import { apiClient } from "@/lib/apiClient";

export type LiturgyCategory = "mass" | "sacrament" | "funeral" | "devotion" | "other";

export interface LiturgyLanguage {
  code: string;
  name: string;
  native: string;
}

export interface LiturgyMeta {
  languages: LiturgyLanguage[];
  categories: Record<LiturgyCategory, string>;
  default_language: string;
}

export interface LiturgySection {
  title: string;
  /** Pamphlet markup — see src/lib/liturgyText.ts. */
  body: string;
}

export interface LiturgyResourceSummary {
  id: string;
  slug: string;
  title: string;
  category: LiturgyCategory;
  summary: string | null;
  icon: string | null;
  languages: string[];
}

export interface LiturgyText {
  language: string;
  title: string;
  introduction: string | null;
  sections: LiturgySection[];
  updated_at?: string;
}

export interface LiturgyResourceDetail extends LiturgyResourceSummary {
  requested_language: string;
  text: LiturgyText;
}

export interface AdminLiturgyText extends LiturgyText {
  id: string;
  is_published: boolean;
}

export interface AdminLiturgyResource {
  id: string;
  slug: string;
  title: string;
  category: LiturgyCategory;
  summary: string | null;
  icon: string | null;
  sort_order: number;
  is_published: boolean;
  updated_at: string;
  texts: AdminLiturgyText[];
}

export type LiturgyResourceInput = Partial<
  Pick<AdminLiturgyResource, "title" | "slug" | "category" | "summary" | "icon" | "sort_order" | "is_published">
>;

export interface LiturgyTextInput {
  title: string;
  introduction?: string | null;
  sections: LiturgySection[];
  is_published: boolean;
}

export const list = async () => {
  const res = await apiClient.get<{ data: LiturgyResourceSummary[]; meta: LiturgyMeta }>("liturgy-resources");
  return res.data;
};

export const get = async (slug: string, lang?: string) => {
  const query = lang ? `?lang=${encodeURIComponent(lang)}` : "";
  const res = await apiClient.get<{ data: LiturgyResourceDetail; meta: LiturgyMeta }>(
    `liturgy-resources/${encodeURIComponent(slug)}${query}`,
  );
  return res.data;
};

export const adminList = async () => {
  const res = await apiClient.get<{ data: AdminLiturgyResource[]; meta: LiturgyMeta }>("admin/liturgy-resources");
  return res.data;
};

export const adminGet = async (id: string) => {
  const res = await apiClient.get<{ data: AdminLiturgyResource; meta: LiturgyMeta }>(`admin/liturgy-resources/${id}`);
  return res.data;
};

export const create = async (input: LiturgyResourceInput) => {
  const res = await apiClient.post<{ data: AdminLiturgyResource }>("admin/liturgy-resources", input);
  return res.data.data;
};

export const update = async (id: string, input: LiturgyResourceInput) => {
  const res = await apiClient.put<{ data: AdminLiturgyResource }>(`admin/liturgy-resources/${id}`, input);
  return res.data.data;
};

export const remove = async (id: string) => {
  await apiClient.delete(`admin/liturgy-resources/${id}`);
};

export const saveText = async (id: string, language: string, input: LiturgyTextInput) => {
  const res = await apiClient.put<{ data: AdminLiturgyText }>(`admin/liturgy-resources/${id}/texts/${language}`, input);
  return res.data.data;
};

export const removeText = async (id: string, language: string) => {
  await apiClient.delete(`admin/liturgy-resources/${id}/texts/${language}`);
};

export default {
  list,
  get,
  adminList,
  adminGet,
  create,
  update,
  remove,
  saveText,
  removeText,
};
