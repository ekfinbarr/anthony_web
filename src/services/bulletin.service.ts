/**
 * Bulletin API Service
 *
 * Public Sunday bulletin archive: list, latest, detail, calendar, download.
 *
 * @package Lovable/src/services
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

export type BulletinFormat = 'pdf' | 'doc' | 'docx' | 'image' | 'images' | string | null;

export interface Bulletin {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  bulletin_date: string;
  bulletin_date_formatted?: string | null;
  file_format?: BulletinFormat;
  mime_type?: string | null;
  file_size?: number | null;
  file_size_formatted?: string | null;
  file_url?: string | null;
  thumbnail_url?: string | null;
  cover_url?: string | null;
  image_urls?: string[];
  content_sections?: unknown;
  download_count?: number;
  is_featured?: boolean;
  is_published?: boolean;
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
  creator?: { id: string; name?: string } | null;
}

export interface BulletinMeta {
  years: number[];
  months_by_year: Record<string, Array<{ month: number; count: number }>>;
}

export interface BulletinCalendarData {
  dates: string[];
  year?: number | null;
  month?: number | null;
}

export interface BulletinNeighbors {
  previous: Bulletin | null;
  next: Bulletin | null;
}

export interface BulletinQueryParams {
  [key: string]: string | number | boolean | undefined;
  page?: number;
  per_page?: number;
  search?: string;
  q?: string;
  year?: number | string;
  month?: number | string;
  from_date?: string;
  to_date?: string;
  sort?: 'newest' | 'oldest';
  exclude_slug?: string;
}

type UnknownRecord = Record<string, unknown>;

const isRecord = (v: unknown): v is UnknownRecord => typeof v === 'object' && v !== null;

function unwrapData<T>(payload: unknown): T {
  if (isRecord(payload) && 'data' in payload) {
    return payload.data as T;
  }
  return payload as T;
}

function normalizePaginated<T>(raw: unknown): PaginatedResponse<T> {
  const root = isRecord(raw) ? raw : {};
  // Laravel Resource collections nest pagination under `meta` or flatten on root
  const meta = isRecord(root.meta) ? root.meta : root;
  let data: T[] = [];
  if (Array.isArray(root.data)) {
    data = root.data as T[];
  } else if (isRecord(root.data) && Array.isArray((root.data as UnknownRecord).data)) {
    data = (root.data as UnknownRecord).data as T[];
  }

  return {
    data,
    current_page: Number(meta.current_page ?? 1),
    last_page: Number(meta.last_page ?? 1),
    per_page: Number(meta.per_page ?? (data.length || 12)),
    total: Number(meta.total ?? data.length),
    from: Number(meta.from ?? (data.length ? 1 : 0)),
    to: Number(meta.to ?? data.length),
  };
}

export const list = async (params?: BulletinQueryParams): Promise<PaginatedResponse<Bulletin>> => {
  const response = await apiClient.get<unknown>('bulletins', params);
  return normalizePaginated<Bulletin>(response.data);
};

export const latest = async (): Promise<Bulletin | null> => {
  const response = await apiClient.get<unknown>('bulletins/latest');
  return unwrapData<Bulletin | null>(response.data);
};

export const getBySlug = async (slug: string): Promise<Bulletin> => {
  const response = await apiClient.get<unknown>(`bulletins/${encodeURIComponent(slug)}`);
  return unwrapData<Bulletin>(response.data);
};

export const meta = async (): Promise<BulletinMeta> => {
  const response = await apiClient.get<unknown>('bulletins/meta');
  return unwrapData<BulletinMeta>(response.data);
};

export const calendar = async (params?: {
  year?: number;
  month?: number;
}): Promise<BulletinCalendarData> => {
  const response = await apiClient.get<unknown>('bulletins/calendar', params);
  return unwrapData<BulletinCalendarData>(response.data);
};

export const neighbors = async (slug: string): Promise<BulletinNeighbors> => {
  const response = await apiClient.get<unknown>(
    `bulletins/${encodeURIComponent(slug)}/neighbors`,
  );
  return unwrapData<BulletinNeighbors>(response.data);
};

export const trackDownload = async (
  slug: string,
): Promise<{ download_url?: string; download_count?: number; image_urls?: string[] }> => {
  const response = await apiClient.post<unknown>(
    `bulletins/${encodeURIComponent(slug)}/download`,
  );
  return unwrapData(response.data);
};

export function formatLabel(format?: BulletinFormat): string {
  switch (format) {
    case 'pdf':
      return 'PDF';
    case 'doc':
      return 'DOC';
    case 'docx':
      return 'DOCX';
    case 'image':
      return 'Image';
    case 'images':
      return 'Images';
    default:
      return format ? String(format).toUpperCase() : 'Document';
  }
}

export function isPdf(format?: BulletinFormat): boolean {
  return format === 'pdf';
}

export function isWord(format?: BulletinFormat): boolean {
  return format === 'doc' || format === 'docx';
}

export function isImageEdition(format?: BulletinFormat): boolean {
  return format === 'image' || format === 'images';
}

export interface BulletinAdminPayload {
  title: string;
  bulletin_date: string;
  description?: string | null;
  is_published?: boolean;
  is_featured?: boolean;
  bulletin_file?: File | null;
  thumbnail?: File | null;
  images?: File[];
  replace_images?: boolean;
}

export interface BulletinStats {
  total_bulletins: number;
  published_bulletins: number;
  featured_bulletins?: number;
  draft_bulletins: number;
  total_downloads: number;
  current_bulletins?: number;
}

function buildFormData(payload: BulletinAdminPayload): FormData {
  const form = new FormData();
  form.append('title', payload.title);
  form.append('bulletin_date', payload.bulletin_date);
  if (payload.description != null) {
    form.append('description', payload.description);
  }
  if (payload.is_published !== undefined) {
    form.append('is_published', payload.is_published ? '1' : '0');
  }
  if (payload.is_featured !== undefined) {
    form.append('is_featured', payload.is_featured ? '1' : '0');
  }
  if (payload.bulletin_file) {
    form.append('bulletin_file', payload.bulletin_file);
  }
  if (payload.thumbnail) {
    form.append('thumbnail', payload.thumbnail);
  }
  if (payload.images?.length) {
    payload.images.forEach((file) => form.append('images[]', file));
  }
  if (payload.replace_images) {
    form.append('replace_images', '1');
  }
  return form;
}

/** Admin list including drafts */
export const adminList = async (
  params?: BulletinQueryParams & { is_published?: boolean | string },
): Promise<PaginatedResponse<Bulletin>> => {
  const response = await apiClient.get<unknown>('admin/bulletins', params);
  return normalizePaginated<Bulletin>(response.data);
};

