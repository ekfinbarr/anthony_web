/**
 * Volunteer API Service
 * 
 * Provides typed API methods for managing volunteer registrations.
 * Handles CRUD operations and volunteer tracking.
 * 
 * @package Lovable/src/services
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

/**
 * Volunteer Model
 */
export interface Volunteer {
  id: string;
  user_id: string;
  event_id?: string | null;
  ministry_id?: string | null;
  role: string;
  status: 'active' | 'inactive' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create Volunteer Payload
 */
export interface CreateVolunteerPayload {
  user_id: string;
  event_id?: string;
  ministry_id?: string;
  role: string;
  status?: 'active' | 'inactive' | 'completed';
  notes?: string;
}

/**
 * Update Volunteer Payload
 */
export type UpdateVolunteerPayload = Partial<CreateVolunteerPayload>;

/**
 * Query Parameters
 */
export interface VolunteerQueryParams {
  page?: number;
  per_page?: number;
  status?: string;
  event_id?: string;
  ministry_id?: string;
  user_id?: string;
}

/**
 * List volunteers with optional filtering
 * 
 * @param params Query parameters
 * @returns Paginated list of volunteers
 */
export const list = async (params?: VolunteerQueryParams): Promise<PaginatedResponse<Volunteer>> => {
  const response = await apiClient.get<PaginatedResponse<Volunteer>>('volunteers', params);
  return response.data;
};

/**
 * Get volunteer by ID
 * 
 * @param id Volunteer ID
 * @returns Volunteer details
 */
export const getById = async (id: string): Promise<Volunteer> => {
  const response = await apiClient.get<Volunteer>(`volunteers/${id}`);
  return response.data;
};

/**
 * Create a new volunteer registration
 * 
 * @param payload Volunteer data
 * @returns Created volunteer
 */
export const create = async (payload: CreateVolunteerPayload): Promise<Volunteer> => {
  const response = await apiClient.post<Volunteer>('volunteers', payload);
  return response.data;
};

/**
 * Update a volunteer registration
 * 
 * @param id Volunteer ID
 * @param payload Updated volunteer data
 * @returns Updated volunteer
 */
export const update = async (id: string, payload: UpdateVolunteerPayload): Promise<Volunteer> => {
  const response = await apiClient.put<Volunteer>(`volunteers/${id}`, payload);
  return response.data;
};

/**
 * Delete a volunteer registration
 * 
 * @param id Volunteer ID
 */
export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`volunteers/${id}`);
};

/**
 * Get volunteers by user
 * 
 * @param userId User ID
 * @param params Query parameters
 * @returns Paginated list of volunteers
 */
export const getByUser = async (
  userId: string,
  params?: VolunteerQueryParams
): Promise<PaginatedResponse<Volunteer>> => {
  const response = await apiClient.get<PaginatedResponse<Volunteer>>(
    `volunteers/user/${userId}`,
    params
  );
  return response.data;
};

/**
 * Get volunteers by event
 * 
 * @param eventId Event ID
 * @param params Query parameters
 * @returns Paginated list of volunteers
 */
export const getByEvent = async (
  eventId: string,
  params?: VolunteerQueryParams
): Promise<PaginatedResponse<Volunteer>> => {
  const response = await apiClient.get<PaginatedResponse<Volunteer>>(
    `volunteers/event/${eventId}`,
    params
  );
  return response.data;
};

/**
 * Get volunteers by ministry
 * 
 * @param ministryId Ministry ID
 * @param params Query parameters
 * @returns Paginated list of volunteers
 */
export const getByMinistry = async (
  ministryId: string,
  params?: VolunteerQueryParams
): Promise<PaginatedResponse<Volunteer>> => {
  const response = await apiClient.get<PaginatedResponse<Volunteer>>(
    `volunteers/ministry/${ministryId}`,
    params
  );
  return response.data;
};

/**
 * Get active volunteers
 * 
 * @param params Query parameters
 * @returns Paginated list of active volunteers
 */
export const getActive = async (params?: VolunteerQueryParams): Promise<PaginatedResponse<Volunteer>> => {
  const response = await apiClient.get<PaginatedResponse<Volunteer>>('volunteers/active', params);
  return response.data;
};

// Export all functions as default object
const volunteerService = {
  list,
  getById,
  create,
  update,
  remove,
  getByUser,
  getByEvent,
  getByMinistry,
  getActive,
};

export default volunteerService;

