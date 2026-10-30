/**
 * Admin: New Mass booking (office booking)
 *
 * Route: /admin/mass-bookings/new
 *
 * The office version of the public booking wizard. Same intentions, Mass
 * dates, offering limits and notifications, but staff book on someone's
 * behalf (a parishioner or a walk-in guest), take cash or a bank transfer at
 * the desk, and can record the offering and confirm the Masses in one step.
 */

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Building2,
  CalendarDays,
  CheckCircle2,
  Copy,
  Loader2,
  Mail,
  Plus,
  Printer,
  Receipt,
  UserRound,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { IsoDatePicker } from "@/components/ui/date-picker";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import AmountInput from "@/components/forms/AmountInput";
import ProofFileField from "@/components/forms/ProofFileField";
import { UserPicker } from "@/components/admin/shared/UserPicker";
import { Field, IntentionFields } from "@/components/mass-booking/bookingShared";
import {
  MAX_INTENTIONS,
  bookingErrorLines,
  duplicateIntention,
  emptyIntention,
  formatTime,
  labelFor,
  todayIso,
  validateIntentions,
  type IntentionDraft,
} from "@/components/mass-booking/bookingHelpers";
import { useToast } from "@/hooks/use-toast";
import { canonicalNigerianPhone } from "@/lib/phone";
import { TONE_BADGE, bookingStatusMeta, paymentStatusMeta } from "@/lib/bookingStatus";
import { cn } from "@/lib/utils";
import { formatMoney } from "@/services/payment.service";
import {
  getBookingOptions,
  getOrderReceipt,
  submitOfficeOrder,
  type BookingOptions,
  type OfficeOrderResult,
  type OrderReceipt,
} from "@/services/massBookingOrder.service";
import type { User } from "@/services/user.service";

type Mode = "parishioner" | "guest";
type Method = "cash" | "bank_transfer";

const METHODS: Array<{ value: Method; label: string; description: string; icon: typeof Banknote }> = [
  { value: "cash", label: "Cash at the office", description: "Paid at the desk, now or later.", icon: Banknote },
  { value: "bank_transfer", label: "Bank transfer", description: "Paid into the parish account.", icon: Building2 },
];

const freshForm = () => ({
  mode: "parishioner" as Mode,
  parishioner: null as User | null,
  name: "",
  phone: "",
  email: "",
  intentions: [emptyIntention()] as IntentionDraft[],
  amount: null as number | null,
  method: "cash" as Method,
  paymentReceived: true,
  paidOn: todayIso(),
  paymentReference: "",
  transferReference: "",
  transferDate: "",
  transferPayer: "",
  transferVerified: false,
  confirmNow: true,
  idempotencyKey: crypto.randomUUID(),
});

type FormState = ReturnType<typeof freshForm>;

