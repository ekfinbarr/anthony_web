/**
 * Leadership API Service
 * 
 * Provides typed API methods for managing church leadership.
 * Handles CRUD operations for priests, clergy, and leadership members.
 * 
 * @package Lovable/src/services
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

/**
 * Leadership Model
 */
export interface Leadership {
  id: string;
  name: string;
  role: string;
  title?: string;
  bio?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  department?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  is_featured: boolean;
  welcome_message?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create Leadership Payload
 */
export interface CreateLeadershipPayload {
  name: string;
  role: string;
  title?: string;
  bio?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  department?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  is_featured?: boolean;
  welcome_message?: string;
}

/**
 * Update Leadership Payload
 */
export type UpdateLeadershipPayload = Partial<CreateLeadershipPayload>;

/**
 * Query Parameters
 */
export interface LeadershipQueryParams {
  page?: number;
  per_page?: number;
  role?: string;
  is_active?: boolean;
  is_featured?: boolean;
  search?: string;
}

/**
 * List leadership members with optional filtering
 * 
 * @param params Query parameters
 * @returns Paginated list of leadership members
 */
export const list = async (params?: LeadershipQueryParams): Promise<PaginatedResponse<Leadership>> => {
  const response = await apiClient.get<PaginatedResponse<Leadership>>('leadership', params);
  return response.data;
};

/**
 * Get leadership member by ID
 * 
 * @param id Leadership ID
 * @returns Leadership details
 */
export const getById = async (id: string): Promise<Leadership> => {
  const response = await apiClient.get<Leadership>(`leadership/${id}`);
  return response.data;
};

/**
 * Create a new leadership member
 * 
 * @param payload Leadership data
 * @returns Created leadership member
 */
export const create = async (payload: CreateLeadershipPayload): Promise<Leadership> => {
  const response = await apiClient.post<Leadership>('leadership', payload);
  return response.data;
};

/**
 * Update a leadership member
 * 
 * @param id Leadership ID
 * @param payload Updated leadership data
 * @returns Updated leadership member
 */
export const update = async (id: string, payload: UpdateLeadershipPayload): Promise<Leadership> => {
  const response = await apiClient.put<Leadership>(`leadership/${id}`, payload);
  return response.data;
};

/**
 * Delete a leadership member
 * 
 * @param id Leadership ID
 */
export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`leadership/${id}`);
};

/**
 * Get current leadership
 * 
 * @returns List of current leadership members
 */
export const getCurrent = async (): Promise<Leadership[]> => {
  const response = await apiClient.get<Leadership[]>('leadership/current');
  return response.data;
};

// Export all functions as default object
const leadershipService = {
  list,
  getById,
  create,
  update,
  remove,
  getCurrent,
};

export default leadershipService;

