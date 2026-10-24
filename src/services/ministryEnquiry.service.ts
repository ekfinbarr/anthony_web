/**
 * Ministry Expression-of-Interest (guest enquiry) API service.
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

export type EnquiryStatus = 'new' | 'read' | 'archived';

export interface MinistryEnquiry {
  id: string;
  ministry_id?: string | null;
  ministry?: { id: string; name: string; slug: string; kind?: string } | null;
  full_name: string;
  email: string;
  phone?: string | null;
  message?: string | null;
  privacy_consent: boolean;
  status: EnquiryStatus;
  read_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateEnquiryPayload {
  ministry_id?: string;
  full_name: string;
  email: string;
  phone?: string;
  message?: string;
  privacy_consent: boolean;
}

export interface EnquiryQueryParams {
  page?: number;
  per_page?: number;
  status?: EnquiryStatus;
  ministry_id?: string;
  search?: string;
}

type ListResponse = {
  data: MinistryEnquiry[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

function normalize(raw: ListResponse): PaginatedResponse<MinistryEnquiry> {
  return {
    data: raw.data ?? [],
    current_page: raw.meta?.current_page ?? 1,
    last_page: raw.meta?.last_page ?? 1,
    per_page: raw.meta?.per_page ?? 20,
    total: raw.meta?.total ?? (raw.data?.length ?? 0),
    from: 0,
    to: 0,
  };
}

export const submit = async (
  payload: CreateEnquiryPayload
): Promise<{ message: string; data: { id: string } }> => {
  const response = await apiClient.post<{ message: string; data: { id: string } }>(
    'ministry-enquiries',
    payload
  );
  return response.data;
};

export const list = async (
  params?: EnquiryQueryParams
): Promise<PaginatedResponse<MinistryEnquiry>> => {
  const response = await apiClient.get<ListResponse>('ministry-enquiries', params as Record<string, string | number | boolean | undefined>);
  return normalize(response.data);
};

export const getById = async (id: string): Promise<{ data: MinistryEnquiry }> => {
  const response = await apiClient.get<{ data: MinistryEnquiry }>(`ministry-enquiries/${id}`);
  return response.data;
};

export const updateStatus = async (
  id: string,
  status: EnquiryStatus
): Promise<{ data: MinistryEnquiry }> => {
  const response = await apiClient.put<{ data: MinistryEnquiry }>(`ministry-enquiries/${id}`, {
    status,
  });
  return response.data;
};

export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`ministry-enquiries/${id}`);
};

const ministryEnquiryService = {
  submit,
  list,
  getById,
  updateStatus,
  remove,
};

export default ministryEnquiryService;
