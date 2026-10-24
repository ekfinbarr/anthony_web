/**
 * Site / parish identity configuration.
 *
 * This module is intentionally free of `import.meta.env` so it can be used both
 * by the browser bundle (see `src/config/site.ts`) and by the build-time SEO
 * plugin (`seo/vite-plugin-seo.ts`), which passes in values from `loadEnv`.
 *
 * Only facts that are confirmed belong here. Optional facts (street address,
 * telephone, coordinates, verified social profiles) are read from environment
 * variables and are omitted from the UI and structured data when unset.
 */

type EnvRecord = Record<string, string | boolean | undefined>;

export interface ParishAddress {
  /** Optional street line, e.g. "12 Example Street". */
  streetAddress?: string;
  /** Neighbourhood / district shown to visitors. */
  neighbourhood: string;
  /** Locality used in structured data (`addressLocality`). */
  locality: string;
  region: string;
  country: string;
  /** ISO 3166-1 alpha-2 country code. */
  countryCode: string;
  postalCode?: string;
}

export interface SocialProfiles {
  facebook: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  twitter: string;
  whatsapp?: string;
}

export interface SiteConfig {
  /** Canonical origin without trailing slash, e.g. https://stanthonygbaja.org */
  url: string;
  name: string;
  slogan: string;
  shortName: string;
  alternateName: string;
  tagline: string;
  taglineCall: string;
  taglineResponse: string;
  defaultTitle: string;
  titleSuffix: string;
  defaultDescription: string;
  language: string;
  locale: string;
  themeColor: string;
  logo: { path: string; width: number; height: number };
  defaultImage: { path: string; width: number; height: number; alt: string };
  email: string;
  telephone?: string;
  address: ParishAddress;
  geo?: { latitude: number; longitude: number };
  /** Google Maps search used for "Get directions" and the embedded map. */
  mapQuery: string;
  diocese?: string;
  /** Profiles shown in the UI. */
  social: SocialProfiles;
  /** Verified official profiles only — used for schema.org `sameAs`. */
  sameAs: string[];
  twitterHandle?: string;
  verification: { google?: string; bing?: string };
  analytics: { gaMeasurementId?: string };
}

const str = (env: EnvRecord, key: string): string | undefined => {
  const value = env[key];
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const num = (env: EnvRecord, key: string): number | undefined => {
  const value = str(env, key);
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const list = (env: EnvRecord, key: string): string[] =>
  (str(env, key) ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter((item) => /^https:\/\//.test(item));

export function createSiteConfig(env: EnvRecord = {}): SiteConfig {
  const url = (str(env, "VITE_SITE_URL") ?? "https://stanthonygbaja.org").replace(/\/+$/, "");
  const name = "St. Anthony Catholic Church, Gbaja";
  const slogan = "To live like Christ and to serve like Christ";
  // const name = "St. Anthony Catholic Church, Gbaja";
  const latitude = num(env, "VITE_PARISH_LATITUDE");
  const longitude = num(env, "VITE_PARISH_LONGITUDE");

  return {
    url,
    name,
    slogan,
    shortName: "Lagos Archdiocese",
    alternateName: "St. Anthony Gbaja",
    tagline: "To Live & Serve Like Christ",
    taglineCall: "To live like Christ",
    taglineResponse: "To Serve Like Christ",
    defaultTitle: `${name}, Surulere, Lagos`,
    titleSuffix: ` | ${name}`,
    defaultDescription:
      "St. Anthony Catholic Church, Gbaja is a Catholic parish in Surulere, Lagos. Find Mass times, sacraments, parish groups, news, events and how to contact the parish.",
    language: "en",
    locale: "en_NG",
    themeColor: "#1e3a8a",
    logo: { path: "/logo.png", width: 500, height: 500 },
    defaultImage: {
      path: str(env, "VITE_DEFAULT_OG_IMAGE") ?? "/og-image.png",
      width: num(env, "VITE_DEFAULT_OG_IMAGE_WIDTH") ?? 1200,
      height: num(env, "VITE_DEFAULT_OG_IMAGE_HEIGHT") ?? 630,
      alt: `${name} logo`,
    },
    email: str(env, "VITE_PARISH_EMAIL") ?? "info@stanthonygbaja.org",
    telephone: str(env, "VITE_PARISH_PHONE"),
    address: {
      streetAddress: str(env, "VITE_PARISH_STREET_ADDRESS"),
      neighbourhood: "Gbaja",
      locality: "Surulere",
      region: "Lagos",
      country: "Nigeria",
      countryCode: "NG",
      postalCode: str(env, "VITE_PARISH_POSTAL_CODE"),
    },
    geo: latitude !== undefined && longitude !== undefined ? { latitude, longitude } : undefined,
    mapQuery: "St Anthony Catholic Church Gbaja Surulere Lagos",
    diocese: str(env, "VITE_PARISH_DIOCESE"),
    social: {
      facebook: str(env, "VITE_SOCIAL_FACEBOOK") ?? "https://facebook.com/stanthonygbaja",
      instagram: str(env, "VITE_SOCIAL_INSTAGRAM") ?? "https://instagram.com/stanthonygbaja",
      youtube: str(env, "VITE_SOCIAL_YOUTUBE") ?? "https://youtube.com/@stanthonygbaja",
      // TikTok & X defaults removed until parish accounts are created and verified.
      // Re-enable fallbacks (and UI entries) when ready:
      // tiktok: str(env, "VITE_SOCIAL_TIKTOK") ?? "https://tiktok.com/@stanthonygbaja",
      // twitter: str(env, "VITE_SOCIAL_TWITTER") ?? "https://twitter.com/stanthonygbaja",
      tiktok: str(env, "VITE_SOCIAL_TIKTOK") ?? "",
      twitter: str(env, "VITE_SOCIAL_TWITTER") ?? "",
      // Parish WhatsApp community / group invite, e.g. https://chat.whatsapp.com/...
      whatsapp: str(env, "VITE_SOCIAL_WHATSAPP"),
    },
    sameAs: list(env, "VITE_SAME_AS"),
    twitterHandle: str(env, "VITE_TWITTER_HANDLE"),
    verification: {
      google: str(env, "VITE_GOOGLE_SITE_VERIFICATION"),
      bing: str(env, "VITE_BING_SITE_VERIFICATION"),
    },
    analytics: { gaMeasurementId: str(env, "VITE_GA_MEASUREMENT_ID") },
  };
}

/** Human-readable single-line address, e.g. "Gbaja, Surulere, Lagos, Nigeria". */
export function formatAddress(address: ParishAddress): string {
  return [address.streetAddress, address.neighbourhood, address.locality, address.region, address.country]
    .filter(Boolean)
    .join(", ");
}

export function mapsSearchUrl(config: SiteConfig): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.mapQuery)}`;
}

export function mapsEmbedUrl(config: SiteConfig): string {
  return `https://www.google.com/maps?q=${encodeURIComponent(config.mapQuery)}&output=embed`;
}
