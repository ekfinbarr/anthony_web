import { useCallback, useSyncExternalStore } from "react";
import type { CarouselApi } from "@/components/ui/carousel";

type EmblaApi = NonNullable<CarouselApi>;

/**
 * Reads a value from an Embla carousel and re-renders when it changes
 * (on "select" and "reInit"). `read` must return a primitive so React can
 * compare snapshots; `fallback` is used before the carousel mounts.
 */
export function useCarouselValue<T extends string | number | boolean>(
  api: CarouselApi | undefined,
  read: (api: EmblaApi) => T,
  fallback: T
): T {
  const subscribe = useCallback(
    (notify: () => void) => {
      if (!api) return () => {};
      api.on("select", notify);
      api.on("reInit", notify);
      return () => {
        api.off("select", notify);
        api.off("reInit", notify);
      };
    },
    [api]
  );

  return useSyncExternalStore(
    subscribe,
    () => (api ? read(api) : fallback),
    () => fallback
  );
}
