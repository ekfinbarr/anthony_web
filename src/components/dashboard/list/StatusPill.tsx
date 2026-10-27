import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "info" | "neutral";

const TONES: Record<Tone, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300",
  warning: "bg-amber-50 text-amber-800 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300",
  danger: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/40 dark:text-red-300",
  info: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-950/40 dark:text-sky-300",
  neutral: "bg-muted text-muted-foreground ring-border",
};

const STATUS_TONE: Record<string, Tone> = {
  approved: "success",
  active: "success",
  successful: "success",
  paid: "success",
  replied: "success",
  pending: "warning",
  awaiting_verification: "warning",
  alternative_required: "info",
  sent: "info",
  read: "neutral",
  rejected: "danger",
  failed: "danger",
  cancelled: "neutral",
  inactive: "neutral",
};

const LABELS: Record<string, string> = {
  awaiting_verification: "Awaiting verification",
  alternative_required: "Needs your choice",
  successful: "Successful",
};

const statusLabel = (status: string) =>
  LABELS[status] ?? status.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export function StatusPill({ status, prefix, className }: { status?: string | null; prefix?: string; className?: string }) {
  if (!status) return null;
  const tone = STATUS_TONE[status] ?? "neutral";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        TONES[tone],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" aria-hidden />
      {prefix ? `${prefix} ${statusLabel(status).toLowerCase()}` : statusLabel(status)}
    </span>
  );
}
