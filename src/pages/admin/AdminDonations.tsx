/**
 * Admin Donations
 *
 * Route: /admin/donations
 *
 * All giving at a glance: summary tiles and a fund breakdown for the chosen
 * window, a filterable list, and a details panel where the office can confirm
 * money for gifts still awaiting it. New gifts are recorded on /admin/donations/new.
 */

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Banknote,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Download,
  Eye,
  Hourglass,
  Loader2,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { IsoDatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { BulkActionBar, SelectAllCheckbox, SelectRowCheckbox } from "@/components/admin/data/BulkActionBar";
import { ExportMenu } from "@/components/admin/data/ExportMenu";
import { fetchAllPages } from "@/components/admin/data/fetchAllPages";
import { InsightsPanel } from "@/components/admin/data/InsightsPanel";
import { rowId, useBulkSelection } from "@/components/admin/data/useBulkSelection";
import { FUND_META, fundMeta } from "@/components/donations/givingCategories";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useToast } from "@/hooks/use-toast";
import { TONE_BADGE, TONE_DOT, type StatusTone } from "@/lib/bookingStatus";
import { downloadAuthenticatedFile } from "@/lib/downloadCsv";
import type { ExportColumn } from "@/lib/export/tableExport";
import { cn } from "@/lib/utils";
import donationService, { type AdminDonationFilters, type Donation, type DonationStatus, type DonationType } from "@/services/donation.service";

const STATUS_META: Record<string, { label: string; tone: StatusTone; icon: typeof CheckCircle2 }> = {
  successful: { label: "Received", tone: "emerald", icon: CheckCircle2 },
  pending: { label: "Awaiting money", tone: "amber", icon: Hourglass },
  failed: { label: "Failed", tone: "rose", icon: X },
  cancelled: { label: "Cancelled", tone: "slate", icon: X },
  refunded: { label: "Refunded", tone: "slate", icon: X },
};
const statusMeta = (s: string) => STATUS_META[s] ?? { label: s, tone: "slate" as StatusTone, icon: AlertCircle };

const METHOD_META: Record<string, { label: string; icon: typeof Banknote }> = {
  cash: { label: "Cash", icon: Banknote },
  bank_transfer: { label: "Bank transfer", icon: Building2 },
  flutterwave: { label: "Online", icon: CreditCard },
  paystack: { label: "Online", icon: CreditCard },
  stripe: { label: "Online", icon: CreditCard },
};
const methodMeta = (m: string) => METHOD_META[m] ?? { label: m.replaceAll("_", " "), icon: CreditCard };

const STATUS_FILTERS = [
  ["all", "All"],
  ["successful", "Received"],
  ["pending", "Awaiting money"],
  ["failed", "Failed"],
] as const;

const money = (amount: number | string, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(amount) || 0);

const shortDate = (value?: string) => (value ? new Date(value).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "—");

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";

/** Animates a number up to its new value (skipped when the user prefers reduced motion). */
function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const start = from.current;
    if (reduce || start === target) {
      from.current = target;
      setValue(target);
      return;
    }
    let frame = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(start + (target - start) * eased);
      if (p < 1) frame = requestAnimationFrame(tick);
      else from.current = target;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}

