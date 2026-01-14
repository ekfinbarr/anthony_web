/**
 * Clinic API Service
 *
 * Backend routes (AnthonyServer):
 * - GET  /api/clinic/services
 * - POST /api/clinic/appointments
 * - GET  /api/clinic/appointments/mine (auth)
 */

import { apiClient } from "@/lib/apiClient";

export interface ClinicService {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
  price?: string | number | null;
  currency: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ClinicServiceCollection {
  data: ClinicService[];
}

export interface CreateClinicAppointmentPayload {
  clinic_service_id?: string;
  patient_name: string;
  patient_email: string;
  patient_phone?: string;
  preferred_date: string;
  preferred_time?: string;
  notes?: string;
}

export const listServices = async (): Promise<ClinicServiceCollection> => {
  const response = await apiClient.get<ClinicServiceCollection>("clinic/services");
  return response.data;
};

export const createAppointment = async (payload: CreateClinicAppointmentPayload) => {
  const response = await apiClient.post("clinic/appointments", payload);
  return response.data;
};

/**
 * Admin: Clinic services CRUD
 * Backend: /api/clinic-services (apiResource)
 */
export interface UpsertClinicServicePayload {
  name: string;
  category?: string | null;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  is_active?: boolean;
  sort_order?: number;
}

export const adminListServices = async (params?: { per_page?: number; page?: number; category?: string; is_active?: boolean }) => {
  const response = await apiClient.get<{ data: ClinicService[]; meta?: unknown; links?: unknown }>("clinic-services", params);
  return response.data;
};

export const adminCreateService = async (payload: UpsertClinicServicePayload) => {
  const response = await apiClient.post<{ message: string; data: ClinicService }>("clinic-services", payload);
  return response.data;
};

export const adminUpdateService = async (id: string, payload: Partial<UpsertClinicServicePayload>) => {
  const response = await apiClient.put<{ message: string; data: ClinicService }>(`clinic-services/${id}`, payload);
  return response.data;
};

export const adminDeleteService = async (id: string) => {
  const response = await apiClient.delete<{ message: string }>(`clinic-services/${id}`);
  return response.data;
};

/**
 * Admin: appointment requests
 * Backend:
 * - GET /api/clinic-appointments
 * - GET /api/clinic-appointments/{id}
 * - POST /api/clinic-appointments/{id}/confirm|reject|cancel
 */
export type ClinicAppointmentStatus = "pending" | "confirmed" | "rejected" | "cancelled";

export interface ClinicAppointment {
  id: string;
  patient_name: string;
  patient_email: string;
  patient_phone?: string | null;
  preferred_date: string;
  preferred_time?: string | null;
  notes?: string | null;
  status: ClinicAppointmentStatus;
  created_at: string;
  updated_at: string;
  clinic_service?: ClinicService | null;
}

export const adminListAppointments = async (params?: { page?: number; per_page?: number; status?: string; preferred_date?: string; clinic_service_id?: string }) => {
  const response = await apiClient.get<{ data: ClinicAppointment[]; meta?: unknown; links?: unknown }>("clinic-appointments", params);
  return response.data;
};

export const adminGetAppointment = async (id: string) => {
  const response = await apiClient.get<{ data: ClinicAppointment }>(`clinic-appointments/${id}`);
  return response.data;
};

export const adminConfirmAppointment = async (id: string) => {
  const response = await apiClient.post(`clinic-appointments/${id}/confirm`, {});
  return response.data as unknown;
};

export const adminRejectAppointment = async (id: string, payload: { reason: string; admin_notes?: string | null }) => {
  const response = await apiClient.post(`clinic-appointments/${id}/reject`, payload);
  return response.data as unknown;
};

export const adminCancelAppointment = async (id: string, payload?: { reason?: string | null }) => {
  const response = await apiClient.post(`clinic-appointments/${id}/cancel`, payload ?? {});
  return response.data as unknown;
};

export default {
  listServices,
  createAppointment,
  adminListServices,
  adminCreateService,
  adminUpdateService,
  adminDeleteService,
  adminListAppointments,
  adminGetAppointment,
  adminConfirmAppointment,
  adminRejectAppointment,
  adminCancelAppointment,
};


