/**
 * Event API Service
 * 
 * Provides typed API methods for managing church events.
 * Handles CRUD operations, RSVP management, and volunteer tracking.
 * 
 * @package Lovable/src/services
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

/**
 * Event Model
 */
export interface Event {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Create Event Payload
 */
export interface CreateEventPayload {
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  is_public?: boolean;
}

/**
 * Update Event Payload
 */
export interface UpdateEventPayload extends Partial<CreateEventPayload> {}

/**
 * Query Parameters
 */
export interface EventQueryParams {
  page?: number;
  per_page?: number;
  is_public?: boolean;
  start_date?: string;
  end_date?: string;
  search?: string;
}

/**
 * List events with optional filtering
 * 
 * @param params Query parameters
 * @returns Paginated list of events
 */
export const list = async (params?: EventQueryParams): Promise<PaginatedResponse<Event>> => {
  const response = await apiClient.get<PaginatedResponse<Event>>('events', params);
  return response.data;
};

/**
 * Get event by ID
 * 
 * @param id Event ID
 * @returns Event details
 */
export const getById = async (id: string): Promise<Event> => {
  const response = await apiClient.get<Event>(`events/${id}`);
  return response.data;
};

/**
 * Create a new event
 * 
 * @param payload Event data
 * @returns Created event
 */
export const create = async (payload: CreateEventPayload): Promise<Event> => {
  const response = await apiClient.post<Event>('events', payload);
  return response.data;
};

/**
 * Update an event
 * 
 * @param id Event ID
 * @param payload Updated event data
 * @returns Updated event
 */
export const update = async (id: string, payload: UpdateEventPayload): Promise<Event> => {
  const response = await apiClient.put<Event>(`events/${id}`, payload);
  return response.data;
};

/**
 * Delete an event
 * 
 * @param id Event ID
 */
export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`events/${id}`);
};

/**
 * Get upcoming events
 * 
 * @param params Query parameters
 * @returns Paginated list of upcoming events
 */
export const getUpcoming = async (params?: EventQueryParams): Promise<PaginatedResponse<Event>> => {
  const response = await apiClient.get<PaginatedResponse<Event>>('events/upcoming', params);
  return response.data;
};

/**
 * Get public events
 * 
 * @param params Query parameters
 * @returns Paginated list of public events
 */
export const getPublic = async (params?: EventQueryParams): Promise<PaginatedResponse<Event>> => {
  const response = await apiClient.get<PaginatedResponse<Event>>('events/public', params);
  return response.data;
};

/**
 * Get events by date range
 * 
 * @param startDate Start date
 * @param endDate End date
 * @param params Query parameters
 * @returns Paginated list of events
 */
export const getByDateRange = async (
  startDate: string,
  endDate: string,
  params?: EventQueryParams
): Promise<PaginatedResponse<Event>> => {
  const response = await apiClient.get<PaginatedResponse<Event>>('events/date-range', {
    start_date: startDate,
    end_date: endDate,
    ...params,
  });
  return response.data;
};

/**
 * Get RSVP counts for an event
 * 
 * @param id Event ID
 * @returns RSVP statistics
 */
export const getRSVPCounts = async (id: string): Promise<any> => {
  const response = await apiClient.get(`events/${id}/rsvp-counts`);
  return response.data;
};

/**
 * Get volunteer count for an event
 * 
 * @param id Event ID
 * @returns Volunteer count
 */
export const getVolunteerCount = async (id: string): Promise<number> => {
  const response = await apiClient.get<{ count: number }>(`events/${id}/volunteer-count`);
  return response.data.count;
};

// Export all functions as default object
const eventService = {
  list,
  getById,
  create,
  update,
  remove,
  getUpcoming,
  getPublic,
  getByDateRange,
  getRSVPCounts,
  getVolunteerCount,
};

export default eventService;

