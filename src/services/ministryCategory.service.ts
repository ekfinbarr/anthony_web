/**
 * Ministry Category API Service
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

export interface MinistryCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  is_active: boolean;
  sort_order?: number;
  archived_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMinistryCategoryPayload {
  name: string;
  description?: string;
  image?: string;
  is_active?: boolean;
  sort_order?: number;
}

export type UpdateMinistryCategoryPayload = Partial<CreateMinistryCategoryPayload> & {
  archive?: boolean;
};

export interface MinistryCategoryQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  is_active?: boolean;
  kind?: 'service' | 'society';
  include_archived?: boolean;
}

type ListResponse = {
  data: MinistryCategory[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

function normalize(raw: ListResponse | MinistryCategory[]): PaginatedResponse<MinistryCategory> {
  if (Array.isArray(raw)) {
    return {
      data: raw,
      current_page: 1,
      last_page: 1,
      per_page: raw.length,
      total: raw.length,
      from: 0,
      to: 0,
    };
  }
  return {
    data: raw.data ?? [],
    current_page: raw.meta?.current_page ?? 1,
    last_page: raw.meta?.last_page ?? 1,
    per_page: raw.meta?.per_page ?? 50,
    total: raw.meta?.total ?? (raw.data?.length ?? 0),
    from: 0,
    to: 0,
  };
}

export const list = async (
  params?: MinistryCategoryQueryParams
): Promise<PaginatedResponse<MinistryCategory>> => {
  const response = await apiClient.get<ListResponse>('ministry-categories', params as Record<string, string | number | boolean | undefined>);
  return normalize(response.data);
};

export const getActive = async (kind?: 'service' | 'society'): Promise<PaginatedResponse<MinistryCategory>> => {
  const response = await apiClient.get<{ data: MinistryCategory[] }>('ministry-categories/active', kind ? { kind } : undefined);
  return normalize(response.data.data ?? []);
};

export const getById = async (id: string): Promise<{ data: MinistryCategory }> => {
  const response = await apiClient.get<{ data: MinistryCategory }>(`ministry-categories/${id}`);
  return response.data;
};

export const create = async (
  payload: CreateMinistryCategoryPayload
): Promise<{ data: MinistryCategory }> => {
  const response = await apiClient.post<{ data: MinistryCategory }>('ministry-categories', payload);
  return response.data;
};

export const update = async (
  id: string,
  payload: UpdateMinistryCategoryPayload
): Promise<{ data: MinistryCategory }> => {
  const response = await apiClient.put<{ data: MinistryCategory }>(`ministry-categories/${id}`, payload);
  return response.data;
};

export const reorder = async (
  items: { id: string; sort_order: number }[]
): Promise<{ data: MinistryCategory[] }> => {
  const response = await apiClient.post<{ data: MinistryCategory[]; message: string }>(
    'ministry-categories/reorder',
    { items }
  );
  return response.data;
};

export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`ministry-categories/${id}`);
};

const ministryCategoryService = {
  list,
  getActive,
  getById,
  create,
  update,
  reorder,
  remove,
};

export default ministryCategoryService;
