import { apiClient } from "@/lib/apiClient";
import { paymentReturnUrl } from "@/services/payment.service";

export interface IntentionCategory {
  value: string;
  label: string;
}

export interface MassOption {
  id: string;
  title: string;
  day_of_week: string;
  start_time?: string | null;
  end_time?: string | null;
  language?: string | null;
  type?: string | null;
  location?: string | null;
  capacity?: number | null;
}

export interface BookingOptions {
  currency: string;
  offering: { minimum: number; maximum: number | null; configured: boolean; applies_to: string };
  categories: IntentionCategory[];
  beneficiaries: IntentionCategory[];
  horizon_days: number | null;
  payment_methods: Array<"flutterwave" | "cash" | "bank_transfer">;
  bank: { bank_name: string; account_name: string; account_number: string; instructions: string } | null;
  transfer_proof_required: boolean;
  form_nonce: string;
  schedules: MassOption[];
}

export interface BookingIntentionInput {
  intention_categories: string[];
  intention_category?: string;
  beneficiary_type: string;
  beneficiary_name: string;
  booking_date: string;
  mass_schedule_id: string;
  notes?: string;
}

export interface BookingOrder {
  id: string;
  reference: string;
  status: string;
  payment_status: string;
  payment_method: string;
  amount: number;
  currency: string;
  receipt_number?: string | null;
  access_token?: string;
  checkout_url?: string | null;
  contact?: { name: string; email: string | null; phone: string };
  transfer?: { reference: string | null; date: string | null; payer_name: string | null; evidence_submitted: boolean };
  rejected_reason?: string | null;
  cancelled_reason?: string | null;
  intentions?: Array<{
    id: string;
    status: string;
    booking_date: string;
    intention: string;
    intention_category?: string | null;
    intention_categories?: string[] | null;
    intention_labels?: string[];
    offered_by?: string | null;
    beneficiary_type?: string | null;
    beneficiary_name?: string | null;
    proposed_booking_date?: string | null;
    mass_schedule?: { id: string; title: string; start_time?: string | null; day_of_week?: string };
  }>;
  created_at?: string;
}

export interface OrderPayload {
  form_nonce: string;
  idempotency_key: string;
  name?: string;
  email?: string;
  phone?: string;
  payment_method: "flutterwave" | "cash" | "bank_transfer";
  amount: number;
  intentions: BookingIntentionInput[];
  transfer_reference?: string;
  transfer_date?: string;
  transfer_payer_name?: string;
  company_website?: string;
  evidence?: File | null;
}

const TOKEN_KEY = "mass-booking-access-token";

export const rememberBookingToken = (token: string) => sessionStorage.setItem(TOKEN_KEY, token);
export const rememberedBookingToken = () => sessionStorage.getItem(TOKEN_KEY);

export const getBookingOptions = async (): Promise<BookingOptions> => {
  const res = await apiClient.get<{ data: BookingOptions }>("mass-booking-orders/options");
  return res.data.data;
};

export const submitBookingOrder = async (payload: OrderPayload): Promise<{ message: string; data: BookingOrder }> => {
  if (payload.evidence) {
    const form = new FormData();
    form.set("form_nonce", payload.form_nonce);
    form.set("idempotency_key", payload.idempotency_key);
    form.set("company_website", payload.company_website ?? "");
    if (payload.name) form.set("name", payload.name);
    if (payload.email) form.set("email", payload.email);
    if (payload.phone) form.set("phone", payload.phone);
    form.set("payment_method", payload.payment_method);
    form.set("amount", String(payload.amount));
    form.set("intentions", JSON.stringify(payload.intentions));
    form.set("return_url", paymentReturnUrl());
    if (payload.transfer_reference) form.set("transfer_reference", payload.transfer_reference);
    if (payload.transfer_date) form.set("transfer_date", payload.transfer_date);
    if (payload.transfer_payer_name) form.set("transfer_payer_name", payload.transfer_payer_name);
    form.set("evidence", payload.evidence);
    const res = await apiClient.postForm<{ message: string; data: BookingOrder }>("mass-booking-orders", form);
    return res.data;
  }

  const { evidence: _evidence, ...fields } = payload;
  const res = await apiClient.post<{ message: string; data: BookingOrder }>("mass-booking-orders", {
    ...fields,
    company_website: payload.company_website ?? "",
    return_url: paymentReturnUrl(),
  });
  return res.data;
};

export interface OfficeOrderPayload {
  idempotency_key: string;
  user_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  payment_method: "cash" | "bank_transfer";
  amount: number;
  intentions: BookingIntentionInput[];
  transfer_reference?: string;
  transfer_date?: string;
  transfer_payer_name?: string;
  evidence?: File | null;
  /** Record the offering as received (cash) or the transfer as verified. */
  payment_received?: boolean;
  paid_on?: string;
  payment_reference?: string;
  /** Confirm the Masses straight away instead of leaving them as requests. */
  confirm_now?: boolean;
}

export interface OfficeOrderResult {
  message: string;
  data: BookingOrder;
  unavailable: Array<{ intention_id: string }>;
  warnings: string[];
}

/** A booking entered by the parish office (admin) for a parishioner or a walk-in guest. */
export const submitOfficeOrder = async (payload: OfficeOrderPayload): Promise<OfficeOrderResult> => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "intentions") form.set(key, JSON.stringify(value));
    else if (typeof value === "boolean") form.set(key, value ? "1" : "0");
    else if (value instanceof File) form.set(key, value);
    else form.set(key, String(value));
  });
  const res = await apiClient.postForm<OfficeOrderResult>("mass-booking-orders/office", form);
  return res.data;
};

export interface OrderReceipt {
  receipt_number: string;
  reference: string;
  amount: number;
  currency: string;
  payment_method: string;
  contact_name: string;
  intentions: Array<{ mass: string | null; date: string | null; for: string | null; intentions: string[] }>;
}

export const getOrderReceipt = async (orderId: string): Promise<OrderReceipt> => {
  const res = await apiClient.get<{ data: OrderReceipt }>(`mass-booking-orders/${orderId}/receipt`);
  return res.data.data;
};

export const getOrderByToken = async (token: string): Promise<BookingOrder> => {
  const res = await apiClient.get<{ data: BookingOrder }>(`mass-booking-orders/access/${encodeURIComponent(token)}`);
  return res.data.data;
};

export const getMyOrders = async (): Promise<BookingOrder[]> => {
  const res = await apiClient.get<{ data: BookingOrder[] }>("mass-booking-orders/mine");
  return res.data.data;
};

export default { getBookingOptions, submitBookingOrder, getOrderByToken, getMyOrders };
