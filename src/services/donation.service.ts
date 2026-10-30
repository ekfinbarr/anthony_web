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

export type DonationStatus = "pending" | "successful" | "failed" | "cancelled" | "refunded";
export type DonationType = "tithe" | "offering" | "building" | "missions" | "thanksgiving" | "welfare" | "other";
export type DonationGateway = "paystack" | "stripe" | "bank_transfer" | "cash" | "flutterwave";

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
  // Returned by DonationResource; optional because older payloads omit them.
  currency?: string;
  type_formatted?: string;
  status_formatted?: string;
  donor_name?: string;
  donor_email?: string;
  donor_phone?: string;
  is_anonymous?: boolean;
  dedication?: string;
  memorial_for?: string;
  donation_date?: string;
  processed_at?: string;
  user?: { id: string; name: string; email: string };
  /** Staff-only details for gifts recorded at the office. */
  office?: { transfer_reference: string | null; transfer_date: string | null; has_evidence: boolean };
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

export interface AdminDonationFilters {
  search?: string;
  status?: DonationStatus;
  type?: DonationType;
  method?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  per_page?: number;
}

export interface DonationSummary {
  received_amount: number;
  received_count: number;
  pending_amount: number;
  pending_count: number;
  donor_count: number;
  by_type: Array<{ type: string; total: number; count: number }>;
}

export interface AdminDonationList {
  data: Donation[];
  meta?: { current_page: number; last_page: number; total: number; per_page: number };
  summary: DonationSummary;
}

/** All giving, for the parish office: filtered page plus a summary of the window. */
export const listAdmin = async (params: AdminDonationFilters) => {
  const res = await apiClient.get<AdminDonationList>("admin-donations", params as Record<string, string | number>);
  return res.data;
};

export interface OfficeGiftPayload {
  user_id?: string;
  donor_name?: string;
  donor_email?: string;
  donor_phone?: string;
  is_anonymous?: boolean;
  type: DonationType;
  amount: number;
  method: "cash" | "bank_transfer";
  received?: boolean;
  received_on?: string;
  office_reference?: string;
  transfer_reference?: string;
  transfer_date?: string;
  dedication?: string;
  notes?: string;
  evidence?: File | null;
}

/** A gift taken at the parish office (cash or bank transfer) for a parishioner or walk-in donor. */
export const recordOfficeGift = async (payload: OfficeGiftPayload) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (typeof value === "boolean") form.set(key, value ? "1" : "0");
    else if (value instanceof File) form.set(key, value);
    else form.set(key, String(value));
  });
  const res = await apiClient.postForm<{ message: string; data: Donation }>("admin-donations", form);
  return res.data;
};

export const markReceived = async (id: string, body: { received_on?: string; office_reference?: string } = {}) => {
  const res = await apiClient.post<{ message: string; data: Donation }>(`admin-donations/${id}/received`, body);
  return res.data;
};

export default {
  listMine,
  getById,
  create,
  report,
  listAdmin,
  recordOfficeGift,
  markReceived,
};


