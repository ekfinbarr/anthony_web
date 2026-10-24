/**
 * Shared API error parsing and friendly user-facing messages.
 */

export type ApiFieldErrors = Record<string, string[]>;

const STATUS_MESSAGES: Record<number, string> = {
  400: "That request wasn’t valid. Please check and try again.",
  401: "Please sign in to continue.",
  403: "You don’t have permission to do that.",
  404: "We couldn’t find what you were looking for.",
  408: "The request took too long. Please try again.",
  409: "That conflicts with existing data. Please refresh and try again.",
  422: "Please check the highlighted fields and try again.",
  429: "You’re doing that too quickly. Please wait a moment and try again.",
  500: "Something went wrong on our side. Please try again.",
  502: "The server is temporarily unavailable. Please try again shortly.",
  503: "The service is temporarily unavailable. Please try again shortly.",
  504: "The server took too long to respond. Please try again.",
};

const GENERIC_FALLBACK = "Something went wrong. Please try again.";
const NETWORK_MESSAGE = "We couldn’t reach the server. Check your connection and try again.";
const TIMEOUT_MESSAGE = "The request timed out. Please try again.";

function firstValidationMessage(errors: unknown): string | null {
  if (!errors || typeof errors !== "object") return null;
  const values = Object.values(errors as Record<string, unknown>);
  for (const value of values) {
    if (Array.isArray(value) && value.length > 0 && value[0] != null) {
      return String(value[0]);
    }
    if (typeof value === "string" && value.trim()) {
      return value;
    }
  }
  return null;
}

function normalizeFieldErrors(errors: unknown): ApiFieldErrors | undefined {
  if (!errors || typeof errors !== "object") return undefined;
  const result: ApiFieldErrors = {};
  for (const [key, value] of Object.entries(errors as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      result[key] = value.map(String);
    } else if (typeof value === "string") {
      result[key] = [value];
    }
  }
  return Object.keys(result).length ? result : undefined;
}

function extractRawMessage(data: unknown): string | null {
  if (!data || typeof data !== "object") {
    if (typeof data === "string" && data.trim()) return data.trim();
    return null;
  }

  const record = data as Record<string, unknown>;

  if (typeof record.message === "string" && record.message.trim()) {
    return record.message.trim();
  }

  if (typeof record.error === "string" && record.error.trim()) {
    return record.error.trim();
  }

  if (record.error && typeof record.error === "object") {
    const nested = record.error as Record<string, unknown>;
    if (typeof nested.message === "string" && nested.message.trim()) {
      return nested.message.trim();
    }
  }

  const fromErrors = firstValidationMessage(record.errors);
  if (fromErrors) return fromErrors;

  return null;
}

/** Framework / debug messages we never show as-is to end users. */
function isRawFrameworkMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower === "too many attempts." ||
    lower === "server error" ||
    lower === "http exception" ||
    lower.startsWith("http error!") ||
    lower.includes("illuminate\\") ||
    lower.includes("/vendor/laravel/")
  );
}

export function messageForStatus(status: number, fallback = GENERIC_FALLBACK): string {
  if (STATUS_MESSAGES[status]) return STATUS_MESSAGES[status];
  if (status >= 500) return STATUS_MESSAGES[500];
  return fallback;
}

export class ApiError extends Error {
  status: number;
  code?: number;
  errors?: ApiFieldErrors;
  raw?: unknown;
  retryAfter?: number;

  constructor(
    message: string,
    options: {
      status: number;
      code?: number;
      errors?: ApiFieldErrors;
      raw?: unknown;
      retryAfter?: number;
      cause?: unknown;
    }
  ) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.errors = options.errors;
    this.raw = options.raw;
    this.retryAfter = options.retryAfter;
  }
}

export function parseApiError(
  status: number,
  data: unknown,
  fallback = GENERIC_FALLBACK
): ApiError {
  const record = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
  const errors = normalizeFieldErrors(record?.errors);
  const code =
    typeof record?.code === "number"
      ? record.code
      : status;
  const retryAfter =
    typeof record?.retry_after === "number"
      ? record.retry_after
      : undefined;

  let message = extractRawMessage(data);

  if (!message || isRawFrameworkMessage(message)) {
    message = messageForStatus(status, fallback);
  }

  // Prefer first field error for 422 when message is generic
  if (status === 422 && errors) {
    const fieldMessage = firstValidationMessage(errors);
    if (fieldMessage && (isRawFrameworkMessage(message) || message === STATUS_MESSAGES[422])) {
      message = fieldMessage;
    }
  }

  return new ApiError(message, {
    status,
    code,
    errors,
    raw: data,
    retryAfter,
  });
}

export function networkApiError(cause?: unknown): ApiError {
  return new ApiError(NETWORK_MESSAGE, { status: 0, cause });
}

export function timeoutApiError(cause?: unknown): ApiError {
  return new ApiError(TIMEOUT_MESSAGE, { status: 408, cause });
}

export function getApiErrorMessage(error: unknown, fallback = GENERIC_FALLBACK): string {
  if (!error) return fallback;

  if (error instanceof ApiError) {
    return error.message || messageForStatus(error.status, fallback);
  }

  if (error instanceof Error) {
    if (error.name === "AbortError") return TIMEOUT_MESSAGE;
    if (error.message === "Failed to fetch" || error.message === "NetworkError when attempting to fetch resource.") {
      return NETWORK_MESSAGE;
    }
    if (error.message === "Request timeout") return TIMEOUT_MESSAGE;
    if (error.message.trim() && !isRawFrameworkMessage(error.message)) {
      return error.message;
    }

    const withStatus = error as Error & { status?: number; data?: unknown };
    if (typeof withStatus.status === "number") {
      return parseApiError(withStatus.status, withStatus.data, fallback).message;
    }
  }

  if (typeof error === "object") {
    const e = error as Record<string, unknown>;
    if (typeof e.status === "number") {
      return parseApiError(e.status as number, e.data ?? e, fallback).message;
    }
    const data = e.data;
    if (data && typeof data === "object") {
      const parsed = extractRawMessage(data);
      if (parsed && !isRawFrameworkMessage(parsed)) return parsed;
    }
  }

  if (typeof error === "string" && error.trim() && !isRawFrameworkMessage(error)) {
    return error.trim();
  }

  return fallback;
}

export function getApiFieldErrors(error: unknown): ApiFieldErrors | undefined {
  if (error instanceof ApiError) return error.errors;

  if (error && typeof error === "object") {
    const e = error as Record<string, unknown>;
    if (e.errors) return normalizeFieldErrors(e.errors);
    if (e.data && typeof e.data === "object") {
      return normalizeFieldErrors((e.data as Record<string, unknown>).errors);
    }
  }

  return undefined;
}

export function getApiErrorLines(error: unknown, fallback = GENERIC_FALLBACK): string[] {
  const fieldErrors = getApiFieldErrors(error);
  if (fieldErrors) {
    const lines = Object.values(fieldErrors).flat().map(String).filter(Boolean);
    if (lines.length) return lines;
  }
  return [getApiErrorMessage(error, fallback)];
}
