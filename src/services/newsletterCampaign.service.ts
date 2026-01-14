/**
 * Newsletter Campaign API (Admin)
 *
 * Backend routes:
 * - GET    /api/newsletter-campaigns
 * - POST   /api/newsletter-campaigns
 * - GET    /api/newsletter-campaigns/{id}
 * - PUT    /api/newsletter-campaigns/{id}
 * - DELETE /api/newsletter-campaigns/{id}
 * - POST   /api/newsletter-campaigns/{id}/queue
 * - POST   /api/newsletter-campaigns/{id}/send
 * - GET    /api/newsletter-campaigns/{id}/stats
 */

import { apiClient } from "@/lib/apiClient";

export interface NewsletterCampaign {
  id: string;
  name: string;
  subject: string;
  status: "draft" | "queued" | "sending" | "sent" | "cancelled";
  /**
   * Campaign content.
   *
   * NOTE:
   * Backend includes these fields on the "show" endpoint (and optionally when requested),
   * but may omit them on list responses for performance.
   */
  html_content?: string;
  plain_content?: string | null;
  scheduled_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface LaravelResourceCollection<T> {
  data: T[];
}

export interface NewsletterStats {
  total: number;
  pending: number;
  sent: number;
  failed: number;
  skipped: number;
}

export const listCampaigns = async (): Promise<LaravelResourceCollection<NewsletterCampaign>> => {
  const response = await apiClient.get<LaravelResourceCollection<NewsletterCampaign>>("newsletter-campaigns");
  return response.data;
};

export const getCampaign = async (id: string): Promise<{ data: NewsletterCampaign }> => {
  const response = await apiClient.get<{ data: NewsletterCampaign }>(`newsletter-campaigns/${id}`);
  return response.data;
};

export const createCampaign = async (payload: {
  name: string;
  subject: string;
  html_content: string;
  plain_content?: string;
}) => {
  const response = await apiClient.post("newsletter-campaigns", payload);
  return response.data;
};

export const updateCampaign = async (
  id: string,
  payload: Partial<{
    name: string;
    subject: string;
    html_content: string;
    plain_content: string | null;
    status: NewsletterCampaign["status"];
  }>
) => {
  const response = await apiClient.put(`newsletter-campaigns/${id}`, payload);
  return response.data;
};

export const queueCampaign = async (id: string) => {
  const response = await apiClient.post(`newsletter-campaigns/${id}/queue`, {});
  return response.data;
};

export const sendCampaignNow = async (id: string) => {
  const response = await apiClient.post(`newsletter-campaigns/${id}/send`, {});
  return response.data;
};

export const getCampaignStats = async (id: string): Promise<{ data: NewsletterStats }> => {
  const response = await apiClient.get<{ data: NewsletterStats }>(`newsletter-campaigns/${id}/stats`);
  return response.data;
};

export default {
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  queueCampaign,
  sendCampaignNow,
  getCampaignStats,
};


