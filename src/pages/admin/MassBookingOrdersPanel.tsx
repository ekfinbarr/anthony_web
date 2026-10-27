import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiClient } from "@/lib/apiClient";
import AmountInput from "@/components/forms/AmountInput";
import { formatMoney } from "@/services/payment.service";
import type { BookingOrder } from "@/services/massBookingOrder.service";
import { BulkActionBar, SelectAllCheckbox, SelectRowCheckbox } from "@/components/admin/data/BulkActionBar";
import { ExportMenu } from "@/components/admin/data/ExportMenu";
import { fetchAllPages } from "@/components/admin/data/fetchAllPages";
import { InsightsPanel } from "@/components/admin/data/InsightsPanel";
import { rowId, useBulkSelection } from "@/components/admin/data/useBulkSelection";
import type { ExportColumn } from "@/lib/export/tableExport";
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

const MassBookingOrdersPanel = () => {
  const qc = useQueryClient();
  const selection = useBulkSelection<BookingOrder>(rowId);
  const [search, setSearch] = useState("");
  const [draftMinOffering, setDraftMinOffering] = useState<number | null | undefined>(undefined);
  const [draftMaxOffering, setDraftMaxOffering] = useState<number | null | undefined>(undefined);
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");

  const list = useQuery({
    queryKey: ["mass-booking-orders", search],
    queryFn: async () => {
      const res = await apiClient.get<{ data: BookingOrder[] }>(`mass-booking-orders?search=${encodeURIComponent(search)}`);
      return res.data.data;
    },
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
      setMessage(text);
      await qc.invalidateQueries({ queryKey: ["mass-booking-orders"] });
      await qc.invalidateQueries({ queryKey: ["mass-booking-order", selected] });
    },
    onError: (error: unknown) => setMessage(error instanceof Error ? error.message : "The action failed."),
  });

  const saveRules = useMutation({
    mutationFn: async (body: Record<string, unknown>) => (await apiClient.put<{ message: string }>("mass-booking-orders/rules", body)).data.message,
    onSuccess: async (text) => {
      setMessage(text);
      setDraftMinOffering(undefined);
      setDraftMaxOffering(undefined);
      await qc.invalidateQueries({ queryKey: ["mass-booking-rules"] });
    },
    onError: (error: unknown) => setMessage(error instanceof Error ? error.message : "The rules could not be saved."),
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
    fetchAllPages<BookingOrder>(async (page, per_page) =>
      (await apiClient.get<{ data: BookingOrder[]; meta?: { last_page?: number } }>(
        `mass-booking-orders?search=${encodeURIComponent(search)}&page=${page}&per_page=${per_page}`
      )).data
    );
  const rows = list.data ?? [];

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
      {message && <p role="status" className="text-sm">{message}</p>}
      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <Label htmlFor="order-search">Search bookings</Label>
            <ExportMenu title="Mass bookings" filename="mass-bookings" columns={exportColumns} fetchAll={fetchAllRows} selected={selection.rows} currency="NGN" size="sm" />
          </div>
          <Input id="order-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name, phone, or reference" />
          {rows.length > 0 && (
            <label className="flex items-center gap-2 px-1 pt-1 text-xs text-muted-foreground">
              <SelectAllCheckbox selection={selection} rows={rows} /> Select all shown
            </label>
          )}
          <ul className="divide-y">
            {rows.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "flex flex-col gap-2 rounded-md px-1 py-3 transition-[background-color,box-shadow] duration-200 hover:bg-church-gold/[0.06] hover:shadow-[inset_3px_0_0_hsl(var(--church-gold-warm))] sm:flex-row sm:items-center sm:justify-between",
                  selection.isSelected(item) && "bg-church-gold/[0.10] shadow-[inset_3px_0_0_hsl(var(--church-gold-warm))]"
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="pt-1"><SelectRowCheckbox selection={selection} row={item} label={`Select ${item.reference}`} /></span>
                  <div>
                  <p className="font-medium">{item.reference}</p>
                  <p className="text-sm text-muted-foreground">{item.contact?.name} · {item.status.replaceAll("_", " ")} · {item.payment_status.replaceAll("_", " ")}</p>
                  </div>
                </div>
                <Button type="button" variant="outline" className="min-h-11" onClick={() => { setSelected(item.id); setMessage(""); }}>Review</Button>
              </li>
            ))}
            {list.data?.length === 0 && <li className="py-4 text-sm text-muted-foreground">No bookings yet.</li>}
          </ul>
        </CardContent>
      </Card>

      {rules.data && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <h2 className="font-heading text-lg font-semibold">Booking rules</h2>
            <form
              className="grid gap-3 sm:grid-cols-2"
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
              <div>
                <Label htmlFor="min_offering">Minimum offering</Label>
                <AmountInput id="min_offering" value={minOffering} onValueChange={setDraftMinOffering} />
              </div>
              <div>
                <Label htmlFor="max_offering">Maximum offering</Label>
                <AmountInput id="max_offering" value={maxOffering} onValueChange={setDraftMaxOffering} />
              </div>
              <Field name="horizon_days" label="Horizon in days" defaultValue={rules.data.horizon_days ? String(rules.data.horizon_days) : ""} />
              <Field name="hold_minutes" label="Checkout hold minutes" defaultValue={String(rules.data.hold_minutes)} />
              <Field name="bank_name" label="Bank" defaultValue={rules.data.bank_draft.bank_name} />
              <Field name="account_name" label="Account name" defaultValue={rules.data.bank_draft.account_name} />
              <Field name="account_number" label="Account number" defaultValue={rules.data.bank_draft.account_number} />
              <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" name="transfer_proof_required" defaultChecked={rules.data.transfer_proof_required} />
                Require transfer proof
              </label>
              <div className="sm:col-span-2">
                <Label htmlFor="instructions">Transfer instructions</Label>
                <Textarea id="instructions" name="instructions" defaultValue={rules.data.bank_draft.instructions} />
              </div>
              <Button type="submit" className="min-h-11 sm:col-span-2" disabled={saveRules.isPending}>Save rules</Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{order?.reference ?? "Booking"}</DialogTitle>
          </DialogHeader>
          {order && (
            <div className="space-y-3 text-sm">
              <p>{order.contact?.name}<br />{order.contact?.phone}<br />{order.contact?.email}</p>
              <p>Offering {formatMoney(order.amount, order.currency)} · {order.payment_method} · {order.payment_status}</p>
              <ul className="space-y-2">
                {order.intentions?.map((item) => (
                  <li key={item.id} className="rounded-md border p-3">
                    <p className="font-medium">{item.mass_schedule?.title} · {item.booking_date}</p>
                    <p>{item.offered_by} · {item.status}</p>
                    {item.intention_labels?.length ? <p>{item.intention_labels.join(", ")}</p> : null}
                    {item.intention && item.intention !== item.intention_labels?.join(", ") ? <p>{item.intention}</p> : null}
                  </li>
                ))}
              </ul>
              <Textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason, when declining or cancelling" />
              <div className="flex flex-wrap gap-2">
                <Button type="button" className="min-h-11" disabled={act.isPending} onClick={() => act.mutate({ path: `mass-booking-orders/${order.id}/confirm` })}>Confirm Masses</Button>
                <Button type="button" variant="outline" className="min-h-11" disabled={act.isPending || !reason.trim()} onClick={() => act.mutate({ path: `mass-booking-orders/${order.id}/reject`, body: { reason } })}>Decline</Button>
                <Button type="button" variant="outline" className="min-h-11" disabled={act.isPending} onClick={() => act.mutate({ path: `mass-booking-orders/${order.id}/cancel`, body: { reason } })}>Cancel</Button>
                {order.payment_method === "cash" && order.payment_status !== "paid" && (
                  <Button type="button" variant="outline" className="min-h-11" disabled={act.isPending} onClick={() => act.mutate({ path: `mass-booking-orders/${order.id}/payments/cash`, body: { amount: order.amount, paid_on: new Date().toISOString().slice(0, 10), reference: "office" } })}>Record cash</Button>
                )}
                {order.payment_method === "bank_transfer" && order.payment_status !== "paid" && (
                  <Button type="button" variant="outline" className="min-h-11" disabled={act.isPending} onClick={() => act.mutate({ path: `mass-booking-orders/${order.id}/payments/transfer`, body: { decision: "approve" } })}>Verify transfer</Button>
                )}
                <Button type="button" variant="ghost" className="min-h-11" disabled={act.isPending} onClick={() => act.mutate({ path: `mass-booking-orders/${order.id}/notifications`, body: { type: "status" } })}>Resend email</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Field = ({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) => (
  <div>
    <Label htmlFor={name}>{label}</Label>
    <Input id={name} name={name} defaultValue={defaultValue} />
  </div>
);

export default MassBookingOrdersPanel;
