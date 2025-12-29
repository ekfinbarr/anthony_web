/**
 * News API Service
 * 
 * Provides typed API methods for managing church news articles.
 * Handles CRUD operations, publishing workflow, and content approval.
 * 
 * @package Lovable/src/services
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

/**
 * News Model
 */
export interface News {
  id: string;
  title: string;
  content: string;
  summary?: string;
  status: 'draft' | 'pending' | 'published' | 'rejected';
  published_at: string | null;
  author_id: string;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Create News Payload
 */
export interface CreateNewsPayload {
  title: string;
  content: string;
  summary?: string;
  status?: 'draft' | 'pending';
}

/**
 * Update News Payload
 */
export interface UpdateNewsPayload extends Partial<CreateNewsPayload> {}

/**
 * Query Parameters
 */
export interface NewsQueryParams {
  page?: number;
  per_page?: number;
  status?: string;
  author_id?: string;
  search?: string;
}

/**
 * List news articles with optional filtering
 * 
 * @param params Query parameters
 * @returns Paginated list of news articles
 */
export const list = async (params?: NewsQueryParams): Promise<PaginatedResponse<News>> => {
  const response = await apiClient.get<PaginatedResponse<News>>('news', params);
  return response.data;
};

/**
 * Get news article by ID
 * 
 * @param id News ID
 * @returns News article details
 */
export const getById = async (id: string): Promise<News> => {
  const response = await apiClient.get<News>(`news/${id}`);
  return response.data;
};

/**
 * Create a new news article
 * 
 * @param payload News data
 * @returns Created news article
 */
export const create = async (payload: CreateNewsPayload): Promise<News> => {
  const response = await apiClient.post<News>('news', payload);
  return response.data;
};

/**
 * Update a news article
 * 
 * @param id News ID
 * @param payload Updated news data
 * @returns Updated news article
 */
export const update = async (id: string, payload: UpdateNewsPayload): Promise<News> => {
  const response = await apiClient.put<News>(`news/${id}`, payload);
  return response.data;
};

/**
 * Delete a news article
 * 
 * @param id News ID
 */
export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`news/${id}`);
};

/**
 * Publish a news article
 * 
 * @param id News ID
 * @returns Published news article
 */
export const publish = async (id: string): Promise<News> => {
  const response = await apiClient.post<News>(`news/${id}/publish`);
  return response.data;
};

/**
 * Reject a news article
 * 
 * @param id News ID
 * @param reason Rejection reason
 * @returns Rejected news article
 */
export const reject = async (id: string, reason: string): Promise<News> => {
  const response = await apiClient.post<News>(`news/${id}/reject`, { reason });
  return response.data;
};

/**
 * Get published news articles
 * 
 * @param params Query parameters
 * @returns Paginated list of published news articles
 */
export const getPublished = async (params?: NewsQueryParams): Promise<PaginatedResponse<News>> => {
  const response = await apiClient.get<PaginatedResponse<News>>('news/published', params);
  return response.data;
};

/**
 * Get news articles by status
 * 
 * @param status News status
 * @param params Query parameters
 * @returns Paginated list of news articles
 */
export const getByStatus = async (
  status: string,
  params?: NewsQueryParams
): Promise<PaginatedResponse<News>> => {
  const response = await apiClient.get<PaginatedResponse<News>>('news/status/' + status, params);
  return response.data;
};

/**
 * Get recent news articles
 * 
 * @param limit Number of articles to return
 * @returns List of recent news articles
 */
export const getRecent = async (limit: number = 5): Promise<News[]> => {
  const response = await apiClient.get<News[]>('news/recent', { limit });
  return response.data;
};

// Export all functions as default object
const newsService = {
  list,
  getById,
  create,
  update,
  remove,
  publish,
  reject,
  getPublished,
  getByStatus,
  getRecent,
};

export default newsService;

