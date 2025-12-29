/**
 * Mail Track API Service
 * 
 * Provides typed API methods for managing email delivery tracking.
 * Handles tracking queries and statistics.
 * 
 * @package Lovable/src/services
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

/**
 * Mail Track Model
 */
export interface MailTrack {
  id: string;
  message_id: string;
  recipient: string;
  subject: string;
  status: string;
  queued_at?: string | null;
  sent_at?: string | null;
  delivered_at?: string | null;
  opened_at?: string | null;
  clicked_at?: string | null;
  bounced_at?: string | null;
  complained_at?: string | null;
  unsubscribed_at?: string | null;
  failed_at?: string | null;
  error_message?: string | null;
  bounce_reason?: string | null;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Query Parameters
 */
export interface MailTrackQueryParams {
  page?: number;
  per_page?: number;
  status?: string;
  recipient?: string;
  start_date?: string;
  end_date?: string;
}

/**
 * Delivery Statistics
 */
export interface DeliveryStatistics {
  total: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
}

/**
 * List mail tracks with optional filtering
 * 
 * @param params Query parameters
 * @returns Paginated list of mail tracks
 */
export const list = async (params?: MailTrackQueryParams): Promise<PaginatedResponse<MailTrack>> => {
  const response = await apiClient.get<PaginatedResponse<MailTrack>>('mail-tracks', params);
  return response.data;
};

/**
 * Get mail track by ID
 * 
 * @param id Mail Track ID
 * @returns Mail track details
 */
export const getById = async (id: string): Promise<MailTrack> => {
  const response = await apiClient.get<MailTrack>(`mail-tracks/${id}`);
  return response.data;
};

/**
 * Get mail tracks by status
 * 
 * @param status Track status
 * @param params Query parameters
 * @returns Paginated list of mail tracks
 */
export const getByStatus = async (
  status: string,
  params?: MailTrackQueryParams
): Promise<PaginatedResponse<MailTrack>> => {
  const response = await apiClient.get<PaginatedResponse<MailTrack>>(
    `mail-tracks/status/${status}`,
    params
  );
  return response.data;
};

/**
 * Get mail tracks by recipient
 * 
 * @param recipient Recipient email
 * @param params Query parameters
 * @returns Paginated list of mail tracks
 */
export const getByRecipient = async (
  recipient: string,
  params?: MailTrackQueryParams
): Promise<PaginatedResponse<MailTrack>> => {
  const response = await apiClient.get<PaginatedResponse<MailTrack>>(
    `mail-tracks/recipient/${recipient}`,
    params
  );
  return response.data;
};

/**
 * Get failed mail tracks
 * 
 * @param params Query parameters
 * @returns Paginated list of failed mail tracks
 */
export const getFailed = async (params?: MailTrackQueryParams): Promise<PaginatedResponse<MailTrack>> => {
  const response = await apiClient.get<PaginatedResponse<MailTrack>>('mail-tracks/failed', params);
  return response.data;
};

/**
 * Get delivery statistics
 * 
 * @param startDate Start date (optional)
 * @param endDate End date (optional)
 * @returns Delivery statistics
 */
export const getStatistics = async (
  startDate?: string,
  endDate?: string
): Promise<DeliveryStatistics> => {
  const response = await apiClient.get<DeliveryStatistics>('mail-tracks/statistics', {
    start_date: startDate,
    end_date: endDate,
  });
  return response.data;
};

// Export all functions as default object
const mailTrackService = {
  list,
  getById,
  getByStatus,
  getByRecipient,
  getFailed,
  getStatistics,
};

export default mailTrackService;

