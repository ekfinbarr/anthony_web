import { apiClient } from "@/lib/apiClient";
import type { BookingOrder } from "@/services/massBookingOrder.service";

/** Signed-in parishioner's own data (`/api/me/*`). */

export interface PageMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from?: number | null;
  to?: number | null;
}

export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

export type ListParams = Record<string, string | number | boolean | undefined>;

export interface MyDonation {
  id: string;
  reference: string;
  amount: number | string;
  currency: string;
  type: string;
  type_formatted?: string;
  status: "pending" | "successful" | "failed" | "cancelled" | string;
  status_formatted?: string;
  payment_gateway: string;
  is_recurring: boolean;
  recurrence_interval?: string;
  dedication?: string;
  memorial_for?: string;
  notes?: string;
  donation_date?: string;
  processed_at?: string;
  failure_reason?: string;
  created_at?: string;
}

export interface DonationSummary {
  total_given: number;
  given_this_year: number;
  successful_count: number;
  pending_count: number;
  currency: string;
}

export interface MyGroup {
  id: string;
  kind: "ministry" | "organization";
  group_id: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  image?: string | null;
  category?: string | null;
  meeting_schedule?: string | null;
  meeting_location?: string | null;
  role?: string | null;
  status: "pending" | "active" | "inactive" | "rejected" | string;
  joined_at?: string | null;
  url?: string | null;
}

export interface AccountNotification {
  id: string;
  type: string;
  title: string;
  body?: string | null;
  link?: string | null;
  read_at?: string | null;
  created_at?: string | null;
}

export interface AccountMessage {
  id: string;
  subject?: string | null;
  excerpt: string;
  type?: string | null;
  status: "sent" | "read" | "replied";
  sent_at?: string | null;
  replied_at?: string | null;
}

export interface ActivityItem {
  type: "mass_booking" | "donation" | "group" | "message";
  title: string;
  description?: string | null;
  status?: string | null;
  amount?: number | null;
  currency?: string | null;
  at: string;
  link?: string | null;
}

export interface AccountOverview {
  profile: {
    name: string;
    email: string;
    phone?: string | null;
    avatar?: string | null;
    address?: string | null;
    member_since?: string | null;
    email_verified: boolean;
    parishioner: { membership_number?: string | null; membership_date?: string | null; family_name?: string | null } | null;
    completeness: number;
    missing: string[];
  };
  stats: {
    upcoming_masses: number;
    mass_bookings: number;
    groups_active: number;
    groups_pending: number;
    unread_notifications: number;
    donations: DonationSummary;
  };
  upcoming_masses: Array<{
    id: string;
    order_id: string;
    date: string;
    time?: string | null;
    mass?: string | null;
    intention: string;
    beneficiary?: string | null;
    status: string;
  }>;
  recent_activity: ActivityItem[];
  notifications: AccountNotification[];
  messages: AccountMessage[];
  announcements: Array<{ id: string; title: string; excerpt: string; published_at?: string | null }>;
}

export const getOverview = async (): Promise<AccountOverview> => {
  const res = await apiClient.get<{ data: AccountOverview }>("me/overview");
  return res.data.data;
};

export const listMyMassBookings = async (params: ListParams) => {
  const res = await apiClient.get<Paginated<BookingOrder>>("me/mass-bookings", params);
  return res.data;
};

export const listMyDonations = async (params: ListParams) => {
  const res = await apiClient.get<Paginated<MyDonation> & { summary: DonationSummary }>("me/donations", params);
  return res.data;
};

export const listMyGroups = async (params: ListParams) => {
  const res = await apiClient.get<Paginated<MyGroup>>("me/groups", params);
  return res.data;
};

export const listMyNotifications = async (params: ListParams) => {
  const res = await apiClient.get<Paginated<AccountNotification> & { meta: PageMeta & { unread_count: number } }>(
    "me/notifications",
    params
  );
  return res.data;
};

export const getUnreadCount = async (): Promise<number> => {
  const res = await apiClient.get<{ data: { unread_count: number } }>("me/notifications/unread-count");
  return res.data.data.unread_count;
};

export const markNotificationRead = async (id: string) => {
  await apiClient.post(`me/notifications/${id}/read`);
};

export const markAllNotificationsRead = async () => {
  await apiClient.post("me/notifications/mark-all-read");
};

export const listMyMessages = async (): Promise<AccountMessage[]> => {
  const res = await apiClient.get<{ data: AccountMessage[] }>("me/messages");
  return res.data.data;
};
