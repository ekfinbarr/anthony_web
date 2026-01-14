/**
 * Calendar API Service (Public + Admin)
 *
 * Public endpoints (AnthonyServer):
 * - GET /api/calendar-events
 * - GET /api/calendar-events/month/{year}/{month}
 * - GET /api/calendar-events/{slug}
 * - GET /api/calendar/ics
 *
 * Admin endpoints:
 * - CRUD via /api/calendar-events (auth + admin/priest)
 */

import { apiClient } from "@/lib/apiClient";

export interface CalendarEvent {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  start_datetime: string;
  end_datetime: string;
  is_all_day: boolean;
  location?: string | null;
  type: string;
  category?: "liturgical" | "parish" | "general";
  liturgical_rank?: string | null;
  color?: string | null;
  is_public?: boolean;
  is_published?: boolean;
}

export interface CalendarMonthResponse {
  data: CalendarEvent[];
  meta: {
    year: number;
    month: number;
    month_name: string;
    start_date: string;
    end_date: string;
    total_events: number;
  };
}

export const getMonth = async (year: number, month: number): Promise<CalendarMonthResponse> => {
  const response = await apiClient.get<CalendarMonthResponse>(`calendar-events/month/${year}/${month}`);
  return response.data;
};

export const listEvents = async (params?: {
  start_date?: string;
  end_date?: string;
  category?: string;
  liturgical_rank?: string;
  type?: string;
}): Promise<{ data: CalendarEvent[]; meta?: unknown }> => {
  const response = await apiClient.get<{ data: CalendarEvent[]; meta?: unknown }>("calendar-events", params);
  return response.data;
};

export const getIcsUrl = (params?: Record<string, string | number | boolean | null | undefined>) => {
  // apiClient.buildURL is private, so build the URL from env here.
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
  const url = new URL(`${base.replace(/\/$/, "")}/calendar/ics`);

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  return url.toString();
};

// Admin helpers
export const createEvent = async (payload: Partial<CalendarEvent>) => {
  const response = await apiClient.post("calendar-events", payload);
  return response.data;
};

export const updateEvent = async (id: string, payload: Partial<CalendarEvent>) => {
  const response = await apiClient.put(`calendar-events/${id}`, payload);
  return response.data;
};

export const deleteEvent = async (id: string) => {
  const response = await apiClient.delete(`calendar-events/${id}`);
  return response.data;
};

export default {
  getMonth,
  listEvents,
  getIcsUrl,
  createEvent,
  updateEvent,
  deleteEvent,
};


