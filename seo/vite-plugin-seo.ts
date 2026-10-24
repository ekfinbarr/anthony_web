/**
 * Build-time SEO for the client-rendered SPA.
 *
 * - Injects the default (home page) head into index.html — dev and build.
 * - Build only: writes one HTML file per registered route (e.g. dist/about.html)
 *   with that route's title, description, canonical, robots, Open Graph and
 *   Twitter tags, so crawlers and link-preview bots that do not execute
 *   JavaScript still get correct metadata. The app itself is unchanged: every
 *   file loads the same bundle and React takes over.
 * - Build only (after files are written): writes app-shell.html (dynamic pages, no canonical),
 *   noindex.html (private areas and 404s), sitemap.xml and robots.txt.
 *
 * Source of truth: src/config/siteConfig.ts and src/config/routes.seo.ts.
 */
import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";
import { createSiteConfig, type SiteConfig } from "../src/config/siteConfig.ts";
import { getIndexableRoutes, privatePrefixes, routeSeo, type RouteSeo } from "../src/config/routes.seo.ts";
import { computeHeadTags, type HeadTag, type PageMeta } from "../src/lib/seo/meta.ts";
import { siteGraph } from "../src/lib/seo/schema.ts";
import { canonicalUrl, serializeJsonLd } from "../src/lib/seo/url.ts";

const MARKER = "<!--app-seo-head-->";
const START = "<!-- seo:start -->";
const END = "<!-- seo:end -->";

type Env = Record<string, string>;
type SitemapEntry = { path: string; lastmod?: string };

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function renderTags(tags: HeadTag[]): string[] {
  return tags.flatMap((tag) => {
    if (tag.kind === "title") return [`<title>${escapeHtml(tag.content)}</title>`];
    if (tag.kind === "link") return tag.href ? [`<link rel="${tag.rel}" href="${escapeHtml(tag.href)}" />`] : [];
    return tag.content ? [`<meta ${tag.attr}="${tag.key}" content="${escapeHtml(tag.content)}" />`] : [];
  });
}

function renderSiteWide(site: SiteConfig): string[] {
  const lines: string[] = [];
  if (site.verification.google) {
    lines.push(`<meta name="google-site-verification" content="${escapeHtml(site.verification.google)}" />`);
  }
  if (site.verification.bing) {
    lines.push(`<meta name="msvalidate.01" content="${escapeHtml(site.verification.bing)}" />`);
  }
  const ga = site.analytics.gaMeasurementId;
  if (ga && /^G-[A-Z0-9]+$/.test(ga)) {
    // GA4 enhanced measurement records SPA page views from history changes automatically.
    lines.push(
      `<script async src="https://www.googletagmanager.com/gtag/js?id=${ga}"></script>`,
      `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga}');</script>`,
    );
  }
  lines.push(`<script type="application/ld+json">${serializeJsonLd(siteGraph(site))}</script>`);
  return lines;
}

function renderHead(site: SiteConfig, page: PageMeta): string {
  const lines = [...renderTags(computeHeadTags(site, page)), ...renderSiteWide(site)];
  return [START, ...lines, END].map((line) => `  ${line}`).join("\n").trimStart();
}

function routeMeta(route: RouteSeo): PageMeta {
  return {
    title: route.title,
    absoluteTitle: route.absoluteTitle,
    description: route.description,
    path: route.path,
    noindex: route.noindex,
    image: route.image,
  };
}

function replaceHead(html: string, head: string): string {
  const start = html.indexOf(START);
  const end = html.indexOf(END);
  if (start === -1 || end === -1) throw new Error("[seo] SEO head delimiters not found in index.html");
  return html.slice(0, start) + head + html.slice(end + END.length);
}

