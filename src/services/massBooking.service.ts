/**
 * Mass Booking API Service
 *
 * Backend routes (AnthonyServer):
 * - POST /api/mass-schedules/{massSchedule}/bookings/guest (public)
 * - POST /api/mass-schedules/{massSchedule}/bookings (auth)
 * - GET  /api/mass-bookings/mine (auth)
 */

import { apiClient } from '../lib/apiClient';

export type MassBookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface MassScheduleSummary {
  id: string;
  title: string;
  day_of_week: string;
  start_time: string;
  language: string;
  type: string;
  capacity?: number | null;
  booking_required?: boolean;
}

export interface MassBooking {
  id: string;
  reference: string;
  status: MassBookingStatus;
  booking_date: string;
  intention: string;
  offered_by?: string | null;
  amount?: string | number | null;
  currency?: string;
  metadata?: Record<string, unknown> | null;
  mass_schedule?: MassScheduleSummary;
  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Laravel ResourceCollection pagination shape.
 */
export interface LaravelResourceCollection<T> {
  data: T[];
  links?: unknown;
  meta?: unknown;
}

export interface CreateMassBookingPayload {
  booking_date: string; // YYYY-MM-DD
  intention: string;
  offered_by?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateGuestMassBookingPayload extends CreateMassBookingPayload {
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
}

export const create = async (
  massScheduleId: string,
  payload: CreateMassBookingPayload
): Promise<{ message: string; data: MassBooking }> => {
  const response = await apiClient.post<{ message: string; data: MassBooking }>(
    `mass-schedules/${massScheduleId}/bookings`,
    payload
  );
  return response.data;
};

export const createGuest = async (
  massScheduleId: string,
  payload: CreateGuestMassBookingPayload
): Promise<{ message: string; data: MassBooking }> => {
  const response = await apiClient.post<{ message: string; data: MassBooking }>(
    `mass-schedules/${massScheduleId}/bookings/guest`,
    payload
  );
  return response.data;
};

export const listMine = async (): Promise<LaravelResourceCollection<MassBooking>> => {
  const response = await apiClient.get<LaravelResourceCollection<MassBooking>>('mass-bookings/mine');
  return response.data;
};

/**
 * Admin: list bookings
 */
export const listAdmin = async (
  params?: { page?: number; per_page?: number; status?: MassBookingStatus; mass_schedule_id?: string; booking_date?: string; search?: string }
): Promise<LaravelResourceCollection<MassBooking>> => {
  const response = await apiClient.get<LaravelResourceCollection<MassBooking>>("mass-bookings", params);
  return response.data;
};

export const getAdminById = async (id: string): Promise<{ data: MassBooking }> => {
  const response = await apiClient.get<{ data: MassBooking }>(`mass-bookings/${id}`);
  return response.data;
};

export const approve = async (id: string) => {
  const response = await apiClient.post(`mass-bookings/${id}/approve`, {});
  return response.data as unknown;
};

export const reject = async (id: string, payload: { reason: string }) => {
  const response = await apiClient.post(`mass-bookings/${id}/reject`, payload);
  return response.data as unknown;
};

export const cancel = async (id: string, payload?: { reason?: string | null }) => {
  const response = await apiClient.post(`mass-bookings/${id}/cancel`, payload ?? {});
  return response.data as unknown;
};

export default {
  create,
  createGuest,
  listMine,
  listAdmin,
  getAdminById,
  approve,
  reject,
  cancel,
};


