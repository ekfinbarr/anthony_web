/**
 * Route-level SEO registry.
 *
 * One entry per public route rendered inside the main <Layout>. It drives:
 *  - per-route <title>, description, canonical, robots and social tags (RouteSEO)
 *  - visible breadcrumbs + BreadcrumbList JSON-LD
 *  - build-time per-route HTML heads and sitemap.xml (seo/vite-plugin-seo.ts)
 *
 * Keep this file free of React / browser APIs — it is imported at build time.
 */

export type SchemaPageType =
  | "WebPage"
  | "AboutPage"
  | "ContactPage"
  | "CollectionPage"
  | "ItemPage";

export type ChangeFrequency = "daily" | "weekly" | "monthly" | "yearly";

export interface RouteSeo {
  path: string;
  /** Page title without the site-name suffix. */
  title: string;
  /** When true, `title` is used as-is (no suffix). */
  absoluteTitle?: boolean;
  description: string;
  /** Short label used in breadcrumbs. */
  breadcrumb: string;
  /** Parent route for breadcrumbs. Defaults to "/". */
  parent?: string;
  /** Exclude from search results and the sitemap. */
  noindex?: boolean;
  /** Why the page is noindexed — for maintainers. */
  noindexReason?: string;
  pageType?: SchemaPageType;
  changefreq?: ChangeFrequency;
  priority?: number;
  /** Social image path (defaults to the site image). */
  image?: string;
}

const PRIVATE = "Private, transactional or account page.";
const PLACEHOLDER =
  "Page currently shows sample/template content. Remove `noindex` once real parish content is in place.";

