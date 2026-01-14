/**
 * Contact Message (Admin) API Service
 *
 * Backend routes (AnthonyServer):
 * - Admin: GET    /api/contact-messages
 * - Admin: GET    /api/contact-messages/{id}
 * - Admin: DELETE /api/contact-messages/{id}
 * - Admin: POST   /api/contact-messages/{id}/mark-read
 * - Admin: POST   /api/contact-messages/{id}/reply
 * - Admin: GET    /api/contact-messages/stats
 */

import { apiClient, PaginatedResponse } from "@/lib/apiClient";

export type ContactMessageStatus = "new" | "read" | "replied" | "resolved" | "archived";
export type ContactMessageType = "general" | "prayer_request" | "complaint" | "suggestion" | "inquiry";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  status: ContactMessageStatus;
  type: ContactMessageType;
  is_read?: boolean;
  read_at?: string | null;
  replied_at?: string | null;
  assigned_to?: string | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
  assigned_user?: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface ContactMessageQueryParams {
  page?: number;
  per_page?: number;
  status?: ContactMessageStatus;
  type?: ContactMessageType;
  assigned_to?: string;
  search?: string;
}

export interface ReplyContactMessagePayload {
  reply_message: string;
  reply_subject?: string;
}

export interface ContactMessageStats {
  total_messages: number;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  recent: {
    today: number;
    week: number;
    month: number;
  };
  response_time: {
    avg_hours: number | null;
  };
  unread_count: number;
}

export const list = async (params?: ContactMessageQueryParams): Promise<PaginatedResponse<ContactMessage>> => {
  const res = await apiClient.get<PaginatedResponse<ContactMessage>>("contact-messages", params);
  return res.data;
};

export const getById = async (id: string): Promise<{ data: ContactMessage }> => {
  const res = await apiClient.get<{ data: ContactMessage }>(`contact-messages/${id}`);
  return res.data;
};

export const remove = async (id: string): Promise<{ message: string }> => {
  const res = await apiClient.delete<{ message: string }>(`contact-messages/${id}`);
  return res.data;
};

export const markRead = async (id: string): Promise<{ message: string; data: ContactMessage }> => {
  const res = await apiClient.post<{ message: string; data: ContactMessage }>(`contact-messages/${id}/mark-read`, {});
  return res.data;
};

export const reply = async (
  id: string,
  payload: ReplyContactMessagePayload
): Promise<{ message: string; data: ContactMessage }> => {
  const res = await apiClient.post<{ message: string; data: ContactMessage }>(`contact-messages/${id}/reply`, payload);
  return res.data;
};

export const stats = async (): Promise<{ data: ContactMessageStats }> => {
  const res = await apiClient.get<{ data: ContactMessageStats }>("contact-messages/stats");
  return res.data;
};

export default {
  list,
  getById,
  remove,
  markRead,
  reply,
  stats,
};


