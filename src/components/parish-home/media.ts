/** Accepts a raw array or a Laravel `{ data: [] }` payload. */
export function unwrapList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object" && "data" in payload) {
    const inner = (payload as { data: unknown }).data;
    if (inner !== payload) return unwrapList<T>(inner);
  }
  return [];
}

/** Turns a stored path into a loadable URL. Full URLs are left as they are. */
export function mediaUrl(image?: string | File | null): string | undefined {
  if (!image || typeof image !== "string") return undefined;
  if (/^(https?:|data:|blob:)/.test(image) || image.startsWith("/")) return image;
  const base = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api").replace(/\/api\/?$/, "");
  return `${base}/storage/${image.replace(/^\/+/, "")}`;
}