export const routeSeo: RouteSeo[] = [
  {
    path: "/",
    title: "St. Anthony Catholic Church, Gbaja – Surulere, Lagos",
    absoluteTitle: true,
    description:
      "Welcome to St. Anthony Catholic Church, Gbaja, Surulere, Lagos. Find Sunday and weekday Mass times, book a Mass intention, request sacraments and join parish life.",
    breadcrumb: "Home",
    changefreq: "weekly",
    priority: 1.0,
  },
  {
    path: "/home",
    title: "Parish Home",
    description:
      "Join St. Anthony Catholic Church, Gbaja. Sunday Mass times, parish history, ministries, news, photographs and how to visit us in Surulere, Lagos.",
    breadcrumb: "Parish Home",
    changefreq: "weekly",
    priority: 0.9,
  },
  {
    path: "/about",
    title: "About the Parish",
    description:
      "Learn about St. Anthony Catholic Church, Gbaja — our story, vision, mission, core values and the clergy who lead our parish community in Surulere, Lagos.",
    breadcrumb: "About",
    pageType: "AboutPage",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/parish-priest",
    title: "Parish Priest — Very Rev. Fr. Sylvester Tolulope Oladunjoye",
    description:
      "Meet Very Rev. Fr. Sylvester Tolulope Oladunjoye, Parish Priest of St. Anthony Catholic Church, Gbaja — his background, education, and archdiocesan ministry.",
    breadcrumb: "Parish Priest",
    parent: "/about",
    changefreq: "monthly",
    priority: 0.7,
  },
  {
    path: "/visit",
    title: "Mass Times & Plan Your Visit",
    description:
      "Sunday and weekday Mass times at St. Anthony Catholic Church, Gbaja, plus directions, what to expect at Mass and answers for first-time visitors.",
    breadcrumb: "Mass Times & Visit",
    changefreq: "monthly",
    priority: 0.9,
  },
  {
    path: "/parish-anthem",
    title: "Parish Anthem",
    description: "Listen to and read the parish anthem of St. Anthony Catholic Church, Gbaja.",
    breadcrumb: "Parish Anthem",
    parent: "/about",
    changefreq: "yearly",
    priority: 0.4,
  },
  {
    path: "/sacraments",
    title: "Sacraments",
    description:
      "How to prepare for and request the sacraments at St. Anthony Catholic Church, Gbaja — Baptism, Confirmation, Eucharist, Confession, Marriage and more.",
    breadcrumb: "Sacraments",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/marriage-classes",
    title: "Marriage Class Registration",
    description:
      "Register for marriage preparation classes at St. Anthony Catholic Church, Gbaja to prepare for the Sacrament of Holy Matrimony.",
    breadcrumb: "Marriage Classes",
    parent: "/sacraments",
    changefreq: "monthly",
    priority: 0.6,
  },
  {
    path: "/marriage-bans",
    title: "Marriage Banns",
    description:
      "Marriage banns announced at St. Anthony Catholic Church, Gbaja, in keeping with Catholic tradition, so that any impediment to a marriage can be made known.",
    breadcrumb: "Marriage Banns",
    parent: "/sacraments",
    changefreq: "weekly",
    priority: 0.5,
  },
  {
    path: "/book-mass",
    title: "Book a Mass Intention",
    description:
      "Book a Mass intention online at St. Anthony Catholic Church, Gbaja for thanksgiving, the repose of a soul or a special intention.",
    breadcrumb: "Book a Mass",
    changefreq: "monthly",
    priority: 0.8,
  },
  {
    path: "/book-mass/guest",
    title: "Guest Mass Booking",
    description:
      "Book a Mass intention at St. Anthony Catholic Church, Gbaja without creating an account. Confirmation is sent by email.",
    breadcrumb: "Guest Booking",
    parent: "/book-mass",
    changefreq: "monthly",
    priority: 0.6,
  },
  {
    path: "/serve-others",
    title: "Serve Others",
    description:
      "Discover parish ministries at St. Anthony Catholic Church, Gbaja — liturgical service, within the parish, and outreach beyond the parish.",
    breadcrumb: "Serve Others",
    pageType: "CollectionPage",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    path: "/groups",
    title: "Groups & Organizations",
    description:
      "Find your place in parish life at St. Anthony Catholic Church, Gbaja — lay organizations, pious societies, youth groups and service groups.",
    breadcrumb: "Groups & Organizations",
    pageType: "CollectionPage",
    changefreq: "monthly",
    priority: 0.7,
  },
  {
    path: "/events",
    title: "Events & Celebrations",
    description:
      "Discover upcoming celebrations, spiritual gatherings, and community activities at St. Anthony Catholic Church, Gbaja.",
    breadcrumb: "Events",
    pageType: "CollectionPage",
    changefreq: "weekly",
    priority: 0.8,
  },
  {
    path: "/calendar",
    title: "Parish Calendar",
    description:
      "The St. Anthony Catholic Church, Gbaja parish calendar: celebrations and liturgical observances, with calendar subscriptions for reminders.",
    breadcrumb: "Calendar",
    changefreq: "weekly",
    priority: 0.6,
  },
  {
    path: "/news",
    title: "Parish News & Updates",
    description: "The latest news and announcements from St. Anthony Catholic Church, Gbaja, Surulere, Lagos.",
    breadcrumb: "News",
    pageType: "CollectionPage",
    changefreq: "daily",
    priority: 0.8,
  },
  {
    path: "/gallery",
    title: "Parish Gallery",
    description:
      "Explore photographs and videos from the life of St. Anthony Catholic Church, Gbaja — sacred celebrations, fellowship, and community service.",
    breadcrumb: "Gallery",
    pageType: "CollectionPage",
    changefreq: "weekly",
    priority: 0.6,
  },
  {
    path: "/sermons",
    title: "Sermons",
    description: "Watch and listen to homilies from St. Anthony Catholic Church, Gbaja.",
    breadcrumb: "Sermons",
    noindex: true,
    noindexReason: PLACEHOLDER,
  },
  {
    path: "/bulletin",
    title: "Sunday Bulletins",
    description:
      "Stay connected with our parish community. Explore the latest Sunday bulletin and browse previous editions for parish news, announcements, readings, celebrations, and upcoming activities.",
    breadcrumb: "Sunday Bulletins",
    changefreq: "weekly",
    priority: 0.7,
  },
  {
    path: "/weekly-bulletin",
    title: "Weekly Bulletin",
    description: "Weekly bulletins from St. Anthony Catholic Church, Gbaja.",
    breadcrumb: "Weekly Bulletin",
    parent: "/bulletin",
    noindex: true,
    noindexReason: "Redirects to /bulletin.",
  },
  {
    path: "/blog",
    title: "Blog",
    description: "Stories and reflections from St. Anthony Catholic Church, Gbaja.",
    breadcrumb: "Blog",
    noindex: true,
    noindexReason: PLACEHOLDER,
  },
  {
    path: "/live",
    title: "Live Stream",
    description: "Join Mass and parish celebrations at St. Anthony Catholic Church, Gbaja online through our live stream.",
    breadcrumb: "Live Stream",
    changefreq: "weekly",
    priority: 0.6,
  },
  {
    path: "/donations",
    title: "Donations & Giving",
    description:
      "Support St. Anthony Catholic Church, Gbaja. Give online or by bank transfer to the parish and its projects.",
    breadcrumb: "Donations",
    changefreq: "monthly",
    priority: 0.7,
  },
  {
    path: "/charity",
    title: "Support Our Mission",
    description: "Support St. Anthony Catholic Church, Gbaja and its mission through your giving.",
    breadcrumb: "Support Our Mission",
    noindex: true,
    noindexReason: "Duplicates /donations.",
  },
  {
    path: "/registration",
    title: "Parish Registration",
    description: "Become a registered member of St. Anthony Catholic Church, Gbaja, Surulere, Lagos.",
    breadcrumb: "Registration",
    changefreq: "yearly",
    priority: 0.6,
  },
  {
    path: "/facilities",
    title: "Our Facilities",
    description: "The spaces at St. Anthony Catholic Church, Gbaja where the parish gathers to worship, learn and serve.",
    breadcrumb: "Facilities",
    changefreq: "yearly",
    priority: 0.4,
  },
  {
    path: "/rentals",
    title: "Hall & Rentals",
    description: "Book parish halls and venues at St. Anthony Catholic Church, Gbaja for events, conferences and celebrations.",
    breadcrumb: "Hall & Rentals",
    changefreq: "monthly",
    priority: 0.5,
  },
  {
    path: "/bookshop",
    title: "Parish Bookshop",
    description:
      "Visit the St. Anthony Catholic Church, Gbaja parish bookshop for Catholic books, sacramentals, rosaries, candles and faith gifts. Open in person—hours and contact on this page.",
    breadcrumb: "Bookshop",
    changefreq: "monthly",
    priority: 0.5,
  },
  {
    path: "/clinic",
    title: "St. Anthony Clinic",
    description: "Healthcare services offered to the community by the St. Anthony Catholic Church, Gbaja parish clinic.",
    breadcrumb: "Clinic",
    changefreq: "monthly",
    priority: 0.5,
  },
  {
    path: "/faq",
    title: "Frequently Asked Questions",
    description:
      "Answers to common questions about St. Anthony Catholic Church, Gbaja: Mass times, contacting the parish office, sacraments, Mass intentions, groups and giving.",
    breadcrumb: "FAQs",
    // FAQPage JSON-LD (with the questions) is emitted by the page itself via <FAQSchema>.
    changefreq: "monthly",
    priority: 0.7,
  },
  {
    path: "/contact",
    title: "Contact the Parish",
    description:
      "Contact St. Anthony Catholic Church, Gbaja in Surulere, Lagos. Send the parish office a message, find our email address and get directions.",
    breadcrumb: "Contact",
    pageType: "ContactPage",
    changefreq: "yearly",
    priority: 0.8,
  },
  {
    path: "/privacy-policy",
    title: "Privacy Policy",
    description: "How St. Anthony Catholic Church, Gbaja collects, uses and protects your personal information.",
    breadcrumb: "Privacy Policy",
    changefreq: "yearly",
    priority: 0.2,
  },
  {
    path: "/terms-of-service",
    title: "Terms of Service",
    description: "The terms that apply when you use the St. Anthony Catholic Church, Gbaja website and online services.",
    breadcrumb: "Terms of Service",
    changefreq: "yearly",
    priority: 0.2,
  },
  {
    path: "/cookies",
    title: "Cookie Policy",
    description: "How the St. Anthony Catholic Church, Gbaja website uses cookies and how to manage your preferences.",
    breadcrumb: "Cookie Policy",
    changefreq: "yearly",
    priority: 0.2,
  },

  // ── Private / transactional pages (rendered in the public layout) ──
  { path: "/login", title: "Sign In", description: "Sign in to your parish account.", breadcrumb: "Sign In", noindex: true, noindexReason: PRIVATE },
  { path: "/register", title: "Create an Account", description: "Create a parish account.", breadcrumb: "Register", noindex: true, noindexReason: PRIVATE },
  { path: "/payment/complete", title: "Payment Status", description: "Payment status.", breadcrumb: "Payment", noindex: true, noindexReason: PRIVATE },
  { path: "/my-mass-bookings", title: "My Mass Bookings", description: "Your Mass intention bookings.", breadcrumb: "My Mass Bookings", noindex: true, noindexReason: PRIVATE },
  { path: "/booking-history", title: "Booking History", description: "Your booking history.", breadcrumb: "Booking History", noindex: true, noindexReason: PRIVATE },
  { path: "/profile-settings", title: "Profile Settings", description: "Manage your profile.", breadcrumb: "Profile Settings", noindex: true, noindexReason: PRIVATE },
  { path: "/notification-settings", title: "Notification Settings", description: "Manage your notifications.", breadcrumb: "Notification Settings", noindex: true, noindexReason: PRIVATE },
  { path: "/settings", title: "Settings", description: "Account settings.", breadcrumb: "Settings", noindex: true, noindexReason: PRIVATE },
];

