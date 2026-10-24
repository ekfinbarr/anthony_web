/**
 * Computes the set of head tags for a page.
 *
 * Shared by the runtime <SEOHead> (which applies them to the live DOM) and the
 * build-time plugin (which writes them into prerendered HTML), so crawlers that
 * do not run JavaScript see exactly the same metadata as browsers.
 */
import type { SiteConfig } from "../../config/siteConfig.ts";
import { normalizePath } from "../../config/routes.seo.ts";
import { absoluteUrl, canonicalUrl } from "./url.ts";

export const INDEX_ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
export const NOINDEX_ROBOTS = "noindex, nofollow";

export interface PageMeta {
  title: string;
  absoluteTitle?: boolean;
  description: string;
  /** Canonical path. Omit for generic shells that must not declare a canonical. */
  path?: string;
  noindex?: boolean;
  type?: "website" | "article";
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  publishedTime?: string;
  modifiedTime?: string;
}

/** `content` / `href` of undefined means "this tag must not be present". */
export type HeadTag =
  | { kind: "title"; content: string }
  | { kind: "meta"; attr: "name" | "property"; key: string; content: string | undefined }
  | { kind: "link"; rel: string; href: string | undefined };

export function buildTitle(site: SiteConfig, title: string, absoluteTitle = false): string {
  return absoluteTitle || title.includes(site.name) ? title : `${title}${site.titleSuffix}`;
}

export function computeHeadTags(site: SiteConfig, page: PageMeta): HeadTag[] {
  const fullTitle = buildTitle(site, page.title, page.absoluteTitle);
  const url = page.path !== undefined ? canonicalUrl(site.url, normalizePath(page.path)) : undefined;
  const usesDefaultImage = !page.image;
  const imageUrl = absoluteUrl(site.url, page.image ?? site.defaultImage.path);
  const width = usesDefaultImage ? site.defaultImage.width : page.imageWidth;
  const height = usesDefaultImage ? site.defaultImage.height : page.imageHeight;
  const alt = page.imageAlt ?? (usesDefaultImage ? site.defaultImage.alt : page.title);
  // Square logos look best as a "summary" card; real photos get the large card.
  const largeImage = !usesDefaultImage || (width ?? 0) > (height ?? 0);
  const isArticle = page.type === "article";
  const meta = (attr: "name" | "property", key: string, content: string | undefined): HeadTag => ({
    kind: "meta",
    attr,
    key,
    content,
  });

  return [
    { kind: "title", content: fullTitle },
    meta("name", "description", page.description),
    meta("name", "robots", page.noindex ? NOINDEX_ROBOTS : INDEX_ROBOTS),
    // A noindexed page should not advertise itself as canonical.
    { kind: "link", rel: "canonical", href: page.noindex ? undefined : url },

    meta("property", "og:type", page.type ?? "website"),
    meta("property", "og:site_name", site.name),
    meta("property", "og:locale", site.locale),
    meta("property", "og:title", fullTitle),
    meta("property", "og:description", page.description),
    meta("property", "og:url", url),
    meta("property", "og:image", imageUrl),
    meta("property", "og:image:alt", alt),
    meta("property", "og:image:width", width ? String(width) : undefined),
    meta("property", "og:image:height", height ? String(height) : undefined),
    meta("property", "article:published_time", isArticle ? page.publishedTime : undefined),
    meta("property", "article:modified_time", isArticle ? page.modifiedTime : undefined),

    meta("name", "twitter:card", largeImage ? "summary_large_image" : "summary"),
    meta("name", "twitter:site", site.twitterHandle),
    meta("name", "twitter:title", fullTitle),
    meta("name", "twitter:description", page.description),
    meta("name", "twitter:image", imageUrl),
    meta("name", "twitter:image:alt", alt),
  ];
}
