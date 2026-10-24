/**
 * Facility (Halls & Rentals) API Service
 *
 * Backend routes (AnthonyServer):
 * - Public: GET /api/facilities, GET /api/facilities/by-type/{type}
 * - Admin : CRUD via /api/facilities (apiResource)
 */

import { apiClient } from "@/lib/apiClient";

export type FacilityType = "hall" | "room" | "clinic" | "shop" | "parking" | "restroom" | "other";

export interface FacilityTimeBlockDto {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  price: string | number;
  currency?: string;
  is_combinable?: boolean;
  is_online?: boolean;
  is_active?: boolean;
}

export interface Facility {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: FacilityType;
  capacity?: number | null;
  rental_fee?: string | number | null;
  amenities?: string[] | null;
  images?: string[] | null;
  availability_notes?: string | null;
  booking_requirements?: string | null;
  restrictions?: string | null;
  setup_buffer_minutes?: number;
  cleanup_buffer_minutes?: number;
  time_blocks?: FacilityTimeBlockDto[];
  is_bookable: boolean;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface UpsertFacilityPayload {
  name: string;
  description: string;
  type: FacilityType;
  capacity?: number | null;
  rental_fee?: number | null;
  amenities?: string[] | null;
  images?: string[] | null;
  availability_notes?: string | null;
  booking_requirements?: string | null;
  is_bookable?: boolean;
  is_active?: boolean;
  sort_order?: number;
}

export const list = async (params?: { type?: FacilityType; search?: string; bookable?: boolean }) => {
  const res = await apiClient.get<{ data: Facility[] }>("facilities", params);
  return res.data;
};

export const getByType = async (type: FacilityType) => {
  const res = await apiClient.get<{ data: Facility[] }>(`facilities/by-type/${type}`);
  return res.data;
};

/**
 * Get a facility by id (admin usage).
 *
 * NOTE:
 * The backend now binds admin `facilities/{facility}` by UUID id (not slug),
 * while public routes bind by slug explicitly.
 */
export const getById = async (id: string) => {
  const res = await apiClient.get<{ data: Facility }>(`facilities/${id}`);
  return res.data;
};

export const getBySlug = async (slug: string) => {
  const res = await apiClient.get<{ data: Facility }>(`facilities/${slug}`);
  return res.data;
};

export const create = async (payload: UpsertFacilityPayload) => {
  const res = await apiClient.post<{ message: string; data: Facility }>("facilities", payload);
  return res.data;
};

export const update = async (id: string, payload: Partial<UpsertFacilityPayload>) => {
  const res = await apiClient.put<{ message: string; data: Facility }>(`facilities/${id}`, payload);
  return res.data;
};

export const remove = async (id: string) => {
  const res = await apiClient.delete<{ message: string }>(`facilities/${id}`);
  return res.data;
};

export interface UpsertTimeBlockPayload {
  name: string;
  start_time: string;
  end_time: string;
  price: number;
  currency?: string;
  is_combinable?: boolean;
  is_online?: boolean;
  is_active?: boolean;
  sort_order?: number;
}

export const listTimeBlocks = async (facilityId: string) => {
  const res = await apiClient.get<{ data: FacilityTimeBlockDto[] }>(`facilities/${facilityId}/time-blocks`);
  return res.data;
};

export const createTimeBlock = async (facilityId: string, payload: UpsertTimeBlockPayload) => {
  const res = await apiClient.post<{ message: string; data: FacilityTimeBlockDto }>(
    `facilities/${facilityId}/time-blocks`,
    payload
  );
  return res.data;
};

export const updateTimeBlock = async (
  facilityId: string,
  blockId: string,
  payload: Partial<UpsertTimeBlockPayload>
) => {
  const res = await apiClient.put<{ message: string; data: FacilityTimeBlockDto }>(
    `facilities/${facilityId}/time-blocks/${blockId}`,
    payload
  );
  return res.data;
};

export const deleteTimeBlock = async (facilityId: string, blockId: string) => {
  const res = await apiClient.delete<{ message: string }>(`facilities/${facilityId}/time-blocks/${blockId}`);
  return res.data;
};

export default {
  list,
  getByType,
  getById,
  getBySlug,
  create,
  update,
  remove,
  listTimeBlocks,
  createTimeBlock,
  updateTimeBlock,
  deleteTimeBlock,
};


