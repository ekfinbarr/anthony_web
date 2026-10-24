/**
 * Livestream API Service
 *
 * Typed API methods for church livestreams: scheduling, live status, recordings.
 */

import { apiClient, PaginatedResponse } from "../lib/apiClient";

export type LivestreamStatus =
  | "scheduled"
  | "live"
  | "ended"
  | "cancelled"
  | "unavailable";

export type LivestreamPlatform =
  | "youtube"
  | "facebook"
  | "tiktok"
  | "twitch"
  | "instagram"
  | "twitter"
  | "rumble"
  | "bitchute"
  | "brighteon"
  | "odysee"
  | "peerTube"
  | "others"
  | "vimeo";

export interface Livestream {
  id: string;
  title: string;
  description: string | null;
  platform: LivestreamPlatform;
  platform_video_id: string | null;
  recorded_url: string | null;
  thumbnail_url: string | null;
  embed_html: string | null;
  scheduled_start_time: string | null;
  actual_start_time: string | null;
  end_time: string | null;
  is_live: boolean;
  status: LivestreamStatus;
  is_published: boolean;
  created_by: string | null;
  created_by_name?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateLivestreamPayload {
  title: string;
  description?: string;
  platform: LivestreamPlatform;
  platform_video_id?: string;
  recorded_url?: string | null;
  thumbnail_url?: string | null;
  embed_html?: string;
  scheduled_start_time?: string;
  actual_start_time?: string;
  end_time?: string;
  is_live?: boolean;
  status?: LivestreamStatus;
  is_published?: boolean;
}

export type UpdateLivestreamPayload = Partial<CreateLivestreamPayload>;

export interface LivestreamQueryParams {
  page?: number;
  per_page?: number;
  is_live?: boolean;
  status?: LivestreamStatus;
  is_published?: boolean;
  search?: string;
  platform?: string;
  recordings_only?: boolean;
}

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function normalizePaginated<T>(payload: unknown): PaginatedResponse<T> {
  if (!payload || typeof payload !== "object") {
    return { data: [], current_page: 1, last_page: 1, per_page: 15, total: 0, from: 0, to: 0 };
  }
  const body = payload as Record<string, unknown>;
  const meta = (body.meta as Record<string, number> | undefined) ?? body;
  const data = Array.isArray(body.data) ? (body.data as T[]) : [];
  return {
    data,
    current_page: Number(meta.current_page ?? 1),
    last_page: Number(meta.last_page ?? 1),
    per_page: Number(meta.per_page ?? (data.length || 15)),
    total: Number(meta.total ?? data.length),
    from: Number(meta.from ?? 0),
    to: Number(meta.to ?? data.length),
  };
}

export const list = async (params?: LivestreamQueryParams): Promise<PaginatedResponse<Livestream>> => {
  const response = await apiClient.get("livestreams", params);
  return normalizePaginated<Livestream>(response.data);
};

export const getById = async (id: string): Promise<Livestream> => {
  const response = await apiClient.get(`livestreams/${id}`);
  return unwrap<Livestream>(response.data);
};

export const create = async (payload: CreateLivestreamPayload): Promise<Livestream> => {
  const response = await apiClient.post("livestreams", payload);
  return unwrap<Livestream>(response.data);
};

export const update = async (id: string, payload: UpdateLivestreamPayload): Promise<Livestream> => {
  const response = await apiClient.put(`livestreams/${id}`, payload);
  return unwrap<Livestream>(response.data);
};

export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`livestreams/${id}`);
};

export const getCurrent = async (): Promise<Livestream | null> => {
  const response = await apiClient.get("livestreams/current");
  return unwrap<Livestream | null>(response.data);
};

export const getActive = async (): Promise<Livestream[]> => {
  const response = await apiClient.get("livestreams/active");
  const data = unwrap<Livestream[] | { data: Livestream[] }>(response.data);
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && Array.isArray((data as { data: Livestream[] }).data)) {
    return (data as { data: Livestream[] }).data;
  }
  return [];
};

export const getUpcoming = async (
  params?: LivestreamQueryParams
): Promise<PaginatedResponse<Livestream>> => {
  const response = await apiClient.get("livestreams/upcoming", params);
  return normalizePaginated<Livestream>(response.data);
};

export const getPast = async (
  params?: LivestreamQueryParams
): Promise<PaginatedResponse<Livestream>> => {
  const response = await apiClient.get("livestreams/past", {
    ...params,
    recordings_only: params?.recordings_only ?? true,
  });
  return normalizePaginated<Livestream>(response.data);
};

export const activate = async (id: string): Promise<Livestream> => {
  const response = await apiClient.post(`livestreams/${id}/activate`);
  return unwrap<Livestream>(response.data);
};

export const deactivate = async (id: string): Promise<Livestream> => {
  const response = await apiClient.post(`livestreams/${id}/deactivate`);
  return unwrap<Livestream>(response.data);
};

const livestreamService = {
  list,
  getById,
  create,
  update,
  remove,
  getCurrent,
  getActive,
  getUpcoming,
  getPast,
  activate,
  deactivate,
};

export default livestreamService;
