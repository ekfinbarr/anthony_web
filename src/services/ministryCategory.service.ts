/**
 * Ministry Category API Service
 * 
 * Provides typed API methods for managing ministry categories.
 * 
 * @package Lovable/src/services
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

export interface MinistryCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface CreateMinistryCategoryPayload {
    name: string;
    description?: string;
    image?: string;
    is_active?: boolean;
}

export type UpdateMinistryCategoryPayload = Partial<CreateMinistryCategoryPayload>;

export interface MinistryCategoryQueryParams {
    page?: number;
    per_page?: number;
    search?: string;
    is_active?: boolean;
}

export const list = async (params?: MinistryCategoryQueryParams): Promise<PaginatedResponse<MinistryCategory>> => {
    const response = await apiClient.get<PaginatedResponse<MinistryCategory>>('ministry-categories', params);
    return response.data;
};

export const getActive = async (): Promise<PaginatedResponse<MinistryCategory>> => {
    const response = await apiClient.get<PaginatedResponse<MinistryCategory>>('ministry-categories/active');
    return response.data;
};

export const getById = async (id: string): Promise<MinistryCategory> => {
    const response = await apiClient.get<MinistryCategory>(`ministry-categories/${id}`);
    return response.data;
};

export const create = async (payload: CreateMinistryCategoryPayload): Promise<MinistryCategory> => {
    const response = await apiClient.post<MinistryCategory>('ministry-categories', payload);
    return response.data;
};

export const update = async (id: string, payload: UpdateMinistryCategoryPayload): Promise<MinistryCategory> => {
    const response = await apiClient.put<MinistryCategory>(`ministry-categories/${id}`, payload);
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
    remove,
};

export default ministryCategoryService;
