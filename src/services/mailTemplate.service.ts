/**
 * Mail Template API Service
 * 
 * Provides typed API methods for managing email templates.
 * Handles CRUD operations and template activation.
 * 
 * @package Lovable/src/services
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

/**
 * Mail Template Model
 */
export interface MailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  plain_content?: string;
  required_variables?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

/**
 * Create Mail Template Payload
 */
export interface CreateMailTemplatePayload {
  name: string;
  subject: string;
  html_content: string;
  plain_content?: string;
  required_variables?: string[];
  is_active?: boolean;
}

/**
 * Update Mail Template Payload
 */
export interface UpdateMailTemplatePayload extends Partial<CreateMailTemplatePayload> {}

/**
 * Query Parameters
 */
export interface MailTemplateQueryParams {
  page?: number;
  per_page?: number;
  is_active?: boolean;
  search?: string;
}

/**
 * List mail templates with optional filtering
 * 
 * @param params Query parameters
 * @returns Paginated list of mail templates
 */
export const list = async (
  params?: MailTemplateQueryParams
): Promise<PaginatedResponse<MailTemplate>> => {
  const response = await apiClient.get<PaginatedResponse<MailTemplate>>('mail-templates', params);
  return response.data;
};

/**
 * Get mail template by ID
 * 
 * @param id Mail Template ID
 * @returns Mail template details
 */
export const getById = async (id: string): Promise<MailTemplate> => {
  const response = await apiClient.get<MailTemplate>(`mail-templates/${id}`);
  return response.data;
};

/**
 * Create a new mail template
 * 
 * @param payload Mail template data
 * @returns Created mail template
 */
export const create = async (payload: CreateMailTemplatePayload): Promise<MailTemplate> => {
  const response = await apiClient.post<MailTemplate>('mail-templates', payload);
  return response.data;
};

/**
 * Update a mail template
 * 
 * @param id Mail Template ID
 * @param payload Updated mail template data
 * @returns Updated mail template
 */
export const update = async (
  id: string,
  payload: UpdateMailTemplatePayload
): Promise<MailTemplate> => {
  const response = await apiClient.put<MailTemplate>(`mail-templates/${id}`, payload);
  return response.data;
};

/**
 * Delete a mail template
 * 
 * @param id Mail Template ID
 */
export const remove = async (id: string): Promise<void> => {
  await apiClient.delete(`mail-templates/${id}`);
};

/**
 * Get active mail templates
 * 
 * @returns List of active mail templates
 */
export const getActive = async (): Promise<MailTemplate[]> => {
  const response = await apiClient.get<MailTemplate[]>('mail-templates/active');
  return response.data;
};

/**
 * Get mail template by name
 * 
 * @param name Template name
 * @returns Mail template
 */
export const getByName = async (name: string): Promise<MailTemplate> => {
  const response = await apiClient.get<MailTemplate>(`mail-templates/name/${name}`);
  return response.data;
};

/**
 * Activate a mail template
 * 
 * @param id Mail Template ID
 * @returns Activated mail template
 */
export const activate = async (id: string): Promise<MailTemplate> => {
  const response = await apiClient.post<MailTemplate>(`mail-templates/${id}/activate`);
  return response.data;
};

/**
 * Deactivate a mail template
 * 
 * @param id Mail Template ID
 * @returns Deactivated mail template
 */
export const deactivate = async (id: string): Promise<MailTemplate> => {
  const response = await apiClient.post<MailTemplate>(`mail-templates/${id}/deactivate`);
  return response.data;
};

// Export all functions as default object
const mailTemplateService = {
  list,
  getById,
  create,
  update,
  remove,
  getActive,
  getByName,
  activate,
  deactivate,
};

export default mailTemplateService;

