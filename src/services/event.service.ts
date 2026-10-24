/**
 * Event API Service
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

export interface EventCategory {
  id: string;
  name: string;
  label: string;
  slug: string;
  color?: string | null;
}

export interface EventGalleryAlbum {
  id: string;
  title: string;
  slug: string;
}

export interface Event {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  summary?: string | null;
  image?: string | File | null;
  start_date: string;
  start_time?: string | null;
  end_date?: string | null;
  end_time?: string | null;
  is_all_day?: boolean;
  location?: string | null;
  online_url?: string | null;
  venue_address?: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  rsvp_enabled?: boolean;
  max_attendees?: number | null;
  available_spaces?: number | null;
  registration_open?: boolean;
  registration_deadline?: string | null;
  status?: string;
  event_state?: 'scheduled' | 'cancelled' | 'rescheduled' | string;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  approval_reason?: string;
  rejected_at?: string;
  rejection_reason?: string;
  is_approved?: boolean;
  is_rejected?: boolean;
  is_published?: boolean;
  published_at?: string;
  is_featured?: boolean;
  featured_at?: string | null;
  categories?: EventCategory[];
  gallery_albums?: EventGalleryAlbum[];
}

export interface CreateEventPayload {
  name: string;
  slug?: string;
  description?: string;
  summary?: string;
  start_date: string;
  start_time?: string;
  end_date?: string;
  end_time?: string;
  is_all_day?: boolean;
  location?: string;
  online_url?: string;
  venue_address?: string;
  is_public?: boolean;
  image?: string | File;
  rsvp_enabled?: boolean;
  max_attendees?: number | null;
  registration_deadline?: string | null;
  is_featured?: boolean;
  is_published?: boolean;
  is_approved?: boolean;
  status?: string;
  event_state?: string;
  category_ids?: string[];
}

export type UpdateEventPayload = Partial<CreateEventPayload>;

export interface EventQueryParams {
  page?: number;
  per_page?: number;
  is_public?: boolean;
  search?: string;
  q?: string;
  category?: string;
  timeframe?: 'upcoming' | 'past' | string;
  from?: string;
  to?: string;
  year?: string | number;
  date?: string;
  sort?: 'soonest' | 'latest' | 'newest' | string;
  is_featured?: boolean | string;
  [key: string]: string | number | boolean | undefined;
}

export interface GuestRegistrationPayload {
  guest_name: string;
  contact_email: string;
  contact_phone?: string;
  guest_count?: number;
  notes?: string;
  status?: 'attending' | 'not_attending' | 'maybe';
}

const unwrap = <T>(payload: unknown): T => {
  if (payload && typeof payload === 'object' && 'data' in (payload as object)) {
    return (payload as { data: T }).data;
  }
  return payload as T;
};

const normalizePaginated = <T>(payload: unknown): PaginatedResponse<T> => {
  const body = (payload || {}) as Record<string, unknown>;
  const data = Array.isArray(body.data) ? (body.data as T[]) : Array.isArray(body) ? (body as T[]) : [];
  const meta = (body.meta || body) as Record<string, unknown>;
  return {
    data,
    current_page: Number(meta.current_page ?? 1),
    last_page: Number(meta.last_page ?? 1),
    per_page: Number(meta.per_page ?? (data.length || 12)),
    total: Number(meta.total ?? data.length),
    from: Number(meta.from ?? (data.length ? 1 : 0)),
    to: Number(meta.to ?? data.length),
  };
};

export const list = async (params?: EventQueryParams): Promise<PaginatedResponse<Event>> => {
  const response = await apiClient.get<PaginatedResponse<Event>>('events', params);
  return response.data;
};

export const getById = async (id: string): Promise<Event> => {
  const response = await apiClient.get<{ data: Event } | Event>(`events/${id}`);
  return unwrap<Event>(response.data);
};

export const create = async (payload: CreateEventPayload): Promise<Event> => {
  const hasFile = payload.image instanceof File;
  if (hasFile) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === 'category_ids' && Array.isArray(value)) {
        value.forEach((id, i) => formData.append(`category_ids[${i}]`, id));
        return;
      }
      if (value instanceof File) formData.append(key, value);
      else if (typeof value === 'boolean') formData.append(key, value ? '1' : '0');
      else formData.append(key, String(value));
    });
    const response = await apiClient.postForm<{ data: Event } | Event>('events', formData);
    return unwrap<Event>(response.data);
  }
  const response = await apiClient.post<{ data: Event } | Event>('events', payload);
  return unwrap<Event>(response.data);
};

export const update = async (id: string, payload: UpdateEventPayload): Promise<Event> => {
  const hasFile = payload.image instanceof File;
  if (hasFile) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === 'category_ids' && Array.isArray(value)) {
        value.forEach((cid, i) => formData.append(`category_ids[${i}]`, cid));
        return;
      }
      if (value instanceof File) formData.append(key, value);
      else if (typeof value === 'boolean') formData.append(key, value ? '1' : '0');
      else formData.append(key, String(value));
    });
    formData.append('_method', 'PUT');
    const response = await apiClient.postForm<{ data: Event } | Event>(`events/${id}`, formData);
    return unwrap<Event>(response.data);
  }
  const response = await apiClient.put<{ data: Event } | Event>(`events/${id}`, payload);
  return unwrap<Event>(response.data);
};

export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`events/${id}`);
};

export const getUpcoming = async (params?: EventQueryParams): Promise<PaginatedResponse<Event>> => {
  const response = await apiClient.get<PaginatedResponse<Event>>('events/upcoming', params);
  return response.data;
};

export const getPublic = async (params?: EventQueryParams): Promise<PaginatedResponse<Event>> => {
  const response = await apiClient.get<unknown>('events/public', params);
  return normalizePaginated<Event>(response.data);
};

export const getPublicUpcoming = async (params?: EventQueryParams): Promise<PaginatedResponse<Event>> => {
  const response = await apiClient.get<unknown>('events/public-upcoming', params);
  return normalizePaginated<Event>(response.data);
};

export const getFeatured = async (): Promise<Event | null> => {
  const response = await apiClient.get<unknown>('events/featured');
  return unwrap<Event | null>(response.data);
};

export const getBySlug = async (slug: string): Promise<Event> => {
  const response = await apiClient.get<{ data: Event }>(`events/slug/${slug}`);
  return unwrap<Event>(response.data);
};

export const getRelated = async (slug: string, limit = 3): Promise<Event[]> => {
  const response = await apiClient.get<{ data: Event[] } | PaginatedResponse<Event>>(
    `events/slug/${slug}/related`,
    { limit },
  );
  const body = response.data as { data?: Event[] };
  return Array.isArray(body?.data) ? body.data : Array.isArray(body) ? (body as Event[]) : [];
};

export const getCalendar = async (params: {
  year?: number;
  month?: number;
  from?: string;
  to?: string;
}): Promise<Event[]> => {
  const response = await apiClient.get<{ data: Event[] }>('events/calendar', params);
  return response.data?.data ?? [];
};

export const registerGuest = async (
  slug: string,
  payload: GuestRegistrationPayload,
): Promise<{ message: string; available_spaces?: number | null }> => {
  const response = await apiClient.post<{
    message: string;
    available_spaces?: number | null;
  }>(`events/slug/${slug}/register`, payload);
  return response.data;
};

export const getByDateRange = async (
  startDate: string,
  endDate: string,
  params?: EventQueryParams,
): Promise<PaginatedResponse<Event>> => {
  const response = await apiClient.get<PaginatedResponse<Event>>('events/calendar', {
    from: startDate,
    to: endDate,
    ...params,
  });
  return response.data;
};

export const getRSVPCounts = async (id: string): Promise<unknown> => {
  const response = await apiClient.get<unknown>(`events/${id}/rsvp-counts`);
  return response.data;
};

export const getVolunteerCount = async (id: string): Promise<number> => {
  const response = await apiClient.get<{ count: number }>(`events/${id}/volunteer-count`);
  return response.data.count;
};

export const exportRsvpsUrl = (id: string): string => {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
  return `${base.replace(/\/$/, '')}/events/${id}/rsvps/export`;
};

const eventService = {
  list,
  getById,
  create,
  update,
  remove,
  getUpcoming,
  getPublic,
  getPublicUpcoming,
  getFeatured,
  getBySlug,
  getRelated,
  getCalendar,
  registerGuest,
  getByDateRange,
  getRSVPCounts,
  getVolunteerCount,
  exportRsvpsUrl,
};

export default eventService;
