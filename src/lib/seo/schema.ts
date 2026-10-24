/**
 * Schema.org JSON-LD builders. Pure functions — usable in the browser and at build time.
 *
 * Every builder only emits properties backed by real data; optional facts are
 * dropped when missing rather than filled with placeholders.
 */
import type { SiteConfig } from "../../config/siteConfig.ts";
import { absoluteUrl, canonicalUrl } from "./url.ts";

type Json = Record<string, unknown>;

export const parishId = (site: SiteConfig) => `${site.url}/#parish`;
export const websiteId = (site: SiteConfig) => `${site.url}/#website`;

/** Removes undefined / empty values so the output never contains placeholders. */
function compact<T extends Json>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => {
      if (value === undefined || value === null || value === "") return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    }),
  ) as T;
}

export function postalAddress(site: SiteConfig): Json {
  const { address } = site;
  return compact({
    "@type": "PostalAddress",
    streetAddress: address.streetAddress,
    addressLocality: address.locality,
    addressRegion: address.region,
    postalCode: address.postalCode,
    addressCountry: address.countryCode,
  });
}

/** The parish as both a place of worship (CatholicChurch) and an Organization. */
export function parishSchema(site: SiteConfig): Json {
  return compact({
    "@type": ["CatholicChurch", "Organization"],
    "@id": parishId(site),
    name: site.name,
    alternateName: site.alternateName,
    slogan: site.tagline,
    description: site.defaultDescription,
    url: `${site.url}/`,
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(site.url, site.logo.path),
      width: site.logo.width,
      height: site.logo.height,
    },
    image: absoluteUrl(site.url, site.defaultImage.path),
    email: site.email,
    telephone: site.telephone,
    address: postalAddress(site),
    geo: site.geo
      ? { "@type": "GeoCoordinates", latitude: site.geo.latitude, longitude: site.geo.longitude }
      : undefined,
    hasMap: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.mapQuery)}`,
    areaServed: { "@type": "Place", name: `${site.address.locality}, ${site.address.region}, ${site.address.country}` },
    parentOrganization: site.diocese ? { "@type": "Organization", name: site.diocese } : undefined,
    sameAs: site.sameAs,
  });
}

export function websiteSchema(site: SiteConfig): Json {
  return {
    "@type": "WebSite",
    "@id": websiteId(site),
    url: `${site.url}/`,
    name: site.name,
    alternateName: site.alternateName,
    inLanguage: site.language,
    publisher: { "@id": parishId(site) },
  };
}

/** Site-wide entity graph, emitted once per document (in the static HTML head). */
export function siteGraph(site: SiteConfig): Json {
  return {
    "@context": "https://schema.org",
    "@graph": [parishSchema(site), websiteSchema(site)],
  };
}

export interface WebPageInput {
  path: string;
  title: string;
  description: string;
  type?: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}

export function webPageSchema(site: SiteConfig, page: WebPageInput): Json {
  const url = canonicalUrl(site.url, page.path);
  return compact({
    "@context": "https://schema.org",
    "@type": page.type ?? "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: page.title,
    description: page.description,
    inLanguage: site.language,
    isPartOf: { "@id": websiteId(site) },
    about: { "@id": parishId(site) },
    primaryImageOfPage: page.image
      ? { "@type": "ImageObject", url: absoluteUrl(site.url, page.image) }
      : undefined,
    datePublished: page.datePublished,
    dateModified: page.dateModified,
  });
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbSchema(site: SiteConfig, items: BreadcrumbItem[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalUrl(site.url, item.path),
    })),
  };
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function faqSchema(items: FaqItem[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** Lagos observes West Africa Time (UTC+01:00) all year. */
const PARISH_UTC_OFFSET = "+01:00";

/**
 * Combines an API date ("2026-11-18") and time ("09:00:00" or a full ISO datetime)
 * into an ISO 8601 datetime with an explicit offset.
 */
export function toIsoDateTime(date?: string, time?: string): string | undefined {
  if (time && /\d{4}-\d{2}-\d{2}T/.test(time)) return time;
  if (!date) return undefined;
  const day = date.slice(0, 10);
  if (!time) return day;
  const hhmmss = time.length === 5 ? `${time}:00` : time.slice(0, 8);
  return `${day}T${hhmmss}${PARISH_UTC_OFFSET}`;
}

export interface EventInput {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  image?: string;
  url: string;
}

export function eventSchema(site: SiteConfig, event: EventInput): Json {
  return compact({
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.description,
    startDate: event.startDate,
    endDate: event.endDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.location || site.name,
      address: postalAddress(site),
    },
    image: event.image ? [absoluteUrl(site.url, event.image)] : undefined,
    organizer: { "@type": "Organization", "@id": parishId(site), name: site.name, url: `${site.url}/` },
    url: absoluteUrl(site.url, event.url),
  });
}

export interface ArticleInput {
  path: string;
  headline: string;
  description?: string;
  image?: string;
  authorName?: string;
  datePublished: string;
  dateModified?: string;
}

export function articleSchema(site: SiteConfig, article: ArticleInput): Json {
  const url = canonicalUrl(site.url, article.path);
  return compact({
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.headline.slice(0, 110),
    description: article.description,
    image: [absoluteUrl(site.url, article.image ?? site.defaultImage.path)],
    datePublished: article.datePublished,
    dateModified: article.dateModified ?? article.datePublished,
    author: article.authorName
      ? { "@type": "Person", name: article.authorName }
      : { "@type": "Organization", "@id": parishId(site), name: site.name, url: `${site.url}/` },
    publisher: { "@id": parishId(site) },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    inLanguage: site.language,
  });
}

export interface PersonInput {
  name: string;
  honorificPrefix?: string;
  jobTitle?: string;
  description?: string;
  image?: string;
}

export function personSchema(site: SiteConfig, person: PersonInput): Json {
  return compact({
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    honorificPrefix: person.honorificPrefix,
    jobTitle: person.jobTitle,
    description: person.description,
    image: person.image ? absoluteUrl(site.url, person.image) : undefined,
    worksFor: { "@id": parishId(site) },
  });
}
