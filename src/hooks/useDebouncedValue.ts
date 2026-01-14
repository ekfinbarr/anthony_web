import { useEffect, useState } from "react";

/**
 * useDebouncedValue
 *
 * Small utility hook used across admin list pages to debounce search input,
 * preventing excessive API requests while typing.
 */
export function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}


