import { ApiError, getApiErrorMessage, networkApiError, parseApiError } from "@/lib/api-error";
import { canonicalNigerianPhone } from "@/lib/phone";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

export type GroupChoice = { id: string; type: "ministry" | "organization"; name: string; description: string | null };

export type RegistrationOptions = {
  policy: { phone_required: boolean; email_required: boolean; address_required: boolean };
  masses: { id: string; title: string; time: string; language: string }[];
  categories: { key: string; label: string; groups: GroupChoice[] }[];
  form_nonce: string;
  turnstile_site_key: string | null;
  contact: { phone: string | null; email: string | null };
};

export type RegistrationResult = { reference: string; status: string; message: string };

export type SacramentAnswer = "received" | "not_yet" | "unsure";
export type SacramentKey = "baptism" | "first_communion" | "confirmation" | "marriage";
export type Sacraments = Partial<Record<SacramentKey, SacramentAnswer>>;

export type HouseholdMember = {
  name: string;
  relationship: "spouse" | "child" | "parent" | "sibling" | "relative" | "other";
  date_of_birth: string | null;
  sacraments: Sacraments | null;
};

export type VerifiedProfile = {
  full_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  preferred_contact_method: "phone" | "email" | "either" | null;
  preferred_mass_schedule_id: string | null;
  groups: { type: "ministry" | "organization"; id: string }[];
  has_parishioner: boolean;
  date_of_birth: string | null;
  gender: "male" | "female" | null;
  occupation: string | null;
  marital_status: "single" | "married" | "widowed" | "separated" | null;
  faith_status: "catholic" | "returning" | "exploring" | null;
  sacraments: Sacraments | null;
  household: unknown[];
  wants_preparation: boolean;
  news_opt_in: boolean;
  giving_preference: "envelopes" | "online" | null;
};

/** @deprecated Prefer ApiError; kept for existing instanceof checks in registration UI. */
export class ParishRegistrationError extends ApiError {
  constructor(message: string, status: number, errors: Record<string, string[]> = {}) {
    super(message, { status, errors, code: status });
    this.name = "ParishRegistrationError";
  }
}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`, { ...init, headers });
  } catch (cause) {
    const network = networkApiError(cause);
    throw new ParishRegistrationError(
      "We could not reach the parish office system. Check your connection and try again.",
      network.status
    );
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const parsed = parseApiError(response.status, data);
    throw new ParishRegistrationError(
      getApiErrorMessage(parsed, "Something went wrong. Please try again."),
      parsed.status,
      parsed.errors ?? {}
    );
  }

  return data as T;
}

export const parishRegistrationService = {
  options: () => request<RegistrationOptions>("parish-registration/options"),

  submit: (body: Record<string, unknown>, idempotencyKey: string) =>
    request<RegistrationResult>("parish-registration", {
      method: "POST",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(body),
    }),

  update: (body: Record<string, unknown>, idempotencyKey: string, token: string) =>
    request<RegistrationResult>("parish-registration/me", {
      method: "PUT",
      headers: { "Idempotency-Key": idempotencyKey },
      body: JSON.stringify(body),
    }, token),

  requestCode: (email: string) =>
    request<{ message: string }>("parish-registration/verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  confirmCode: (email: string, code: string) =>
    request<{ token: string; profile: VerifiedProfile }>("parish-registration/verification/confirm", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    }),
};

export function phoneIsAcceptable(value: string, required: boolean): boolean {
  if (!value.trim()) return !required;
  return canonicalNigerianPhone(value) !== null;
}
