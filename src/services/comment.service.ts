/**
 * Comment API Service
 * 
 * Provides typed API methods for managing comments.
 * Handles CRUD operations and moderation workflow.
 * 
 * @package Lovable/src/services
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

/**
 * Comment Model
 */
export interface Comment {
  id: string;
  author_name: string;
  author_email: string;
  content: string;
  is_approved: boolean;
  related_type: string;
  related_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create Comment Payload
 */
export interface CreateCommentPayload {
  author_name: string;
  author_email: string;
  content: string;
  related_type: string;
  related_id: string;
}

/**
 * Update Comment Payload
 */
export type UpdateCommentPayload = Partial<CreateCommentPayload>;

/**
 * Query Parameters
 */
export interface CommentQueryParams {
  page?: number;
  per_page?: number;
  is_approved?: boolean;
  related_type?: string;
  related_id?: string;
  search?: string;
}

/**
 * List comments with optional filtering
 * 
 * @param params Query parameters
 * @returns Paginated list of comments
 */
export const list = async (params?: CommentQueryParams): Promise<PaginatedResponse<Comment>> => {
  const response = await apiClient.get<PaginatedResponse<Comment>>('comments', params);
  return response.data;
};

/**
 * Get comment by ID
 * 
 * @param id Comment ID
 * @returns Comment details
 */
export const getById = async (id: string): Promise<Comment> => {
  const response = await apiClient.get<Comment>(`comments/${id}`);
  return response.data;
};

/**
 * Create a new comment
 * 
 * @param payload Comment data
 * @returns Created comment
 */
export const create = async (payload: CreateCommentPayload): Promise<Comment> => {
  const response = await apiClient.post<Comment>('comments', payload);
  return response.data;
};

/**
 * Update a comment
 * 
 * @param id Comment ID
 * @param payload Updated comment data
 * @returns Updated comment
 */
export const update = async (id: string, payload: UpdateCommentPayload): Promise<Comment> => {
  const response = await apiClient.put<Comment>(`comments/${id}`, payload);
  return response.data;
};

/**
 * Delete a comment
 * 
 * @param id Comment ID
 */
export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`comments/${id}`);
};

/**
 * Get approved comments
 * 
 * @param params Query parameters
 * @returns Paginated list of approved comments
 */
export const getApproved = async (params?: CommentQueryParams): Promise<PaginatedResponse<Comment>> => {
  const response = await apiClient.get<PaginatedResponse<Comment>>('comments/approved', params);
  return response.data;
};

/**
 * Get pending comments
 * 
 * @param params Query parameters
 * @returns Paginated list of pending comments
 */
export const getPending = async (params?: CommentQueryParams): Promise<PaginatedResponse<Comment>> => {
  const response = await apiClient.get<PaginatedResponse<Comment>>('comments/pending', params);
  return response.data;
};

/**
 * Get comments by related entity
 * 
 * @param relatedType Related entity type
 * @param relatedId Related entity ID
 * @param approvedOnly Only return approved comments
 * @param params Query parameters
 * @returns Paginated list of comments
 */
export const getByRelated = async (
  relatedType: string,
  relatedId: string,
  approvedOnly: boolean = true,
  params?: CommentQueryParams
): Promise<PaginatedResponse<Comment>> => {
  const response = await apiClient.get<PaginatedResponse<Comment>>('comments/related', {
    related_type: relatedType,
    related_id: relatedId,
    approved_only: approvedOnly,
    ...params,
  });
  return response.data;
};

/**
 * Approve a comment
 * 
 * @param id Comment ID
 * @returns Approved comment
 */
export const approve = async (id: string): Promise<Comment> => {
  const response = await apiClient.post<Comment>(`comments/${id}/approve`);
  return response.data;
};

/**
 * Reject a comment
 * 
 * @param id Comment ID
 * @returns Rejected comment
 */
export const reject = async (id: string): Promise<Comment> => {
  const response = await apiClient.post<Comment>(`comments/${id}/reject`);
  return response.data;
};

// Export all functions as default object
const commentService = {
  list,
  getById,
  create,
  update,
  remove,
  getApproved,
  getPending,
  getByRelated,
  approve,
  reject,
};

export default commentService;

