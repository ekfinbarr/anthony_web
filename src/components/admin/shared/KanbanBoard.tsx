import type React from "react";
import { useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Ban, GripVertical, Loader2, MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StatusTone } from "@/lib/bookingStatus";
import { cn } from "@/lib/utils";

export type KanbanTone = StatusTone;

export interface KanbanColumn<TItem extends { id: string }> {
  id: string;
  title: string;
  helpText?: string;
  getItems: (all: TItem[]) => TItem[];
  /** Colour context for the column header, cards and drop highlight. */
  tone?: KanbanTone;
  icon?: LucideIcon;
  emptyText?: string;
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
  /** Explains why a column won't take the dragged item; shown on the column while dragging. */
  getMoveBlockedReason?: (args: { item: TItem; toColumnId: string }) => string | null;
  /** Opens the item (e.g. details dialog) when the card is clicked or Enter is pressed. */
  onCardOpen?: (item: TItem) => void;
  /** Item currently being saved: shown with a spinner and not draggable. */
  pendingId?: string | null;
  /** Item that just moved: plays a short "landed" animation. */
  highlightId?: string | null;
  /** Plays a celebratory burst on the highlighted card (e.g. on approval). */
  celebrate?: boolean;
}

const TONES: Record<
  KanbanTone,
  { top: string; header: string; chip: string; icon: string; card: string; drop: string; empty: string }
> = {
  amber: {
    top: "border-t-amber-400",
    header: "bg-gradient-to-b from-amber-50 to-transparent",
    chip: "bg-amber-100 text-amber-800",
    icon: "bg-amber-100 text-amber-700",
    card: "border-l-amber-400",
    drop: "ring-amber-400 bg-amber-50/70",
    empty: "text-amber-400",
  },
  emerald: {
    top: "border-t-emerald-500",
    header: "bg-gradient-to-b from-emerald-50 to-transparent",
    chip: "bg-emerald-100 text-emerald-800",
    icon: "bg-emerald-100 text-emerald-700",
    card: "border-l-emerald-500",
    drop: "ring-emerald-400 bg-emerald-50/70",
    empty: "text-emerald-400",
  },
  rose: {
    top: "border-t-rose-400",
    header: "bg-gradient-to-b from-rose-50 to-transparent",
    chip: "bg-rose-100 text-rose-800",
    icon: "bg-rose-100 text-rose-700",
    card: "border-l-rose-400",
    drop: "ring-rose-400 bg-rose-50/70",
    empty: "text-rose-300",
  },
  slate: {
    top: "border-t-slate-400",
    header: "bg-gradient-to-b from-slate-100 to-transparent",
    chip: "bg-slate-200 text-slate-700",
    icon: "bg-slate-200 text-slate-600",
    card: "border-l-slate-400",
    drop: "ring-slate-400 bg-slate-100/80",
    empty: "text-slate-300",
  },
  sky: {
    top: "border-t-sky-400",
    header: "bg-gradient-to-b from-sky-50 to-transparent",
    chip: "bg-sky-100 text-sky-800",
    icon: "bg-sky-100 text-sky-700",
    card: "border-l-sky-400",
    drop: "ring-sky-400 bg-sky-50/70",
    empty: "text-sky-300",
  },
  violet: {
    top: "border-t-violet-400",
    header: "bg-gradient-to-b from-violet-50 to-transparent",
    chip: "bg-violet-100 text-violet-800",
    icon: "bg-violet-100 text-violet-700",
    card: "border-l-violet-400",
    drop: "ring-violet-400 bg-violet-50/70",
    empty: "text-violet-300",
  },
};

const BURST = Array.from({ length: 10 }, (_, i) => {
  const angle = (i / 10) * Math.PI * 2;
  return { tx: `${Math.round(Math.cos(angle) * 56)}px`, ty: `${Math.round(Math.sin(angle) * 40)}px` };
});

/**
 * Lightweight Kanban using native HTML drag/drop (no extra deps).
 * Every card also has a "Move to" menu, so moves work without a mouse.
 */
