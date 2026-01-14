/**
 * Sacrament API Service
 * 
 * Provides typed API methods for managing church sacraments.
 * Handles CRUD operations, registration management, and approval workflows.
 * 
 * @package Lovable/src/services
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

/**
 * Sacrament Model
 */
export interface Sacrament {
  id: string;
  name: string;
  description?: string;
  contact?: string;
  schedule?: string;
  requirements?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Create Sacrament Payload
 */
export interface CreateSacramentPayload {
  name: string;
  description?: string;
  contact?: string;
  schedule?: string;
  requirements?: string[];
  is_active?: boolean;
}

/**
 * Update Sacrament Payload
 */
export type UpdateSacramentPayload = Partial<CreateSacramentPayload>;

/**
 * Query Parameters
 */
export interface SacramentQueryParams {
  page?: number;
  per_page?: number;
  is_active?: boolean;
  search?: string;
}

/**
 * List sacraments with optional filtering
 * 
 * @param params Query parameters
 * @returns Paginated list of sacraments
 */
export const list = async (params?: SacramentQueryParams): Promise<PaginatedResponse<Sacrament>> => {
  const response = await apiClient.get<PaginatedResponse<Sacrament>>('sacraments', params);
  return response.data;
};

/**
 * Get sacrament by ID
 * 
 * @param id Sacrament ID
 * @returns Sacrament details
 */
export const getById = async (id: string): Promise<Sacrament> => {
  const response = await apiClient.get<Sacrament>(`sacraments/${id}`);
  return response.data;
};

/**
 * Create a new sacrament
 * 
 * @param payload Sacrament data
 * @returns Created sacrament
 */
export const create = async (payload: CreateSacramentPayload): Promise<Sacrament> => {
  const response = await apiClient.post<Sacrament>('sacraments', payload);
  return response.data;
};

/**
 * Update a sacrament
 * 
 * @param id Sacrament ID
 * @param payload Updated sacrament data
 * @returns Updated sacrament
 */
export const update = async (id: string, payload: UpdateSacramentPayload): Promise<Sacrament> => {
  const response = await apiClient.put<Sacrament>(`sacraments/${id}`, payload);
  return response.data;
};

/**
 * Delete a sacrament
 * 
 * @param id Sacrament ID
 */
export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`sacraments/${id}`);
};

/**
 * Get active sacraments
 * 
 * @param params Query parameters
 * @returns Paginated list of active sacraments
 */
export const getActive = async (params?: SacramentQueryParams): Promise<PaginatedResponse<Sacrament>> => {
  const response = await apiClient.get<PaginatedResponse<Sacrament>>('sacraments/active', params);
  return response.data;
};

/**
 * Get sacrament with registrations
 * 
 * @param id Sacrament ID
 * @returns Sacrament with registrations
 */
export const getWithRegistrations = async (id: string): Promise<Sacrament> => {
  const response = await apiClient.get<Sacrament>(`sacraments/${id}/registrations`);
  return response.data;
};

/**
 * Check if user can register for sacrament
 * 
 * @param sacramentId Sacrament ID
 * @param userId User ID
 * @returns Registration eligibility
 */
export const canUserRegister = async (
  sacramentId: string,
  userId: string
): Promise<{ can_register: boolean; reason?: string }> => {
  const response = await apiClient.get<{ can_register: boolean; reason?: string }>(
    `sacraments/${sacramentId}/can-register/${userId}`
  );
  return response.data;
};

/**
 * Get sacrament statistics
 * 
 * @param id Sacrament ID
 * @returns Sacrament statistics
 */
export const getStatistics = async (id: string): Promise<unknown> => {
  const response = await apiClient.get<unknown>(`sacraments/${id}/statistics`);
  return response.data;
};

// Export all functions as default object
const sacramentService = {
  list,
  getById,
  create,
  update,
  remove,
  getActive,
  getWithRegistrations,
  canUserRegister,
  getStatistics,
};

export default sacramentService;

