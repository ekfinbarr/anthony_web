import type React from "react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, CalendarDays, Church, Mail, Phone, Search, Settings2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { apiClient } from "@/lib/apiClient";
import AmountInput from "@/components/forms/AmountInput";
import { formatMoney } from "@/services/payment.service";
import type { BookingOrder } from "@/services/massBookingOrder.service";
import { BulkActionBar, SelectAllCheckbox, SelectRowCheckbox } from "@/components/admin/data/BulkActionBar";
import { ExportMenu } from "@/components/admin/data/ExportMenu";
import { fetchAllPages } from "@/components/admin/data/fetchAllPages";
import { InsightsPanel } from "@/components/admin/data/InsightsPanel";
import { rowId, useBulkSelection } from "@/components/admin/data/useBulkSelection";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useToast } from "@/hooks/use-toast";
import type { ExportColumn } from "@/lib/export/tableExport";
import { PAYMENT_METHOD_LABEL, TONE_BADGE, TONE_BORDER_L, TONE_DOT, bookingStatusMeta, paymentStatusMeta } from "@/lib/bookingStatus";
import { cn } from "@/lib/utils";

type Rules = {
  offering: { minimum: number; maximum: number | null };
  categories: Array<{ value: string; label: string }>;
  horizon_days: number | null;
  hold_minutes: number;
  transfer_proof_required: boolean;
  enabled_methods: string[];
  bank_draft: { bank_name: string; account_name: string; account_number: string; instructions: string };
  currency: string;
};

const STATUS_FILTERS = [
  ["all", "All"],
  ["pending", "Requested"],
  ["alternative_required", "Needs new time"],
  ["approved", "Approved"],
  ["rejected", "Rejected"],
  ["cancelled", "Cancelled"],
] as const;

const PER_PAGE = 15;

function StatusPill({ status, kind = "booking" }: { status: string; kind?: "booking" | "payment" }) {
  const meta = kind === "booking" ? bookingStatusMeta(status) : paymentStatusMeta(status);
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium", TONE_BADGE[meta.tone])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", TONE_DOT[meta.tone])} aria-hidden />
      {meta.label}
    </span>
  );
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== "all") q.set(k, String(v));
  });
  return q.toString();
}

