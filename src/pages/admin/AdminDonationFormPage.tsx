/**
 * Admin: Record a gift
 *
 * Route: /admin/donations/new
 *
 * The office version of the public giving page: the same funds, preset
 * amounts, "in honour of", message and anonymity, but staff record a gift for
 * a parishioner or a walk-in donor, taken as cash or by bank transfer. When
 * the money is in hand the donor gets the same receipt email as online givers.
 */

import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ArrowLeft, Banknote, Building2, CheckCircle2, Copy, Heart, Loader2, Mail, Plus, UserRound, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { IsoDatePicker } from "@/components/ui/date-picker";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import AmountInput from "@/components/forms/AmountInput";
import ProofFileField from "@/components/forms/ProofFileField";
import { UserPicker } from "@/components/admin/shared/UserPicker";
import { Field } from "@/components/mass-booking/bookingShared";
import { FUND_TONE, OTHER_FUNDS, PRESET_AMOUNTS, fundMeta, givingCategories } from "@/components/donations/givingCategories";
import { useToast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api-error";
import { canonicalNigerianPhone } from "@/lib/phone";
import { TONE_BADGE } from "@/lib/bookingStatus";
import { cn } from "@/lib/utils";
import paymentService, { formatMoney } from "@/services/payment.service";
import donationAccountService from "@/services/donationAccount.service";
import donationService, { type Donation, type DonationType } from "@/services/donation.service";
import type { User } from "@/services/user.service";

type Mode = "parishioner" | "guest";
type Method = "cash" | "bank_transfer";

const todayIso = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const freshForm = () => ({
  mode: "parishioner" as Mode,
  donor: null as User | null,
  name: "",
  email: "",
  phone: "",
  type: givingCategories[0].type as DonationType,
  amount: 5000 as number | null,
  dedication: "",
  notes: "",
  anonymous: false,
  method: "cash" as Method,
  received: true,
  receivedOn: todayIso(),
  officeReference: "",
  transferReference: "",
  transferDate: "",
});
type FormState = ReturnType<typeof freshForm>;

const CARD_TONE = FUND_TONE;

export default function AdminDonationFormPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(freshForm);
  const [proof, setProof] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState<Donation | null>(null);
  const [copied, setCopied] = useState("");

  const configQuery = useQuery({ queryKey: ["payment-config"], queryFn: paymentService.getConfig, staleTime: 5 * 60_000 });
  const accountsQuery = useQuery({ queryKey: ["donation-accounts", "active"], queryFn: donationAccountService.listActive });
  const currency = configQuery.data?.currency ?? "NGN";
  const minAmount = configQuery.data?.donation_min_amount ?? 100;
  const maxAmount = configQuery.data?.donation_max_amount ?? null;
  const money = (v: number) => formatMoney(v, currency);
  const accounts = accountsQuery.data?.data ?? [];

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));
  const pickDonor = (user: User | null) =>
    setForm((f) => ({ ...f, donor: user, name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "" }));

  const fund = fundMeta(form.type);
  const category = givingCategories.find((c) => c.type === form.type);

  const validate = () => {
    const next: Record<string, string> = {};
    if (form.mode === "parishioner" && !form.donor) next.donor = "Choose the parishioner.";
    if (form.name.trim().length < 2) next.name = "Enter the donor's name.";
    if (form.phone.trim() && !canonicalNigerianPhone(form.phone)) next.phone = "Enter a valid Nigerian phone number or leave it blank.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email address.";
    if (form.amount === null || form.amount < minAmount) next.amount = `The minimum gift is ${money(minAmount)}.`;
    else if (maxAmount && form.amount > maxAmount) next.amount = `The largest gift recorded at once is ${money(maxAmount)}.`;
    if (form.method === "bank_transfer" && !form.transferReference.trim()) next.transferReference = "Enter the transfer reference.";
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.scrollIntoView({ behavior: "smooth", block: "center" }));
    }
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    setServerError("");
    if (!validate()) return;
    setSubmitting(true);
    try {
      const phone = form.phone.trim() ? canonicalNigerianPhone(form.phone) ?? undefined : undefined;
      const res = await donationService.recordOfficeGift({
        user_id: form.mode === "parishioner" ? form.donor?.id : undefined,
        donor_name: form.name.trim(),
        donor_email: form.email.trim() || undefined,
        donor_phone: phone,
        is_anonymous: form.anonymous,
        type: form.type,
        amount: form.amount ?? 0,
        method: form.method,
        received: form.received,
        received_on: form.received ? form.receivedOn : undefined,
        office_reference: form.received ? form.officeReference.trim() || undefined : undefined,
        transfer_reference: form.method === "bank_transfer" ? form.transferReference.trim() : undefined,
        transfer_date: form.method === "bank_transfer" ? form.transferDate || undefined : undefined,
        dedication: form.dedication.trim() || undefined,
        notes: form.notes.trim() || undefined,
        evidence: form.method === "bank_transfer" ? proof : null,
      });
      setSaved(res.data);
      qc.invalidateQueries({ queryKey: ["admin-donations"] });
      toast({ title: "Gift recorded", description: res.message });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setServerError(getApiErrorMessage(e, "The gift could not be recorded. Your entries are still here."));
    } finally {
      setSubmitting(false);
    }
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    window.setTimeout(() => setCopied(""), 1800);
  };

  if (saved) {
    return (
      <GiftSaved
        donation={saved}
        onAnother={() => {
          setForm(freshForm());
          setProof(null);
          setErrors({});
          setSaved(null);
        }}
        onDone={() => navigate("/admin/donations")}
      />
    );
  }

  const paymentNote = form.received
    ? "Recorded as received. A receipt is issued straight away."
    : form.method === "cash"
      ? "Saved as awaiting money. Mark it received when the cash comes in."
      : "Saved as awaiting money. Mark it received once the transfer shows in the account.";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-3">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin">Admin</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbLink asChild><Link to="/admin/donations">Donations</Link></BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem><BreadcrumbPage>Record a gift</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/donations")} aria-label="Back to donations">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Record a gift</h1>
            <p className="mt-1 text-muted-foreground">For gifts handed in at the office or paid by transfer. Online card gifts are made by donors on the website.</p>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          {serverError ? (
            <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {serverError}
            </p>
          ) : null}

          <Section step={1} title="Who is giving" description="The receipt and thank-you go to this person.">
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Who is giving">
              <ChoiceCard selected={form.mode === "parishioner"} onSelect={() => set("mode", "parishioner")} icon={Users} title="Registered parishioner" description="Shows on their dashboard and giving history." />
              <ChoiceCard selected={form.mode === "guest"} onSelect={() => setForm((f) => ({ ...f, mode: "guest", donor: null }))} icon={UserRound} title="Walk-in donor" description="No account needed." />
            </div>
            {form.mode === "parishioner" ? (
              <Field label="Parishioner" required error={errors.donor}>
                <UserPicker value={form.donor} onChange={pickDonor} />
              </Field>
            ) : null}
            {form.mode === "guest" || form.donor ? (
              <div className="grid gap-4 sm:grid-cols-2 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-1">
                <div className="sm:col-span-2">
                  <Field label="Full name" required error={errors.name}>
                    <Input value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="off" />
                  </Field>
                </div>
                <Field label="Email (for the receipt)" error={errors.email} hint="Optional. Without it, no receipt is emailed.">
                  <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@example.com" autoComplete="off" />
                </Field>
                <Field label="Phone" error={errors.phone} hint="Optional. Nigerian number, such as 080… or +234…">
                  <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} inputMode="tel" placeholder="0803 000 0000" autoComplete="off" />
                </Field>
              </div>
            ) : null}
            <label className="flex items-center justify-between gap-3 rounded-lg border p-3">
              <span>
                <span className="block text-sm font-medium">Give anonymously</span>
                <span className="block text-xs text-muted-foreground">Their name won't appear in parish records. The receipt still goes to them.</span>
              </span>
              <Switch checked={form.anonymous} onCheckedChange={(v) => set("anonymous", v)} />
            </label>
          </Section>

          <Section step={2} title="The gift" description="Choose the fund and the amount, as on the giving page.">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" role="radiogroup" aria-label="Fund">
              {givingCategories.map((c) => {
                const tone = CARD_TONE[fundMeta(c.type).tone];
                const on = form.type === c.type;
                return (
                  <button
                    key={c.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => set("type", c.type)}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      on ? cn(tone.ring, tone.bg, "shadow-md motion-safe:scale-[1.03]") : "border-border hover:-translate-y-0.5 hover:shadow-sm"
                    )}
                  >
                    <c.icon size="md" />
                    <span className="text-sm font-semibold leading-tight">{c.name}</span>
                    <span className="hidden text-xs text-muted-foreground sm:block">{c.description}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-sm text-muted-foreground">Or another fund:</span>
              <Select value={category ? "" : form.type} onValueChange={(v) => set("type", v as DonationType)}>
                <SelectTrigger className="sm:w-56" aria-label="Another fund"><SelectValue placeholder="Choose a fund" /></SelectTrigger>
                <SelectContent>
                  {OTHER_FUNDS.map((f) => <SelectItem key={f.type} value={f.type}>{f.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Field label={`Amount (${currency})`} required error={errors.amount}>
              <div className="space-y-2">
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {PRESET_AMOUNTS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => set("amount", preset)}
                      className={cn(
                        "rounded-md border px-2 py-2 text-sm font-semibold transition-all duration-200",
                        form.amount === preset ? "border-primary bg-primary text-primary-foreground shadow-sm" : "hover:-translate-y-0.5 hover:border-primary"
                      )}
                    >
                      {money(preset).replace(/\.00$/, "")}
                    </button>
                  ))}
                </div>
                <AmountInput currency={currency} value={form.amount} onValueChange={(v) => set("amount", v)} placeholder="Or enter another amount" />
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="In honour of" hint="Optional.">
                <Input value={form.dedication} onChange={(e) => set("dedication", e.target.value)} />
              </Field>
              <Field label="Message" hint="Optional. Anything the donor asked to note.">
                <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={1} maxLength={1000} />
              </Field>
            </div>
          </Section>

          <Section step={3} title="Payment" description="How the money was given.">
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
              <ChoiceCard selected={form.method === "cash"} onSelect={() => set("method", "cash")} icon={Banknote} title="Cash at the office" description="Handed in at the desk." />
              <ChoiceCard selected={form.method === "bank_transfer"} onSelect={() => set("method", "bank_transfer")} icon={Building2} title="Bank transfer" description="Paid into a parish account." />
            </div>

            {form.method === "bank_transfer" ? (
              <div className="space-y-4 rounded-lg border p-4 motion-safe:animate-in motion-safe:fade-in-0">
                {accounts.length ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {accounts.map((acc) => (
                      <div key={acc.id} className="rounded-md bg-muted/40 p-3 text-sm">
                        <p className="font-medium">{acc.name}</p>
                        <p className="text-muted-foreground">{acc.bank_name} · {acc.account_name}</p>
                        <button type="button" onClick={() => copy(acc.account_number)} className="mt-1 inline-flex items-center gap-1.5 font-mono text-base hover:text-primary" aria-label={`Copy account number ${acc.account_number}`}>
                          {acc.account_number}
                          {copied === acc.account_number ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 opacity-60" />}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Transfer reference" required error={errors.transferReference} hint="The reference on the bank receipt.">
                    <Input value={form.transferReference} onChange={(e) => set("transferReference", e.target.value)} />
                  </Field>
                  <Field label="Transfer date" hint="Optional. The day the money was sent.">
                    <IsoDatePicker value={form.transferDate} max={todayIso()} onChange={(v) => set("transferDate", v)} />
                  </Field>
                </div>
                <Field label="Proof of payment" hint="Optional. JPEG, PNG, WebP, or PDF, up to 10 MB.">
                  <ProofFileField value={proof} onChange={setProof} />
                </Field>
              </div>
            ) : null}

            <div className="space-y-4 rounded-lg border p-4">
              <label className="flex items-center justify-between gap-3">
                <span>
                  <span className="block text-sm font-medium">{form.method === "cash" ? "Money received now" : "I've checked the money arrived"}</span>
                  <span className="block text-xs text-muted-foreground">Records the gift as received and issues the receipt.</span>
                </span>
                <Switch checked={form.received} onCheckedChange={(v) => set("received", v)} />
              </label>
              {form.received ? (
                <div className="grid gap-4 sm:grid-cols-2 motion-safe:animate-in motion-safe:fade-in-0">
                  <Field label="Date received">
                    <IsoDatePicker value={form.receivedOn} max={todayIso()} onChange={(v) => set("receivedOn", v || todayIso())} />
                  </Field>
                  <Field label="Office reference" hint="Optional, e.g. a cash book number.">
                    <Input value={form.officeReference} onChange={(e) => set("officeReference", e.target.value)} placeholder="Cash book 12" />
                  </Field>
                </div>
              ) : null}
            </div>
          </Section>
        </div>

        <aside className="lg:sticky lg:top-6">
          <Card className="overflow-hidden">
            <div className={cn("relative flex flex-col items-center gap-2 px-6 pb-5 pt-6 text-center transition-colors duration-500", CARD_TONE[fund.tone].bg)}>
              {category ? <category.icon size="lg" className="motion-safe:animate-kanban-float" /> : <Heart className="h-10 w-10 text-church-gold-warm" aria-hidden />}
              <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", TONE_BADGE[fund.tone])}>{fund.label}</span>
              <p key={form.amount ?? 0} className="text-3xl font-bold tabular-nums motion-safe:animate-scale-in">{form.amount ? money(form.amount) : "—"}</p>
              <p className="text-sm text-muted-foreground">
                {form.anonymous ? "Anonymous gift" : form.name.trim() ? `from ${form.name.trim()}` : form.mode === "parishioner" ? "Choose a parishioner" : "Walk-in donor"}
              </p>
            </div>
            <CardContent className="space-y-4 pt-5 text-sm">
              <p className="text-xs text-muted-foreground">{paymentNote}</p>
              <p className="flex gap-2 text-xs text-muted-foreground">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                {form.email ? (form.received ? `The receipt is emailed to ${form.email}.` : `The receipt is emailed to ${form.email} once received.`) : "No email address, so no receipt will be emailed."}
              </p>
              <div className="space-y-2">
                <Button type="button" variant="church" className="h-11 w-full gap-2" onClick={submit} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Heart className="h-4 w-4" aria-hidden />}
                  Record gift
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={() => navigate("/admin/donations")} disabled={submitting}>Cancel</Button>
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
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-church-gold-soft/40 font-heading text-sm font-bold text-church-charcoal">{step}</span>
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

function GiftSaved({ donation, onAnother, onDone }: { donation: Donation; onAnother: () => void; onDone: () => void }) {
  const received = donation.status === "successful";
  const fund = fundMeta(donation.type);
  return (
    <div className="mx-auto max-w-lg py-6">
      <Card className="overflow-hidden motion-safe:animate-scale-in">
        <div className={cn("flex flex-col items-center gap-3 px-6 pb-4 pt-8 text-center", received ? "bg-gradient-to-b from-emerald-50 to-transparent" : "bg-gradient-to-b from-amber-50 to-transparent")}>
          <span className={cn("relative flex h-16 w-16 items-center justify-center rounded-full", received ? "bg-emerald-100" : "bg-amber-100")}>
            <span className={cn("absolute inset-0 rounded-full motion-safe:animate-ping motion-safe:[animation-iteration-count:2]", received ? "bg-emerald-200" : "bg-amber-200")} aria-hidden />
            {received ? <CheckCircle2 className="relative h-8 w-8 text-emerald-600" aria-hidden /> : <Heart className="relative h-8 w-8 text-amber-600" aria-hidden />}
          </span>
          <h1 className="font-heading text-2xl font-bold">{received ? "Gift received" : "Gift recorded"}</h1>
          <p className="text-3xl font-bold tabular-nums">{formatMoney(Number(donation.amount), donation.currency ?? "NGN")}</p>
          <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", TONE_BADGE[fund.tone])}>{fund.label}</span>
          <p className="font-mono text-xs text-muted-foreground">{donation.reference}</p>
        </div>
        <CardContent className="space-y-4 pt-2 text-center text-sm">
          <p className="text-muted-foreground">
            {received
              ? donation.donor_email
                ? `A receipt is on its way to ${donation.donor_email}.`
                : "Recorded as received. No email address was given, so no receipt was emailed."
              : "Saved as awaiting money. Open it from Donations to mark it received when the money arrives."}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button variant="outline" onClick={onDone}>Back to donations</Button>
            <Button variant="church" className="gap-2" onClick={onAnother}><Plus className="h-4 w-4" /> Record another</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
