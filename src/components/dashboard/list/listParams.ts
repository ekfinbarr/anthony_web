import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

/** Sentinel for "no filter" in Select controls (Radix forbids empty values). */
export const ALL = "__all";

export function useListParams(defaults: Record<string, string> = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => {
    const out: Record<string, string> = { ...defaults };
    searchParams.forEach((value, key) => {
      if (value !== "") out[key] = value;
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const update = (patch: Record<string, string | undefined>, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === ALL || value === defaults[key]) next.delete(key);
      else next.set(key, value);
    });
    if (resetPage && !("page" in patch)) next.delete("page");
    setSearchParams(next, { replace: true });
  };

  const activeFilterCount = Object.keys(params).filter(
    (k) => !["page", "sort", "search", "per_page"].includes(k) && params[k] !== defaults[k]
  ).length;

  const clear = () => setSearchParams(new URLSearchParams(), { replace: true });

  return { params, update, clear, activeFilterCount, page: Number(params.page ?? 1) };
}

/** Staggered entrance for list rows; respects reduced-motion via the animate class. */
export const rowAnimation = (index: number) => ({
  className: "animate-fade-in [animation-fill-mode:both]",
  style: { animationDelay: `${Math.min(index, 8) * 40}ms` },
});