function buildSitemap(site: SiteConfig, dynamicEntries: SitemapEntry[]): string {
  const entries = getIndexableRoutes().map((route) =>
    [
      "  <url>",
      `    <loc>${canonicalUrl(site.url, route.path)}</loc>`,
      route.changefreq ? `    <changefreq>${route.changefreq}</changefreq>` : "",
      route.priority !== undefined ? `    <priority>${route.priority.toFixed(1)}</priority>` : "",
      "  </url>",
    ]
      .filter(Boolean)
      .join("\n"),
  );
  for (const { path, lastmod } of dynamicEntries) {
    entries.push(
      ["  <url>", `    <loc>${escapeHtml(canonicalUrl(site.url, path))}</loc>`, lastmod ? `    <lastmod>${lastmod}</lastmod>` : "", "  </url>"]
        .filter(Boolean)
        .join("\n"),
    );
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
}

function buildRobots(site: SiteConfig): string {
  const privatePublicLayout = routeSeo
    .filter((route) => route.noindex && route.noindexReason?.startsWith("Private"))
    // "$" anchors the match so e.g. /register does not also block /registration.
    .map((route) => `Disallow: ${route.path}$`);
  return [
    "# robots.txt — generated at build time by seo/vite-plugin-seo.ts",
    "User-agent: *",
    "Allow: /",
    ...privatePrefixes.flatMap((prefix) => [`Disallow: ${prefix}$`, `Disallow: ${prefix}/`]),
    ...privatePublicLayout,
    "Disallow: /api/",
    "",
    `Sitemap: ${site.url}/sitemap.xml`,
    "",
  ].join("\n");
}

/**
 * Optionally lists published news, gallery albums, events and bulletins from the API
 * so they appear in the sitemap. Enabled by SEO_SITEMAP_API_URL (e.g. https://api.stanthonygbaja.org/api).
 * Failures never break the build.
 */
async function fetchDynamicPaths(apiUrl: string | undefined, log: (msg: string) => void): Promise<SitemapEntry[]> {
  if (!apiUrl) return [];
  const base = apiUrl.replace(/\/+$/, "");
  const results: SitemapEntry[] = [];
  const fetchJson = async (url: string) => {
    const response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(10_000) });
    if (!response.ok) throw new Error(`${response.status} ${url}`);
    return response.json() as Promise<{ data?: Array<Record<string, unknown>>; last_page?: number; meta?: { last_page?: number } }>;
  };
  const collect = async (endpoint: string, toPath: (item: Record<string, unknown>) => string | undefined) => {
    for (let page = 1; page <= 50; page += 1) {
      const json = await fetchJson(`${base}/${endpoint}${endpoint.includes("?") ? "&" : "?"}page=${page}`);
      for (const item of json.data ?? []) {
        const path = toPath(item);
        const updated = typeof item.updated_at === "string" ? item.updated_at.slice(0, 10) : undefined;
        if (path) results.push({ path, lastmod: updated });
      }
      const lastPage = json.last_page ?? json.meta?.last_page ?? 1;
      if (page >= lastPage) break;
    }
  };
  try {
    await collect("posts/published?post_type=news&per_page=100", (item) =>
      typeof item.slug === "string" ? `/news/${encodeURIComponent(item.slug)}` : undefined,
    );
    await collect("gallery-albums?per_page=100", (item) =>
      typeof item.slug === "string" && item.is_published !== false ? `/gallery/${encodeURIComponent(item.slug)}` : undefined,
    );
    await collect("events/public?per_page=100", (item) =>
      typeof item.slug === "string" && item.is_published !== false ? `/events/${encodeURIComponent(item.slug)}` : undefined,
    );
    await collect("bulletins?per_page=100", (item) =>
      typeof item.slug === "string" && item.is_published !== false ? `/bulletin/${encodeURIComponent(item.slug)}` : undefined,
    );
    log(`[seo] Added ${results.length} dynamic URLs to sitemap.xml`);
  } catch (error) {
    log(`[seo] Skipped dynamic sitemap URLs: ${(error as Error).message}`);
  }
  return results;
}

export default function seoPlugin(options: { env: Env }): Plugin {
  const site = createSiteConfig(options.env);
  const home = routeSeo.find((route) => route.path === "/");
  if (!home) throw new Error("[seo] The route registry must contain '/'");

  return {
    name: "app-seo",
    transformIndexHtml: {
      order: "pre",
      handler(html) {
        if (!html.includes(MARKER)) throw new Error(`[seo] ${MARKER} marker missing from index.html`);
        return html.replace(MARKER, renderHead(site, routeMeta(home)));
      },
    },
    writeBundle: {
      order: "post",
      async handler(outputOptions) {
        const outDir = outputOptions.dir;
        if (!outDir) return;
        const indexPath = path.join(outDir, "index.html");
        if (!fs.existsSync(indexPath)) return;
        const template = fs.readFileSync(indexPath, "utf8");
        const emit = (fileName: string, source: string) => {
          const target = path.join(outDir, fileName);
          fs.mkdirSync(path.dirname(target), { recursive: true });
          fs.writeFileSync(target, source);
        };

        for (const route of routeSeo) {
          if (route.path === "/") continue;
          emit(`${route.path.slice(1)}.html`, replaceHead(template, renderHead(site, routeMeta(route))));
        }

        // Dynamic pages (news articles, gallery albums): generic head without a canonical;
        // the page sets its own canonical once data loads.
        emit(
          "app-shell.html",
          replaceHead(template, renderHead(site, { title: site.defaultTitle, absoluteTitle: true, description: site.defaultDescription })),
        );
        // Private areas and unknown URLs.
        emit(
          "noindex.html",
          replaceHead(template, renderHead(site, { title: site.name, absoluteTitle: true, description: site.defaultDescription, noindex: true })),
        );

        const dynamicEntries = await fetchDynamicPaths(options.env.SEO_SITEMAP_API_URL, (msg) => this.info(msg));
        emit("sitemap.xml", buildSitemap(site, dynamicEntries));
        emit("robots.txt", buildRobots(site));
        this.info(`[seo] Wrote ${routeSeo.length + 1} HTML entry points, sitemap.xml and robots.txt`);
      },
    },
  };
}
