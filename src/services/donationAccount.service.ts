/**
 * Donation Account API Service
 *
 * Backend routes (AnthonyServer):
 * - GET /api/donation-accounts (public, active accounts)
 */

import { apiClient } from "../lib/apiClient";

export interface DonationAccount {
  id: string;
  name: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  currency: string;
  instructions?: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * ResourceCollection (non-paginated for this endpoint).
 */
export interface LaravelResourceCollection<T> {
  data: T[];
}

export const listActive = async (): Promise<LaravelResourceCollection<DonationAccount>> => {
  const response = await apiClient.get<LaravelResourceCollection<DonationAccount>>("donation-accounts");
  return response.data;
};

export default {
  listActive,
};


