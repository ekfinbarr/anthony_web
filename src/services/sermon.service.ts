/**
 * Sermon API Service
 * 
 * Provides typed API methods for managing church sermons.
 * Handles CRUD operations and sermon management.
 * 
 * @package Lovable/src/services
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

/**
 * Sermon Model
 */
export interface Sermon {
  id: string;
  title: string;
  slug: string;
  speaker: string;
  date?: string; // preaching date
  preached_date?: string; // alias for date
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
  tags?: any[];
  categories?: any[];
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
  [key: string]: any;
  page?: number;
  per_page?: number;
  is_published?: boolean;
  is_featured?: boolean;
  series?: string;
  speaker?: string;
  search?: string;
}

/**
 * List sermons with optional filtering
 * 
 * @param params Query parameters
 * @returns Paginated list of sermons
 */
export const list = async (params?: SermonQueryParams): Promise<PaginatedResponse<Sermon>> => {
  const response = await apiClient.get<PaginatedResponse<Sermon>>('sermons', params);
  return response.data;
};

/**
 * Get sermon by ID
 * 
 * @param id Sermon ID
 * @returns Sermon details
 */
export const getById = async (id: string): Promise<Sermon> => {
  const response = await apiClient.get<Sermon>(`sermons/${id}`);
  return response.data;
};

/**
 * Create a new sermon
 * 
 * @param payload Sermon data
 * @returns Created sermon
 */
export const create = async (payload: CreateSermonPayload): Promise<Sermon> => {
  const response = await apiClient.post<Sermon>('sermons', payload);
  return response.data;
};

/**
 * Update a sermon
 * 
 * @param id Sermon ID
 * @param payload Updated sermon data
 * @returns Updated sermon
 */
export const update = async (id: string, payload: UpdateSermonPayload): Promise<Sermon> => {
  const response = await apiClient.put<Sermon>(`sermons/${id}`, payload);
  return response.data;
};

/**
 * Delete a sermon
 * 
 * @param id Sermon ID
 */
export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`sermons/${id}`);
};

/**
 * Get featured sermons
 * 
 * @param params Query parameters
 * @returns Paginated list of featured sermons
 */
export const getFeatured = async (params?: SermonQueryParams): Promise<PaginatedResponse<Sermon>> => {
  const response = await apiClient.get<PaginatedResponse<Sermon>>('sermons/featured', params);
  return response.data;
};

/**
 * Get latest sermons
 * 
 * @param params Query parameters
 * @returns Paginated list of latest sermons
 */
export const getLatest = async (params?: SermonQueryParams): Promise<PaginatedResponse<Sermon>> => {
  const response = await apiClient.get<PaginatedResponse<Sermon>>('sermons/latest', params);
  return response.data;
};

// Export all functions as default object
const sermonService = {
  list,
  getById,
  create,
  update,
  remove,
  getFeatured,
  getLatest,
};

export default sermonService;

