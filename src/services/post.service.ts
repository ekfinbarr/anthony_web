/**
 * Post API Service
 * 
 * Provides typed API methods for managing blog posts and content.
 * Handles CRUD operations, publishing, and view tracking.
 * 
 * @package Lovable/src/services
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

/**
 * Post Model
 */
export interface Post {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  views: number;
  parent_id: string | null;
  author_id: string;
  type: string;
  published: boolean;
  image?: string;
  video?: string;
  allow_comment: boolean;
  rate?: number;
  archived: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

/**
 * Create Post Payload
 */
export interface CreatePostPayload {
  title: string;
  slug?: string;
  summary?: string;
  content: string;
  parent_id?: string;
  author_id: string;
  type: string;
  published?: boolean;
  image?: string;
  video?: string;
  allow_comment?: boolean;
}

/**
 * Update Post Payload
 */
export interface UpdatePostPayload extends Partial<CreatePostPayload> {}

/**
 * Query Parameters
 */
export interface PostQueryParams {
  page?: number;
  per_page?: number;
  published?: boolean;
  type?: string;
  author_id?: string;
  search?: string;
}

/**
 * List posts with optional filtering
 * 
 * @param params Query parameters
 * @returns Paginated list of posts
 */
export const list = async (params?: PostQueryParams): Promise<PaginatedResponse<Post>> => {
  const response = await apiClient.get<PaginatedResponse<Post>>('posts', params);
  return response.data;
};

/**
 * Get post by ID
 * 
 * @param id Post ID
 * @returns Post details
 */
export const getById = async (id: string): Promise<Post> => {
  const response = await apiClient.get<Post>(`posts/${id}`);
  return response.data;
};

/**
 * Get post by slug
 * 
 * @param slug Post slug
 * @returns Post details
 */
export const getBySlug = async (slug: string): Promise<Post> => {
  const response = await apiClient.get<Post>(`posts/slug/${slug}`);
  return response.data;
};

/**
 * Create a new post
 * 
 * @param payload Post data
 * @returns Created post
 */
export const create = async (payload: CreatePostPayload): Promise<Post> => {
  const response = await apiClient.post<Post>('posts', payload);
  return response.data;
};

/**
 * Update a post
 * 
 * @param id Post ID
 * @param payload Updated post data
 * @returns Updated post
 */
export const update = async (id: string, payload: UpdatePostPayload): Promise<Post> => {
  const response = await apiClient.put<Post>(`posts/${id}`, payload);
  return response.data;
};

/**
 * Delete a post
 * 
 * @param id Post ID
 */
export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`posts/${id}`);
};

/**
 * Get published posts
 * 
 * @param params Query parameters
 * @returns Paginated list of published posts
 */
export const getPublished = async (params?: PostQueryParams): Promise<PaginatedResponse<Post>> => {
  const response = await apiClient.get<PaginatedResponse<Post>>('posts/published', params);
  return response.data;
};

/**
 * Get popular posts
 * 
 * @param limit Number of posts to return
 * @returns List of popular posts
 */
export const getPopular = async (limit: number = 5): Promise<Post[]> => {
  const response = await apiClient.get<Post[]>('posts/popular', { limit });
  return response.data;
};

/**
 * Get posts by author
 * 
 * @param authorId Author ID
 * @param params Query parameters
 * @returns Paginated list of posts
 */
export const getByAuthor = async (
  authorId: string,
  params?: PostQueryParams
): Promise<PaginatedResponse<Post>> => {
  const response = await apiClient.get<PaginatedResponse<Post>>(`posts/author/${authorId}`, params);
  return response.data;
};

/**
 * Get posts by type
 * 
 * @param type Post type
 * @param params Query parameters
 * @returns Paginated list of posts
 */
export const getByType = async (
  type: string,
  params?: PostQueryParams
): Promise<PaginatedResponse<Post>> => {
  const response = await apiClient.get<PaginatedResponse<Post>>(`posts/type/${type}`, params);
  return response.data;
};

// Export all functions as default object
const postService = {
  list,
  getById,
  getBySlug,
  create,
  update,
  remove,
  getPublished,
  getPopular,
  getByAuthor,
  getByType,
};

export default postService;

