/**
 * Livestream API Service
 * 
 * Provides typed API methods for managing church livestreams.
 * Handles CRUD operations, scheduling, and active stream management.
 * 
 * @package Lovable/src/services
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

/**
 * Livestream Model
 */
/**
 * Livestream Model
 */
export interface Livestream {
  id: string;
  title: string;
  description: string | null;
  platform: 'youtube' | 'facebook' | 'tiktok' | 'twitch' | 'instagram' | 'twitter' | 'rumble' | 'bitchute' | 'brighteon' | 'odysee' | 'peerTube' | 'others' | 'vimeo';
  platform_video_id: string | null;
  embed_html: string | null;
  scheduled_start_time: string | null;
  actual_start_time: string | null;
  end_time: string | null;
  is_live: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create Livestream Payload
 */
export interface CreateLivestreamPayload {
  title: string;
  description?: string;
  platform: 'youtube' | 'facebook' | 'tiktok' | 'twitch' | 'instagram' | 'twitter' | 'rumble' | 'bitchute' | 'brighteon' | 'odysee' | 'peerTube' | 'others' | 'vimeo';
  platform_video_id?: string;
  embed_html?: string;
  scheduled_start_time?: string;
  actual_start_time?: string;
  end_time?: string;
  is_live?: boolean;
  created_by?: string;
}

/**
 * Update Livestream Payload
 */
export type UpdateLivestreamPayload = Partial<CreateLivestreamPayload>;

/**
 * Query Parameters
 */
export interface LivestreamQueryParams {
  page?: number;
  per_page?: number;
  is_live?: boolean;
  search?: string;
}

/**
 * List livestreams with optional filtering
 * 
 * @param params Query parameters
 * @returns Paginated list of livestreams
 */
export const list = async (params?: LivestreamQueryParams): Promise<PaginatedResponse<Livestream>> => {
  const response = await apiClient.get<PaginatedResponse<Livestream>>('livestreams', params);
  return response.data;
};

/**
 * Get livestream by ID
 * 
 * @param id Livestream ID
 * @returns Livestream details
 */
export const getById = async (id: string): Promise<Livestream> => {
  const response = await apiClient.get<Livestream>(`livestreams/${id}`);
  return response.data;
};

/**
 * Create a new livestream
 * 
 * @param payload Livestream data
 * @returns Created livestream
 */
export const create = async (payload: CreateLivestreamPayload): Promise<Livestream> => {
  const response = await apiClient.post<Livestream>('livestreams', payload);
  return response.data;
};

/**
 * Update a livestream
 * 
 * @param id Livestream ID
 * @param payload Updated livestream data
 * @returns Updated livestream
 */
export const update = async (id: string, payload: UpdateLivestreamPayload): Promise<Livestream> => {
  const response = await apiClient.put<Livestream>(`livestreams/${id}`, payload);
  return response.data;
};

/**
 * Delete a livestream
 * 
 * @param id Livestream ID
 */
export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`livestreams/${id}`);
};

/**
 * Get current active livestream
 * 
 * @returns Current livestream
 */
export const getCurrent = async (): Promise<Livestream | null> => {
  const response = await apiClient.get<Livestream | null>('livestreams/current');
  return response.data;
};

/**
 * Get active livestreams
 * 
 * @returns List of active livestreams
 */
export const getActive = async (): Promise<Livestream[]> => {
  const response = await apiClient.get<Livestream[]>('livestreams/active');
  return response.data;
};

/**
 * Get upcoming livestreams
 * 
 * @param params Query parameters
 * @returns Paginated list of upcoming livestreams
 */
export const getUpcoming = async (
  params?: LivestreamQueryParams
): Promise<PaginatedResponse<Livestream>> => {
  const response = await apiClient.get<PaginatedResponse<Livestream>>('livestreams/upcoming', params);
  return response.data;
};

/**
 * Activate a livestream
 * 
 * @param id Livestream ID
 * @returns Activated livestream
 */
export const activate = async (id: string): Promise<Livestream> => {
  const response = await apiClient.post<Livestream>(`livestreams/${id}/activate`);
  return response.data;
};

/**
 * Deactivate a livestream
 * 
 * @param id Livestream ID
 * @returns Deactivated livestream
 */
export const deactivate = async (id: string): Promise<Livestream> => {
  const response = await apiClient.post<Livestream>(`livestreams/${id}/deactivate`);
  return response.data;
};

// Export all functions as default object
const livestreamService = {
  list,
  getById,
  create,
  update,
  remove,
  getCurrent,
  getActive,
  getUpcoming,
  activate,
  deactivate,
};

export default livestreamService;

