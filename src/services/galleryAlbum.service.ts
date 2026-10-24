/**
 * Gallery Albums API Service
 *
 * Backend routes (AnthonyServer):
 * Public:
 * - GET /api/gallery-albums
 * - GET /api/gallery-albums/years
 * - GET /api/gallery-albums/media
 * - GET /api/gallery-albums/{slug}
 * - GET /api/gallery-albums/{slug}/related
 * - GET /api/gallery-albums/{slug}/items
 *
 * Admin (auth + role:admin):
 * - CRUD admin-gallery-albums
 * - CRUD admin-gallery-albums/{id}/items
 * - POST admin-gallery-albums/{id}/items/reorder
 */

import { apiClient } from "@/lib/apiClient";

export interface GalleryAlbumCategory {
  id: string;
  label: string;
  slug: string;
  color?: string | null;
}

export interface GalleryAlbumTag {
  id: string;
  label: string;
  slug: string;
  color?: string | null;
}

export type GalleryMediaKind = "photo" | "video" | "audio" | "other";

export interface GalleryAlbumItem {
  id: string;
  album_id: string;
  title: string;
  description?: string | null;
  alt_text?: string | null;
  credit?: string | null;
  attachment_id?: string | null;
  media_url?: string | null;
  filetype?: string | null;
  filename?: string | null;
  media_kind?: GalleryMediaKind;
  sort_order: number;
  is_published: boolean;
  categories?: GalleryAlbumCategory[];
  tags?: GalleryAlbumTag[];
  album?: {
    id: string;
    title: string;
    slug: string;
    cover_url?: string | null;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  event_date?: string | null;
  event_end_date?: string | null;
  venue?: string | null;
  cover_attachment_id?: string | null;
  cover_url?: string | null;
  associated_type?: string | null;
  associated_id?: string | null;
  sort_order: number;
  is_featured: boolean;
  is_published: boolean;
  published_at?: string | null;
  items_count?: number;
  photo_count?: number;
  video_count?: number;
  items?: GalleryAlbumItem[];
  categories?: GalleryAlbumCategory[];
  tags?: GalleryAlbumTag[];
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Laravel ResourceCollection pagination shape.
 */
export interface LaravelResourceCollection<T> {
  data: T[];
  links?: unknown;
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    [key: string]: unknown;
  };
}

export type GalleryAlbumSort = "newest" | "oldest" | "featured";
export type GalleryMediaTypeFilter = "photo" | "video";

export interface ListPublicAlbumsParams {
  search?: string;
  category_id?: string;
  tag_id?: string;
  is_featured?: boolean;
  year?: number | string;
  sort?: GalleryAlbumSort;
  associated_type?: string;
  associated_id?: string;
  page?: number;
  per_page?: number;
}

export interface ListPublicMediaParams {
  type?: GalleryMediaTypeFilter;
  search?: string;
  year?: number | string;
  category_id?: string;
  page?: number;
  per_page?: number;
}

export interface ListAdminAlbumsParams {
  search?: string;
  is_published?: boolean | string;
  category_id?: string;
  tag_id?: string;
  sort?: GalleryAlbumSort;
  page?: number;
  per_page?: number;
}

export interface CreateOrUpdateAlbumPayload {
  title: string;
  slug?: string | null;
  description?: string | null;
  event_date?: string | null;
  event_end_date?: string | null;
  venue?: string | null;
  cover_attachment_id?: string | null;
  associated_type?: string | null;
  associated_id?: string | null;
  sort_order?: number | null;
  is_featured?: boolean;
  is_published?: boolean;
  published_at?: string | null;
  category_ids?: string[];
  tag_ids?: string[];
}

export interface CreateAlbumItemPayload {
  title: string;
  description?: string | null;
  alt_text?: string | null;
  credit?: string | null;
  file: File;
  sort_order?: number | null;
  is_published?: boolean;
  category_ids?: string[];
  tag_ids?: string[];
}

export interface UpdateAlbumItemPayload {
  title?: string;
  description?: string | null;
  alt_text?: string | null;
  credit?: string | null;
  file?: File;
  sort_order?: number | null;
  is_published?: boolean;
  category_ids?: string[];
  tag_ids?: string[];
}

export const listPublicAlbums = async (
  params?: ListPublicAlbumsParams
): Promise<LaravelResourceCollection<GalleryAlbum>> => {
  const res = await apiClient.get<LaravelResourceCollection<GalleryAlbum>>("gallery-albums", params);
  return res.data;
};

export const listPublicYears = async (): Promise<number[]> => {
  const res = await apiClient.get<{ data: number[] }>("gallery-albums/years");
  return res.data.data ?? [];
};

export const listPublicMedia = async (
  params?: ListPublicMediaParams
): Promise<LaravelResourceCollection<GalleryAlbumItem>> => {
  const res = await apiClient.get<LaravelResourceCollection<GalleryAlbumItem>>("gallery-albums/media", params);
  return res.data;
};

export const getPublicAlbum = async (slug: string): Promise<{ data: GalleryAlbum }> => {
  const res = await apiClient.get<{ data: GalleryAlbum }>(`gallery-albums/${slug}`);
  return res.data;
};

export const getRelatedAlbums = async (slug: string): Promise<{ data: GalleryAlbum[] }> => {
  const res = await apiClient.get<{ data: GalleryAlbum[] }>(`gallery-albums/${slug}/related`);
  return res.data;
};

export const listPublicAlbumItems = async (
  slug: string,
  params?: { page?: number; per_page?: number; type?: GalleryMediaTypeFilter }
): Promise<LaravelResourceCollection<GalleryAlbumItem>> => {
  const res = await apiClient.get<LaravelResourceCollection<GalleryAlbumItem>>(
    `gallery-albums/${slug}/items`,
    params
  );
  return res.data;
};

export const listAdminAlbums = async (
  params?: ListAdminAlbumsParams
): Promise<LaravelResourceCollection<GalleryAlbum>> => {
  const res = await apiClient.get<LaravelResourceCollection<GalleryAlbum>>("admin-gallery-albums", params);
  return res.data;
};

export const getAdminAlbum = async (albumId: string): Promise<{ data: GalleryAlbum }> => {
  const res = await apiClient.get<{ data: GalleryAlbum }>(`admin-gallery-albums/${albumId}`);
  return res.data;
};

export const createAlbum = async (
  payload: CreateOrUpdateAlbumPayload
): Promise<{ message: string; data: GalleryAlbum }> => {
  const res = await apiClient.post<{ message: string; data: GalleryAlbum }>("admin-gallery-albums", payload);
  return res.data;
};

export const updateAlbum = async (
  albumId: string,
  payload: Partial<CreateOrUpdateAlbumPayload>
): Promise<{ message: string; data: GalleryAlbum }> => {
  const res = await apiClient.put<{ message: string; data: GalleryAlbum }>(
    `admin-gallery-albums/${albumId}`,
    payload
  );
  return res.data;
};

export const deleteAlbum = async (albumId: string): Promise<{ message: string }> => {
  const res = await apiClient.delete<{ message: string }>(`admin-gallery-albums/${albumId}`);
  return res.data;
};

export const listAdminAlbumItems = async (
  albumId: string,
  params?: { page?: number; per_page?: number }
): Promise<LaravelResourceCollection<GalleryAlbumItem>> => {
  const res = await apiClient.get<LaravelResourceCollection<GalleryAlbumItem>>(
    `admin-gallery-albums/${albumId}/items`,
    params
  );
  return res.data;
};

export const createAlbumItem = async (
  albumId: string,
  payload: CreateAlbumItemPayload
): Promise<{ message: string; data: GalleryAlbumItem }> => {
  const form = new FormData();
  form.append("title", payload.title);
  if (payload.description) form.append("description", payload.description);
  if (payload.alt_text) form.append("alt_text", payload.alt_text);
  if (payload.credit) form.append("credit", payload.credit);
  form.append("file", payload.file);
  if (typeof payload.sort_order === "number") form.append("sort_order", String(payload.sort_order));
  if (typeof payload.is_published === "boolean") form.append("is_published", payload.is_published ? "1" : "0");
  (payload.category_ids ?? []).forEach((id) => form.append("category_ids[]", id));
  (payload.tag_ids ?? []).forEach((id) => form.append("tag_ids[]", id));

  const res = await apiClient.postForm<{ message: string; data: GalleryAlbumItem }>(
    `admin-gallery-albums/${albumId}/items`,
    form
  );
  return res.data;
};

export const updateAlbumItem = async (
  albumId: string,
  itemId: string,
  payload: UpdateAlbumItemPayload
): Promise<{ message: string; data: GalleryAlbumItem }> => {
  const form = new FormData();
  if (payload.title) form.append("title", payload.title);
  if (payload.description !== undefined) form.append("description", payload.description ?? "");
  if (payload.alt_text !== undefined) form.append("alt_text", payload.alt_text ?? "");
  if (payload.credit !== undefined) form.append("credit", payload.credit ?? "");
  if (payload.file) form.append("file", payload.file);
  if (typeof payload.sort_order === "number") form.append("sort_order", String(payload.sort_order));
  if (typeof payload.is_published === "boolean") form.append("is_published", payload.is_published ? "1" : "0");
  if (payload.category_ids) payload.category_ids.forEach((id) => form.append("category_ids[]", id));
  if (payload.tag_ids) payload.tag_ids.forEach((id) => form.append("tag_ids[]", id));

  const res = await apiClient.put<{ message: string; data: GalleryAlbumItem }>(
    `admin-gallery-albums/${albumId}/items/${itemId}`,
    form
  );
  return res.data;
};

export const reorderAdminItems = async (
  albumId: string,
  orders: { id: string; sort_order: number }[]
): Promise<{ message: string }> => {
  const res = await apiClient.post<{ message: string }>(`admin-gallery-albums/${albumId}/items/reorder`, {
    orders,
  });
  return res.data;
};

export const deleteAlbumItem = async (albumId: string, itemId: string): Promise<{ message: string }> => {
  const res = await apiClient.delete<{ message: string }>(`admin-gallery-albums/${albumId}/items/${itemId}`);
  return res.data;
};

export default {
  listPublicAlbums,
  listPublicYears,
  listPublicMedia,
  getPublicAlbum,
  getRelatedAlbums,
  listPublicAlbumItems,
  listAdminAlbums,
  getAdminAlbum,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  listAdminAlbumItems,
  createAlbumItem,
  updateAlbumItem,
  reorderAdminItems,
  deleteAlbumItem,
};
