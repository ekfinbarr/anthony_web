import { useCallback, useMemo, useState } from "react";

/** Server-side cap per bulk request (config/bulk_actions.php `max_items`). */
export const BULK_MAX_ITEMS = 200;

/**
 * Row selection for admin tables. Selection survives paging and filtering,
 * so admins can build a set across pages; rows are remembered by id so the
 * export menu and failure report can still describe them.
 */
export function useBulkSelection<T>(getId: (row: T) => string) {
  const [selected, setSelected] = useState<Map<string, T>>(() => new Map());

  const isSelected = useCallback((row: T) => selected.has(getId(row)), [selected, getId]);

  const toggle = useCallback(
    (row: T) =>
      setSelected((prev) => {
        const next = new Map(prev);
        const id = getId(row);
        if (next.has(id)) next.delete(id);
        else if (next.size < BULK_MAX_ITEMS) next.set(id, row);
        return next;
      }),
    [getId]
  );

  /** Header checkbox: select every visible row, or clear them if all are selected. */
  const toggleAll = useCallback(
    (rows: T[]) =>
      setSelected((prev) => {
        const next = new Map(prev);
        const allOn = rows.length > 0 && rows.every((r) => next.has(getId(r)));
        for (const row of rows) {
          const id = getId(row);
          if (allOn) next.delete(id);
          else if (next.size < BULK_MAX_ITEMS) next.set(id, row);
        }
        return next;
      }),
    [getId]
  );

  const headerState = useCallback(
    (rows: T[]): boolean | "indeterminate" => {
      if (rows.length === 0) return false;
      const on = rows.filter((r) => selected.has(getId(r))).length;
      return on === 0 ? false : on === rows.length ? true : "indeterminate";
    },
    [selected, getId]
  );

  const clear = useCallback(() => setSelected(new Map()), []);
  const remove = useCallback(
    (ids: string[]) =>
      setSelected((prev) => {
        const next = new Map(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      }),
    []
  );

  const ids = useMemo(() => [...selected.keys()], [selected]);
  const rows = useMemo(() => [...selected.values()], [selected]);

  return {
    ids,
    rows,
    count: selected.size,
    atLimit: selected.size >= BULK_MAX_ITEMS,
    isSelected,
    toggle,
    toggleAll,
    headerState,
    clear,
    remove,
    getId,
  };
}

export type BulkSelection<T> = ReturnType<typeof useBulkSelection<T>>;

/** Stable id getter for the common `{ id }` row shape. */
export const rowId = (row: { id: string | number }) => String(row.id);
