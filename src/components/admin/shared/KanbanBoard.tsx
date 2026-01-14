import type React from "react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

export interface KanbanColumn<TItem extends { id: string }> {
  id: string;
  title: string;
  helpText?: string;
  getItems: (all: TItem[]) => TItem[];
}

export interface KanbanBoardProps<TItem extends { id: string }> {
  items: TItem[];
  columns: KanbanColumn<TItem>[];
  /**
   * When an item is dropped into a column.
   * The page should persist this (API call) and then refetch/invalidate.
   */
  onMove: (args: { item: TItem; toColumnId: string }) => void | Promise<void>;
  /**
   * Render a compact card for the item (used in admin Kanban boards).
   */
  renderCard: (item: TItem) => React.ReactNode;
  /**
   * Disable DnD for columns/items that aren't supported by backend yet.
   */
  isMoveAllowed?: (args: { item: TItem; toColumnId: string }) => boolean;
}

/**
 * Lightweight Kanban using native HTML drag/drop (no extra deps).
 * This keeps the bundle small and works fine for admin workflows.
 */
export function KanbanBoard<TItem extends { id: string }>(props: KanbanBoardProps<TItem>) {
  const { items, columns, onMove, renderCard, isMoveAllowed } = props;
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const draggingItem = useMemo(
    () => (draggingId ? items.find((i) => i.id === draggingId) ?? null : null),
    [draggingId, items]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {columns.map((col) => {
        const colItems = col.getItems(items);
        const canDrop = draggingItem
          ? (isMoveAllowed ? isMoveAllowed({ item: draggingItem, toColumnId: col.id }) : true)
          : false;

        return (
          <div
            key={col.id}
            className={cn(
              "rounded-xl border bg-card shadow-sm",
              draggingItem && !canDrop && "opacity-60"
            )}
            onDragOver={(e) => {
              // Allow drop.
              e.preventDefault();
            }}
            onDrop={async (e) => {
              e.preventDefault();
              if (!draggingItem) return;
              const allowed = isMoveAllowed ? isMoveAllowed({ item: draggingItem, toColumnId: col.id }) : true;
              if (!allowed) return;
              await onMove({ item: draggingItem, toColumnId: col.id });
              setDraggingId(null);
            }}
          >
            <div className="p-4 border-b">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold">{col.title}</div>
                <div className="text-xs text-muted-foreground">{colItems.length}</div>
              </div>
              {col.helpText ? (
                <div className="mt-1 text-xs text-muted-foreground">{col.helpText}</div>
              ) : null}
            </div>

            <div className="p-3 space-y-3 min-h-[120px]">
              {colItems.map((item) => (
                <div
                  key={item.id}
                  draggable
                  role="button"
                  tabIndex={0}
                  aria-label="Kanban item"
                  className={cn(
                    "rounded-lg border bg-background shadow-sm p-3",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    draggingId === item.id && "opacity-60"
                  )}
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = "move";
                    setDraggingId(item.id);
                  }}
                  onDragEnd={() => setDraggingId(null)}
                >
                  {renderCard(item)}
                </div>
              ))}

              {colItems.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                  No items
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}


