import { apiClient } from "@/lib/apiClient";

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
  meta?: Record<string, unknown> | null;
  read_at?: string | null;
  created_at?: string;
}

export interface AdminNotificationList {
  data: AdminNotification[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    unread_count: number;
  };
}

export const list = async (params?: {
  per_page?: number;
  unread_only?: boolean;
}): Promise<AdminNotificationList> => {
  const res = await apiClient.get<AdminNotificationList>("admin/notifications", params);
  return res.data;
};

export const unreadCount = async (): Promise<number> => {
  const res = await apiClient.get<{ data: { unread_count: number } }>(
    "admin/notifications/unread-count"
  );
  return res.data.data.unread_count;
};

export const markRead = async (id: string) => {
  const res = await apiClient.post(`admin/notifications/${id}/read`);
  return res.data;
};

export const markAllRead = async () => {
  const res = await apiClient.post("admin/notifications/mark-all-read");
  return res.data;
};

export default { list, unreadCount, markRead, markAllRead };
