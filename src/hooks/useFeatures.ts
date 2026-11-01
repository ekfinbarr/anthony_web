import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { allOnSnapshot, audienceAllows, featureForHref, type FeatureSnapshot } from "@/config/features";
import featureService from "@/services/feature.service";

const FALLBACK = allOnSnapshot();

/**
 * Loads the public module snapshot in parallel with page content.
 * Until it arrives, and if it fails, every module stays on so the first paint matches the prerendered site.
 */
export function useFeatures() {
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["features", "public"],
    queryFn: () => featureService.getPublic(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    placeholderData: FALLBACK,
  });

  const snapshot: FeatureSnapshot = query.isError ? FALLBACK : (query.data ?? FALLBACK);
  const roles = useMemo(
    () => (user ? (user.roles && user.roles.length > 0 ? user.roles : [user.role]) : null),
    [user],
  );

  const allows = (key: string, mode: "nav" | "page") => {
    const module = snapshot.modules[key];
    if (!module) return true;
    const flag = mode === "nav" ? module.nav : module.on;
    return flag && audienceAllows(module, roles);
  };

  return {
    isOn: (key: string) => allows(key, "page"),
    isNavOn: (key: string) => allows(key, "nav"),
    showNav: (href: string) => {
      const key = featureForHref(href);
      return key ? allows(key, "nav") : true;
    },
    showPage: (href: string) => {
      const key = featureForHref(href);
      return key ? allows(key, "page") : true;
    },
  };
}

export default useFeatures;
