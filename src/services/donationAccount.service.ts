import { apiClient } from "../lib/apiClient";

export interface DonationAccount {
  id: string;
  name: string;
  purpose: 'tithe' | 'building' | 'charity' | 'daily' | 'caritas' | 'general';
  description?: string | null;
  bank_name: string;
  account_name: string;
  account_number: string;
  currency: string;
  instructions?: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface LaravelMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface LaravelResourceResponse<T> {
  data: T;
}

export interface LaravelCollectionResponse<T> {
  data: T[];
  meta?: LaravelMeta;
}

export const listActive = async (): Promise<LaravelCollectionResponse<DonationAccount>> => {
  const response = await apiClient.get<LaravelCollectionResponse<DonationAccount>>("donation-accounts");
  return response.data;
};

export const listAll = async (params?: Record<string, string | number | boolean>): Promise<LaravelCollectionResponse<DonationAccount>> => {
  const response = await apiClient.get<LaravelCollectionResponse<DonationAccount>>("donation-accounts/all", params);
  return response.data;
};

export const create = async (data: Partial<DonationAccount>): Promise<LaravelResourceResponse<DonationAccount>> => {
  const response = await apiClient.post<LaravelResourceResponse<DonationAccount>>("donation-accounts", data);
  return response.data;
};

export const update = async (id: string, data: Partial<DonationAccount>): Promise<LaravelResourceResponse<DonationAccount>> => {
  const response = await apiClient.put<LaravelResourceResponse<DonationAccount>>(`donation-accounts/${id}`, data);
  return response.data;
};

export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`donation-accounts/${id}`);
};

export default {
  listActive,
  listAll,
  create,
  update,
  remove,
};
