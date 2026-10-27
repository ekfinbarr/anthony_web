/** Upper bound for "all results" exports; larger sets should be filtered first. */
export const EXPORT_ROW_LIMIT = 5000;

/**
 * Pages through a list endpoint to collect every matching row (up to the limit).
 * `fetchPage` receives a 1-based page and returns the Laravel { data, meta } envelope.
 */
type PageEnvelope<T> = { data?: T[]; meta?: { last_page?: number }; last_page?: number };

export async function fetchAllPages<T>(
  fetchPage: (page: number, perPage: number) => Promise<PageEnvelope<T> | T[]>,
  perPage = 100
): Promise<{ rows: T[]; truncated: boolean }> {
  const rows: T[] = [];
  let page = 1;
  let last = 1;
  do {
    const res = await fetchPage(page, perPage);
    // Resource collections nest pagination under `meta`; plain paginators don't; some endpoints return arrays.
    if (Array.isArray(res)) {
      rows.push(...res);
      break;
    }
    rows.push(...(res.data ?? []));
    last = res.meta?.last_page ?? res.last_page ?? page;
    page += 1;
  } while (page <= last && rows.length < EXPORT_ROW_LIMIT);

  return { rows: rows.slice(0, EXPORT_ROW_LIMIT), truncated: page <= last || rows.length > EXPORT_ROW_LIMIT };
}
