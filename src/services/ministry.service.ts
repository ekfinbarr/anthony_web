/**
 * Ministry API Service
 *
 * Typed API for parish ministries (Serve Others) and groups/societies.
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

export type MinistryKind = 'service' | 'society';
export type JoiningMethod = 'online_eoi' | 'download' | 'coordinator' | 'parish_office';

export interface MinistryCategoryRef {
  id: string;
  name: string;
  slug?: string;
}

export interface MinistryResource {
  id: string;
  ministry_id: string;
  title: string;
  description?: string | null;
  url?: string | null;
  mime_type?: string | null;
  file_size?: number | null;
  original_filename?: string | null;
  sort_order: number;
  is_public: boolean;
}

export interface Ministry {
  id: string;
  name: string;
  slug: string;
  kind: MinistryKind;
  description?: string;
  short_description?: string | null;
  full_description?: string | null;
  mission?: string;
  vision?: string;
  is_active: boolean;
  accepting_members: boolean;
  is_featured: boolean;
  is_published?: boolean;
  leader_id?: string;
  category_id?: string;
  category_ids?: string[];
  category?: MinistryCategoryRef | null;
  categories?: MinistryCategoryRef[];
  leader?: { id?: string; name?: string } | null;
  contact_name?: string | null;
  contact_email?: string;
  contact_phone?: string;
  contact_instructions?: string | null;
  meeting_location?: string;
  meeting_schedule?: string | Record<string, unknown> | null;
  activities?: string | string[] | Record<string, unknown> | null;
  requirements?: string;
  eligibility?: string | null;
  joining_instructions?: string | null;
  joining_methods?: JoiningMethod[];
  image?: string;
  seo_title?: string | null;
  seo_description?: string | null;
  sort_order: number;
  status: 'active' | 'inactive' | 'suspended';
  published_at?: string | null;
  resources?: MinistryResource[];
  created_at: string;
  updated_at: string;
}

export interface CreateMinistryPayload {
  name: string;
  slug?: string;
  kind?: MinistryKind;
  description?: string;
  short_description?: string;
  full_description?: string;
  mission?: string;
  vision?: string;
  leader_id?: string;
  category_id?: string;
  category_ids?: string[];
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_instructions?: string;
  meeting_location?: string;
  meeting_schedule?: string | Record<string, unknown> | null;
  activities?: string | string[] | Record<string, unknown> | null;
  requirements?: string;
  eligibility?: string;
  joining_instructions?: string;
  joining_methods?: JoiningMethod[];
  image?: string;
  seo_title?: string;
  seo_description?: string;
  is_active?: boolean;
  is_featured?: boolean;
  accepting_members?: boolean;
  sort_order?: number;
  status?: 'active' | 'inactive' | 'suspended';
  published_at?: string | null;
}

export type UpdateMinistryPayload = Partial<CreateMinistryPayload>;

export interface MinistryQueryParams {
  page?: number;
  per_page?: number;
  is_active?: boolean;
  accepting_members?: boolean;
  is_featured?: boolean;
  search?: string;
  kind?: MinistryKind;
  category?: string;
  category_id?: string;
  category_slug?: string;
  sort?: 'name' | 'sort_order' | 'published_at';
  direction?: 'asc' | 'desc';
  status?: string;
  include_unpublished?: boolean;
  [key: string]: string | number | boolean | undefined;
}

type MinistryListResponse = {
  data: Ministry[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
};

function normalizeList(raw: MinistryListResponse): PaginatedResponse<Ministry> {
  const meta = raw.meta;
  return {
    data: raw.data ?? [],
    current_page: meta?.current_page ?? raw.current_page ?? 1,
    last_page: meta?.last_page ?? raw.last_page ?? 1,
    per_page: meta?.per_page ?? raw.per_page ?? 15,
    total: meta?.total ?? raw.total ?? (raw.data?.length ?? 0),
    from: 0,
    to: 0,
  };
}

export const list = async (params?: MinistryQueryParams): Promise<PaginatedResponse<Ministry>> => {
  const response = await apiClient.get<MinistryListResponse>('ministries', params);
  return normalizeList(response.data);
};

/** Admin list including drafts/unpublished. */
export const listAdmin = async (params?: MinistryQueryParams): Promise<PaginatedResponse<Ministry>> => {
  return list({ ...params, include_unpublished: true });
};

export const listPublished = async (params?: MinistryQueryParams): Promise<PaginatedResponse<Ministry>> => {
  return list(params);
};

export const getById = async (id: string, admin = false): Promise<{ data: Ministry }> => {
  const response = await apiClient.get<{ data: Ministry }>(`ministries/${id}`, admin ? { admin: true } : undefined);
  return response.data;
};

export const getBySlug = async (
  slug: string
): Promise<{ data: Ministry; related?: Ministry[] }> => {
  const response = await apiClient.get<{ data: Ministry; related?: Ministry[] }>(
    `ministries/by-slug/${encodeURIComponent(slug)}`
  );
  return response.data;
};

export const create = async (payload: CreateMinistryPayload): Promise<{ data: Ministry }> => {
  const response = await apiClient.post<{ data: Ministry }>('ministries', payload);
  return response.data;
};

export const update = async (
  id: string,
  payload: UpdateMinistryPayload
): Promise<{ data: Ministry }> => {
  const response = await apiClient.put<{ data: Ministry }>(`ministries/${id}`, payload);
  return response.data;
};

export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`ministries/${id}`);
};

export const getActive = async (params?: MinistryQueryParams): Promise<PaginatedResponse<Ministry>> => {
  const response = await apiClient.get<MinistryListResponse>('ministries/active', params);
  return normalizeList(response.data);
};

export const getAcceptingMembers = async (
  params?: MinistryQueryParams
): Promise<PaginatedResponse<Ministry>> => {
  const response = await apiClient.get<MinistryListResponse>('ministries/accepting-members', params);
  return normalizeList(response.data);
};

export const getStatistics = async (id: string): Promise<unknown> => {
  const response = await apiClient.get<{ data: unknown }>(`ministries/${id}/statistics`);
  return response.data?.data ?? response.data;
};

export const listResources = async (ministryId: string): Promise<MinistryResource[]> => {
  const response = await apiClient.get<{ data: MinistryResource[] }>(
    `ministries/${ministryId}/resources`
  );
  return response.data.data ?? [];
};

export const addResource = async (
  ministryId: string,
  formData: FormData
): Promise<MinistryResource> => {
  const response = await apiClient.postForm<{ data: MinistryResource }>(
    `ministries/${ministryId}/resources`,
    formData
  );
  return response.data.data;
};

export const updateResource = async (
  ministryId: string,
  resourceId: string,
  payload: Partial<Pick<MinistryResource, 'title' | 'description' | 'sort_order' | 'is_public' | 'url'>>
): Promise<MinistryResource> => {
  const response = await apiClient.put<{ data: MinistryResource }>(
    `ministries/${ministryId}/resources/${resourceId}`,
    payload
  );
  return response.data.data;
};

export const removeResource = async (ministryId: string, resourceId: string): Promise<void> => {
  await apiClient.delete(`ministries/${ministryId}/resources/${resourceId}`);
};

const ministryService = {
  list,
  listAdmin,
  listPublished,
  getById,
  getBySlug,
  create,
  update,
  remove,
  getActive,
  getAcceptingMembers,
  getStatistics,
  listResources,
  addResource,
  updateResource,
  removeResource,
};

export default ministryService;
