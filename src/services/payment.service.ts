/**
 * Online payments (Flutterwave hosted checkout).
 *
 * Flow: start a checkout -> send the browser to `checkout_url` -> the API
 * verifies the payment and redirects back to /payment/complete?reference=...
 * -> that page reads the final status from `getStatus` / `verify`.
 *
 * Works for guests (name + email required) and signed-in users (token sent automatically).
 */

import { apiClient } from "@/lib/apiClient";

export type PaymentStatus = "pending" | "successful" | "failed" | "cancelled";

export interface PaymentConfig {
  gateway: string;
  enabled: boolean;
  public_key: string | null;
  currency: string;
  mass_booking_stipend: number;
  donation_min_amount: number;
  donation_max_amount: number;
}

export interface Payment {
  reference: string;
  status: PaymentStatus;
  amount: number;
  amount_paid: number | null;
  currency: string;
  gateway: string;
  payment_method: string | null;
  failure_reason: string | null;
  payer_first_name: string | null;
  payable_type: "donation" | "mass_booking" | string | null;
  description: string | null;
  details: Record<string, string | number | boolean | null>;
  checkout_url?: string;
  paid_at: string | null;
  created_at: string | null;
}

export interface CheckoutResponse {
  message: string;
  data: Payment & { checkout_url: string };
}

interface PayerDetails {
  /** Required for guests; signed-in users default to their account details. */
  name?: string;
  email?: string;
  phone?: string;
}

export type DonationType = "tithe" | "offering" | "building" | "missions" | "thanksgiving" | "welfare" | "other";

export interface DonationCheckoutPayload extends PayerDetails {
  amount: number;
  type: DonationType;
  is_anonymous?: boolean;
  dedication?: string;
  memorial_for?: string;
  notes?: string;
}

export interface MassBookingCheckoutPayload extends PayerDetails {
  mass_schedule_id: string;
  booking_date: string;
  intention: string;
  intention_type?: string;
  offered_by?: string;
}

/** Page the API sends payers back to after checkout. */
export const paymentReturnUrl = () => `${window.location.origin}/payment/complete`;

export const getConfig = async (): Promise<PaymentConfig> => {
  const res = await apiClient.get<{ data: PaymentConfig }>("payments/config");
  return res.data.data;
};

export const checkoutDonation = async (payload: DonationCheckoutPayload): Promise<CheckoutResponse> => {
  const res = await apiClient.post<CheckoutResponse>("donations/checkout", { ...payload, return_url: paymentReturnUrl() });
  return res.data;
};

export const checkoutMassBooking = async (payload: MassBookingCheckoutPayload): Promise<CheckoutResponse> => {
  const res = await apiClient.post<CheckoutResponse>("mass-bookings/checkout", { ...payload, return_url: paymentReturnUrl() });
  return res.data;
};

export const getStatus = async (reference: string): Promise<Payment> => {
  const res = await apiClient.get<{ data: Payment }>(`payments/${encodeURIComponent(reference)}`);
  return res.data.data;
};

/** Ask the API to re-check a pending payment with the provider. */
export const verify = async (reference: string): Promise<Payment> => {
  const res = await apiClient.post<{ data: Payment }>(`payments/${encodeURIComponent(reference)}/verify`, {});
  return res.data.data;
};

/** Leave the SPA for the hosted checkout page. */
export const redirectToCheckout = (checkoutUrl: string) => {
  window.location.assign(checkoutUrl);
};

export const formatMoney = (amount: number | null | undefined, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(amount ?? 0));

export default {
  getConfig,
  checkoutDonation,
  checkoutMassBooking,
  getStatus,
  verify,
  redirectToCheckout,
  formatMoney,
  paymentReturnUrl,
};
