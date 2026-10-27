import { useState } from "react";
import { Link } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { format, isValid, parseISO } from "date-fns";
import { CalendarDays, ChevronRight, Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IsoDatePicker } from "@/components/ui/date-picker";
import { ChurchFrontIcon } from "@/components/icons/ParishIcons";
import {
  DashboardPageHeader,
  FilterSelect,
  ListEmpty,
  ListPagination,
  ListSkeleton,
  ListToolbar,
} from "@/components/dashboard/list/DashboardList";
import { rowAnimation, useListParams } from "@/components/dashboard/list/listParams";
import { StatusPill } from "@/components/dashboard/list/StatusPill";
import { useIsMobile } from "@/hooks/use-mobile";
import { listMyMassBookings } from "@/services/account.service";
import type { BookingOrder } from "@/services/massBookingOrder.service";
import { formatMoney } from "@/services/payment.service";
import { ExportMenu } from "@/components/admin/data/ExportMenu";
import { fetchAllPages } from "@/components/admin/data/fetchAllPages";
import type { ExportColumn } from "@/lib/export/tableExport";

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "amount_desc", label: "Amount: high to low" },
  { value: "amount_asc", label: "Amount: low to high" },
];

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "alternative_required", label: "Needs your choice" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled" },
];

const PAYMENT_STATUSES = [
  { value: "pending", label: "Not paid" },
  { value: "awaiting_verification", label: "Awaiting verification" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "rejected", label: "Rejected" },
];

const PAYMENT_METHODS: Record<string, string> = {
  flutterwave: "Online payment",
  bank_transfer: "Bank transfer",
  cash: "Cash at the parish office",
};

const fmtDate = (value?: string | null, pattern = "EEE, d MMM yyyy") => {
  if (!value) return "—";
  const d = parseISO(value);
  return isValid(d) ? format(d, pattern) : value;
};

const fmtTime = (value?: string | null) => {
  if (!value) return null;
  const d = parseISO(`1970-01-01T${value.slice(0, 5)}`);
  return isValid(d) ? format(d, "h:mm a") : value;
};

type Intention = NonNullable<BookingOrder["intentions"]>[number];

function IntentionLine({ intention }: { intention: Intention }) {
  return (
    <div className="flex gap-3 min-w-0">
      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-church-gold/15 text-church-brown dark:text-church-gold">
        <span className="text-[10px] font-semibold uppercase leading-none">{fmtDate(intention.booking_date, "MMM")}</span>
        <span className="text-lg font-bold leading-tight">{fmtDate(intention.booking_date, "d")}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {intention.mass_schedule?.title ?? "Mass"}
          {intention.mass_schedule?.start_time && (
            <span className="text-muted-foreground"> · {fmtTime(intention.mass_schedule.start_time)}</span>
          )}
        </p>
        <p className="line-clamp-1 text-sm text-muted-foreground">{intention.intention}</p>
      </div>
    </div>
  );
}