/** Routes whose metadata is set by the page itself from API data. */
export const dynamicRoutePatterns = ["/news/:slug", "/gallery/:slug", "/events/:slug"] as const;

/** Path prefixes that are always private (never indexed, never in the sitemap). */
export const privatePrefixes = ["/admin", "/dashboard", "/auth"] as const;

/** Legacy / duplicate URLs and their canonical targets (also mirrored as 301s in .htaccess). */
export const routeRedirects: Array<{ from: string; to: string }> = [
  { from: "/landing", to: "/" },
  { from: "/anthem", to: "/parish-anthem" },
  { from: "/privacy", to: "/privacy-policy" },
  { from: "/terms", to: "/terms-of-service" },
  { from: "/ministries", to: "/serve-others" },
  { from: "/mass-booking", to: "/book-mass" },
  { from: "/weekly-bulletin", to: "/bulletin" },
];

/** "/about/" → "/about", "" → "/" */
export function normalizePath(path: string): string {
  const clean = path.split(/[?#]/)[0] || "/";
  if (clean === "/") return "/";
  return clean.replace(/\/+$/, "") || "/";
}

const routeIndex = new Map(routeSeo.map((route) => [route.path, route]));

export function findRouteSeo(path: string): RouteSeo | undefined {
  return routeIndex.get(normalizePath(path));
}

export function isPrivatePath(path: string): boolean {
  const clean = normalizePath(path);
  return privatePrefixes.some((prefix) => clean === prefix || clean.startsWith(`${prefix}/`));
}

/** Ordered breadcrumb trail from Home to the given static route. */
export function getBreadcrumbTrail(path: string): Array<{ name: string; path: string }> {
  const trail: Array<{ name: string; path: string }> = [];
  let current = findRouteSeo(path);
  const seen = new Set<string>();
  while (current && !seen.has(current.path)) {
    seen.add(current.path);
    trail.unshift({ name: current.breadcrumb, path: current.path });
    if (current.path === "/") break;
    current = findRouteSeo(current.parent ?? "/");
  }
  return trail;
}

export function getIndexableRoutes(): RouteSeo[] {
  return routeSeo.filter((route) => !route.noindex);
}
