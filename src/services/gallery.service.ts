/**
 * Gallery API Service
 * 
 * Provides typed API methods for managing gallery items.
 * Handles CRUD operations for photos, videos, and media.
 * 
 * @package Lovable/src/services
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

/**
 * Gallery Item Model
 */
export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  type: 'photo' | 'video';
  image_url?: string;
  video_url?: string;
  thumbnail_url?: string;
  category?: string;
  is_featured: boolean;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create Gallery Item Payload
 */
export interface CreateGalleryItemPayload {
  title: string;
  description?: string;
  type: 'photo' | 'video';
  image_url?: string;
  video_url?: string;
  thumbnail_url?: string;
  category?: string;
  is_featured?: boolean;
  is_published?: boolean;
}

/**
 * Update Gallery Item Payload
 */
export type UpdateGalleryItemPayload = Partial<CreateGalleryItemPayload>;

/**
 * Query Parameters
 */
export interface GalleryQueryParams {
  page?: number;
  per_page?: number;
  type?: 'photo' | 'video';
  category?: string;
  is_featured?: boolean;
  is_published?: boolean;
  search?: string;
}

/**
 * List gallery items with optional filtering
 * 
 * @param params Query parameters
 * @returns Paginated list of gallery items
 */
export const list = async (params?: GalleryQueryParams): Promise<PaginatedResponse<GalleryItem>> => {
  const response = await apiClient.get<PaginatedResponse<GalleryItem>>('gallery', params);
  return response.data;
};

/**
 * Get gallery item by ID
 * 
 * @param id Gallery Item ID
 * @returns Gallery item details
 */
export const getById = async (id: string): Promise<GalleryItem> => {
  const response = await apiClient.get<GalleryItem>(`gallery/${id}`);
  return response.data;
};

/**
 * Create a new gallery item
 * 
 * @param payload Gallery item data
 * @returns Created gallery item
 */
export const create = async (payload: CreateGalleryItemPayload): Promise<GalleryItem> => {
  const response = await apiClient.post<GalleryItem>('gallery', payload);
  return response.data;
};

/**
 * Update a gallery item
 * 
 * @param id Gallery Item ID
 * @param payload Updated gallery item data
 * @returns Updated gallery item
 */
export const update = async (id: string, payload: UpdateGalleryItemPayload): Promise<GalleryItem> => {
  const response = await apiClient.put<GalleryItem>(`gallery/${id}`, payload);
  return response.data;
};

/**
 * Delete a gallery item
 * 
 * @param id Gallery Item ID
 */
export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`gallery/${id}`);
};

/**
 * Get featured gallery items
 * 
 * @param params Query parameters
 * @returns Paginated list of featured gallery items
 */
export const getFeatured = async (params?: GalleryQueryParams): Promise<PaginatedResponse<GalleryItem>> => {
  const response = await apiClient.get<PaginatedResponse<GalleryItem>>('gallery/featured', params);
  return response.data;
};

/**
 * Get gallery items by type
 * 
 * @param type Gallery type (photo or video)
 * @param params Query parameters
 * @returns Paginated list of gallery items
 */
export const getByType = async (
  type: 'photo' | 'video',
  params?: GalleryQueryParams
): Promise<PaginatedResponse<GalleryItem>> => {
  const response = await apiClient.get<PaginatedResponse<GalleryItem>>(`gallery/by-type/${type}`, params);
  return response.data;
};

// Export all functions as default object
const galleryService = {
  list,
  getById,
  create,
  update,
  remove,
  getFeatured,
  getByType,
};

export default galleryService;

