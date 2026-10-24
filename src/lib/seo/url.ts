import { normalizePath } from "../../config/routes.seo.ts";

/** Turns a site path (or already-absolute URL) into an absolute URL on `origin`. */
export function absoluteUrl(origin: string, pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${origin}${path}`;
}

/** Canonical URL for a path: no query string, no hash, no trailing slash (except root). */
export function canonicalUrl(origin: string, path: string): string {
  const clean = normalizePath(path);
  return clean === "/" ? `${origin}/` : `${origin}${clean}`;
}

/** Serialises JSON-LD safely for embedding inside a <script> element. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
