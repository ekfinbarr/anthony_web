/**
 * Attachment API Service
 * 
 * Provides typed API methods for managing file attachments.
 * Handles file uploads, downloads, and storage management.
 * 
 * @package Lovable/src/services
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

type UnknownRecord = Record<string, unknown>;
const isRecord = (v: unknown): v is UnknownRecord => typeof v === "object" && v !== null;

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
 * Backend response shape for uploads.
 *
 * NOTE:
 * The Laravel controller returns:
 *   { message: string, data: AttachmentResource }
 * but some call sites historically treated uploads as returning the raw Attachment.
 * We support BOTH shapes to keep this service reusable without breaking older code.
 */
export interface UploadAttachmentResponse {
  message: string;
  data: Attachment;
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

  // Use apiClient so uploads share the same baseURL/auth/error handling as the rest of the app.
  // Backend usually returns: { message: string, data: Attachment }
  // Some call sites historically treated uploads as returning the raw Attachment.
  const response = await apiClient.postForm<UploadAttachmentResponse | Attachment>("attachments", formData);
  const data = response.data as unknown;

  // If the upload endpoint returns HTML, it almost always means you're hitting the frontend server,
  // not the Laravel API (missing Vite proxy or wrong VITE_API_BASE_URL).
  if (typeof data === "string") {
    const text = data.trim();
    if (text.startsWith("<!doctype") || text.startsWith("<html") || text.includes("/@vite/client")) {
      throw new Error(
        "Upload endpoint returned HTML instead of JSON. Check your API base URL / dev proxy (VITE_API_BASE_URL should point to the Laravel /api)."
      );
    }
    throw new Error("Upload failed: unexpected non-JSON response from server.");
  }

  // Normalize to a single return shape (Attachment).
  const maybe = data as UnknownRecord;
  const attachment = (maybe?.data as Attachment | undefined) ?? (data as Attachment | undefined);
  const attachmentId = (attachment as { id?: unknown } | undefined)?.id;
  if (!attachment || typeof attachmentId !== "string" || !attachmentId) {
    throw new Error("Upload succeeded but server response did not include an attachment record.");
  }

  return attachment;
};

/**
 * Extract an attachment id from any known upload response shape.
 *
 * Supported:
 * - { id: "..." }
 * - { data: { id: "..." } }
 */
export const extractAttachmentId = (uploadResponse: unknown): string | null => {
  if (!uploadResponse || typeof uploadResponse !== "object") return null;
  const r = uploadResponse as UnknownRecord;
  if (typeof r.id === "string" && r.id) return r.id;
  const inner = r.data as UnknownRecord | undefined;
  if (inner && typeof inner.id === "string" && inner.id) return inner.id;
  return null;
};

/**
 * High-level helper: upload a file AND immediately resolve its final URL.
 *
 * This is the recommended function for UI components (modals/forms),
 * because most screens need the public URL, not just the attachment record.
 */
export const uploadAndGetUrl = async (
  payload: CreateAttachmentPayload,
  options?: { temporary?: boolean }
): Promise<{ url: string; attachmentId: string; attachment?: Attachment }> => {
  const uploadRes = (await create(payload)) as unknown;
  const attachmentId = extractAttachmentId(uploadRes);

  if (!attachmentId) {
    // Try to surface a meaningful backend error if present.
    if (isRecord(uploadRes) && typeof uploadRes.message === "string" && uploadRes.message) {
      throw new Error(uploadRes.message);
    }
    throw new Error("Upload succeeded but no attachment id was returned.");
  }

  const url = await getUrl(attachmentId, options?.temporary ?? false);

  // Provide the attachment record if available (best-effort).
  const attachment = (() => {
    if (!isRecord(uploadRes)) return undefined;
    if (typeof uploadRes.id === "string") return uploadRes as unknown as Attachment;
    if (isRecord(uploadRes.data) && typeof uploadRes.data.id === "string") {
      return uploadRes.data as unknown as Attachment;
    }
    return undefined;
  })();

  return { url, attachmentId, attachment };
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
  // Convenience helper for UI layers
  uploadAndGetUrl,
};

export default attachmentService;