function BookingDetails({ order }: { order: BookingOrder }) {
  return (
    <div className="space-y-6 pb-6">
      <div className="flex flex-wrap gap-2">
        <StatusPill status={order.status} />
        <StatusPill status={order.payment_status} prefix="Payment" />
      </div>

      <dl className="grid grid-cols-2 gap-4 rounded-xl bg-muted/50 p-4 text-sm">
        <div>
          <dt className="text-xs text-muted-foreground">Amount</dt>
          <dd className="font-semibold">{formatMoney(Number(order.amount), order.currency)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Payment method</dt>
          <dd>{PAYMENT_METHODS[order.payment_method] ?? order.payment_method}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Booked on</dt>
          <dd>{fmtDate(order.created_at, "d MMM yyyy")}</dd>
        </div>
        {order.receipt_number && (
          <div>
            <dt className="text-xs text-muted-foreground">Receipt</dt>
            <dd className="font-mono text-xs">{order.receipt_number}</dd>
          </div>
        )}
      </dl>

      {(order.rejected_reason || order.cancelled_reason) && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
          {order.rejected_reason || order.cancelled_reason}
        </p>
      )}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">
          Intentions ({order.intentions?.length ?? 0})
        </h3>
        {(order.intentions ?? []).map((i) => (
          <div key={i.id} className="space-y-2 rounded-xl border p-3">
            <IntentionLine intention={i} />
            <p className="text-sm whitespace-pre-wrap">{i.intention}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {i.beneficiary_name && <span>For {i.beneficiary_name}</span>}
              {i.offered_by && <span>Offered by {i.offered_by}</span>}
              {(i.intention_labels ?? []).map((l) => (
                <span key={l} className="rounded-full bg-muted px-2 py-0.5">{l}</span>
              ))}
              <StatusPill status={i.status} />
            </div>
            {i.status === "alternative_required" && i.proposed_booking_date && (
              <p className="rounded-lg bg-sky-50 p-2 text-xs text-sky-800 dark:bg-sky-950/40 dark:text-sky-200">
                The parish proposed {fmtDate(i.proposed_booking_date)} instead. Check your email to accept or choose another date.
              </p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}

export default function MyMassBookings() {
  const isMobile = useIsMobile();
  const { params, update, clear, activeFilterCount, page } = useListParams({ sort: "newest" });
  const [selected, setSelected] = useState<BookingOrder | null>(null);

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["me", "mass-bookings", params],
    queryFn: () => listMyMassBookings({ ...params, per_page: 8 }),
    placeholderData: keepPreviousData,
  });

  const rows = data?.data ?? [];
  const period = params.period ?? "all";

  const exportColumns: ExportColumn<BookingOrder>[] = [
    { header: "Reference", value: (o) => o.reference },
    { header: "Booked", value: (o) => o.created_at ?? null, type: "date" },
    {
      header: "Masses",
      value: (o) => (o.intentions ?? []).map((i) => `${fmtDate(i.booking_date, "d MMM yyyy")} — ${i.mass_schedule?.title ?? "Mass"}`).join("; "),
      width: 40,
    },
    { header: "Intentions", value: (o) => (o.intentions ?? []).map((i) => i.intention).join(" | "), width: 50 },
    { header: "Status", value: (o) => o.status },
    { header: "Payment", value: (o) => o.payment_status },
    { header: "Receipt", value: (o) => o.receipt_number ?? "" },
    { header: "Amount", value: (o) => Number(o.amount), type: "money", total: true },
  ];
  const fetchAllBookings = () =>
    fetchAllPages<BookingOrder>((page, per_page) => listMyMassBookings({ ...params, page, per_page }), 50);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <DashboardPageHeader
        icon={<ChurchFrontIcon size="lg" className="hidden sm:inline-flex" />}
        title="My Mass bookings"
        description="Track your Mass intentions, payments and receipts."
        actions={
          <>
            <ExportMenu title="My Mass bookings" filename="my-mass-bookings" columns={exportColumns} fetchAll={fetchAllBookings} className="w-full sm:w-auto" />
            <Button asChild className="w-full sm:w-auto">
              <Link to="/book-mass">
                <Plus className="mr-2 h-4 w-4" /> Book a Mass
              </Link>
            </Button>
          </>
        }
      />

      <Tabs value={period} onValueChange={(v) => update({ period: v === "all" ? undefined : v })}>
        <TabsList className="grid w-full grid-cols-3 sm:inline-grid sm:w-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>
      </Tabs>

      <ListToolbar
        search={params.search}
        onSearch={(v) => update({ search: v })}
        searchPlaceholder="Search reference, intention or name…"
        sort={params.sort}
        sortOptions={SORTS}
        onSort={(v) => update({ sort: v })}
        activeFilterCount={activeFilterCount - (params.period ? 1 : 0)}
        onClear={clear}
      >
        <FilterSelect label="Booking status" value={params.status} options={STATUSES} onChange={(v) => update({ status: v })} />
        <FilterSelect label="Payment" value={params.payment_status} options={PAYMENT_STATUSES} onChange={(v) => update({ payment_status: v })} />
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Booked from</Label>
          <IsoDatePicker value={params.from} max={params.to} onChange={(v) => update({ from: v })} placeholder="Any date" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Booked to</Label>
          <IsoDatePicker value={params.to} min={params.from} onChange={(v) => update({ to: v })} placeholder="Any date" />
        </div>
      </ListToolbar>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <ListEmpty
          icon={<ChurchFrontIcon size="lg" />}
          title="We couldn't load your bookings"
          description="Please check your connection and try again."
          action={<Button variant="outline" onClick={() => refetch()}>Try again</Button>}
        />
      ) : rows.length === 0 ? (
        <ListEmpty
          icon={<ChurchFrontIcon size="lg" />}
          title={params.search || activeFilterCount ? "No bookings match" : "No Mass bookings yet"}
          description={
            params.search || activeFilterCount
              ? "Try a different search or clear the filters."
              : "Offer a Mass for a loved one, a thanksgiving or a special intention."
          }
          action={
            params.search || activeFilterCount ? (
              <Button variant="outline" onClick={clear}>Clear filters</Button>
            ) : (
              <Button asChild><Link to="/book-mass">Book a Mass</Link></Button>
            )
          }
        />
      ) : (
        <ul className={`space-y-3 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
          {rows.map((order, index) => {
            const intentions = order.intentions ?? [];
            const anim = rowAnimation(index);
            return (
              <li key={order.id} className={anim.className} style={anim.style}>
                <Card className="group overflow-hidden transition-all hover:-translate-y-0.5 hover:border-church-gold/40 hover:shadow-md">
                  <button
                    type="button"
                    onClick={() => setSelected(order)}
                    className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`View booking ${order.reference}`}
                  >
                    <CardContent className="space-y-3 p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-mono text-sm font-semibold">{order.reference}</p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                            Booked {fmtDate(order.created_at, "d MMM yyyy")}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusPill status={order.status} />
                          <StatusPill status={order.payment_status} prefix="Payment" />
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {intentions.slice(0, 2).map((i) => (
                          <IntentionLine key={i.id} intention={i} />
                        ))}
                      </div>

                      <div className="flex items-center justify-between border-t pt-3 text-sm">
                        <span className="text-muted-foreground">
                          {intentions.length} intention{intentions.length === 1 ? "" : "s"}
                          {intentions.length > 2 && ` · +${intentions.length - 2} more`}
                        </span>
                        <span className="flex items-center gap-2 font-semibold">
                          {formatMoney(Number(order.amount), order.currency)}
                          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
                        </span>
                      </div>
                    </CardContent>
                  </button>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <ListPagination meta={data?.meta} onPage={(p) => update({ page: String(p) }, false)} noun="bookings" />

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={isMobile ? "max-h-[90vh] overflow-y-auto rounded-t-2xl" : "w-full overflow-y-auto sm:max-w-lg"}
        >
          {selected && (
            <>
              <SheetHeader className="mb-4 text-left">
                <SheetTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-church-gold" aria-hidden /> {selected.reference}
                </SheetTitle>
                <SheetDescription>Mass booking details</SheetDescription>
              </SheetHeader>
              <BookingDetails order={selected} />
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
