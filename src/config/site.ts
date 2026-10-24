import { createSiteConfig } from "./siteConfig";

/**
 * Site configuration for the browser bundle.
 *
 * Each variable is read individually on purpose: passing the whole `import.meta.env`
 * object would make Vite inline *every* VITE_* variable into the public bundle.
 */
export const site = createSiteConfig({
  VITE_SITE_URL: import.meta.env.VITE_SITE_URL,
  VITE_DEFAULT_OG_IMAGE: import.meta.env.VITE_DEFAULT_OG_IMAGE,
  VITE_DEFAULT_OG_IMAGE_WIDTH: import.meta.env.VITE_DEFAULT_OG_IMAGE_WIDTH,
  VITE_DEFAULT_OG_IMAGE_HEIGHT: import.meta.env.VITE_DEFAULT_OG_IMAGE_HEIGHT,
  VITE_PARISH_EMAIL: import.meta.env.VITE_PARISH_EMAIL,
  VITE_PARISH_PHONE: import.meta.env.VITE_PARISH_PHONE,
  VITE_PARISH_STREET_ADDRESS: import.meta.env.VITE_PARISH_STREET_ADDRESS,
  VITE_PARISH_POSTAL_CODE: import.meta.env.VITE_PARISH_POSTAL_CODE,
  VITE_PARISH_LATITUDE: import.meta.env.VITE_PARISH_LATITUDE,
  VITE_PARISH_LONGITUDE: import.meta.env.VITE_PARISH_LONGITUDE,
  VITE_PARISH_DIOCESE: import.meta.env.VITE_PARISH_DIOCESE,
  VITE_SOCIAL_FACEBOOK: import.meta.env.VITE_SOCIAL_FACEBOOK,
  VITE_SOCIAL_INSTAGRAM: import.meta.env.VITE_SOCIAL_INSTAGRAM,
  VITE_SOCIAL_YOUTUBE: import.meta.env.VITE_SOCIAL_YOUTUBE,
  VITE_SOCIAL_TIKTOK: import.meta.env.VITE_SOCIAL_TIKTOK,
  VITE_SOCIAL_TWITTER: import.meta.env.VITE_SOCIAL_TWITTER,
  VITE_SOCIAL_WHATSAPP: import.meta.env.VITE_SOCIAL_WHATSAPP,
  VITE_SAME_AS: import.meta.env.VITE_SAME_AS,
  VITE_TWITTER_HANDLE: import.meta.env.VITE_TWITTER_HANDLE,
});

export { formatAddress, mapsEmbedUrl, mapsSearchUrl } from "./siteConfig";
export type { SiteConfig } from "./siteConfig";
