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
 * Lightweight Category/Tag shapes (used in Post responses).
 * We intentionally keep these minimal so this service does not depend on admin-only category/tag screens.
 */
export interface CategoryRef {
  id: string;
  label: string;
  slug: string;
  color?: string | null;
}

export interface TagRef {
  id: string;
  label: string;
  slug: string;
  color?: string | null;
}

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
  /**
   * Content type (drives editor/media UI): text | image | video
   * NOTE: this maps to the backend `posts.type`.
   */
  type: string;
  /**
   * Post classification (drives post listing/grouping): post | news | announcement | article
   * NOTE: this maps to the backend `posts.post_type`.
   */
  post_type?: string;
  published: boolean;
  image?: string;
  video?: string;
  allow_comment: boolean;
  rate?: number;
  archived: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  /** Optional eager-loaded relations (if backend includes them). */
  categories?: CategoryRef[];
  tags?: TagRef[];
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
  post_type?: string;
  published?: boolean;
  image?: string;
  video?: string;
  allow_comment?: boolean;
  /** Selected taxonomy (UUIDs). */
  category_ids?: string[];
  tag_ids?: string[];
}

/**
 * Update Post Payload
 */
export type UpdatePostPayload = Partial<CreatePostPayload>;

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
 * Convert typed params into a plain Record (matches `apiClient.get` typing).
 */
const toQueryParams = (params?: PostQueryParams): Record<string, string | number | boolean> | undefined => {
  if (!params) return undefined;
  const out: Record<string, string | number | boolean> = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (typeof v === "boolean" || typeof v === "number") {
      out[k] = v;
    } else {
      out[k] = String(v);
    }
  });
  return out;
};

/**
 * List posts with optional filtering
 * 
 * @param params Query parameters
 * @returns Paginated list of posts
 */
export const list = async (params?: PostQueryParams): Promise<PaginatedResponse<Post>> => {
  const response = await apiClient.get<PaginatedResponse<Post>>('posts', toQueryParams(params));
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
  const response = await apiClient.get<PaginatedResponse<Post>>('posts/published', toQueryParams(params));
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
  const response = await apiClient.get<PaginatedResponse<Post>>(`posts/author/${authorId}`, toQueryParams(params));
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
  const response = await apiClient.get<PaginatedResponse<Post>>(`posts/type/${type}`, toQueryParams(params));
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

