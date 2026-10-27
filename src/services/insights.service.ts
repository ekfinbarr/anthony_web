import { apiClient } from "@/lib/apiClient";

export type InsightFormat = "money" | "number";

export interface InsightKpi {
  label: string;
  value: number;
  format: InsightFormat;
  hint?: string;
}

export interface InsightTrend {
  label: string;
  format: InsightFormat;
  points: Array<{ period: string; label: string; value: number }>;
}

export interface InsightBreakdown {
  label: string;
  format: InsightFormat;
  items: Array<{ label: string; value: number }>;
}

export interface Insights {
  currency?: string;
  kpis: InsightKpi[];
  trend: InsightTrend;
  breakdowns: InsightBreakdown[];
}

export type InsightsModule =
  | "donations"
  | "mass_bookings"
  | "memberships"
  | "contact_messages"
  | "users"
  | "facility_bookings"
  | "bookshop_orders";

export const getInsights = async (module: InsightsModule, months = 12): Promise<Insights> => {
  const res = await apiClient.get<{ data: Insights }>(`admin/insights/${module}`, { months });
  return res.data.data;
};
