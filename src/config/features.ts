/**
 * Public module keys and the paths they control.
 * Kept free of React so menus and route gates share one map.
 */

export const FEATURE_KEYS = [
  "login",
  "account_registration",
  "parish_registration",
  "parish_registration_new",
  "parish_registration_returning",
  "parish_registration_update",
  "mass_bookings",
  "mass_booking_requests",
  "mass_booking_online_payment",
  "donations",
  "donation_accounts",
  "online_donations",
  "rentals",
  "rental_online_booking",
  "daily_readings",
  "livestream",
  "sermons",
  "bulletins",
  "bulletin_download",
  "parish_anthem",
  "parish_priest",
  "events",
  "event_registration",
  "news",
  "calendar",
  "galleries",
  "groups",
  "serve_others",
  "service_groups",
  "sacraments",
  "sacrament_registration",
  "bookshop",
  "clinic",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

export type FeatureAudience = "everyone" | "guests" | "authenticated" | "roles";

export interface FeatureModule {
  on: boolean;
  audience: FeatureAudience;
  roles: string[];
  nav: boolean;
}

export interface FeatureSnapshot {
  version: string;
  modules: Record<string, FeatureModule>;
}

const OPEN: FeatureModule = { on: true, audience: "everyone", roles: [], nav: true };

export function allOnSnapshot(): FeatureSnapshot {
  const modules: Record<string, FeatureModule> = {};
  for (const key of FEATURE_KEYS) modules[key] = OPEN;
  return { version: "default", modules };
}

const HREF_FEATURES: { prefix: string; key: FeatureKey }[] = [
  { prefix: "/dashboard/mass-bookings", key: "mass_bookings" },
  { prefix: "/dashboard/donations", key: "donations" },
  { prefix: "/dashboard/sacraments", key: "sacraments" },
  { prefix: "/dashboard/groups", key: "groups" },
  { prefix: "/auth/register", key: "account_registration" },
  { prefix: "/parish-priest", key: "parish_priest" },
  { prefix: "/parish-anthem", key: "parish_anthem" },
  { prefix: "/daily-readings", key: "daily_readings" },
  { prefix: "/serve-others", key: "serve_others" },
  { prefix: "/my-mass-bookings", key: "mass_bookings" },
  { prefix: "/book-mass", key: "mass_bookings" },
  { prefix: "/registration", key: "parish_registration" },
  { prefix: "/sacraments", key: "sacraments" },
  { prefix: "/donations", key: "donations" },
  { prefix: "/bulletins", key: "bulletins" },
  { prefix: "/bulletin", key: "bulletins" },
  { prefix: "/bookshop", key: "bookshop" },
  { prefix: "/calendar", key: "calendar" },
  { prefix: "/sermons", key: "sermons" },
  { prefix: "/rentals", key: "rentals" },
  { prefix: "/gallery", key: "galleries" },
  { prefix: "/groups", key: "service_groups" },
  { prefix: "/events", key: "events" },
  { prefix: "/clinic", key: "clinic" },
  { prefix: "/news", key: "news" },
  { prefix: "/live", key: "livestream" },
  { prefix: "/register", key: "parish_registration" },
];

export function featureForHref(href: string): FeatureKey | null {
  const path = href.split(/[?#]/)[0];
  const match = HREF_FEATURES.find((item) => path === item.prefix || path.startsWith(`${item.prefix}/`));
  return match?.key ?? null;
}

export function audienceAllows(module: FeatureModule, roles: string[] | null): boolean {
  switch (module.audience) {
    case "guests":
      return roles === null;
    case "authenticated":
      return roles !== null;
    case "roles":
      return roles !== null && module.roles.some((role) => roles.includes(role));
    default:
      return true;
  }
}

export const FEATURE_ROLE_OPTIONS = [
  "super_admin",
  "admin",
  "priest",
  "deacon",
  "editor",
  "finance_officer",
  "secretary",
  "catechist",
  "sacristan",
  "parishioner",
  "user",
] as const;
