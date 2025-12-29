/**
 * Announcement API Service
 * 
 * Provides typed API methods for managing church announcements.
 * Handles CRUD operations, publishing, and content management.
 * 
 * @package Lovable/src/services
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

/**
 * Announcement Model
 */
export interface Announcement {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  published_at: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Create Announcement Payload
 */
export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  is_published?: boolean;
  published_at?: string;
  sort_order?: number;
}

/**
/**
 * Update Announcement Payload
 * 
 * Allows partial updates to any property of CreateAnnouncementPayload.
 */
export type UpdateAnnouncementPayload = Partial<CreateAnnouncementPayload>;

/**
 * Query Parameters
 */
export interface AnnouncementQueryParams {
  page?: number;
  per_page?: number;
  is_published?: boolean;
  search?: string;
}

/**
 * List announcements with optional filtering
 * 
 * @param params Query parameters
 * @returns Paginated list of announcements
 */
export const list = async (
  params?: AnnouncementQueryParams
): Promise<PaginatedResponse<Announcement>> => {
  const response = await apiClient.get<PaginatedResponse<Announcement>>('announcements', {
    params: { ...params },
  });
  return response.data;
};


/*
et announcement by ID
 * 
 * @param id Announcement ID
 * @returns Announcement details
 */
export const getById = async (id: string): Promise<Announcement> => {
  const response = await apiClient.get<Announcement>(`announcements/${id}`);
  return response.data;
};

/**
 * Create a new announcement
 * 
 * @param payload Announcement data
 * @returns Created announcement
 */
export const create = async (payload: CreateAnnouncementPayload): Promise<Announcement> => {
  const response = await apiClient.post<Announcement>('announcements', payload);
  return response.data;
};

/**
 * Update an announcement
 * 
 * @param id Announcement ID
 * @param payload Updated announcement data
 * @returns Updated announcement
 */
export const update = async (
  id: string,
  payload: UpdateAnnouncementPayload
): Promise<Announcement> => {
  const response = await apiClient.put<Announcement>(`announcements/${id}`, payload);
  return response.data;
};

/**
 * Delete an announcement
 * 
 * @param id Announcement ID
 */
export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`announcements/${id}`);
};

/**
 * Publish an announcement
 * 
 * @param id Announcement ID
 * @returns Published announcement
 */
export const publish = async (id: string): Promise<Announcement> => {
  const response = await apiClient.post<Announcement>(`announcements/${id}/publish`);
  return response.data;
};

/**
 * Unpublish an announcement
 * 
 * @param id Announcement ID
 * @returns Unpublished announcement
 */
export const unpublish = async (id: string): Promise<Announcement> => {
  const response = await apiClient.post<Announcement>(`announcements/${id}/unpublish`);
  return response.data;
};

/**
 * Get published announcements
 * 
 * @param params Query parameters
 * @returns Paginated list of published announcements
 */
export const getPublished = async (
  params?: AnnouncementQueryParams
): Promise<PaginatedResponse<Announcement>> => {
  const response = await apiClient.get<PaginatedResponse<Announcement>>('announcements/published', { ...params });
  return response.data;
};


/*
  * Get recent announcements
 * 
 * @param limit Number of announcements to return
 * @returns List of recent announcements
 */
export const getRecent = async (limit: number = 5): Promise<Announcement[]> => {
  const response = await apiClient.get<Announcement[]>('announcements/recent', { limit });
  return response.data;
};

// Export all functions as default object
const announcementService = {
  list,
  getById,
  create,
  update,
  remove,
  publish,
  unpublish,
  getPublished,
  getRecent,
};

export default announcementService;

