import { useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, ChevronDown, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { getBulkActions, runBulkAction, type BulkActionDef, type BulkResult } from "@/services/bulk.service";
import { BULK_MAX_ITEMS, type BulkSelection } from "./useBulkSelection";

// ---- Checkbox cells -------------------------------------------------------------

export function SelectAllCheckbox<T>({ selection, rows, label = "Select all on this page" }: { selection: BulkSelection<T>; rows: T[]; label?: string }) {
  return (
    <Checkbox
      checked={selection.headerState(rows)}
      onCheckedChange={() => selection.toggleAll(rows)}
      aria-label={label}
      disabled={rows.length === 0}
    />
  );
}

export function SelectRowCheckbox<T>({ selection, row, label }: { selection: BulkSelection<T>; row: T; label: string }) {
  const checked = selection.isSelected(row);
  const blocked = !checked && selection.atLimit;
  return (
    <Checkbox
      checked={checked}
      onCheckedChange={() => selection.toggle(row)}
      onClick={(e) => e.stopPropagation()}
      aria-label={label}
      disabled={blocked}
      title={blocked ? `You can select up to ${BULK_MAX_ITEMS} items at once` : undefined}
    />
  );
}

// ---- Bar --------------------------------------------------------------------------

const TONE_CLASS: Record<BulkActionDef["tone"], string> = {
  default: "text-church-pearl hover:bg-white/10",
  success: "text-emerald-300 hover:bg-emerald-400/15",
  warning: "text-amber-300 hover:bg-amber-400/15",
  danger: "text-red-300 hover:bg-red-400/15",
};

interface BulkActionBarProps<T> {
  /** Resource key from config/bulk_actions.php, e.g. "posts". */
  resource: string;
  selection: BulkSelection<T>;
  /** Human name for a row, used in confirmations and the failure report. */
  describe: (row: T) => string;
  /** Singular/plural noun, e.g. ["post", "posts"]. */
  noun: [string, string];
  /** Called after any run so the table can refetch. */
  onComplete?: (result: BulkResult) => void;
  /** Extra controls (e.g. export selected). */
  children?: ReactNode;
}

export function BulkActionBar<T>({ resource, selection, describe, noun, onComplete, children }: BulkActionBarProps<T>) {
  const reduceMotion = useReducedMotion();
  const [pending, setPending] = useState<BulkActionDef | null>(null);
  const [reason, setReason] = useState("");
  const [report, setReport] = useState<{ action: BulkActionDef; result: BulkResult } | null>(null);

  const { data: catalog } = useQuery({ queryKey: ["bulk-actions"], queryFn: getBulkActions, staleTime: 5 * 60_000 });
  const actions = useMemo(() => catalog?.[resource] ?? [], [catalog, resource]);

  const count = selection.count;
  const nounFor = (n: number) => (n === 1 ? noun[0] : noun[1]);

  const mutation = useMutation({
    mutationFn: ({ action, why }: { action: BulkActionDef; why?: string }) =>
      runBulkAction(resource, { action: action.key, ids: selection.ids, reason: why || undefined }),
    onSuccess: (res, { action }) => {
      const { succeeded, failed } = res.data;
      selection.remove(succeeded.map((s) => s.id));
      onComplete?.(res.data);
      if (failed.length === 0) {
        notify.success(`${action.label}: ${succeeded.length} ${nounFor(succeeded.length)} updated`);
      } else {
        setReport({ action, result: res.data });
      }
    },
    onError: (error) => notify.error(error, { description: "No changes were made." }),
    onSettled: () => {
      setPending(null);
      setReason("");
    },
  });

  const start = (action: BulkActionDef) => {
    if (action.confirm || action.reason) setPending(action);
    else mutation.mutate({ action });
  };

  const primary = actions.slice(0, 3);
  const overflow = actions.slice(3);
  const busy = mutation.isPending;

  const rowsById = new Map(selection.rows.map((r) => [selection.getId(r), r]));
  const failedRows = report?.result.failed ?? [];

  return (
    <>
      <AnimatePresence>
        {count > 0 && (
          // Positioning lives on a plain wrapper: framer-motion writes an inline
          // transform that would otherwise cancel the centring translate.
          <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:bottom-6 sm:px-6">
          <motion.div
            role="region"
            aria-label="Bulk actions"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 32, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="pointer-events-auto w-full max-w-3xl"
          >
            <div className="border-glow flex w-full items-center gap-1 rounded-2xl bg-church-charcoal/95 p-2 text-church-pearl shadow-[0_20px_50px_-12px_rgb(0_0_0/0.55),0_0_40px_-10px_hsl(var(--church-gold)/0.45)] backdrop-blur-md sm:gap-2 sm:pl-4">
              <div className="flex min-w-0 items-center gap-2 pr-1 sm:pr-2">
                <span className="glow-pulse flex h-7 min-w-7 items-center justify-center rounded-full bg-church-gold px-2 text-sm font-bold text-church-charcoal" aria-live="polite">
                  {count}
                </span>
                <span className="hidden whitespace-nowrap text-sm sm:inline">
                  {nounFor(count)} selected{selection.atLimit && <span className="text-church-gold"> (max)</span>}
                </span>
              </div>

              <div className="mx-1 hidden h-6 w-px bg-white/15 sm:block" aria-hidden />

              {/* Desktop: inline actions */}
              <div className="hidden min-w-0 flex-1 items-center gap-1 sm:flex">
                {primary.map((a) => (
                  <Button
                    key={a.key}
                    size="sm"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => start(a)}
                    className={cn("h-9 rounded-xl px-3 transition-colors", TONE_CLASS[a.tone])}
                  >
                    {busy && mutation.variables?.action.key === a.key && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                    {a.label}
                  </Button>
                ))}
                {overflow.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost" disabled={busy} className="h-9 rounded-xl px-3 text-church-pearl hover:bg-white/10">
                        More <ChevronDown className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="center" side="top" className="w-52">
                      {overflow.map((a, i) => (
                        <div key={a.key}>
                          {a.tone === "danger" && i > 0 && <DropdownMenuSeparator />}
                          <DropdownMenuItem onClick={() => start(a)} className={cn(a.tone === "danger" && "text-destructive focus:text-destructive")}>
                            {a.label}
                          </DropdownMenuItem>
                        </div>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                {actions.length === 0 && !children && (
                  <span className="px-2 text-sm text-church-pearl/70">No bulk actions available to you here.</span>
                )}
              </div>

              {/* Phone: one menu */}
              <div className={cn("flex flex-1 sm:hidden", actions.length === 0 && "hidden")}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" disabled={busy || actions.length === 0} className="h-10 flex-1 rounded-xl bg-church-gold text-church-charcoal hover:bg-church-gold-light">
                      {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Actions <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" side="top" className="w-[calc(100vw-2rem)] max-w-sm">
                    {actions.map((a) => (
                      <DropdownMenuItem key={a.key} onClick={() => start(a)} className={cn("py-2.5", a.tone === "danger" && "text-destructive focus:text-destructive")}>
                        {a.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {children}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" onClick={selection.clear} disabled={busy} className="h-9 w-9 shrink-0 rounded-xl text-church-pearl/80 hover:bg-white/10 hover:text-white" aria-label="Clear selection">
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">Clear selection</TooltipContent>
              </Tooltip>
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation (destructive or needs a reason) */}
      <AlertDialog open={!!pending} onOpenChange={(open) => !open && !busy && setPending(null)}>
        <AlertDialogContent className="border-church-gold/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              {pending?.tone === "danger" && <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden />}
              {pending?.label} {count} {nounFor(count)}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pending?.key === "delete"
                ? "Deleted items are removed from the website and admin lists. This can't be undone from here."
                : "This applies to every selected item. Items that can't be changed are skipped and listed afterwards."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="max-h-36 space-y-1 overflow-y-auto rounded-lg bg-muted/50 p-3 text-sm">
            {selection.rows.slice(0, 8).map((r) => (
              <li key={selection.getId(r)} className="truncate">• {describe(r)}</li>
            ))}
            {count > 8 && <li className="text-muted-foreground">and {count - 8} more…</li>}
          </ul>
          {pending?.reason && (
            <div className="space-y-2">
              <Label htmlFor="bulk-reason">Reason (sent to the people affected)</Label>
              <Textarea id="bulk-reason" value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="e.g. The requested date is fully booked." />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={busy || (!!pending?.reason && reason.trim().length < 3)}
              onClick={(e) => {
                e.preventDefault();
                if (pending) mutation.mutate({ action: pending, why: reason.trim() });
              }}
              className={cn(pending?.tone === "danger" && "bg-destructive text-destructive-foreground hover:bg-destructive/90")}
            >
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {pending?.label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Partial-failure report */}
      <Dialog open={!!report} onOpenChange={(open) => !open && setReport(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{report?.action.label}: some items were skipped</DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
              {report?.result.succeeded.length ?? 0} done · {failedRows.length} skipped
            </DialogDescription>
          </DialogHeader>
          <ul className="max-h-72 space-y-2 overflow-y-auto">
            {failedRows.map((f) => {
              const row = rowsById.get(f.id);
              return (
                <li key={f.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
                  <p className="font-medium">{row ? describe(row) : f.id}</p>
                  <p className="text-muted-foreground">{f.reason}</p>
                </li>
              );
            })}
          </ul>
          <p className="text-xs text-muted-foreground">Skipped items are still selected so you can deal with them.</p>
          <DialogFooter>
            <Button onClick={() => setReport(null)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