export function KanbanBoard<TItem extends { id: string }>(props: KanbanBoardProps<TItem>) {
  const {
    items,
    columns,
    onMove,
    renderCard,
    isMoveAllowed,
    getMoveBlockedReason,
    onCardOpen,
    pendingId,
    highlightId,
    celebrate,
  } = props;
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const draggingItem = useMemo(
    () => (draggingId ? items.find((i) => i.id === draggingId) ?? null : null),
    [draggingId, items]
  );

  const columnOf = (item: TItem) => columns.find((c) => c.getItems([item]).length > 0)?.id ?? null;

  const blockedReason = (item: TItem, toColumnId: string): string | null => {
    if (columnOf(item) === toColumnId) return "Already here";
    const reason = getMoveBlockedReason?.({ item, toColumnId }) ?? null;
    if (reason) return reason;
    if (isMoveAllowed && !isMoveAllowed({ item, toColumnId })) return "Not allowed";
    return null;
  };

  const endDrag = () => {
    setDraggingId(null);
    setOverColumnId(null);
  };

  return (
    <div className="-mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
      {columns.map((col, colIndex) => {
        const tone = TONES[col.tone ?? "slate"];
        const Icon = col.icon;
        const colItems = col.getItems(items);
        const isSource = !!draggingItem && columnOf(draggingItem) === col.id;
        const reason = draggingItem && !isSource ? blockedReason(draggingItem, col.id) : null;
        const canDrop = !!draggingItem && !isSource && !reason;
        const isOver = overColumnId === col.id;

        return (
          <section
            key={col.id}
            aria-label={`${col.title} column, ${colItems.length} items`}
            style={{ animationDelay: `${colIndex * 70}ms` }}
            className={cn(
              "relative flex min-w-[260px] flex-1 snap-start flex-col rounded-xl border border-t-4 bg-card shadow-sm",
              "transition-[transform,box-shadow,opacity,filter] duration-300 motion-safe:animate-fade-in motion-safe:[animation-fill-mode:both]",
              tone.top,
              canDrop && "shadow-md",
              canDrop && isOver && cn("ring-2 motion-safe:scale-[1.015]", tone.drop),
              draggingItem && reason && "opacity-55 saturate-50"
            )}
            onDragOver={(e) => {
              if (!canDrop) return;
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (overColumnId !== col.id) setOverColumnId(col.id);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOverColumnId(null);
            }}
            onDrop={async (e) => {
              e.preventDefault();
              const item = draggingItem;
              endDrag();
              if (!item || blockedReason(item, col.id)) return;
              await onMove({ item, toColumnId: col.id });
            }}
          >
            <header className={cn("rounded-t-lg border-b px-4 py-3", tone.header)}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  {Icon ? (
                    <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full", tone.icon)}>
                      <Icon className="h-4 w-4" aria-hidden />
                    </span>
                  ) : null}
                  <h3 className="truncate font-semibold">{col.title}</h3>
                </div>
                <span
                  key={colItems.length}
                  className={cn(
                    "min-w-7 rounded-full px-2 py-0.5 text-center text-xs font-semibold tabular-nums motion-safe:animate-scale-in",
                    tone.chip
                  )}
                >
                  {colItems.length}
                </span>
              </div>
              {col.helpText ? <p className="mt-1 text-xs text-muted-foreground">{col.helpText}</p> : null}
            </header>

            {draggingItem && reason && !isSource ? (
              <div className="pointer-events-none absolute inset-x-3 top-16 z-10 flex items-center justify-center gap-1.5 rounded-md bg-background/95 px-2 py-1.5 text-center text-xs text-muted-foreground shadow-sm motion-safe:animate-scale-in">
                <Ban className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {reason}
              </div>
            ) : null}

            <div className="max-h-[68vh] min-h-[180px] flex-1 space-y-3 overflow-y-auto p-3">
              {canDrop ? (
                <div
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg border-2 border-dashed py-3 text-xs font-medium transition-all duration-200",
                    isOver ? cn("ring-0", tone.drop, "border-current") : "border-muted-foreground/25 text-muted-foreground"
                  )}
                >
                  <MoveRight className="h-3.5 w-3.5" aria-hidden />
                  {isOver ? "Release to move here" : "Drop here"}
                </div>
              ) : null}

              {colItems.map((item, i) => {
                const pending = pendingId === item.id;
                const highlighted = highlightId === item.id;
                const targets = columns.filter((c) => c.id !== col.id);
                return (
                  <div
                    key={item.id}
                    draggable={!pending}
                    role="button"
                    tabIndex={0}
                    aria-busy={pending || undefined}
                    style={{ animationDelay: `${Math.min(i, 8) * 45 + colIndex * 70}ms` }}
                    className={cn(
                      "group relative cursor-grab rounded-lg border border-l-4 bg-background p-3 shadow-sm active:cursor-grabbing",
                      "transition-[transform,box-shadow,opacity] duration-200 hover:-translate-y-0.5 hover:shadow-md",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2 motion-safe:duration-300 motion-safe:[animation-fill-mode:both]",
                      tone.card,
                      draggingId === item.id && "rotate-1 scale-95 opacity-40",
                      highlighted && "motion-safe:animate-kanban-pop",
                      pending && "pointer-events-none"
                    )}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest("[data-kanban-menu]")) return;
                      onCardOpen?.(item);
                    }}
                    onKeyDown={(e) => {
                      if (e.target !== e.currentTarget) return;
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onCardOpen?.(item);
                      }
                    }}
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = "move";
                      // Firefox will not start a drag without data.
                      e.dataTransfer.setData("text/plain", item.id);
                      setDraggingId(item.id);
                    }}
                    onDragEnd={endDrag}
                  >
                    <div className="flex items-start gap-1">
                      <GripVertical
                        className="-ml-1 mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-muted-foreground"
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">{renderCard(item)}</div>
                      <div data-kanban-menu>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="-mr-1 -mt-1 h-7 w-7 opacity-60 transition-opacity group-hover:opacity-100"
                              aria-label="Move to another column"
                            >
                              <MoveRight className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-60">
                            <DropdownMenuLabel>Move to…</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {targets.map((target) => {
                              const why = blockedReason(item, target.id);
                              const TargetIcon = target.icon;
                              return (
                                <DropdownMenuItem
                                  key={target.id}
                                  disabled={!!why}
                                  onSelect={() => void onMove({ item, toColumnId: target.id })}
                                  className="flex-col items-start gap-0.5"
                                >
                                  <span className="flex items-center gap-2">
                                    {TargetIcon ? <TargetIcon className="h-3.5 w-3.5" aria-hidden /> : null}
                                    {target.title}
                                  </span>
                                  {why ? <span className="text-xs text-muted-foreground">{why}</span> : null}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {pending ? (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/70 backdrop-blur-[1px]">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-label="Saving" />
                      </div>
                    ) : null}

                    {highlighted && celebrate ? (
                      <span aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 hidden motion-safe:block">
                        {BURST.map((b, k) => (
                          <span
                            key={k}
                            className={cn(
                              "absolute h-1.5 w-1.5 rounded-full animate-kanban-burst",
                              k % 3 === 0 ? "bg-church-gold-warm" : k % 3 === 1 ? "bg-emerald-400" : "bg-amber-300"
                            )}
                            style={{ "--tx": b.tx, "--ty": b.ty } as React.CSSProperties}
                          />
                        ))}
                      </span>
                    ) : null}
                  </div>
                );
              })}

              {colItems.length === 0 && !canDrop ? (
                <div className="flex flex-col items-center gap-2 px-2 py-6 text-center">
                  <EmptyColumnIllustration className={cn("h-16 w-20 motion-safe:animate-kanban-float", tone.empty)} />
                  <p className="text-sm text-muted-foreground">{col.emptyText ?? "Nothing here yet"}</p>
                </div>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/** Two stacked, empty cards: an "all clear" picture for an empty column. */
function EmptyColumnIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 64" fill="none" className={className} aria-hidden>
      <rect x="14" y="6" width="52" height="34" rx="6" fill="currentColor" opacity="0.18" transform="rotate(-6 40 23)" />
      <rect x="12" y="18" width="56" height="38" rx="6" fill="white" stroke="currentColor" strokeWidth="2" />
      <rect x="20" y="27" width="26" height="4" rx="2" fill="currentColor" opacity="0.55" />
      <rect x="20" y="36" width="38" height="3" rx="1.5" fill="currentColor" opacity="0.3" />
      <rect x="20" y="43" width="18" height="3" rx="1.5" fill="currentColor" opacity="0.3" />
      <circle cx="62" cy="14" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="70" cy="22" r="1.4" fill="currentColor" opacity="0.4" />
      <circle cx="8" cy="12" r="1.6" fill="currentColor" opacity="0.4" />
    </svg>
  );
}
