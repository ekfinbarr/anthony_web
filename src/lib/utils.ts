import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Constant-time string comparison to prevent timing attacks
 * Compares two strings in a way that takes the same amount of time
 * regardless of where the difference occurs
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still perform comparison to maintain constant time
    let result = 0;
    const maxLength = Math.max(a.length, b.length);
    for (let i = 0; i < maxLength; i++) {
      result |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
    }
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Validates and sanitizes a redirect path to prevent open redirect vulnerabilities
 * Only allows relative paths that start with '/' and don't contain '//' or external URLs
 */
export function validateRedirectPath(path: string | null | undefined, defaultPath: string = "/dashboard"): string {
  if (!path || typeof path !== "string") {
    return defaultPath;
  }

  // Remove any whitespace
  const trimmedPath = path.trim();

  // Reject empty strings
  if (trimmedPath.length === 0) {
    return defaultPath;
  }

  // Reject paths that don't start with '/' (relative paths only)
  if (!trimmedPath.startsWith("/")) {
    return defaultPath;
  }

  // Reject paths containing '//' (could be used for protocol-relative URLs)
  if (trimmedPath.includes("//")) {
    return defaultPath;
  }

  // Reject paths containing ':' after the first character (could be protocol)
  if (trimmedPath.includes(":") && trimmedPath.indexOf(":") > 0) {
    return defaultPath;
  }

  // Reject paths containing control characters or suspicious patterns
  if (/[\x00-\x1F\x7F]/.test(trimmedPath) || /\.\./.test(trimmedPath)) {
    return defaultPath;
  }

  // Allow only alphanumeric, forward slashes, hyphens, underscores, and query strings
  if (!/^\/[a-zA-Z0-9\/\-_?=&]*$/.test(trimmedPath)) {
    return defaultPath;
  }

  return trimmedPath;
}
