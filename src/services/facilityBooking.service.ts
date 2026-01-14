/**
 * Facility Booking API Service (Halls & Rentals)
 *
 * Provides typed API methods for creating and managing facility bookings.
 *
 * Backend routes (AnthonyServer):
 * - POST /api/facilities/{facility}/booking-requests (public guest)
 * - POST /api/facilities/{facility}/bookings (auth)
 * - GET  /api/facility-bookings/mine (auth)
 * - Admin: GET/SHOW/APPROVE/REJECT/CANCEL under /api/facility-bookings/*
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

export type FacilityBookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface FacilityBooking {
  id: string;
  reference: string;
  status: FacilityBookingStatus;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  purpose?: string | null;
  notes?: string | null;
  total_amount?: string | number | null;
  currency?: string;
  metadata?: Record<string, unknown> | null;
  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateGuestFacilityBookingPayload {
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  purpose?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateFacilityBookingPayload {
  booking_date: string;
  start_time: string;
  end_time: string;
  purpose?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface FacilityAvailabilityResponse {
  available: boolean;
  message: string;
  data?: {
    facility?: string;
    date?: string;
    time?: string;
    rental_fee?: string;
  };
}

/**
 * Laravel ResourceCollection pagination shape.
 */
export interface LaravelResourceCollection<T> {
  data: T[];
  links?: unknown;
  meta?: unknown;
}

/**
 * Guest booking request (no auth).
 */
export const createGuest = async (
  facilitySlug: string,
  payload: CreateGuestFacilityBookingPayload
): Promise<{ message: string; data: FacilityBooking }> => {
  const response = await apiClient.post<{ message: string; data: FacilityBooking }>(
    `facilities/${facilitySlug}/booking-requests`,
    payload
  );
  return response.data;
};

/**
 * Authenticated booking request (links to the current user).
 */
export const create = async (
  facilitySlug: string,
  payload: CreateFacilityBookingPayload
): Promise<{ message: string; data: FacilityBooking }> => {
  const response = await apiClient.post<{ message: string; data: FacilityBooking }>(
    `facilities/${facilitySlug}/bookings`,
    payload
  );
  return response.data;
};

/**
 * List current user's facility bookings.
 */
export const listMine = async (params?: { page?: number; per_page?: number }): Promise<PaginatedResponse<FacilityBooking>> => {
  const response = await apiClient.get<PaginatedResponse<FacilityBooking>>('facility-bookings/mine', params);
  return response.data;
};

/**
 * Check facility availability for a time slot.
 */
export const checkAvailability = async (
  facilitySlug: string,
  params: { date: string; start_time: string; end_time: string }
): Promise<FacilityAvailabilityResponse> => {
  const response = await apiClient.post<FacilityAvailabilityResponse>(
    `facilities/${facilitySlug}/check-availability`,
    params
  );
  return response.data;
};

export default {
  createGuest,
  create,
  listMine,
  /**
   * Admin endpoints (role:admin|priest)
   */
  listAdmin: async (params?: { page?: number; per_page?: number; facility_id?: string; status?: FacilityBookingStatus; booking_date?: string }) => {
    // Admin controller returns a Laravel ResourceCollection shape ({ data, meta, links }).
    const response = await apiClient.get<LaravelResourceCollection<FacilityBooking>>("facility-bookings", params);
    return response.data;
  },
  getAdminById: async (id: string) => {
    const response = await apiClient.get<{ data: FacilityBooking }>(`facility-bookings/${id}`);
    return response.data;
  },
  approve: async (id: string) => {
    const response = await apiClient.post(`facility-bookings/${id}/approve`, {});
    return response.data as unknown;
  },
  reject: async (id: string, payload: { reason: string }) => {
    const response = await apiClient.post(`facility-bookings/${id}/reject`, payload);
    return response.data as unknown;
  },
  cancel: async (id: string, payload?: { reason?: string | null }) => {
    const response = await apiClient.post(`facility-bookings/${id}/cancel`, payload ?? {});
    return response.data as unknown;
  },
  checkAvailability,
};