export default function MassBookingFormPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(freshForm);
  const [proof, setProof] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<OfficeOrderResult | null>(null);

  const optionsQuery = useQuery<BookingOptions>({ queryKey: ["mass-booking-options"], queryFn: getBookingOptions });
  const options = optionsQuery.data ?? null;
  const money = (value: number) => formatMoney(value, options?.currency || "NGN");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const pickParishioner = (user: User | null) =>
    setForm((f) => ({
      ...f,
      parishioner: user,
      // Contact details start from the account; staff can correct them for this booking.
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
    }));

  const setIntention = (id: string, patch: Partial<IntentionDraft>) =>
    setForm((f) => ({ ...f, intentions: f.intentions.map((i) => (i.id === id ? { ...i, ...patch } : i)) }));

  const duplicateLast = () => {
    if (form.intentions.length >= MAX_INTENTIONS) return;
    const next = duplicateIntention(form.intentions.at(-1), options);
    if (!next) return;
    if ("error" in next) {
      setErrors((e) => ({ ...e, duplicate: next.error }));
      return;
    }
    setErrors(({ duplicate: _gone, ...rest }) => rest);
    setForm((f) => ({ ...f, intentions: [...f.intentions, next.item] }));
  };

  const offering = options?.offering;
  const offeringOpen = !!offering?.configured && offering.maximum !== null;

  const validate = () => {
    const next: Record<string, string> = {};
    if (form.mode === "parishioner" && !form.parishioner) next.parishioner = "Choose the parishioner.";
    if (form.name.trim().length < 2) next.name = "Enter the full name.";
    if (!canonicalNigerianPhone(form.phone)) next.phone = "Enter a valid Nigerian phone number.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address.";
    Object.assign(next, validateIntentions(form.intentions, options));
    if (!offeringOpen) {
      next.amount = "Set a maximum offering in Booking rules before taking bookings.";
    } else if (form.amount === null) {
      next.amount = "Enter the offering for this booking.";
    } else if (form.amount < offering!.minimum) {
      next.amount = `The offering must be at least ${money(offering!.minimum)}.`;
    } else if (form.amount > offering!.maximum!) {
      next.amount = `The offering cannot be more than ${money(offering!.maximum!)}.`;
    }
    if (form.method === "bank_transfer") {
      if (!form.transferReference.trim()) next.transferReference = "Enter the transfer reference.";
      if (!form.transferDate) next.transferDate = "Enter the transfer date.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // After a failed check, bring the first problem into view.
  const [scrollTick, setScrollTick] = useState(0);
  useEffect(() => {
    if (!scrollTick) return;
    document.querySelector<HTMLElement>('[aria-invalid="true"], [role="alert"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [scrollTick]);

  const submit = async () => {
    setServerErrors([]);
    if (!validate()) {
      setScrollTick((t) => t + 1);
      return;
    }
    const phone = canonicalNigerianPhone(form.phone);
    if (!phone) return;
    setSubmitting(true);
    try {
      const res = await submitOfficeOrder({
        idempotency_key: form.idempotencyKey,
        user_id: form.mode === "parishioner" ? form.parishioner?.id : undefined,
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone,
        payment_method: form.method,
        amount: form.amount ?? 0,
        intentions: form.intentions.map((item) => ({
          intention_categories: item.categories,
          beneficiary_type: item.beneficiaryType,
          beneficiary_name: item.beneficiaryType === "myself" ? form.name.trim() : item.beneficiaryName.trim(),
          booking_date: item.date,
          mass_schedule_id: item.scheduleId,
          notes: item.notes.trim() || undefined,
        })),
        transfer_reference: form.method === "bank_transfer" ? form.transferReference.trim() : undefined,
        transfer_date: form.method === "bank_transfer" ? form.transferDate : undefined,
        transfer_payer_name: form.method === "bank_transfer" ? form.transferPayer.trim() || form.name.trim() : undefined,
        evidence: form.method === "bank_transfer" ? proof : null,
        payment_received: form.method === "cash" ? form.paymentReceived : form.transferVerified,
        paid_on: form.method === "cash" && form.paymentReceived ? form.paidOn : undefined,
        payment_reference: form.method === "cash" && form.paymentReceived ? form.paymentReference.trim() || undefined : undefined,
        confirm_now: form.confirmNow,
      });
      setResult(res);
      toast({ title: "Booking saved", description: `Reference ${res.data.reference}.` });
      qc.invalidateQueries({ queryKey: ["mass-booking-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-mass-bookings"] });
      qc.invalidateQueries({ queryKey: ["admin-mass-bookings-kanban"] });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (caught) {
      setServerErrors(bookingErrorLines(caught));
      setScrollTick((t) => t + 1);
    } finally {
      setSubmitting(false);
    }
  };

  const startAnother = () => {
    setForm(freshForm());
    setProof(null);
    setErrors({});
    setServerErrors([]);
    setResult(null);
  };

  const booker = form.name.trim() || (form.mode === "parishioner" ? "Choose a parishioner" : "Walk-in guest");
  const paymentNote =
    form.method === "cash"
      ? form.paymentReceived
        ? "Recorded as paid. A receipt is issued."
        : "Left unpaid until the offering is brought in."
      : form.transferVerified
        ? "Transfer recorded as verified. A receipt is issued."
        : "Awaiting verification of the transfer.";

  if (result) {
    return <SuccessView result={result} onAnother={startAnother} onDone={() => navigate("/admin/mass-bookings")} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin">Admin</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin/mass-bookings">Mass Bookings</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>New booking</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/mass-bookings")} aria-label="Back to Mass bookings">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">New Mass booking</h1>
            <p className="mt-1 text-muted-foreground">Book one or more Masses for a parishioner or a walk-in guest. The same rules apply as on the website.</p>
          </div>
        </div>
      </div>

      {optionsQuery.error ? (
        <Notice tone="error">
          The booking options could not be loaded.{" "}
          <button type="button" className="underline" onClick={() => optionsQuery.refetch()}>Try again</button>
        </Notice>
      ) : null}
      {options && !offeringOpen ? (
        <Notice tone="warn">
          Bookings stay closed until a maximum offering is saved. Set it under <strong>Orders → Booking rules</strong>.
        </Notice>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {serverErrors.length > 0 ? (
            <ul role="alert" className="list-disc space-y-1 rounded-lg border border-destructive/30 bg-destructive/5 py-3 pl-8 pr-4 text-sm text-destructive">
              {serverErrors.map((line, i) => <li key={`${i}-${line}`}>{line}</li>)}
            </ul>
          ) : null}

          <Section step={1} title="Who is booking" description="The person the office is booking for. Emails and the receipt go to them.">
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Who is booking">
              <ChoiceCard
                selected={form.mode === "parishioner"}
                onSelect={() => setForm((f) => ({ ...f, mode: "parishioner" }))}
                icon={Users}
                title="Registered parishioner"
                description="Linked to their account and dashboard."
              />
              <ChoiceCard
                selected={form.mode === "guest"}
                onSelect={() => setForm((f) => ({ ...f, mode: "guest", parishioner: null }))}
                icon={UserRound}
                title="Walk-in guest"
                description="No account needed."
              />
            </div>

            {form.mode === "parishioner" ? (
              <Field label="Parishioner" required error={errors.parishioner}>
                <UserPicker value={form.parishioner} onChange={pickParishioner} />
              </Field>
            ) : null}

            {form.mode === "guest" || form.parishioner ? (
              <div className="grid gap-4 sm:grid-cols-2 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1">
                <div className="sm:col-span-2">
                  <Field label="Full name" required error={errors.name} hint="First name and surname.">
                    <Input value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="off" />
                  </Field>
                </div>
                <Field label="Phone number" required error={errors.phone} hint="Nigerian number, such as 080… or +234…">
                  <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} inputMode="tel" placeholder="0803 000 0000" autoComplete="off" />
                </Field>
                <Field label="Email address" error={errors.email} hint="Optional. Needed for email updates and the receipt.">
                  <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@example.com" autoComplete="off" />
                </Field>
                {form.mode === "parishioner" ? (
                  <p className="text-xs text-muted-foreground sm:col-span-2">Changes here apply to this booking only, not to their account.</p>
                ) : null}
              </div>
            ) : null}
          </Section>

          <Section
            step={2}
            title="Masses in this booking"
            description={`${form.intentions.length} ${form.intentions.length === 1 ? "Mass" : "Masses"}. Several people may book the same Mass.`}
          >
            {form.intentions.map((item, index) => (
              <IntentionFields
                key={item.id}
                item={item}
                index={index}
                options={options}
                errors={errors}
                onChange={(patch) => setIntention(item.id, patch)}
                onRemove={form.intentions.length > 1 ? () => setForm((f) => ({ ...f, intentions: f.intentions.filter((i) => i.id !== item.id) })) : undefined}
                beneficiaryLabel={(value, label) => (value === "myself" ? (form.mode === "parishioner" ? "The parishioner themselves" : "The person booking") : label)}
                hints={{ beneficiary: "The person booking, someone else, or a family." }}
                className="space-y-4 rounded-lg border bg-muted/20 p-4 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2"
              />
            ))}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 border-2 border-primary"
                disabled={form.intentions.length >= MAX_INTENTIONS}
                onClick={() => setForm((f) => ({ ...f, intentions: [...f.intentions, emptyIntention()] }))}
              >
                <Plus className="mr-2 h-4 w-4" aria-hidden /> Add another Mass
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                disabled={form.intentions.length >= MAX_INTENTIONS || !form.intentions.at(-1)?.date || !form.intentions.at(-1)?.scheduleId}
                onClick={duplicateLast}
              >
                <Copy className="mr-2 h-4 w-4" aria-hidden /> Same Mass next week
              </Button>
            </div>
            {errors.duplicate ? <p role="alert" className="text-sm text-destructive">{errors.duplicate}</p> : null}
          </Section>

          <Section
            step={3}
            title="Offering and payment"
            description={offeringOpen ? `One offering for the whole booking, from ${money(offering!.minimum)} to ${money(offering!.maximum!)}.` : "One offering for the whole booking."}
          >
            <Field label="Offering amount" required error={errors.amount} hint="One amount in naira for the whole booking.">
              <AmountInput value={form.amount} onValueChange={(v) => set("amount", v)} placeholder="5,000.00" />
            </Field>

            <div className="space-y-2">
              <p className="text-sm font-medium">Payment method <span className="text-destructive" aria-hidden>*</span></p>
              <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
                {METHODS.map((m) => (
                  <ChoiceCard
                    key={m.value}
                    selected={form.method === m.value}
                    onSelect={() => set("method", m.value)}
                    icon={m.icon}
                    title={m.label}
                    description={m.description}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Card payments are made by the person themselves on the website.</p>
            </div>

            {form.method === "cash" ? (
              <div className="space-y-4 rounded-lg border p-4 motion-safe:animate-in motion-safe:fade-in-0">
                <ToggleRow
                  checked={form.paymentReceived}
                  onChange={(v) => set("paymentReceived", v)}
                  title="Offering received now"
                  description="Records the cash as paid and issues a receipt."
                />
                {form.paymentReceived ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Date received" required>
                      <IsoDatePicker value={form.paidOn} max={todayIso()} onChange={(v) => set("paidOn", v || todayIso())} />
                    </Field>
                    <Field label="Office reference" hint="Optional, e.g. a cash book number.">
                      <Input value={form.paymentReference} onChange={(e) => set("paymentReference", e.target.value)} placeholder="Cash book 12" />
                    </Field>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="space-y-4 rounded-lg border p-4 motion-safe:animate-in motion-safe:fade-in-0">
                {options?.bank ? (
                  <div className="rounded-md bg-muted/40 p-3 text-sm">
                    <p className="font-medium">{options.bank.bank_name}</p>
                    <p>{options.bank.account_name}</p>
                    <p className="font-mono">{options.bank.account_number}</p>
                  </div>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Transfer reference" required error={errors.transferReference} hint="The reference on the bank receipt.">
                    <Input value={form.transferReference} onChange={(e) => set("transferReference", e.target.value)} />
                  </Field>
                  <Field label="Transfer date" required error={errors.transferDate} hint="The day the money was sent.">
                    <IsoDatePicker value={form.transferDate} max={todayIso()} onChange={(v) => set("transferDate", v)} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Paid by" hint="Optional. Defaults to the person booking.">
                      <Input value={form.transferPayer} onChange={(e) => set("transferPayer", e.target.value)} placeholder={form.name || "Name on the transfer"} />
                    </Field>
                  </div>
                </div>
                <Field label="Proof of payment" hint="Optional at the office. JPEG, PNG, WebP, or PDF, up to 10 MB.">
                  <ProofFileField value={proof} onChange={setProof} />
                </Field>
                <ToggleRow
                  checked={form.transferVerified}
                  onChange={(v) => set("transferVerified", v)}
                  title="I've checked the money arrived"
                  description="Records the transfer as verified and issues a receipt."
                />
              </div>
            )}
          </Section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <Card className="overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-church-gold-soft via-church-gold-warm to-church-gold-soft" aria-hidden />
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base"><Receipt className="h-4 w-4" aria-hidden /> Booking summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Booked for</p>
                <p className="font-medium">{booker}</p>
                {form.email ? <p className="text-muted-foreground">{form.email}</p> : null}
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Masses</p>
                <ul className="space-y-2">
                  {form.intentions.map((item, i) => {
                    const mass = options?.schedules.find((s) => s.id === item.scheduleId);
                    return (
                      <li key={item.id} className="rounded-md border bg-muted/20 p-2">
                        <p className="font-medium">
                          {item.categories.length ? item.categories.map((c) => labelFor(options?.categories, c)).join(", ") : `Mass ${i + 1}`}
                        </p>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarDays className="h-3 w-3" aria-hidden />
                          {item.date || "No date yet"}
                          {mass ? ` · ${mass.title} ${formatTime(mass.start_time)}` : ""}
                        </p>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="flex items-baseline justify-between border-t pt-3">
                <span className="text-muted-foreground">Offering</span>
                <span className="text-xl font-semibold tabular-nums">{form.amount !== null ? money(form.amount) : "—"}</span>
              </div>
              <p className="text-xs text-muted-foreground">{paymentNote}</p>

              <div className="rounded-lg border p-3">
                <ToggleRow
                  checked={form.confirmNow}
                  onChange={(v) => set("confirmNow", v)}
                  title="Confirm the Masses now"
                  description="Otherwise they wait as requests in the Orders tab."
                />
              </div>

              <p className="flex gap-2 text-xs text-muted-foreground">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                {form.email ? `Updates and the receipt are emailed to ${form.email}.` : "No email address, so nothing will be emailed."}
              </p>

              <div className="space-y-2">
                <Button type="button" variant="church" className="h-11 w-full" onClick={submit} disabled={submitting || !options || !offeringOpen}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden />}
                  Save booking
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/admin/mass-bookings")} disabled={submitting}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Section({ step, title, description, children }: { step: number; title: string; description?: string; children: ReactNode }) {
  return (
    <Card className="motion-safe:animate-fade-in motion-safe:[animation-fill-mode:both]" style={{ animationDelay: `${(step - 1) * 80}ms` }}>
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-church-gold-soft/40 font-heading text-sm font-bold text-church-charcoal">
            {step}
          </span>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}

function ChoiceCard({ selected, onSelect, icon: Icon, title, description }: { selected: boolean; onSelect: () => void; icon: typeof Users; title: string; description: string }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex min-h-16 items-start gap-3 rounded-lg border-2 p-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected ? "border-church-gold-warm bg-church-gold-soft/15 shadow-sm" : "border-border hover:border-church-gold-soft hover:bg-muted/40"
      )}
    >
      <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors", selected ? "bg-church-gold-warm text-white" : "bg-muted text-muted-foreground")}>
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <span>
        <span className="block font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
    </button>
  );
}

function ToggleRow({ checked, onChange, title, description }: { checked: boolean; onChange: (v: boolean) => void; title: string; description: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3">
      <span>
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{description}</span>
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

function Notice({ tone, children }: { tone: "warn" | "error"; children: ReactNode }) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2 rounded-lg border px-4 py-3 text-sm",
        tone === "warn" ? "border-amber-300 bg-amber-50 text-amber-900" : "border-destructive/30 bg-destructive/5 text-destructive"
      )}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

function Pill({ label, tone }: { label: string; tone: keyof typeof TONE_BADGE }) {
  return <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", TONE_BADGE[tone])}>{label}</span>;
}

function SuccessView({ result, onAnother, onDone }: { result: OfficeOrderResult; onAnother: () => void; onDone: () => void }) {
  const order = result.data;
  const paid = order.payment_status === "paid";
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null);
  const [loadingReceipt, setLoadingReceipt] = useState(false);
  const { toast } = useToast();
  const status = bookingStatusMeta(order.status);
  const payment = paymentStatusMeta(order.payment_status);

  // Print once the receipt has rendered.
  useEffect(() => {
    if (receipt) window.setTimeout(() => window.print(), 50);
  }, [receipt]);

  const printReceipt = async () => {
    if (receipt) {
      window.print();
      return;
    }
    setLoadingReceipt(true);
    try {
      setReceipt(await getOrderReceipt(order.id));
    } catch (e) {
      toast({ title: "Receipt unavailable", description: e instanceof Error ? e.message : "Try again from the Orders tab.", variant: "destructive" });
    } finally {
      setLoadingReceipt(false);
    }
  };

  const intentions = useMemo(() => order.intentions ?? [], [order.intentions]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <Card className="overflow-hidden print:hidden motion-safe:animate-scale-in">
        <div className="flex flex-col items-center gap-3 bg-gradient-to-b from-emerald-50 to-transparent px-6 pb-2 pt-8 text-center">
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <span className="absolute inset-0 rounded-full bg-emerald-200 motion-safe:animate-ping motion-safe:[animation-iteration-count:2]" aria-hidden />
            <CheckCircle2 className="relative h-8 w-8 text-emerald-600" aria-hidden />
          </span>
          <h1 className="font-heading text-2xl font-bold">Booking saved</h1>
          <p className="font-mono text-sm text-muted-foreground">{order.reference}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Pill label={status.label} tone={status.tone} />
            <Pill label={payment.label} tone={payment.tone} />
          </div>
        </div>
        <CardContent className="space-y-4 pt-4">
          {result.warnings.length > 0 ? (
            <ul className="space-y-1 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              {result.warnings.map((w) => (
                <li key={w} className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{w}</li>
              ))}
            </ul>
          ) : null}
          <div className="rounded-lg border p-3 text-sm">
            <p className="font-medium">{order.contact?.name}</p>
            <p className="text-muted-foreground">{[order.contact?.phone, order.contact?.email].filter(Boolean).join(" · ")}</p>
          </div>
          <ul className="space-y-2 text-sm">
            {intentions.map((item) => {
              const meta = bookingStatusMeta(item.status);
              return (
                <li key={item.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                  <div>
                    <p className="font-medium">{item.intention_labels?.join(", ") || item.intention}</p>
                    <p className="text-muted-foreground">{item.booking_date} · {item.mass_schedule?.title} · for {item.offered_by}</p>
                  </div>
                  <Pill label={meta.label} tone={meta.tone} />
                </li>
              );
            })}
          </ul>
          <div className="flex items-baseline justify-between border-t pt-3">
            <span className="text-muted-foreground">Offering</span>
            <span className="text-xl font-semibold">{formatMoney(order.amount, order.currency)}</span>
          </div>
          {order.contact?.email ? (
            <p className="text-xs text-muted-foreground">A confirmation is being emailed to {order.contact.email}.</p>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row">
            {paid ? (
              <Button variant="outline" className="gap-2" onClick={printReceipt} disabled={loadingReceipt}>
                {loadingReceipt ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />} Print receipt
              </Button>
            ) : null}
            <Button variant="outline" onClick={onDone}>Back to bookings</Button>
            <Button variant="church" className="gap-2 sm:ml-auto" onClick={onAnother}>
              <Plus className="h-4 w-4" /> Book another
            </Button>
          </div>
        </CardContent>
      </Card>

      {receipt ? (
        <div className="hidden print:block">
          <div className="mx-auto max-w-md space-y-4 font-mono text-sm">
            <div className="text-center">
              <p className="text-lg font-bold">MASS OFFERING RECEIPT</p>
              <p>Receipt {receipt.receipt_number}</p>
              <p>Booking {receipt.reference}</p>
            </div>
            <p>Received from: {receipt.contact_name}</p>
            <ul className="space-y-2 border-y border-dashed py-3">
              {receipt.intentions.map((line, i) => (
                <li key={i}>
                  {line.date} · {line.mass}
                  <br />For {line.for}: {line.intentions.join(", ")}
                </li>
              ))}
            </ul>
            <p className="flex justify-between text-base font-bold"><span>TOTAL</span><span>{formatMoney(receipt.amount, receipt.currency)}</span></p>
            <p className="text-center">Thank you for your offering.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
