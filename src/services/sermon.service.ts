/**
 * Sermon API Service
 *
 * Provides typed API methods for managing church sermons.
 * Handles CRUD operations and sermon catalog queries.
 *
 * @package Lovable/src/services
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

export interface SermonTaxonomy {
  id: string;
  label?: string;
  name?: string;
  slug?: string;
  color?: string;
}

/**
 * Sermon Model
 */
export interface Sermon {
  id: string;
  title: string;
  slug: string;
  speaker: string;
  date?: string;
  preached_date?: string;
  series?: string;
  scripture_reference?: string;
  duration?: string;
  video_url?: string;
  audio_url?: string;
  notes_url?: string;
  thumbnail_url?: string;
  sermon_notes?: string;
  description?: string;
  is_featured: boolean;
  is_published: boolean;
  view_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
  tags?: SermonTaxonomy[];
  categories?: SermonTaxonomy[];
}

export interface SermonStats {
  total_sermons: number;
  published_sermons?: number;
  featured_sermons?: number;
  draft_sermons?: number;
  total_speakers: number;
  total_series: number;
  total_views: number;
  total_downloads: number;
  average_duration?: number | null;
  most_popular_speaker?: string | null;
  most_popular_series?: string | null;
}

/**
 * Create Sermon Payload
 */
export interface CreateSermonPayload {
  title: string;
  slug?: string;
  speaker: string;
  preached_date: string;
  series?: string;
  scripture_reference?: string;
  duration?: string;
  video_url?: string;
  audio_url?: string;
  notes_url?: string;
  thumbnail_url?: string;
  sermon_notes?: string;
  description?: string;
  is_featured?: boolean;
  is_published?: boolean;
  category_ids?: string[];
  tag_ids?: string[];
}

/**
 * Update Sermon Payload
 */
export type UpdateSermonPayload = Partial<CreateSermonPayload>;

/**
 * Query Parameters
 */
export interface SermonQueryParams {
  [key: string]: string | number | boolean | undefined;
  page?: number;
  per_page?: number;
  is_published?: boolean;
  is_featured?: boolean;
  series?: string;
  speaker?: string;
  search?: string;
  sort?: 'preached_date' | 'view_count' | 'title' | 'created_at' | 'speaker' | 'download_count';
  order?: 'asc' | 'desc';
  only_published?: boolean;
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
  const meta = isRecord(root.meta) ? root.meta : root;
  const data = Array.isArray(root.data) ? (root.data as T[]) : [];

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

/**
 * List sermons with optional filtering
 */
export const list = async (params?: SermonQueryParams): Promise<PaginatedResponse<Sermon>> => {
  const response = await apiClient.get<unknown>('sermons', params);
  return normalizePaginated<Sermon>(response.data);
};

/**
 * Get sermon by ID
 */
export const getById = async (id: string): Promise<Sermon> => {
  const response = await apiClient.get<unknown>(`sermons/${id}`);
  return unwrapData<Sermon>(response.data);
};

/**
 * Get sermon by slug (increments view count when published)
 */
export const getBySlug = async (slug: string): Promise<Sermon> => {
  const response = await apiClient.get<unknown>(`sermons/slug/${encodeURIComponent(slug)}`);
  return unwrapData<Sermon>(response.data);
};

/**
 * Create a new sermon
 */
export const create = async (payload: CreateSermonPayload): Promise<Sermon> => {
  const response = await apiClient.post<unknown>('sermons', payload);
  return unwrapData<Sermon>(response.data);
};

/**
 * Update a sermon
 */
export const update = async (id: string, payload: UpdateSermonPayload): Promise<Sermon> => {
  const response = await apiClient.put<unknown>(`sermons/${id}`, payload);
  return unwrapData<Sermon>(response.data);
};

/**
 * Delete a sermon
 */
export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`sermons/${id}`);
};

/**
 * Get featured sermons
 */
export const getFeatured = async (params?: SermonQueryParams): Promise<Sermon[]> => {
  const response = await apiClient.get<unknown>('sermons/featured', params);
  const data = unwrapData<Sermon[] | { data: Sermon[] }>(response.data);
  if (Array.isArray(data)) return data;
  if (isRecord(data) && Array.isArray(data.data)) return data.data as Sermon[];
  return [];
};

/**
 * Get latest sermons
 */
export const getLatest = async (params?: { limit?: number }): Promise<Sermon[]> => {
  const response = await apiClient.get<unknown>('sermons/latest', params);
  const data = unwrapData<Sermon[] | { data: Sermon[] }>(response.data);
  if (Array.isArray(data)) return data;
  if (isRecord(data) && Array.isArray(data.data)) return data.data as Sermon[];
  return [];
};

/**
 * Search sermons (dedicated endpoint)
 */
export const search = async (
  q: string,
  params?: Omit<SermonQueryParams, 'search'>
): Promise<PaginatedResponse<Sermon>> => {
  const response = await apiClient.get<unknown>('sermons/search', { q, ...params });
  return normalizePaginated<Sermon>(response.data);
};

/**
 * Distinct series list
 */
export const getSeries = async (): Promise<string[]> => {
  const response = await apiClient.get<unknown>('sermons/series');
  const data = unwrapData<string[]>(response.data);
  return Array.isArray(data) ? data.filter(Boolean) : [];
};

/**
 * Distinct speakers list
 */
export const getSpeakers = async (): Promise<string[]> => {
  const response = await apiClient.get<unknown>('sermons/speakers');
  const data = unwrapData<string[]>(response.data);
  return Array.isArray(data) ? data.filter(Boolean) : [];
};

/**
 * Record a download
 */
export const recordDownload = async (id: string): Promise<void> => {
  await apiClient.post(`sermons/${id}/download`, {});
};

/**
 * Admin stats
 */
export const getStats = async (): Promise<SermonStats> => {
  const response = await apiClient.get<unknown>('sermons/stats');
  return unwrapData<SermonStats>(response.data);
};

const sermonService = {
  list,
  getById,
  getBySlug,
  create,
  update,
  remove,
  getFeatured,
  getLatest,
  search,
  getSeries,
  getSpeakers,
  recordDownload,
  getStats,
};

export default sermonService;
