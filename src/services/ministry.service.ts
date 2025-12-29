/**
 * Ministry API Service
 * 
 * Provides typed API methods for managing church ministries.
 * Handles CRUD operations and membership management.
 * 
 * @package Lovable/src/services
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

/**
 * Ministry Model
 */
export interface Ministry {
  id: string;
  name: string;
  description?: string;
  mission?: string;
  vision?: string;
  is_active: boolean;
  accepting_members: boolean;
  leader_id?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create Ministry Payload
 */
export interface CreateMinistryPayload {
  name: string;
  description?: string;
  mission?: string;
  vision?: string;
  is_active?: boolean;
  accepting_members?: boolean;
  leader_id?: string;
}

/**
 * Update Ministry Payload
 */
export interface UpdateMinistryPayload extends Partial<CreateMinistryPayload> {}

/**
 * Query Parameters
 */
export interface MinistryQueryParams {
  page?: number;
  per_page?: number;
  is_active?: boolean;
  accepting_members?: boolean;
  search?: string;
}

/**
 * List ministries with optional filtering
 * 
 * @param params Query parameters
 * @returns Paginated list of ministries
 */
export const list = async (params?: MinistryQueryParams): Promise<PaginatedResponse<Ministry>> => {
  const response = await apiClient.get<PaginatedResponse<Ministry>>('ministries', params);
  return response.data;
};

/**
 * Get ministry by ID
 * 
 * @param id Ministry ID
 * @returns Ministry details
 */
export const getById = async (id: string): Promise<Ministry> => {
  const response = await apiClient.get<Ministry>(`ministries/${id}`);
  return response.data;
};

/**
 * Create a new ministry
 * 
 * @param payload Ministry data
 * @returns Created ministry
 */
export const create = async (payload: CreateMinistryPayload): Promise<Ministry> => {
  const response = await apiClient.post<Ministry>('ministries', payload);
  return response.data;
};

/**
 * Update a ministry
 * 
 * @param id Ministry ID
 * @param payload Updated ministry data
 * @returns Updated ministry
 */
export const update = async (id: string, payload: UpdateMinistryPayload): Promise<Ministry> => {
  const response = await apiClient.put<Ministry>(`ministries/${id}`, payload);
  return response.data;
};

/**
 * Delete a ministry
 * 
 * @param id Ministry ID
 */
export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`ministries/${id}`);
};

/**
 * Get active ministries
 * 
 * @param params Query parameters
 * @returns Paginated list of active ministries
 */
export const getActive = async (params?: MinistryQueryParams): Promise<PaginatedResponse<Ministry>> => {
  const response = await apiClient.get<PaginatedResponse<Ministry>>('ministries/active', params);
  return response.data;
};

/**
 * Get ministries accepting new members
 * 
 * @param params Query parameters
 * @returns Paginated list of ministries
 */
export const getAcceptingMembers = async (
  params?: MinistryQueryParams
): Promise<PaginatedResponse<Ministry>> => {
  const response = await apiClient.get<PaginatedResponse<Ministry>>('ministries/accepting-members', params);
  return response.data;
};

/**
 * Get ministry statistics
 * 
 * @param id Ministry ID
 * @returns Ministry statistics
 */
export const getStatistics = async (id: string): Promise<any> => {
  const response = await apiClient.get(`ministries/${id}/statistics`);
  return response.data;
};

// Export all functions as default object
const ministryService = {
  list,
  getById,
  create,
  update,
  remove,
  getActive,
  getAcceptingMembers,
  getStatistics,
};

export default ministryService;