export const adminStats = async (): Promise<BulletinStats> => {
  const response = await apiClient.get<unknown>('admin/bulletins/stats');
  return unwrapData<BulletinStats>(response.data);
};

export const create = async (payload: BulletinAdminPayload): Promise<Bulletin> => {
  const response = await apiClient.postForm<unknown>('bulletins', buildFormData(payload));
  return unwrapData<Bulletin>(response.data);
};

export const update = async (slug: string, payload: BulletinAdminPayload): Promise<Bulletin> => {
  const response = await apiClient.postForm<unknown>(
    `bulletins/${encodeURIComponent(slug)}`,
    buildFormData(payload),
  );
  return unwrapData<Bulletin>(response.data);
};

export const publish = async (slug: string): Promise<Bulletin> => {
  const response = await apiClient.post<unknown>(`bulletins/${encodeURIComponent(slug)}/publish`);
  return unwrapData<Bulletin>(response.data);
};

export const unpublish = async (slug: string): Promise<Bulletin> => {
  const response = await apiClient.post<unknown>(
    `bulletins/${encodeURIComponent(slug)}/unpublish`,
  );
  return unwrapData<Bulletin>(response.data);
};

export const remove = async (slug: string): Promise<void> => {
  await apiClient.delete(`bulletins/${encodeURIComponent(slug)}`);
};

const bulletinService = {
  list,
  latest,
  getBySlug,
  meta,
  calendar,
  neighbors,
  trackDownload,
  formatLabel,
  isPdf,
  isWord,
  isImageEdition,
  adminList,
  adminStats,
  create,
  update,
  publish,
  unpublish,
  remove,
};

export default bulletinService;
