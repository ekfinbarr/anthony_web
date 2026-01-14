/**
 * Gallery Albums API Service
 *
 * Backend routes (AnthonyServer):
 * Public:
 * - GET /api/gallery-albums
 * - GET /api/gallery-albums/{slug}
 * - GET /api/gallery-albums/{slug}/items
 *
 * Admin (auth + role:admin):
 * - GET    /api/gallery-albums
 * - POST   /api/gallery-albums
 * - GET    /api/gallery-albums/{id}
 * - PUT    /api/gallery-albums/{id}
 * - DELETE /api/gallery-albums/{id}
 * - GET    /api/gallery-albums/{id}/items
 * - POST   /api/gallery-albums/{id}/items (multipart with file)
 * - PUT/POST /api/gallery-albums/{id}/items/{itemId} (multipart with optional file)
 * - DELETE /api/gallery-albums/{id}/items/{itemId}
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

export interface GalleryAlbumItem {
  id: string;
  album_id: string;
  title: string;
  description?: string | null;
  attachment_id?: string | null;
  media_url?: string | null;
  filetype?: string | null;
  filename?: string | null;
  sort_order: number;
  is_published: boolean;
  categories?: GalleryAlbumCategory[];
  tags?: GalleryAlbumTag[];
  created_at: string;
  updated_at: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  cover_attachment_id?: string | null;
  cover_url?: string | null;
  associated_type?: string | null;
  associated_id?: string | null;
  sort_order: number;
  is_featured: boolean;
  is_published: boolean;
  published_at?: string | null;
  items_count?: number;
  items?: GalleryAlbumItem[];
  categories?: GalleryAlbumCategory[];
  tags?: GalleryAlbumTag[];
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Laravel ResourceCollection pagination shape.
 * (Used by JsonResource::collection($paginator))
 */
export interface LaravelResourceCollection<T> {
  data: T[];
  links?: unknown;
  meta?: unknown;
}

export interface ListPublicAlbumsParams {
  search?: string;
  category_id?: string;
  tag_id?: string;
  is_featured?: boolean;
  associated_type?: string;
  associated_id?: string;
  page?: number;
  per_page?: number;
}

export interface ListAdminAlbumsParams {
  search?: string;
  is_published?: boolean | string;
  category_id?: string;
  tag_id?: string;
  page?: number;
  per_page?: number;
}

export interface CreateOrUpdateAlbumPayload {
  title: string;
  slug?: string | null;
  description?: string | null;
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
  file: File;
  sort_order?: number | null;
  is_published?: boolean;
  category_ids?: string[];
  tag_ids?: string[];
}

export interface UpdateAlbumItemPayload {
  title?: string;
  description?: string | null;
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

export const getPublicAlbum = async (slug: string): Promise<{ data: GalleryAlbum }> => {
  const res = await apiClient.get<{ data: GalleryAlbum }>(`gallery-albums/${slug}`);
  return res.data;
};

export const listPublicAlbumItems = async (
  slug: string,
  params?: { page?: number; per_page?: number }
): Promise<LaravelResourceCollection<GalleryAlbumItem>> => {
  const res = await apiClient.get<LaravelResourceCollection<GalleryAlbumItem>>(`gallery-albums/${slug}/items`, params);
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

export const createAlbum = async (payload: CreateOrUpdateAlbumPayload): Promise<{ message: string; data: GalleryAlbum }> => {
  const res = await apiClient.post<{ message: string; data: GalleryAlbum }>("admin-gallery-albums", payload);
  return res.data;
};

export const updateAlbum = async (
  albumId: string,
  payload: Partial<CreateOrUpdateAlbumPayload>
): Promise<{ message: string; data: GalleryAlbum }> => {
  const res = await apiClient.put<{ message: string; data: GalleryAlbum }>(`admin-gallery-albums/${albumId}`, payload);
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
  const res = await apiClient.get<LaravelResourceCollection<GalleryAlbumItem>>(`admin-gallery-albums/${albumId}/items`, params);
  return res.data;
};

export const createAlbumItem = async (
  albumId: string,
  payload: CreateAlbumItemPayload
): Promise<{ message: string; data: GalleryAlbumItem }> => {
  const form = new FormData();
  form.append("title", payload.title);
  if (payload.description) form.append("description", payload.description);
  form.append("file", payload.file);
  if (typeof payload.sort_order === "number") form.append("sort_order", String(payload.sort_order));
  if (typeof payload.is_published === "boolean") form.append("is_published", payload.is_published ? "1" : "0");
  (payload.category_ids ?? []).forEach((id) => form.append("category_ids[]", id));
  (payload.tag_ids ?? []).forEach((id) => form.append("tag_ids[]", id));

  const res = await apiClient.postForm<{ message: string; data: GalleryAlbumItem }>(`admin-gallery-albums/${albumId}/items`, form);
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
  if (payload.file) form.append("file", payload.file);
  if (typeof payload.sort_order === "number") form.append("sort_order", String(payload.sort_order));
  if (typeof payload.is_published === "boolean") form.append("is_published", payload.is_published ? "1" : "0");
  if (payload.category_ids) payload.category_ids.forEach((id) => form.append("category_ids[]", id));
  if (payload.tag_ids) payload.tag_ids.forEach((id) => form.append("tag_ids[]", id));

  // Backend supports PUT or POST here (multipart-friendly).
  const res = await apiClient.put<{ message: string; data: GalleryAlbumItem }>(`admin-gallery-albums/${albumId}/items/${itemId}`, form);
  return res.data;
};

export const deleteAlbumItem = async (albumId: string, itemId: string): Promise<{ message: string }> => {
  const res = await apiClient.delete<{ message: string }>(`admin-gallery-albums/${albumId}/items/${itemId}`);
  return res.data;
};

export default {
  listPublicAlbums,
  getPublicAlbum,
  listPublicAlbumItems,
  listAdminAlbums,
  getAdminAlbum,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  listAdminAlbumItems,
  createAlbumItem,
  updateAlbumItem,
  deleteAlbumItem,
};


