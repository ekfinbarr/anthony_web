import { apiClient } from '../lib/apiClient';

export interface FlashNews {
  id: string;
  title: string;
  body: string;
  cta_label: string | null;
  cta_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CurrentFlashNewsResponse {
  data: FlashNews | null;
}

export async function getCurrentFlashNews(): Promise<FlashNews | null> {
  const response = await apiClient.get<CurrentFlashNewsResponse>('flash-news/current');
  return response.data.data ?? null;
}
