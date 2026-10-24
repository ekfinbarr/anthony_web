/**
 * Facility Booking API Service (Halls & Venue Rentals)
 */

import { apiClient, PaginatedResponse } from '../lib/apiClient';

export type FacilityBookingStatus =
  | 'pending_review'
  | 'needs_info'
  | 'approved'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'
  | 'completed'
  | 'pending'; // legacy

export type FacilityPaymentStatus =
  | 'not_due'
  | 'awaiting_payment'
  | 'payment_initiated'
  | 'awaiting_verification'
  | 'partially_paid'
  | 'paid'
  | 'failed'
  | 'rejected'
  | 'refunded';

export interface FacilityTimeBlock {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  price: string | number;
  currency?: string;
  is_combinable?: boolean;
  is_online?: boolean;
  is_active?: boolean;
}

export interface FacilityBookingBlock {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  unit_price: string | number;
  currency: string;
}

export interface FacilityBooking {
  id: string;
  reference: string;
  status: FacilityBookingStatus;
  payment_status: FacilityPaymentStatus;
  public_status?: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  purpose?: string | null;
  event_title?: string | null;
  event_category?: string | null;
  expected_attendance?: number | null;
  event_description?: string | null;
  setup_requirements?: string | null;
  accessibility_requirements?: string | null;
  organization?: string | null;
  preferred_contact?: string | null;
  applicant_type?: string | null;
  notes?: string | null;
  needs_info_message?: string | null;
  admin_suggested_alternative?: string | null;
  total_amount?: string | number | null;
  deposit_amount?: string | number | null;
  deposit_paid?: string | number | null;
  balance_amount?: string | number | null;
  balance_paid?: string | number | null;
  amount_paid?: string | number | null;
  outstanding_deposit?: number;
  outstanding_balance?: number;
  next_payable_amount?: number;
  next_payable_purpose?: string;
  can_pay?: boolean;
  currency?: string;
  pricing_snapshot?: Record<string, unknown> | null;
  deposit_due_at?: string | null;
  balance_due_at?: string | null;
  allocation_expires_at?: string | null;
  payment_method?: string | null;
  receipt_number?: string | null;
  has_evidence?: boolean;
  applicant_name?: string;
  applicant_email?: string | null;
  applicant_phone?: string | null;
  guest_name?: string | null;
  guest_email?: string | null;
  guest_phone?: string | null;
  time_blocks?: FacilityBookingBlock[];
  facility?: {
    id: string;
    name: string;
    slug: string;
    type?: string;
    capacity?: number | null;
    images?: string[] | null;
  } | null;
  bank_details?: Record<string, string>;
  enabled_payment_methods?: string[];
  rejected_reason?: string | null;
  cancelled_reason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateVenueRentalPayload {
  full_name?: string;
  guest_name?: string;
  email?: string;
  guest_email?: string;
  phone?: string;
  guest_phone?: string;
  organization?: string;
  preferred_contact?: string;
  applicant_type?: string;
  booking_date: string;
  time_block_ids?: string[];
  start_time?: string;
  end_time?: string;
  event_title: string;
  event_category?: string;
  expected_attendance?: number;
  event_description?: string;
  setup_requirements?: string;
  accessibility_requirements?: string;
  notes?: string;
  accept_terms: boolean;
  accept_privacy: boolean;
  idempotency_key?: string;
}

export interface FacilityAvailabilityResponse {
  available: boolean;
  informational_only?: boolean;
  message: string;
  allocating_conflicts?: number;
  competing_pending_requests?: number;
  data?: {
    facility?: string;
    date?: string;
    time?: string;
  };
}

export interface VenueRentalOptions {
  event_categories: string[];
  terms_notice?: string | null;
  privacy_notice?: string | null;
  enabled_payment_methods: string[];
  allow_full_payment: boolean;
  allocation_on_approval: boolean;
}

export interface SubmitResponse {
  message: string;
  data: FacilityBooking;
  access_token: string;
}

export const getOptions = async (): Promise<VenueRentalOptions> => {
  const response = await apiClient.get<{ data: VenueRentalOptions }>('facility-bookings/options');
  return response.data.data;
};

export const createGuest = async (
  facilitySlug: string,
  payload: CreateVenueRentalPayload
): Promise<SubmitResponse> => {
  const response = await apiClient.post<SubmitResponse>(
    `facilities/${facilitySlug}/booking-requests`,
    payload
  );
  return response.data;
};

export const create = async (
  facilitySlug: string,
  payload: CreateVenueRentalPayload
): Promise<SubmitResponse> => {
  const response = await apiClient.post<SubmitResponse>(
    `facilities/${facilitySlug}/bookings`,
    payload
  );
  return response.data;
};

export const listMine = async (params?: {
  page?: number;
  per_page?: number;
}): Promise<PaginatedResponse<FacilityBooking>> => {
  const response = await apiClient.get<PaginatedResponse<FacilityBooking>>(
    'facility-bookings/mine',
    params
  );
  return response.data;
};

export const getByToken = async (token: string): Promise<FacilityBooking> => {
  const response = await apiClient.get<{ data: FacilityBooking }>(
    `facility-bookings/access/${token}`
  );
  return response.data.data;
};

export const checkout = async (
  token: string,
  payload?: { purpose?: string; full?: boolean; return_url?: string }
) => {
  const response = await apiClient.post<{
    message: string;
    data: { checkout_url: string; reference: string };
  }>(`facility-bookings/access/${token}/checkout`, payload ?? {});
  return response.data;
};

export const submitTransfer = async (token: string, formData: FormData) => {
  const response = await apiClient.postForm<{ message: string; data: FacilityBooking }>(
    `facility-bookings/access/${token}/transfer`,
    formData
  );
  return response.data;
};

export const checkAvailability = async (
  facilitySlug: string,
  params: {
    date: string;
    start_time: string;
    end_time: string;
    time_block_ids?: string[];
  }
): Promise<FacilityAvailabilityResponse> => {
  const response = await apiClient.post<FacilityAvailabilityResponse>(
    `facilities/${facilitySlug}/check-availability`,
    params
  );
  return response.data;
};

export default {
  getOptions,
  createGuest,
  create,
  listMine,
  getByToken,
  checkout,
  submitTransfer,
  checkAvailability,
  listAdmin: async (params?: {
    page?: number;
    per_page?: number;
    facility_id?: string;
    status?: string;
    payment_status?: string;
    booking_date?: string;
    search?: string;
  }) => {
    const response = await apiClient.get<{ data: FacilityBooking[] }>('facility-bookings', params);
    return response.data;
  },
  getAdminById: async (id: string) => {
    const response = await apiClient.get<{ data: FacilityBooking; competing?: FacilityBooking[] }>(
      `facility-bookings/${id}`
    );
    return response.data;
  },
  approve: async (id: string) => {
    const response = await apiClient.post(`facility-bookings/${id}/approve`, {});
    return response.data;
  },
  reject: async (id: string, payload: { reason: string }) => {
    const response = await apiClient.post(`facility-bookings/${id}/reject`, payload);
    return response.data;
  },
  cancel: async (id: string, payload?: { reason?: string | null }) => {
    const response = await apiClient.post(`facility-bookings/${id}/cancel`, payload ?? {});
    return response.data;
  },
};
