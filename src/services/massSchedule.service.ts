/**
 * Mass Schedule API Service
 * 
 * Provides typed API methods for managing mass schedules.
 * Handles CRUD operations and schedule queries.
 * 
 * @package Lovable/src/services
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

/**
 * Mass Schedule Model
 */
export interface MassSchedule {
  id: string;
  title: string;
  day_of_week: string;
  start_time: string;
  end_time?: string;
  language: string;
  type: string;
  description?: string;
  priest_id?: string;
  location?: string;
  capacity?: number;
  is_active: boolean;
  booking_required: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Create Mass Schedule Payload
 */
export interface CreateMassSchedulePayload {
  title: string;
  day_of_week: string;
  start_time: string;
  end_time?: string;
  language: string;
  type: string;
  description?: string;
  priest_id?: string;
  location?: string;
  capacity?: number;
  is_active?: boolean;
  booking_required?: boolean;
}

/**
 * Update Mass Schedule Payload
 */
export interface UpdateMassSchedulePayload extends Partial<CreateMassSchedulePayload> {}

/**
 * Query Parameters
 */
export interface MassScheduleQueryParams {
  page?: number;
  per_page?: number;
  is_active?: boolean;
  day_of_week?: string;
  type?: string;
  language?: string;
  booking_required?: boolean;
}

/**
 * List mass schedules with optional filtering
 * 
 * @param params Query parameters
 * @returns Paginated list of mass schedules
 */
export const list = async (
  params?: MassScheduleQueryParams
): Promise<PaginatedResponse<MassSchedule>> => {
  const response = await apiClient.get<PaginatedResponse<MassSchedule>>('mass-schedules', params);
  return response.data;
};

/**
 * Get mass schedule by ID
 * 
 * @param id Mass Schedule ID
 * @returns Mass schedule details
 */
export const getById = async (id: string): Promise<MassSchedule> => {
  const response = await apiClient.get<MassSchedule>(`mass-schedules/${id}`);
  return response.data;
};

/**
 * Create a new mass schedule
 * 
 * @param payload Mass schedule data
 * @returns Created mass schedule
 */
export const create = async (payload: CreateMassSchedulePayload): Promise<MassSchedule> => {
  const response = await apiClient.post<MassSchedule>('mass-schedules', payload);
  return response.data;
};

/**
 * Update a mass schedule
 * 
 * @param id Mass Schedule ID
 * @param payload Updated mass schedule data
 * @returns Updated mass schedule
 */
export const update = async (
  id: string,
  payload: UpdateMassSchedulePayload
): Promise<MassSchedule> => {
  const response = await apiClient.put<MassSchedule>(`mass-schedules/${id}`, payload);
  return response.data;
};

/**
 * Delete a mass schedule
 * 
 * @param id Mass Schedule ID
 */
export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`mass-schedules/${id}`);
};

/**
 * Get active mass schedules
 * 
 * @param params Query parameters
 * @returns Paginated list of active mass schedules
 */
export const getActive = async (
  params?: MassScheduleQueryParams
): Promise<PaginatedResponse<MassSchedule>> => {
  const response = await apiClient.get<PaginatedResponse<MassSchedule>>('mass-schedules/active', params);
  return response.data;
};

/**
 * Get mass schedules by day of week
 * 
 * @param dayOfWeek Day of week
 * @returns List of mass schedules
 */
export const getByDay = async (dayOfWeek: string): Promise<MassSchedule[]> => {
  const response = await apiClient.get<MassSchedule[]>('mass-schedules/day/' + dayOfWeek);
  return response.data;
};

/**
 * Get Sunday masses
 * 
 * @returns List of Sunday masses
 */
export const getSundayMasses = async (): Promise<MassSchedule[]> => {
  const response = await apiClient.get<MassSchedule[]>('mass-schedules/sunday');
  return response.data;
};

/**
 * Get weekday masses
 * 
 * @returns List of weekday masses
 */
export const getWeekdayMasses = async (): Promise<MassSchedule[]> => {
  const response = await apiClient.get<MassSchedule[]>('mass-schedules/weekday');
  return response.data;
};

/**
 * Get mass schedules by type
 * 
 * @param type Mass type
 * @param params Query parameters
 * @returns Paginated list of mass schedules
 */
export const getByType = async (
  type: string,
  params?: MassScheduleQueryParams
): Promise<PaginatedResponse<MassSchedule>> => {
  const response = await apiClient.get<PaginatedResponse<MassSchedule>>(
    `mass-schedules/type/${type}`,
    params
  );
  return response.data;
};

/**
 * Get mass schedules by language
 * 
 * @param language Language
 * @returns List of mass schedules
 */
export const getByLanguage = async (language: string): Promise<MassSchedule[]> => {
  const response = await apiClient.get<MassSchedule[]>(`mass-schedules/language/${language}`);
  return response.data;
};

/**
 * Get mass schedules requiring booking
 * 
 * @returns List of mass schedules requiring booking
 */
export const getRequiringBooking = async (): Promise<MassSchedule[]> => {
  const response = await apiClient.get<MassSchedule[]>('mass-schedules/booking-required');
  return response.data;
};

// Export all functions as default object
const massScheduleService = {
  list,
  getById,
  create,
  update,
  remove,
  getActive,
  getByDay,
  getSundayMasses,
  getWeekdayMasses,
  getByType,
  getByLanguage,
  getRequiringBooking,
};

export default massScheduleService;

