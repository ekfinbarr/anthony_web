/**
 * Daily Reading API Service
 *
 * Backend routes (AnthonyServer):
 * - GET /api/daily-readings/today
 * - GET /api/daily-readings/{date} (YYYY-MM-DD)
 */

import { apiClient } from "@/lib/apiClient";

export interface DailyReading {
  id: string;
  reading_date: string;
  source: string;
  payload: Record<string, unknown>;
  fetched_at?: string | null;
  created_at: string;
  updated_at: string;
}

export const getToday = async (): Promise<DailyReading> => {
  const response = await apiClient.get<{ data: DailyReading }>("daily-readings/today");
  return response.data.data;
};

export const getByDate = async (date: string): Promise<DailyReading> => {
  const response = await apiClient.get<{ data: DailyReading }>(`daily-readings/${date}`);
  return response.data.data;
};

export default {
  getToday,
  getByDate,
};


