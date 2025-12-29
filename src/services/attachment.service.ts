/**
 * Attachment API Service
 * 
 * Provides typed API methods for managing file attachments.
 * Handles file uploads, downloads, and storage management.
 * 
 * @package Lovable/src/services
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

/**
 * Attachment Model
 */
export interface Attachment {
  id: string;
  filename: string;
  filepath: string;
  filetype: string;
  filesize: number;
  uploaded_by: string;
  related_type: string;
  related_id: string;
  created_at: string;
  updated_at: string;
}

/**
 * Create Attachment Payload (for file upload)
 */
export interface CreateAttachmentPayload {
  file: File;
  related_type: string;
  related_id: string;
}

/**
 * Query Parameters
 */
export interface AttachmentQueryParams {
  page?: number;
  per_page?: number;
  related_type?: string;
  related_id?: string;
  filetype?: string;
  search?: string;
}

/**
 * List attachments with optional filtering
 * 
 * @param params Query parameters
 * @returns Paginated list of attachments
 */
export const list = async (
  params?: AttachmentQueryParams
): Promise<PaginatedResponse<Attachment>> => {
  // Convert params to a Record<string, string | number | boolean>
  const queryParams: Record<string, string | number | boolean> = {};
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (typeof value !== 'undefined' && value !== null) {
        queryParams[key] = value;
      }
    });
  }
  const response = await apiClient.get<PaginatedResponse<Attachment>>('attachments', queryParams);
  return response.data;
};

/* Get attachment by ID
 * 
 * @param id Attachment ID
 * @returns Attachment details
 */
export const getById = async (id: string): Promise<Attachment> => {
  const response = await apiClient.get<Attachment>(`attachments/${id}`);
  return response.data;
};

/**
 * Upload a new attachment
 * 
 * @param payload Attachment data with file
 * @returns Created attachment
 */
export const create = async (payload: CreateAttachmentPayload): Promise<Attachment> => {
  const formData = new FormData();
  formData.append('file', payload.file);
  formData.append('related_type', payload.related_type);
  formData.append('related_id', payload.related_id);

  // Use fetch directly for file uploads
  const token = localStorage.getItem('church_user')
    ? JSON.parse(localStorage.getItem('church_user') || '{}').token
    : null;

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
  const response = await fetch(`${API_BASE_URL}/attachments`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload attachment');
  }

  const data = await response.json();
  return data;
};

/**
 * Delete an attachment
 * 
 * @param id Attachment ID
 */
export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`attachments/${id}`);
};

/**
 * Get attachment URL
 * 
 * @param id Attachment ID
 * @param temporary Generate temporary signed URL
 * @returns Attachment URL
 */
export const getUrl = async (id: string, temporary: boolean = false): Promise<string> => {
  const response = await apiClient.get<{ url: string }>(`attachments/${id}/url`, { temporary });
  return response.data.url;
};

/**
 * Get attachments by related entity
 * 
 * @param relatedType Related entity type
 * @param relatedId Related entity ID
 * @returns List of attachments
 */
export const getByRelated = async (
  relatedType: string,
  relatedId: string
): Promise<Attachment[]> => {
  const response = await apiClient.get<Attachment[]>('attachments/related', {
    related_type: relatedType,
    related_id: relatedId,
  });
  return response.data;
};

/**
 * Get attachments by uploader
 * 
 * @param uploadedBy Uploader user ID
 * @param params Query parameters
 * @returns Paginated list of attachments
 */
export const getByUploader = async (
  uploadedBy: string,
  params?: Record<string, string | number | boolean>
): Promise<PaginatedResponse<Attachment>> => {
  const response = await apiClient.get<PaginatedResponse<Attachment>>(
    'attachments/uploader/' + uploadedBy,
    params
  );
  return response.data;
};

// Export all functions as default object
const attachmentService = {
  list,
  getById,
  create,
  remove,
  getUrl,
  getByRelated,
  getByUploader,
};

export default attachmentService;

