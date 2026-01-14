/**
 * Ministry User API Service
 * 
 * Provides typed API methods for managing ministry memberships.
 * Handles join/leave workflow, approval, and membership management.
 * 
 * @package Lovable/src/services
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

/**
 * Ministry User Model
 */
export interface MinistryUser {
  id: string;
  ministry_id: string;
  user_id: string;
  status: 'pending' | 'active' | 'rejected' | 'inactive';
  approved_by?: string | null;
  approved_at?: string | null;
  rejection_reason?: string | null;
  joined_at?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Join Ministry Payload
 */
export interface JoinMinistryPayload {
  ministry_id: string;
  user_id: string;
  notes?: string;
}

/**
 * Query Parameters
 */
export interface MinistryUserQueryParams {
  page?: number;
  per_page?: number;
  status?: string;
  ministry_id?: string;
  user_id?: string;
}

/**
 * List ministry memberships with optional filtering
 * 
 * @param params Query parameters
 * @returns Paginated list of ministry memberships
 */
export const list = async (
  params?: MinistryUserQueryParams
): Promise<PaginatedResponse<MinistryUser>> => {
  const response = await apiClient.get<PaginatedResponse<MinistryUser>>('ministry-users', params);
  return response.data;
};

/**
 * Get ministry membership by ID
 * 
 * @param id Ministry User ID
 * @returns Ministry membership details
 */
export const getById = async (id: string): Promise<MinistryUser> => {
  const response = await apiClient.get<MinistryUser>(`ministry-users/${id}`);
  return response.data;
};

/**
 * Join a ministry (create membership request)
 * 
 * @param payload Join ministry data
 * @returns Created ministry membership
 */
export const join = async (payload: JoinMinistryPayload): Promise<MinistryUser> => {
  const response = await apiClient.post<MinistryUser>('ministry-users/join', payload);
  return response.data;
};

/**
 * Leave a ministry
 * 
 * @param ministryId Ministry ID
 * @param userId User ID
 */
export const leave = async (ministryId: string, userId: string): Promise<void> => {
  await apiClient.delete(`ministry-users/leave/${ministryId}/${userId}`);
};

/**
 * Approve membership
 * 
 * @param id Ministry User ID
 * @param approvedBy User ID who approved
 * @returns Approved membership
 */
export const approve = async (id: string, approvedBy?: string): Promise<MinistryUser> => {
  const response = await apiClient.post<MinistryUser>(`ministry-users/${id}/approve`, {
    approved_by: approvedBy,
  });
  return response.data;
};

/**
 * Reject membership
 * 
 * @param id Ministry User ID
 * @param reason Rejection reason
 * @returns Rejected membership
 */
export const reject = async (id: string, reason?: string): Promise<MinistryUser> => {
  const response = await apiClient.post<MinistryUser>(`ministry-users/${id}/reject`, {
    reason,
  });
  return response.data;
};

/**
 * Get memberships by user
 * 
 * @param userId User ID
 * @param params Query parameters
 * @returns Paginated list of memberships
 */
export const getByUser = async (
  userId: string,
  params?: MinistryUserQueryParams
): Promise<PaginatedResponse<MinistryUser>> => {
  const response = await apiClient.get<PaginatedResponse<MinistryUser>>(
    `ministry-users/user/${userId}`,
    params
  );
  return response.data;
};

/**
 * Get memberships by ministry
 * 
 * @param ministryId Ministry ID
 * @param params Query parameters
 * @returns Paginated list of memberships
 */
export const getByMinistry = async (
  ministryId: string,
  params?: MinistryUserQueryParams
): Promise<PaginatedResponse<MinistryUser>> => {
  const response = await apiClient.get<PaginatedResponse<MinistryUser>>(
    `ministry-users/ministry/${ministryId}`,
    params
  );
  return response.data;
};

/**
 * Get pending memberships
 * 
 * @param params Query parameters
 * @returns Paginated list of pending memberships
 */
export const getPending = async (
  params?: MinistryUserQueryParams
): Promise<PaginatedResponse<MinistryUser>> => {
  const response = await apiClient.get<PaginatedResponse<MinistryUser>>(
    'ministry-users/pending',
    params
  );
  return response.data;
};

/**
 * Check if user is member of ministry
 * 
 * @param userId User ID
 * @param ministryId Ministry ID
 * @returns Whether user is a member
 */
export const isMember = async (userId: string, ministryId: string): Promise<boolean> => {
  const response = await apiClient.get<{ is_member: boolean }>(
    `ministry-users/check/${userId}/${ministryId}`
  );
  return response.data.is_member;
};

/**
 * Add a member to a ministry (admin)
 * 
 * @param payload Data for adding a member
 * @returns Created membership
 */
export const create = async (payload: { ministry_id: string; user_id: string }): Promise<MinistryUser> => {
  const response = await apiClient.post<MinistryUser>('ministry-users', payload);
  return response.data;
};

/**
 * Remove a member (admin)
 * 
 * @param id Membership ID
 */
export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`ministry-users/${id}`);
};

// Export all functions as default object
const ministryUserService = {
  list,
  getById,
  join,
  leave,
  approve,
  reject,
  getByUser,
  getByMinistry,
  getPending,
  isMember,
  create,
  remove,
};

export default ministryUserService;

