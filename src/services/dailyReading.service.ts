/**
 * Daily Reading API Service
 *
 * Backend routes (AnthonyServer):
 * - GET /api/daily-readings/today
 * - GET /api/daily-readings/{date} (YYYY-MM-DD)
 *
 * Readings follow the Nigerian liturgical calendar (Universalis), cached by the backend.
 */

import { apiClient } from "@/lib/apiClient";

export type LiturgicalColour = "green" | "white" | "red" | "violet" | "rose" | "black";

export type CelebrationType = "saint" | "feast" | "feria" | "sunday";

export interface ReadingPart {
  key: string;
  label: string;
  heading: string | null;
  source: string | null;
  /** Sanitised by the backend to <p>, <i>, <b>, <em>, <strong>, <br>. */
  html: string;
  excerpt: string;
}

export interface DailyReadingPayload {
  schema: number;
  date: string;
  day_label: string | null;
  celebration: {
    title: string | null;
    rank: string | null;
    subtitle: string | null;
    type: CelebrationType;
  };
  season: string | null;
  season_week: number | null;
  colour: LiturgicalColour | null;
  readings: ReadingPart[];
  copyright: string | null;
  attribution_url: string;
}

export interface DailyReading {
  id: string;
  reading_date: string;
  source: string;
  payload: DailyReadingPayload;
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
