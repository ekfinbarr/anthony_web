import { useLocation } from "react-router-dom";
import { getBreadcrumbTrail } from "@/config/routes.seo";
import Breadcrumbs from "./Breadcrumbs";

/**
 * Visible breadcrumbs for nested static pages (e.g. Home › Sacraments › Marriage Classes).
 * Top-level pages already have a clear position in the main navigation, so no trail is shown.
 */
const RouteBreadcrumbs = () => {
  const { pathname } = useLocation();
  const trail = getBreadcrumbTrail(pathname);
  if (trail.length < 3) return null;
  return <Breadcrumbs items={trail} />;
};

export default RouteBreadcrumbs;