export default function AdminDonations() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const selection = useBulkSelection<Donation>(rowId);

  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 350);
  const [status, setStatus] = useState<DonationStatus | "all">("all");
  const [type, setType] = useState<DonationType | "all">("all");
  const [method, setMethod] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selected, setSelected] = useState<Donation | null>(null);

  const filters: AdminDonationFilters = useMemo(
    () => ({
      search: search || undefined,
      status: status === "all" ? undefined : status,
      type: type === "all" ? undefined : type,
      method: method === "all" ? undefined : method,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
    }),
    [search, status, type, method, startDate, endDate]
  );

  const listQuery = useQuery({
    queryKey: ["admin-donations", filters, page, pageSize],
    queryFn: () => donationService.listAdmin({ ...filters, page, per_page: pageSize }),
    placeholderData: (prev) => prev,
  });

  const donations = listQuery.data?.data ?? [];
  const summary = listQuery.data?.summary;
  const lastPage = listQuery.data?.meta?.last_page ?? 1;
  const total = listQuery.data?.meta?.total ?? donations.length;
  const filtered = Object.values(filters).some(Boolean);

  const resetPage = <T,>(fn: (v: T) => void) => (v: T) => {
    fn(v);
    setPage(1);
  };
  const clearFilters = () => {
    setSearchInput("");
    setStatus("all");
    setType("all");
    setMethod("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const exportColumns: ExportColumn<Donation>[] = [
    { header: "Date", value: (d) => d.donation_date ?? d.created_at, type: "date" },
    { header: "Reference", value: (d) => d.reference },
    { header: "Donor", value: (d) => (d.is_anonymous ? "Anonymous" : d.donor_name ?? "") },
    { header: "Email", value: (d) => (d.is_anonymous ? "" : d.donor_email ?? "") },
    { header: "Fund", value: (d) => fundMeta(d.type).label },
    { header: "Method", value: (d) => methodMeta(d.payment_gateway).label },
    { header: "Status", value: (d) => statusMeta(d.status).label },
    { header: "Dedication", value: (d) => (d.memorial_for ? `In memory of ${d.memorial_for}` : d.dedication ?? "") },
    { header: "Amount", value: (d) => Number(d.amount), type: "money", total: true },
  ];
  const fetchAllRows = () =>
    fetchAllPages<Donation>((p, per_page) => donationService.listAdmin({ ...filters, page: p, per_page }) as never);

  const received = summary?.received_amount ?? 0;
  const average = summary && summary.received_count ? summary.received_amount / summary.received_count : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <BulkActionBar resource="donations" selection={selection} describe={(d) => d.reference} noun={["donation", "donations"]} onComplete={() => qc.invalidateQueries({ queryKey: ["admin-donations"] })}>
        <ExportMenu variant="bar" title="Donations" filename="donations" columns={exportColumns} fetchAll={fetchAllRows} selected={selection.rows} currency="NGN" />
      </BulkActionBar>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Donations</h1>
          <p className="mt-1 text-muted-foreground">Every gift to the parish, online and at the office.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportMenu title="Donations" filename="donations" columns={exportColumns} fetchAll={fetchAllRows} selected={selection.rows} currency="NGN" />
          <Button variant="church" onClick={() => navigate("/admin/donations/new")} className="gap-2">
            <Plus className="h-4 w-4" /> Record a gift
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile index={0} tone="emerald" icon={CheckCircle2} label="Received" value={received} format={money} note={`${summary?.received_count ?? 0} gifts`} loading={listQuery.isLoading} />
        <StatTile
          index={1}
          tone="amber"
          icon={Hourglass}
          label="Awaiting money"
          value={summary?.pending_amount ?? 0}
          format={money}
          note={`${summary?.pending_count ?? 0} gifts to confirm`}
          loading={listQuery.isLoading}
          onClick={summary?.pending_count ? () => resetPage(setStatus)("pending") : undefined}
        />
        <StatTile index={2} tone="sky" icon={Users} label="Donors" value={summary?.donor_count ?? 0} format={(v) => Math.round(v).toLocaleString()} note="Who gave in this window" loading={listQuery.isLoading} />
        <StatTile index={3} tone="violet" icon={TrendingUp} label="Average gift" value={average} format={money} note="Received gifts only" loading={listQuery.isLoading} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          {/* Filters: search and selects on one row on wide screens, stacked on phones. */}
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px_180px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search donor, email, phone or reference…"
                    className="pl-9"
                    value={searchInput}
                    onChange={(e) => resetPage(setSearchInput)(e.target.value)}
                    aria-label="Search donations"
                  />
                </div>
                <Select value={type} onValueChange={(v) => resetPage(setType)(v as DonationType | "all")}>
                  <SelectTrigger aria-label="Fund"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All funds</SelectItem>
                    {Object.entries(FUND_META).map(([value, meta]) => (
                      <SelectItem key={value} value={value}>
                        <span className="flex items-center gap-2">
                          <span className={cn("h-2 w-2 rounded-full", TONE_DOT[meta.tone])} aria-hidden />
                          {meta.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={method} onValueChange={resetPage(setMethod)}>
                  <SelectTrigger aria-label="Payment method"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All methods</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="bank_transfer">Bank transfer</SelectItem>
                    <SelectItem value="flutterwave">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <ToggleGroup
                  type="single"
                  value={status}
                  onValueChange={(v) => v && resetPage(setStatus)(v as DonationStatus | "all")}
                  className="flex-wrap justify-start"
                  aria-label="Filter by status"
                >
                  {STATUS_FILTERS.map(([value, label]) => (
                    <ToggleGroupItem key={value} value={value} size="sm" className="gap-1.5">
                      {value !== "all" ? <span className={cn("h-2 w-2 rounded-full", TONE_DOT[statusMeta(value).tone])} aria-hidden /> : null}
                      {label}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                  <IsoDatePicker id="donation-start" className="sm:w-40" value={startDate} max={endDate || undefined} onChange={resetPage(setStartDate)} placeholder="From" />
                  <IsoDatePicker id="donation-end" className="sm:w-40" value={endDate} min={startDate || undefined} onChange={resetPage(setEndDate)} placeholder="To" />
                  {filtered ? (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="col-span-2 gap-1 text-muted-foreground sm:col-span-1">
                      <X className="h-3.5 w-3.5" /> Clear
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
              <div>
                <CardTitle>Gifts</CardTitle>
                <CardDescription>{listQuery.isLoading ? "Loading…" : `${total.toLocaleString()} ${total === 1 ? "gift" : "gifts"}`}</CardDescription>
              </div>
              <Select value={String(pageSize)} onValueChange={(v) => resetPage(setPageSize)(Number(v))}>
                <SelectTrigger className="w-[130px]" aria-label="Rows per page"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[10, 15, 25, 50].map((n) => <SelectItem key={n} value={String(n)}>{n} per page</SelectItem>)}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {listQuery.isLoading ? (
                <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
              ) : listQuery.error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
                  <h3 className="mb-2 text-lg font-semibold">Couldn't load donations</h3>
                  <p className="mb-4 text-muted-foreground">{listQuery.error instanceof Error ? listQuery.error.message : "An unexpected error occurred"}</p>
                  <Button onClick={() => listQuery.refetch()}>Try again</Button>
                </div>
              ) : donations.length === 0 ? (
                <EmptyGifts filtered={filtered} onClear={clearFilters} onRecord={() => navigate("/admin/donations/new")} />
              ) : (
                <>
                  {/* Phones and tablets: cards */}
                  <ul className="space-y-3 md:hidden">
                    {donations.map((d, i) => (
                      <li
                        key={d.id}
                        style={{ animationDelay: `${Math.min(i, 10) * 35}ms` }}
                        className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:[animation-fill-mode:both]"
                      >
                        <button
                          type="button"
                          onClick={() => setSelected(d)}
                          className={cn("flex w-full items-center gap-3 rounded-lg border border-l-4 p-3 text-left transition-shadow hover:shadow-md", toneBorder(fundMeta(d.type).tone))}
                        >
                          <DonorAvatar donation={d} />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">{donorName(d)}</span>
                            <span className="block truncate text-xs text-muted-foreground">{fundMeta(d.type).label} · {shortDate(d.donation_date ?? d.created_at)}</span>
                            <span className="mt-1 block"><StatusPill status={d.status} /></span>
                          </span>
                          <span className="shrink-0 text-right font-semibold tabular-nums">{money(d.amount, d.currency)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* Desktop: table */}
                  <div className="hidden overflow-x-auto rounded-md border md:block">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10"><SelectAllCheckbox selection={selection} rows={donations} /></TableHead>
                          <TableHead>Donor</TableHead>
                          <TableHead>Fund</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[60px]"><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {donations.map((d, i) => {
                          const m = methodMeta(d.payment_gateway);
                          return (
                            <TableRow
                              key={d.id}
                              style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
                              className="cursor-pointer transition-colors hover:bg-church-gold/[0.05] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:[animation-fill-mode:both]"
                              data-state={selection.isSelected(d) ? "selected" : undefined}
                              onClick={(e) => {
                                if ((e.target as HTMLElement).closest("button, [role=checkbox], label")) return;
                                setSelected(d);
                              }}
                            >
                              <TableCell className="w-10"><SelectRowCheckbox selection={selection} row={d} label={`Select ${d.reference}`} /></TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <DonorAvatar donation={d} />
                                  <div className="min-w-0">
                                    <div className="truncate font-medium">{donorName(d)}</div>
                                    <div className="truncate font-mono text-xs text-muted-foreground">{d.reference}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell><FundPill type={d.type} /></TableCell>
                              <TableCell className="text-right font-semibold tabular-nums">{money(d.amount, d.currency)}</TableCell>
                              <TableCell>
                                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"><m.icon className="h-3.5 w-3.5" aria-hidden />{m.label}</span>
                              </TableCell>
                              <TableCell className="whitespace-nowrap text-sm text-muted-foreground">{shortDate(d.donation_date ?? d.created_at)}</TableCell>
                              <TableCell><StatusPill status={d.status} /></TableCell>
                              <TableCell>
                                <Button variant="ghost" size="icon" aria-label={`View ${d.reference}`} onClick={() => setSelected(d)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                  {lastPage > 1 ? (
                    <div className="mt-6 flex flex-col items-center justify-between gap-3 sm:flex-row">
                      <div className="text-sm text-muted-foreground">Page {page} of {lastPage}</div>
                      <AdminPagination currentPage={page} totalPages={lastPage} onPageChange={setPage} />
                    </div>
                  ) : null}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <FundBreakdown rows={summary?.by_type ?? []} loading={listQuery.isLoading} onPick={(t) => resetPage(setType)(t as DonationType)} />
          <InsightsPanel module="donations" />
        </aside>
      </div>

      <DonationDetails
        donation={selected}
        onClose={() => setSelected(null)}
        onUpdated={(d) => {
          setSelected(d);
          qc.invalidateQueries({ queryKey: ["admin-donations"] });
          toast({ title: "Marked as received", description: d.donor_email ? `A receipt has been emailed to ${d.donor_email}.` : "The gift is now recorded as received." });
        }}
      />
    </div>
  );
}

const TONE_BORDER: Record<StatusTone, string> = {
  amber: "border-l-amber-400",
  emerald: "border-l-emerald-500",
  rose: "border-l-rose-400",
  slate: "border-l-slate-400",
  sky: "border-l-sky-400",
  violet: "border-l-violet-400",
};
const toneBorder = (tone: StatusTone) => TONE_BORDER[tone];

const TILE_TONE: Record<StatusTone, { chip: string; glow: string }> = {
  emerald: { chip: "bg-emerald-100 text-emerald-700", glow: "from-emerald-50" },
  amber: { chip: "bg-amber-100 text-amber-700", glow: "from-amber-50" },
  sky: { chip: "bg-sky-100 text-sky-700", glow: "from-sky-50" },
  violet: { chip: "bg-violet-100 text-violet-700", glow: "from-violet-50" },
  rose: { chip: "bg-rose-100 text-rose-700", glow: "from-rose-50" },
  slate: { chip: "bg-slate-100 text-slate-700", glow: "from-slate-50" },
};

function StatTile({
  index,
  tone,
  icon: Icon,
  label,
  value,
  format,
  note,
  loading,
  onClick,
}: {
  index: number;
  tone: StatusTone;
  icon: typeof CheckCircle2;
  label: string;
  value: number;
  format: (v: number) => string;
  note: string;
  loading?: boolean;
  onClick?: () => void;
}) {
  const shown = useCountUp(value);
  const t = TILE_TONE[tone];
  const body = (
    <>
      <div className={cn("pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent opacity-70", t.glow)} aria-hidden />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {loading ? <Skeleton className="mt-2 h-8 w-32" /> : <p className="mt-1 truncate text-2xl font-bold tabular-nums">{format(shown)}</p>}
          <p className="mt-1 text-xs text-muted-foreground">{note}</p>
        </div>
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6", t.chip)}>
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
    </>
  );
  const cls = "group relative overflow-hidden rounded-xl border bg-card p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md motion-safe:animate-fade-in motion-safe:[animation-fill-mode:both]";
  return onClick ? (
    <button type="button" onClick={onClick} className={cn(cls, "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring")} style={{ animationDelay: `${index * 70}ms` }}>
      {body}
    </button>
  ) : (
    <div className={cls} style={{ animationDelay: `${index * 70}ms` }}>{body}</div>
  );
}

/** Received totals per fund for the window: one measure, so one bar colour; labels carry the fund. */
function FundBreakdown({ rows, loading, onPick }: { rows: Array<{ type: string; total: number; count: number }>; loading?: boolean; onPick: (type: string) => void }) {
  const sorted = [...rows].sort((a, b) => b.total - a.total);
  const max = sorted[0]?.total ?? 0;
  const sum = sorted.reduce((s, r) => s + r.total, 0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <Card className="motion-safe:animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Received by fund</CardTitle>
        <CardDescription>For the current filters. Choose a fund to filter the list.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}</div>
        ) : sorted.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No received gifts in this window yet.</p>
        ) : (
          <TooltipProvider delayDuration={100}>
            <ul className="space-y-3">
              {sorted.map((row) => {
                const meta = fundMeta(row.type);
                const share = sum ? Math.round((row.total / sum) * 100) : 0;
                return (
                  <li key={row.type}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" onClick={() => onPick(row.type)} className="group block w-full rounded-md py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                          <span className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
                            <span className="flex min-w-0 items-center gap-2">
                              <span className={cn("h-2 w-2 shrink-0 rounded-full", TONE_DOT[meta.tone])} aria-hidden />
                              <span className="truncate font-medium group-hover:underline">{meta.label}</span>
                            </span>
                            <span className="shrink-0 tabular-nums text-muted-foreground">{money(row.total)}</span>
                          </span>
                          <span className="block h-2 w-full overflow-hidden rounded-full bg-muted">
                            <span
                              className="block h-full rounded-full bg-church-gold-warm transition-[width] duration-700 ease-out group-hover:bg-church-gold-warm/80"
                              style={{ width: ready && max ? `${Math.max(2, (row.total / max) * 100)}%` : "0%" }}
                            />
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p className="font-medium">{meta.label}</p>
                        <p className="text-xs">{money(row.total)} · {row.count} {row.count === 1 ? "gift" : "gifts"} · {share}% of received</p>
                      </TooltipContent>
                    </Tooltip>
                  </li>
                );
              })}
            </ul>
          </TooltipProvider>
        )}
      </CardContent>
    </Card>
  );
}

const donorName = (d: Donation) => (d.is_anonymous ? "Anonymous" : d.donor_name || d.user?.name || "—");

function DonorAvatar({ donation }: { donation: Donation }) {
  const tone = fundMeta(donation.type).tone;
  return (
    <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold", TILE_TONE[tone].chip)} aria-hidden>
      {donation.is_anonymous ? <Sparkles className="h-4 w-4" /> : initials(donorName(donation))}
    </span>
  );
}

function FundPill({ type }: { type: string }) {
  const meta = fundMeta(type);
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium", TONE_BADGE[meta.tone])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", TONE_DOT[meta.tone])} aria-hidden />
      {meta.label}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const meta = statusMeta(status);
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium", TONE_BADGE[meta.tone])}>
      <meta.icon className="h-3 w-3" aria-hidden />
      {meta.label}
    </span>
  );
}

function EmptyGifts({ filtered, onClear, onRecord }: { filtered: boolean; onClear: () => void; onRecord: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <svg viewBox="0 0 120 96" className="h-24 w-28 text-church-gold-warm motion-safe:animate-kanban-float" aria-hidden fill="none">
        <ellipse cx="60" cy="88" rx="34" ry="4" fill="currentColor" opacity="0.12" />
        <rect x="26" y="40" width="68" height="44" rx="6" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="2" />
        <rect x="20" y="30" width="80" height="14" rx="4" fill="white" stroke="currentColor" strokeWidth="2" />
        <rect x="55" y="30" width="10" height="54" fill="currentColor" opacity="0.45" />
        <path d="M60 30c-6-12-22-14-22-4 0 6 12 6 22 4Zm0 0c6-12 22-14 22-4 0 6-12 6-22 4Z" fill="white" stroke="currentColor" strokeWidth="2" />
        <circle cx="98" cy="18" r="2.5" fill="currentColor" opacity="0.6" />
        <circle cx="18" cy="22" r="2" fill="currentColor" opacity="0.4" />
        <path d="M104 34l2 4 4 2-4 2-2 4-2-4-4-2 4-2Z" fill="currentColor" opacity="0.5" />
      </svg>
      <div>
        <p className="font-medium">{filtered ? "No gifts match these filters" : "No gifts yet"}</p>
        <p className="text-sm text-muted-foreground">{filtered ? "Try a wider date range or another fund." : "Gifts made online or at the office will appear here."}</p>
      </div>
      {filtered ? (
        <Button variant="outline" onClick={onClear}>Clear filters</Button>
      ) : (
        <Button variant="church" className="gap-2" onClick={onRecord}><Plus className="h-4 w-4" /> Record a gift</Button>
      )}
    </div>
  );
}

const DETAIL_BAND: Record<StatusTone, string> = {
  emerald: "from-emerald-100 via-emerald-50",
  amber: "from-amber-100 via-amber-50",
  rose: "from-rose-100 via-rose-50",
  slate: "from-slate-100 via-slate-50",
  sky: "from-sky-100 via-sky-50",
  violet: "from-violet-100 via-violet-50",
};

function DonationDetails({ donation, onClose, onUpdated }: { donation: Donation | null; onClose: () => void; onUpdated: (d: Donation) => void }) {
  const { toast } = useToast();
  const [receivedOn, setReceivedOn] = useState("");
  const [reference, setReference] = useState("");
  const [justReceived, setJustReceived] = useState(false);

  const receive = useMutation({
    mutationFn: () => donationService.markReceived(donation!.id, { received_on: receivedOn || undefined, office_reference: reference.trim() || undefined }),
    onSuccess: (res) => {
      setJustReceived(true);
      setReceivedOn("");
      setReference("");
      onUpdated(res.data);
    },
    onError: (e: unknown) => toast({ title: "Couldn't confirm the gift", description: e instanceof Error ? e.message : "Try again.", variant: "destructive" }),
  });

  if (!donation) return <Dialog open={false} />;
  const status = statusMeta(donation.status);
  const m = methodMeta(donation.payment_gateway);
  const canReceive = donation.status === "pending" && (donation.payment_gateway === "cash" || donation.payment_gateway === "bank_transfer");

  const rows: Array<[string, React.ReactNode]> = [
    ["Fund", <FundPill key="f" type={donation.type} />],
    ["Method", <span key="m" className="inline-flex items-center gap-1.5"><m.icon className="h-3.5 w-3.5" aria-hidden />{m.label}</span>],
    ["Date", shortDate(donation.donation_date ?? donation.created_at)],
    ...(donation.processed_at ? ([["Received", shortDate(donation.processed_at)]] as Array<[string, React.ReactNode]>) : []),
    ...(donation.office?.transfer_reference ? ([["Transfer reference", <span key="t" className="font-mono">{donation.office.transfer_reference}</span>]] as Array<[string, React.ReactNode]>) : []),
    ...(donation.dedication ? ([["In honour of", donation.dedication]] as Array<[string, React.ReactNode]>) : []),
    ...(donation.memorial_for ? ([["In memory of", donation.memorial_for]] as Array<[string, React.ReactNode]>) : []),
  ];

  return (
    <Dialog open onOpenChange={(open) => { if (!open) { setJustReceived(false); onClose(); } }}>
      <DialogContent className="max-h-[92vh] overflow-hidden p-0 sm:max-w-lg">
        <div className={cn("bg-gradient-to-b to-transparent px-6 pb-4 pt-6", DETAIL_BAND[status.tone])}>
          <DialogHeader className="space-y-3 text-left">
            <div className="flex items-center justify-between gap-2">
              <StatusPill status={donation.status} />
              <span className="font-mono text-xs text-muted-foreground">{donation.reference}</span>
            </div>
            <DialogTitle className={cn("text-3xl font-bold tabular-nums", justReceived && "motion-safe:animate-kanban-pop")}>
              {money(donation.amount, donation.currency)}
            </DialogTitle>
            <DialogDescription className="text-base text-foreground">
              {donorName(donation)}
              {!donation.is_anonymous && donation.donor_email ? <span className="block text-sm text-muted-foreground">{donation.donor_email}</span> : null}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 pb-6">
          {justReceived ? (
            <p className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden /> Recorded as received{donation.donor_email ? " and the receipt is on its way." : "."}
            </p>
          ) : null}

          <dl className="divide-y rounded-lg border">
            {rows.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 px-3 py-2.5 text-sm">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right">{value}</dd>
              </div>
            ))}
          </dl>

          {donation.notes ? (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm">
              <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Message</p>
              <p className="whitespace-pre-wrap">{donation.notes}</p>
            </div>
          ) : null}

          {donation.office?.has_evidence ? (
            <Button variant="outline" className="w-full gap-2" onClick={() => downloadAuthenticatedFile(`admin-donations/${donation.id}/evidence`, `proof-${donation.reference}`)}>
              <Download className="h-4 w-4" /> Download proof of payment
            </Button>
          ) : null}

          {canReceive ? (
            <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/60 p-4">
              <div>
                <p className="font-medium">Has the money arrived?</p>
                <p className="text-xs text-muted-foreground">Confirming issues the receipt{donation.donor_email ? ` to ${donation.donor_email}` : ""}.</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <IsoDatePicker value={receivedOn} max={new Date().toISOString().slice(0, 10)} onChange={setReceivedOn} placeholder="Date received (today)" />
                <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Office reference (optional)" aria-label="Office reference" />
              </div>
              <Button variant="church" className="w-full gap-2" onClick={() => receive.mutate()} disabled={receive.isPending}>
                {receive.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Mark as received
              </Button>
            </div>
          ) : null}

          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden /> Recorded {shortDate(donation.created_at)}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
