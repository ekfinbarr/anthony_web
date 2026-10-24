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
  slug: string;
  title: string;
  position: string;
  bio?: string;
  email?: string;
  phone?: string;
  image_url?: string;
  qualifications?: string[];
  ministries?: string[];
  start_date?: string;
  end_date?: string;
  sort_order: number;
  is_active: boolean;
  show_on_website: boolean;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Create Leadership Payload
 */
export interface CreateLeadershipPayload {
  name: string;
  slug?: string;
  title: string;
  position: string;
  bio?: string;
  email?: string;
  phone?: string;
  image_url?: string;
  qualifications?: string[];
  ministries?: string[];
  start_date?: string;
  end_date?: string;
  sort_order?: number;
  is_active?: boolean;
  show_on_website?: boolean;
}

/**
 * Update Leadership Payload
 */
export type UpdateLeadershipPayload = Partial<CreateLeadershipPayload>;

/**
 * Leadership Sort Order Item
 */
export interface LeadershipSortOrder {
  id: string;
  sort_order: number;
}

/**
 * Query Parameters
 */
export interface LeadershipQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  public?: boolean;
  [key: string]: string | number | boolean | undefined;
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

/**
 * Update sort order for leadership members
 * 
 * @param orders Array of sort order items
 */
export const updateOrder = async (orders: LeadershipSortOrder[]): Promise<void> => {
  await apiClient.post('leadership/order', { orders });
};

// Export all functions as default object
const leadershipService = {
  list,
  getById,
  create,
  update,
  remove,
  getCurrent,
  updateOrder,
};

export default leadershipService;

