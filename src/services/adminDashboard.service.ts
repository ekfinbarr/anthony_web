import { apiClient } from "@/lib/apiClient";

export interface DashboardKpis {
  users: number;
  posts: number;
  events: number;
  donations_total: number;
  donations_count: number;
  mass_booking_orders: number;
  contact_messages: number;
  contact_unread: number;
  gallery_items: number;
  livestreams: number;
}

export interface DashboardSeriesPoint {
  date: string;
  count: number;
  total?: number;
}

export interface DashboardActivity {
  action: string;
  user: string;
  time: string;
  link?: string;
}

export interface AdminDashboardData {
  kpis: DashboardKpis;
  series: {
    donations: DashboardSeriesPoint[];
    mass_bookings: DashboardSeriesPoint[];
  };
  recent_activity: DashboardActivity[];
}

export const getDashboard = async (): Promise<AdminDashboardData> => {
  const res = await apiClient.get<{ data: AdminDashboardData }>("admin/dashboard");
  return res.data.data;
};

export default { getDashboard };
