import { useLocation } from "react-router-dom";
import { site } from "@/config/site";
import { findRouteSeo, isPrivatePath } from "@/config/routes.seo";
import { webPageSchema } from "@/lib/seo/schema";
import SEOHead from "./SEOHead";
import JsonLd from "./JsonLd";

/**
 * Applies metadata for the current route from the central registry
 * (`src/config/routes.seo.ts`).
 *
 * - Registered static routes: title, description, canonical, robots, social tags + WebPage JSON-LD.
 * - Private areas (/admin, /dashboard, /auth): noindex.
 * - Dynamic routes (/news/:slug, /gallery/:slug) and unknown paths render nothing here;
 *   those pages (and NotFound) set their own metadata.
 */
const RouteSEO = () => {
  const { pathname } = useLocation();
  const route = findRouteSeo(pathname);

  if (route) {
    return (
      <>
        <SEOHead
          title={route.title}
          absoluteTitle={route.absoluteTitle}
          description={route.description}
          path={route.path}
          noindex={route.noindex}
          image={route.image}
        />
        {!route.noindex && (
          <JsonLd
            data={webPageSchema(site, {
              path: route.path,
              title: route.title,
              description: route.description,
              type: route.pageType,
            })}
          />
        )}
      </>
    );
  }

  if (isPrivatePath(pathname)) {
    return <SEOHead title="Parish Portal" description={site.defaultDescription} path={pathname} noindex />;
  }

  return null;
};

export default RouteSEO;
