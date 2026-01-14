/**
 * Donation (Admin/User) API Service
 *
 * Backend routes (AnthonyServer):
 * - Auth : GET  /api/donations
 * - Auth : POST /api/donations
 * - Auth : GET  /api/donations/{id}
 * - Admin: GET  /api/donations/report
 */

import { apiClient } from "@/lib/apiClient";

export type DonationStatus = "pending" | "successful" | "failed";
export type DonationType = "tithe" | "offering" | "building" | "other";
export type DonationGateway = "paystack" | "stripe" | "bank_transfer";

export interface Donation {
  id: string;
  reference: string;
  amount: number;
  type: DonationType;
  status: DonationStatus;
  is_recurring: boolean;
  recurrence_interval?: string | null;
  payment_gateway: DonationGateway;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface DonationResourceCollection<T> {
  data: T[];
  meta?: unknown;
  links?: unknown;
}

export interface CreateDonationPayload {
  amount: number;
  type: DonationType;
  is_recurring?: boolean;
  recurrence_interval?: string | null;
  payment_gateway: DonationGateway;
  notes?: string | null;
}

export const listMine = async (params?: { type?: DonationType; status?: DonationStatus; is_recurring?: boolean }) => {
  const res = await apiClient.get<DonationResourceCollection<Donation>>("donations", params);
  return res.data;
};

export const getById = async (id: string) => {
  const res = await apiClient.get<Donation>("donations/" + id);
  return res.data;
};

export const create = async (payload: CreateDonationPayload) => {
  const res = await apiClient.post("donations", payload);
  return res.data as unknown;
};

export const report = async (params?: {
  type?: DonationType;
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
}) => {
  const res = await apiClient.get<{
    total_amount: number;
    donations: DonationResourceCollection<Donation>;
  }>("donations/report", params);
  return res.data;
};

export default {
  listMine,
  getById,
  create,
  report,
};