const MassBookingOrdersPanel = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const selection = useBulkSelection<BookingOrder>(rowId);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput, 350);
  const [status, setStatus] = useState<string>("all");
  const [payment, setPayment] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [draftMinOffering, setDraftMinOffering] = useState<number | null | undefined>(undefined);
  const [draftMaxOffering, setDraftMaxOffering] = useState<number | null | undefined>(undefined);
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const filters = { search, status, payment_status: payment };

  const list = useQuery({
    queryKey: ["mass-booking-orders", filters, page],
    queryFn: async () =>
      (await apiClient.get<{ data: BookingOrder[]; meta?: { last_page?: number; total?: number } }>(
        `mass-booking-orders?${buildQuery({ ...filters, page, per_page: PER_PAGE })}`
      )).data,
    placeholderData: (prev) => prev,
  });

  const rules = useQuery({
    queryKey: ["mass-booking-rules"],
    queryFn: async () => (await apiClient.get<{ data: Rules }>("mass-booking-orders/rules")).data.data,
  });

  const detail = useQuery({
    queryKey: ["mass-booking-order", selected],
    enabled: Boolean(selected),
    queryFn: async () => (await apiClient.get<{ data: BookingOrder }>(`mass-booking-orders/${selected}`)).data.data,
  });

  const act = useMutation({
    mutationFn: async ({ path, body }: { path: string; body?: unknown }) => {
      const res = await apiClient.post<{ message: string }>(path, body ?? {});
      return res.data.message;
    },
    onSuccess: async (text) => {
      toast({ title: "Done", description: text });
      setReason("");
      await qc.invalidateQueries({ queryKey: ["mass-booking-orders"] });
      await qc.invalidateQueries({ queryKey: ["mass-booking-order", selected] });
      // Order actions move its intentions too.
      await qc.invalidateQueries({ queryKey: ["admin-mass-bookings"] });
      await qc.invalidateQueries({ queryKey: ["admin-mass-bookings-kanban"] });
    },
    onError: (error: unknown) =>
      toast({ title: "Action failed", description: error instanceof Error ? error.message : "The action failed.", variant: "destructive" }),
  });

  const saveRules = useMutation({
    mutationFn: async (body: Record<string, unknown>) => (await apiClient.put<{ message: string }>("mass-booking-orders/rules", body)).data.message,
    onSuccess: async (text) => {
      toast({ title: "Rules saved", description: text });
      setDraftMinOffering(undefined);
      setDraftMaxOffering(undefined);
      setRulesOpen(false);
      await qc.invalidateQueries({ queryKey: ["mass-booking-rules"] });
    },
    onError: (error: unknown) =>
      toast({ title: "Couldn't save rules", description: error instanceof Error ? error.message : "The rules could not be saved.", variant: "destructive" }),
  });

  const minOffering = draftMinOffering === undefined ? (rules.data?.offering.minimum ?? null) : draftMinOffering;
  const maxOffering = draftMaxOffering === undefined ? (rules.data?.offering.maximum ?? null) : draftMaxOffering;

  const order = detail.data;

  const exportColumns: ExportColumn<BookingOrder>[] = [
    { header: "Reference", value: (o) => o.reference },
    { header: "Booked", value: (o) => o.created_at ?? null, type: "datetime" },
    { header: "Contact", value: (o) => o.contact?.name ?? "" },
    { header: "Email", value: (o) => o.contact?.email ?? "" },
    { header: "Phone", value: (o) => o.contact?.phone ?? "" },
    { header: "Intentions", value: (o) => o.intentions?.length ?? 0, type: "number", total: true },
    {
      header: "Masses",
      value: (o) =>
        (o.intentions ?? []).map((i) => `${i.booking_date} ${i.mass_schedule?.title ?? ""}`.trim()).join("; "),
      width: 40,
    },
    { header: "Status", value: (o) => o.status },
    { header: "Payment", value: (o) => o.payment_status },
    { header: "Method", value: (o) => o.payment_method },
    { header: "Receipt", value: (o) => o.receipt_number ?? "" },
    { header: "Amount", value: (o) => Number(o.amount), type: "money", total: true },
  ];
  const fetchAllRows = () =>
    fetchAllPages<BookingOrder>(async (p, per_page) =>
      (await apiClient.get<{ data: BookingOrder[]; meta?: { last_page?: number } }>(
        `mass-booking-orders?${buildQuery({ ...filters, page: p, per_page })}`
      )).data
    );
  const rows = list.data?.data ?? [];
  const lastPage = list.data?.meta?.last_page ?? 1;
  const total = list.data?.meta?.total;
  const filtered = Boolean(search) || status !== "all" || payment !== "all";
  const canDecide = order ? ["pending", "alternative_required"].includes(order.status) : false;
  const canCancel = order ? !["cancelled", "rejected"].includes(order.status) : false;

  return (
    <div className="space-y-6">
      <BulkActionBar
        resource="mass_booking_orders"
        selection={selection}
        describe={(o) => `${o.reference} · ${o.contact?.name ?? ""}`}
        noun={["booking", "bookings"]}
        onComplete={() => qc.invalidateQueries({ queryKey: ["mass-booking-orders"] })}
      >
        <ExportMenu variant="bar" title="Mass bookings" filename="mass-bookings" columns={exportColumns} fetchAll={fetchAllRows} selected={selection.rows} currency="NGN" />
      </BulkActionBar>
      <InsightsPanel module="mass_bookings" title="Mass booking insights" />

      <Card>
        <div className="space-y-3 border-b p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="order-search"
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  setPage(1);
                }}
                placeholder="Name, phone, email or reference"
                className="pl-9"
                aria-label="Search bookings"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={payment} onValueChange={(v) => { setPayment(v); setPage(1); }}>
                <SelectTrigger className="w-[190px]" aria-label="Payment status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All payments</SelectItem>
                  <SelectItem value="pending">Unpaid</SelectItem>
                  <SelectItem value="awaiting_verification">Awaiting verification</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Payment failed</SelectItem>
                </SelectContent>
              </Select>
              <ExportMenu title="Mass bookings" filename="mass-bookings" columns={exportColumns} fetchAll={fetchAllRows} selected={selection.rows} currency="NGN" size="sm" />
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setRulesOpen(true)} disabled={!rules.data}>
                <Settings2 className="h-4 w-4" /> Booking rules
              </Button>
            </div>
          </div>
          <ToggleGroup
            type="single"
            value={status}
            onValueChange={(v) => { if (v) { setStatus(v); setPage(1); } }}
            className="flex-wrap justify-start"
            aria-label="Filter by status"
          >
            {STATUS_FILTERS.map(([value, label]) => (
              <ToggleGroupItem key={value} value={value} size="sm" className="gap-1.5">
                {value !== "all" ? <span className={cn("h-2 w-2 rounded-full", TONE_DOT[bookingStatusMeta(value).tone])} aria-hidden /> : null}
                {label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <CardContent className="p-0">
          {list.isLoading ? (
            <div className="space-y-2 p-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : list.error ? (
            <p className="p-8 text-center text-sm text-destructive">Couldn't load bookings.</p>
          ) : rows.length === 0 ? (
            <div className="p-6">
              <GenericEmptyState
                title={filtered ? "No bookings match" : "No bookings yet"}
                description={filtered ? "Try a different search or filter." : "Mass bookings from the website will appear here."}
                icon="church"
              />
            </div>
          ) : (
            <>
              <label className="flex items-center gap-2 border-b px-4 py-2 text-xs text-muted-foreground">
                <SelectAllCheckbox selection={selection} rows={rows} /> Select all shown
                {typeof total === "number" ? <span className="ml-auto">{total} bookings</span> : null}
              </label>
              <ul className="divide-y">
                {rows.map((item, i) => {
                  const tone = bookingStatusMeta(item.status).tone;
                  return (
                    <li
                      key={item.id}
                      style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}
                      className={cn(
                        "group relative flex cursor-pointer flex-col gap-3 px-4 py-3 transition-colors duration-200 hover:bg-church-gold/[0.05] sm:flex-row sm:items-center",
                        "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-1 motion-safe:[animation-fill-mode:both]",
                        selection.isSelected(item) && "bg-church-gold/[0.08]"
                      )}
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest("button, input, label, [role=checkbox]")) return;
                        setSelected(item.id);
                      }}
                    >
                      <span className={cn("absolute inset-y-2 left-0 w-1 rounded-r transition-all group-hover:inset-y-0", TONE_DOT[tone])} aria-hidden />
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        <span className="pt-0.5"><SelectRowCheckbox selection={selection} row={item} label={`Select ${item.reference}`} /></span>
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{item.contact?.name || "—"}</p>
                            <span className="font-mono text-xs text-muted-foreground">{item.reference}</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1"><Church className="h-3.5 w-3.5" aria-hidden />{item.intentions?.length ?? 0} intention{(item.intentions?.length ?? 0) === 1 ? "" : "s"}</span>
                            {item.intentions?.[0] ? (
                              <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" aria-hidden />{item.intentions[0].booking_date}{(item.intentions.length ?? 0) > 1 ? " +" : ""}</span>
                            ) : null}
                            <span>{PAYMENT_METHOD_LABEL[item.payment_method] ?? item.payment_method}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pl-7 sm:pl-0">
                        <StatusPill status={item.status} />
                        <StatusPill status={item.payment_status} kind="payment" />
                        <span className="w-28 text-right text-sm font-semibold tabular-nums">{formatMoney(item.amount, item.currency)}</span>
                        <Button type="button" variant="outline" size="sm" onClick={() => setSelected(item.id)}>Review</Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              {lastPage > 1 ? (
                <div className="flex items-center justify-between border-t p-4">
                  <span className="text-sm text-muted-foreground">Page {page} of {lastPage}</span>
                  <AdminPagination currentPage={page} totalPages={lastPage} onPageChange={setPage} />
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      {rules.data && (
        <Dialog open={rulesOpen} onOpenChange={(open) => !saveRules.isPending && setRulesOpen(open)}>
          <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Booking rules</DialogTitle>
              <DialogDescription>How people can book Masses on the website, and where bank transfers go.</DialogDescription>
            </DialogHeader>
            <form
              className="space-y-6"
              onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                saveRules.mutate({
                  min_offering: minOffering ?? 0,
                  max_offering: maxOffering,
                  horizon_days: form.get("horizon_days") ? Number(form.get("horizon_days")) : null,
                  hold_minutes: Number(form.get("hold_minutes")),
                  transfer_proof_required: form.get("transfer_proof_required") === "on",
                  categories: rules.data?.categories ?? [],
                  payment_methods: ["flutterwave", "cash", "bank_transfer"],
                  bank_name: String(form.get("bank_name") ?? ""),
                  account_name: String(form.get("account_name") ?? ""),
                  account_number: String(form.get("account_number") ?? ""),
                  instructions: String(form.get("instructions") ?? ""),
                });
              }}
            >
              <RulesSection title="Offering" description="The range a single booking's offering must fall within.">
                <div className="space-y-1.5">
                  <Label htmlFor="min_offering">Minimum</Label>
                  <AmountInput id="min_offering" value={minOffering} onValueChange={setDraftMinOffering} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="max_offering">Maximum</Label>
                  <AmountInput id="max_offering" value={maxOffering} onValueChange={setDraftMaxOffering} />
                </div>
              </RulesSection>

              <RulesSection title="Scheduling" description="How far ahead people can book, and how long a slot is held during online payment.">
                <Field name="horizon_days" type="number" label="Book up to (days ahead)" hint="Leave empty for no limit." placeholder="No limit" defaultValue={rules.data.horizon_days ? String(rules.data.horizon_days) : ""} />
                <Field name="hold_minutes" type="number" label="Checkout hold (minutes)" hint="A limited Mass slot is reserved this long." defaultValue={String(rules.data.hold_minutes)} />
              </RulesSection>

              <RulesSection title="Bank transfer" description="Shown to people who choose to pay by transfer.">
                <Field name="bank_name" label="Bank" defaultValue={rules.data.bank_draft.bank_name} />
                <Field name="account_name" label="Account name" defaultValue={rules.data.bank_draft.account_name} />
                <Field name="account_number" label="Account number" inputMode="numeric" defaultValue={rules.data.bank_draft.account_number} />
                <label className="flex items-center justify-between gap-3 rounded-lg border p-3 sm:col-span-2">
                  <span>
                    <span className="block text-sm font-medium">Require transfer proof</span>
                    <span className="block text-xs text-muted-foreground">People must upload a receipt before their booking is reviewed.</span>
                  </span>
                  <Switch name="transfer_proof_required" defaultChecked={rules.data.transfer_proof_required} />
                </label>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="instructions">Transfer instructions</Label>
                  <Textarea id="instructions" name="instructions" rows={3} placeholder="e.g. Use your booking reference as the transfer narration." defaultValue={rules.data.bank_draft.instructions} />
                </div>
              </RulesSection>

              <DialogFooter className="gap-2 border-t pt-4">
                <Button type="button" variant="outline" onClick={() => setRulesOpen(false)} disabled={saveRules.isPending}>Cancel</Button>
                <Button type="submit" variant="church" disabled={saveRules.isPending}>{saveRules.isPending ? "Saving…" : "Save rules"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) { setSelected(null); setReason(""); } }}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex flex-wrap items-center gap-2">
              <span className="font-mono">{order?.reference ?? "Booking"}</span>
              {order ? <StatusPill status={order.status} /> : null}
              {order ? <StatusPill status={order.payment_status} kind="payment" /> : null}
            </DialogTitle>
            <DialogDescription>{order?.created_at ? `Booked ${new Date(order.created_at).toLocaleString()}` : "Loading…"}</DialogDescription>
          </DialogHeader>
          {detail.isLoading ? (
            <div className="space-y-3"><Skeleton className="h-20 w-full" /><Skeleton className="h-32 w-full" /></div>
          ) : order ? (
            <div className="space-y-4 text-sm motion-safe:animate-in motion-safe:fade-in-0">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5 rounded-lg border p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Contact</p>
                  <p className="flex items-center gap-2 font-medium"><User className="h-4 w-4 text-muted-foreground" />{order.contact?.name || "—"}</p>
                  {order.contact?.phone ? <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" />{order.contact.phone}</p> : null}
                  {order.contact?.email ? <p className="flex items-center gap-2 break-all"><Mail className="h-4 w-4 shrink-0 text-muted-foreground" />{order.contact.email}</p> : null}
                </div>
                <div className="space-y-1.5 rounded-lg border p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Offering</p>
                  <p className="flex items-center gap-2 text-lg font-semibold"><Banknote className="h-4 w-4 text-muted-foreground" />{formatMoney(order.amount, order.currency)}</p>
                  <p className="text-muted-foreground">{PAYMENT_METHOD_LABEL[order.payment_method] ?? order.payment_method}</p>
                  {order.receipt_number ? <p className="text-muted-foreground">Receipt {order.receipt_number}</p> : null}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Intentions</p>
                <ul className="space-y-2">
                  {order.intentions?.map((item) => (
                    <li key={item.id} className={cn("rounded-lg border border-l-4 p-3", TONE_BORDER_L[bookingStatusMeta(item.status).tone])}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="font-medium">{item.mass_schedule?.title} · {item.booking_date}</p>
                        <StatusPill status={item.status} />
                      </div>
                      <p className="text-muted-foreground">Offered by {item.offered_by || "—"}</p>
                      {item.intention_labels?.length ? <p>{item.intention_labels.join(", ")}</p> : null}
                      {item.intention && item.intention !== item.intention_labels?.join(", ") ? <p>{item.intention}</p> : null}
                      {item.proposed_booking_date ? <p className="text-xs text-violet-700">Proposed new date: {item.proposed_booking_date}</p> : null}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2 border-t pt-4">
                <Button type="button" variant="church" disabled={act.isPending || !canDecide} onClick={() => act.mutate({ path: `mass-booking-orders/${order.id}/confirm` })}>Confirm Masses</Button>
                {order.payment_method === "cash" && order.payment_status !== "paid" && (
                  <Button type="button" variant="outline" disabled={act.isPending} onClick={() => act.mutate({ path: `mass-booking-orders/${order.id}/payments/cash`, body: { amount: order.amount, paid_on: new Date().toISOString().slice(0, 10), reference: "office" } })}>Record cash</Button>
                )}
                {order.payment_method === "bank_transfer" && order.payment_status !== "paid" && (
                  <Button type="button" variant="outline" disabled={act.isPending} onClick={() => act.mutate({ path: `mass-booking-orders/${order.id}/payments/transfer`, body: { decision: "approve" } })}>Verify transfer</Button>
                )}
                <Button type="button" variant="ghost" disabled={act.isPending} onClick={() => act.mutate({ path: `mass-booking-orders/${order.id}/notifications`, body: { type: "status" } })}>
                  <Mail className="mr-1.5 h-4 w-4" /> Resend email
                </Button>
              </div>

              {canCancel ? (
                <div className="space-y-2 rounded-lg border border-dashed p-3">
                  <Label htmlFor="order-reason">Decline or cancel</Label>
                  <Textarea id="order-reason" value={reason} onChange={(event) => setReason(event.target.value)} rows={2} placeholder="Reason, shown to the requester" />
                  <div className="flex flex-wrap gap-2">
                    {canDecide ? (
                      <Button type="button" variant="outline" className="text-destructive" disabled={act.isPending || !reason.trim()} onClick={() => act.mutate({ path: `mass-booking-orders/${order.id}/reject`, body: { reason } })}>Decline</Button>
                    ) : null}
                    <Button type="button" variant="outline" disabled={act.isPending} onClick={() => act.mutate({ path: `mass-booking-orders/${order.id}/cancel`, body: { reason } })}>Cancel booking</Button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

function RulesSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="space-y-0.5">
        <span className="block font-heading font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

const Field = ({
  name,
  label,
  defaultValue,
  hint,
  ...props
}: { name: string; label: string; defaultValue: string; hint?: string } & React.ComponentProps<typeof Input>) => (
  <div className="space-y-1.5">
    <Label htmlFor={name}>{label}</Label>
    <Input id={name} name={name} defaultValue={defaultValue} {...props} />
    {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
  </div>
);

export default MassBookingOrdersPanel;
