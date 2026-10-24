import { cloneElement, FormEvent, isValidElement, useEffect, useId, useMemo, useRef, useState, type ReactElement, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle, ChevronLeft, Copy, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import FieldHint from "@/components/forms/FieldHint";
import { useAuth } from "@/contexts/AuthContext";
import { canonicalNigerianPhone } from "@/lib/phone";
import AmountInput from "@/components/forms/AmountInput";
import ProofFileField from "@/components/forms/ProofFileField";
import { IsoDatePicker } from "@/components/ui/date-picker";
import { formatMoney } from "@/services/payment.service";
import {
  getBookingOptions,
  rememberBookingToken,
  submitBookingOrder,
  type BookingOptions,
  type BookingOrder,
  type MassOption,
} from "@/services/massBookingOrder.service";
import { redirectToCheckout } from "@/services/payment.service";

const DRAFT_KEY = "mass-booking-draft";
const KEY_KEY = "mass-booking-idempotency";

type IntentionDraft = {
  id: string;
  categories: string[];
  beneficiaryType: string;
  beneficiaryName: string;
  date: string;
  scheduleId: string;
  notes: string;
};

type Draft = {
  name: string;
  phone: string;
  email: string;
  saveProfile: boolean;
  intentions: IntentionDraft[];
  amount: string;
  method: "" | "flutterwave" | "cash" | "bank_transfer";
  transferReference: string;
  transferDate: string;
  transferPayer: string;
  companyWebsite: string;
};

const emptyIntention = (): IntentionDraft => ({
  id: crypto.randomUUID(),
  categories: [],
  beneficiaryType: "",
  beneficiaryName: "",
  date: "",
  scheduleId: "",
  notes: "",
});

const normalizeIntention = (item: Partial<IntentionDraft> & { category?: string }): IntentionDraft => {
  const legacy = item.category ? [item.category] : [];
  const categories = Array.isArray(item.categories) ? item.categories.filter(Boolean) : legacy;
  return {
    id: item.id || crypto.randomUUID(),
    categories,
    beneficiaryType: item.beneficiaryType || "",
    beneficiaryName: item.beneficiaryName || "",
    date: item.date || "",
    scheduleId: item.scheduleId || "",
    notes: item.notes || "",
  };
};

const emptyDraft: Draft = {
  name: "",
  phone: "",
  email: "",
  saveProfile: false,
  intentions: [emptyIntention()],
  amount: "",
  method: "",
  transferReference: "",
  transferDate: "",
  transferPayer: "",
  companyWebsite: "",
};

const steps = [
  { id: 1, label: "Booker" },
  { id: 2, label: "Masses" },
  { id: 3, label: "Offering" },
  { id: 4, label: "Review" },
];

function loadDraft(): Draft {
  try {
    const saved = sessionStorage.getItem(DRAFT_KEY);
    if (!saved) return emptyDraft;
    const parsed = JSON.parse(saved) as Partial<Draft>;
    const intentions = parsed.intentions?.length
      ? parsed.intentions.map((item) => normalizeIntention(item as Partial<IntentionDraft> & { category?: string }))
      : [emptyIntention()];
    return { ...emptyDraft, ...parsed, intentions };
  } catch {
    return emptyDraft;
  }
}

function todayIso() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T12:00:00`);
  date.setDate(date.getDate() + days);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function weekday(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
}

const BOOKING_FIELD_LABELS: Record<string, string> = {
  intention_categories: "intentions",
  intention_category: "intentions",
  booking_date: "date",
  mass_schedule_id: "time",
  beneficiary_type: "offered for",
  beneficiary_name: "name",
  notes: "notes",
  amount: "Offering",
  name: "Full name",
  phone: "Phone number",
  email: "Email address",
  payment_method: "Payment method",
  transfer_reference: "Transfer reference",
  transfer_date: "Transfer date",
  evidence: "Proof of payment",
};

function bookingFieldLabel(key: string): string {
  const mass = key.match(/^intentions\.(\d+)\.([a-z_]+)/);
  if (mass) {
    const number = Number(mass[1]) + 1;
    const name = BOOKING_FIELD_LABELS[mass[2]] ?? mass[2].replaceAll("_", " ");
    return `Mass ${number} ${name}`;
  }
  return BOOKING_FIELD_LABELS[key] ?? key.replaceAll("_", " ");
}

function readableBookingError(key: string, message: string): string {
  const label = bookingFieldLabel(key);
  const stripped = message.replace(/^The .+? field/i, label);
  if (stripped !== message) {
    return stripped.charAt(0).toUpperCase() + stripped.slice(1);
  }
  return `${label}: ${message}`;
}

function bookingErrorLines(caught: unknown): string[] {
  const data = caught && typeof caught === "object" && "data" in caught
    ? (caught as { data?: unknown }).data
    : undefined;
  if (data && typeof data === "object" && data !== null && "errors" in data) {
    const errors = (data as { errors?: unknown }).errors;
    if (errors && typeof errors === "object") {
      const lines = Object.entries(errors as Record<string, unknown>).flatMap(([key, value]) => {
        const messages = Array.isArray(value) ? value : [value];
        return messages
          .filter((item): item is string => typeof item === "string" && item.trim() !== "")
          .map((message) => readableBookingError(key, message));
      });
      if (lines.length > 0) return lines;
    }
  }
  if (caught instanceof Error && caught.message) return [caught.message];
  return ["The booking could not be submitted. Your entries are still here."];
}

function formatTime(value?: string | null) {
  if (!value) return "";
  const [hour, minute] = value.split(":");
  const date = new Date();
  date.setHours(Number(hour), Number(minute || 0));
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

const MassBookingWizard = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorId = useId();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(loadDraft);
  const [options, setOptions] = useState<BookingOptions | null>(null);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [proof, setProof] = useState<File | null>(null);
  const [result, setResult] = useState<BookingOrder | null>(null);
  const [idempotencyKey] = useState(() => sessionStorage.getItem(KEY_KEY) || crypto.randomUUID());

  useEffect(() => {
    sessionStorage.setItem(KEY_KEY, idempotencyKey);
  }, [idempotencyKey]);

  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step, result]);

  useEffect(() => {
    let active = true;
    getBookingOptions()
      .then((data) => {
        if (!active) return;
        setOptions(data);
      })
      .catch(() => {
        if (active) setLoadError("The booking form could not be loaded. Check your connection and try again.");
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    setDraft((current) => ({
      ...current,
      name: current.name || user.name || "",
      email: current.email || user.email || "",
      phone: current.phone || user.phone || "",
    }));
  }, [user]);

  const schedulesFor = (date: string) => {
    if (!options || !date) return [];
    const day = weekday(date);
    return options.schedules.filter((schedule) => schedule.day_of_week.toLowerCase() === day);
  };

  const labelFor = (list: { value: string; label: string }[] | undefined, value: string) =>
    list?.find((item) => item.value === value)?.label || value;

  const scheduleById = (id: string): MassOption | undefined => options?.schedules.find((schedule) => schedule.id === id);

  const amountNumber = Number(draft.amount);
  const money = (value: number) => formatMoney(value, options?.currency || "NGN");

  const setIntention = (id: string, patch: Partial<IntentionDraft>) => {
    setDraft((current) => ({
      ...current,
      intentions: current.intentions.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  };

  const validateIntentions = () => {
    const errors: Record<string, string> = {};
    draft.intentions.forEach((item, index) => {
      const prefix = `intention-${item.id}`;
      if (item.categories.length === 0) errors[`${prefix}-category`] = "Choose at least one intention.";
      if (!item.beneficiaryType) errors[`${prefix}-beneficiary`] = "Say who this Mass is for.";
      if (item.beneficiaryType !== "myself" && item.beneficiaryName.trim().length < 2) {
        errors[`${prefix}-name`] = "Enter the person's or family's name.";
      }
      if (!item.date) errors[`${prefix}-date`] = "Choose a date.";
      if (item.date && item.date < todayIso()) errors[`${prefix}-date`] = "Choose today or a future date.";
      if (options?.horizon_days && item.date > addDays(todayIso(), options.horizon_days)) {
        errors[`${prefix}-date`] = `Bookings can be made up to ${options.horizon_days} days ahead.`;
      }
      const masses = schedulesFor(item.date);
      if (item.date && masses.length === 0) errors[`${prefix}-mass`] = "No Mass is scheduled that day.";
      if (item.date && masses.length > 0 && !masses.some((mass) => mass.id === item.scheduleId)) {
        errors[`${prefix}-mass`] = "Choose a Mass celebrated on that day.";
      }
      if (!errors[`${prefix}-category`] && item.categories.length === 0) errors[`${prefix}-category`] = `Mass ${index + 1} needs an intention.`;
    });
    return errors;
  };

  const validateStep = (target: number) => {
    const errors: Record<string, string> = {};
    if (target === 1) {
      if (draft.name.trim().length < 2) errors.name = "Enter your full name.";
      if (!canonicalNigerianPhone(draft.phone)) errors.phone = "Enter a valid Nigerian phone number.";
      if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) errors.email = "Enter a valid email address.";
    }
    if (target === 2) Object.assign(errors, validateIntentions());
    if (target === 3) {
      if (!options?.offering.configured || options.offering.maximum === null) {
        errors.amount = "The parish office has not published a maximum offering yet, so online booking is closed.";
      } else if (!draft.amount || Number.isNaN(amountNumber)) {
        errors.amount = "Enter the offering for this booking.";
      } else if (amountNumber < options.offering.minimum) {
        errors.amount = `The offering must be at least ${money(options.offering.minimum)}.`;
      } else if (amountNumber > options.offering.maximum) {
        errors.amount = `The offering cannot be more than ${money(options.offering.maximum)}.`;
      }
      if (!draft.method) errors.method = "Choose how you will make the offering.";
      if (draft.method === "flutterwave" && !draft.email) errors.email = "Email is required for card payment.";
      if (draft.method === "bank_transfer") {
        if (!draft.transferReference.trim()) errors.transferReference = "Enter the transfer reference.";
        if (!draft.transferDate) errors.transferDate = "Enter the transfer date.";
        if (options?.transfer_proof_required && !proof) errors.proof = "Upload proof of the transfer.";
      }
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const duplicateLast = () => {
    const source = draft.intentions[draft.intentions.length - 1];
    if (!source?.date || !source.scheduleId || draft.intentions.length >= 12) return;
    const nextDate = addDays(source.date, 7);
    if (options?.horizon_days && nextDate > addDays(todayIso(), options.horizon_days)) {
      setFieldErrors({ duplicate: "No later date is open for that Mass." });
      return;
    }
    setFieldErrors({});
    setDraft((current) => ({
      ...current,
      intentions: [...current.intentions, { ...source, id: crypto.randomUUID(), date: nextDate }],
    }));
  };

  const goNext = () => {
    setError([]);
    if (!validateStep(step)) return;
    setStep((current) => Math.min(4, current + 1));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!options || submitting) return;
    setError([]);
    for (const item of [1, 2, 3]) {
      if (!validateStep(item)) {
        setStep(item);
        setSubmitting(false);
        return;
      }
    }

    const phone = canonicalNigerianPhone(draft.phone);
    if (!phone) return;
    setSubmitting(true);
    try {
      if (user && draft.saveProfile) {
        const saved = await updateProfile({ name: draft.name.trim(), email: draft.email.trim(), phone });
        if (!saved.success) {
          setError([saved.error || "Your account details could not be updated. The booking was not submitted."]);
          setSubmitting(false);
          return;
        }
      }

      const response = await submitBookingOrder({
        form_nonce: options.form_nonce,
        idempotency_key: idempotencyKey,
        name: draft.name.trim(),
        email: draft.email.trim() || undefined,
        phone,
        payment_method: draft.method as "flutterwave" | "cash" | "bank_transfer",
        amount: Number(draft.amount),
        intentions: draft.intentions.map((item) => ({
          intention_categories: item.categories,
          beneficiary_type: item.beneficiaryType,
          beneficiary_name: item.beneficiaryType === "myself" ? draft.name.trim() : item.beneficiaryName.trim(),
          booking_date: item.date,
          mass_schedule_id: item.scheduleId,
          notes: item.notes.trim() || undefined,
        })),
        transfer_reference: draft.transferReference.trim() || undefined,
        transfer_date: draft.transferDate || undefined,
        transfer_payer_name: draft.transferPayer.trim() || draft.name.trim(),
        company_website: draft.companyWebsite,
        evidence: proof,
      });

      if (response.data.access_token) rememberBookingToken(response.data.access_token);
      if (response.data.checkout_url) {
        redirectToCheckout(response.data.checkout_url);
        return;
      }
      sessionStorage.removeItem(DRAFT_KEY);
      sessionStorage.removeItem(KEY_KEY);
      setResult(response.data);
    } catch (caught) {
      setError(bookingErrorLines(caught));
    } finally {
      setSubmitting(false);
    }
  };

  const summary = useMemo(() => draft.intentions.length, [draft.intentions.length]);

  if (result) {
    const paid = result.payment_status === "paid";
    return (
      <Card>
        <CardHeader>
          <CardTitle ref={headingRef} tabIndex={-1} className="flex items-center gap-2 outline-none">
            <CheckCircle className="h-6 w-6 text-primary" aria-hidden />
            Request received
          </CardTitle>
          <CardDescription>Reference {result.reference}. The parish office still needs to confirm the Mass.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            {result.payment_method === "cash"
              ? "Please bring the offering to the parish office. It is not recorded as paid yet."
              : result.payment_status === "awaiting_verification"
                ? "Your transfer is awaiting verification. It is not recorded as paid yet."
                : paid
                  ? "Payment was received. This is not yet a confirmation of the Mass time."
                  : "We have your request."}
          </p>
          {result.contact?.email && (
            <p className="text-sm text-muted-foreground">If the mail provider accepts it, a message will be sent to {result.contact.email}. This page does not confirm that the email arrived.</p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="church" className="min-h-11" onClick={() => navigate("/")}>Back to home</Button>
            <Button variant="outline" className="min-h-11" asChild><Link to="/my-mass-bookings">My bookings</Link></Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 motion-reduce:transition-none" noValidate>
      <ol className="grid grid-cols-4 gap-2" aria-label="Booking progress">
        {steps.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`w-full rounded-md px-2 py-2 text-xs sm:text-sm min-h-11 ${step === item.id ? "bg-primary text-primary-foreground" : item.id < step ? "bg-church-gold/20" : "bg-muted"}`}
              aria-current={step === item.id ? "step" : undefined}
              onClick={() => item.id < step && setStep(item.id)}
              disabled={item.id > step}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ol>

      {loadError && <p role="alert" className="text-sm text-destructive">{loadError}</p>}
      {options && !options.offering.configured && (
        <p role="status" className="rounded-md border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">
          Booking stays closed until the parish office saves a maximum offering. You can review the form, but it cannot be submitted yet.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle ref={headingRef} tabIndex={-1} className="outline-none">
            {step === 1 && "Who is booking"}
            {step === 2 && "Masses in this booking"}
            {step === 3 && "One offering for this booking"}
            {step === 4 && "Review and submit"}
          </CardTitle>
          <CardDescription>
            {step === 2 && `${summary} ${summary === 1 ? "Mass" : "Masses"}. Several people may book the same Mass.`}
            {step === 3 && options?.offering.configured && options.offering.maximum !== null && (
              <>One offering, from {money(options.offering.minimum)} to {money(options.offering.maximum)}.</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {error.length > 0 && (
            <ul id={errorId} role="alert" className="list-disc space-y-1 pl-5 text-sm text-destructive">
              {error.map((line, index) => <li key={`${index}-${line}`}>{line}</li>)}
            </ul>
          )}

          {step === 1 && (
            <div className="space-y-4">
              {!user && (
                <p className="text-sm">
                  Parishioners can <Link className="text-primary underline" to="/auth/login?redirect=/book-mass">sign in</Link>. Guests can continue without an account.
                </p>
              )}
              <Field label="Full name" required error={fieldErrors.name} hint="First name and surname.">
                <Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} autoComplete="name" />
              </Field>
              <Field label="Phone number" required error={fieldErrors.phone} hint="Nigerian number, such as 080… or +234…">
                <Input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} autoComplete="tel" inputMode="tel" placeholder="0803 000 0000" />
              </Field>
              <Field label="Email address" required={draft.method === "flutterwave"} error={fieldErrors.email} hint="Required for card payment. Optional otherwise.">
                <Input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} autoComplete="email" placeholder="name@example.com" />
              </Field>
              {user && (
                <label className="flex items-start gap-2 text-sm">
                  <input type="checkbox" className="mt-1" checked={draft.saveProfile} onChange={(event) => setDraft({ ...draft, saveProfile: event.target.checked })} />
                  Save these contact details to my account
                </label>
              )}
            </div>
          )}

          {step === 2 && draft.intentions.map((item, index) => {
            const masses = schedulesFor(item.date);
            const prefix = `intention-${item.id}`;
            return (
              <fieldset key={item.id} className="space-y-4 rounded-lg border p-4">
                <legend className="px-1 text-sm font-medium">Mass {index + 1}</legend>
                <Field label="Intentions" required error={fieldErrors[`${prefix}-category`]} hint="Choose every intention for this Mass.">
                  <MultiSelect
                    options={options?.categories ?? []}
                    value={item.categories}
                    onValueChange={(categories) => setIntention(item.id, { categories })}
                    placeholder="Choose intentions"
                    searchPlaceholder="Search intentions"
                    className="min-h-11"
                  />
                </Field>
                <Field label="Offered for" required error={fieldErrors[`${prefix}-beneficiary`]} hint="You, another person, or a family.">
                  <Select value={item.beneficiaryType} onValueChange={(value) => setIntention(item.id, { beneficiaryType: value })}>
                    <SelectTrigger><SelectValue placeholder="Who is this for?" /></SelectTrigger>
                    <SelectContent>
                      {options?.beneficiaries.map((beneficiary) => <SelectItem key={beneficiary.value} value={beneficiary.value}>{beneficiary.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
                {item.beneficiaryType && item.beneficiaryType !== "myself" && (
                  <Field
                    label={item.beneficiaryType === "family_or_group" ? "Family or group" : "Name"}
                    required
                    error={fieldErrors[`${prefix}-name`]}
                    hint="The name the priest should read."
                  >
                    <Input value={item.beneficiaryName} onChange={(event) => setIntention(item.id, { beneficiaryName: event.target.value })} />
                  </Field>
                )}
                <Field label="Date" required error={fieldErrors[`${prefix}-date`]} hint="Today or a later day in the booking period.">
                  <IsoDatePicker
                    value={item.date}
                    min={todayIso()}
                    max={options?.horizon_days ? addDays(todayIso(), options.horizon_days) : undefined}
                    onChange={(value) => setIntention(item.id, { date: value, scheduleId: "" })}
                  />
                </Field>
                <Field label="Mass" required error={fieldErrors[`${prefix}-mass`]} hint="Choose the date first, then the time.">
                  <Select value={item.scheduleId} onValueChange={(value) => setIntention(item.id, { scheduleId: value })} disabled={!item.date || masses.length === 0}>
                    <SelectTrigger><SelectValue placeholder={item.date ? "Choose a Mass" : "Choose a date first"} /></SelectTrigger>
                    <SelectContent>
                      {masses.map((mass) => (
                        <SelectItem key={mass.id} value={mass.id}>
                          {mass.title} {formatTime(mass.start_time)} {mass.language ? `(${mass.language})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Notes" hint="Optional. Anything else for the office.">
                  <Textarea value={item.notes} maxLength={2000} onChange={(event) => setIntention(item.id, { notes: event.target.value })} />
                </Field>
                {draft.intentions.length > 1 && (
                  <Button type="button" variant="outline" className="min-h-11 border-2 border-destructive text-destructive" onClick={() => setDraft({ ...draft, intentions: draft.intentions.filter((row) => row.id !== item.id) })}>
                    <Trash2 className="mr-2 h-4 w-4" aria-hidden /> Remove this Mass
                  </Button>
                )}
              </fieldset>
            );
          })}

          {step === 2 && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                className="min-h-11 border-2 border-primary"
                disabled={draft.intentions.length >= 12}
                onClick={() => setDraft({ ...draft, intentions: [...draft.intentions, emptyIntention()] })}
              >
                <Plus className="mr-2 h-4 w-4" aria-hidden /> Add another Mass intention
              </Button>
              <Button
                type="button"
                variant="outline"
                className="min-h-11"
                disabled={draft.intentions.length >= 12 || !draft.intentions.at(-1)?.date || !draft.intentions.at(-1)?.scheduleId}
                onClick={duplicateLast}
              >
                <Copy className="mr-2 h-4 w-4" aria-hidden /> Duplicate last Mass
              </Button>
            </div>
          )}
          {step === 2 && fieldErrors.duplicate && <p role="alert" className="text-sm text-destructive">{fieldErrors.duplicate}</p>}

          {step === 3 && (
            <div className="space-y-4">
              <Field label="Offering amount" required error={fieldErrors.amount} hint="One amount in naira for the whole booking.">
                <AmountInput
                  value={draft.amount === "" ? null : Number(draft.amount)}
                  onValueChange={(next) => setDraft({ ...draft, amount: next === null ? "" : String(next) })}
                  placeholder="5,000.00"
                />
              </Field>
              <fieldset className="space-y-2">
                <legend className="flex items-center gap-1.5 text-sm font-medium">
                  Payment method <span className="text-destructive" aria-hidden="true">*</span>
                  <FieldHint text="Card, cash at the office, or a bank transfer." />
                </legend>
                {fieldErrors.method && <p className="text-sm text-destructive">{fieldErrors.method}</p>}
                {(options?.payment_methods.length ? options.payment_methods : []).map((method) => (
                  <label key={method} className="flex min-h-11 items-center gap-2 rounded-md border px-3">
                    <input type="radio" name="payment-method" checked={draft.method === method} onChange={() => setDraft({ ...draft, method })} />
                    {method === "flutterwave" ? "Card or Flutterwave" : method === "cash" ? "Cash at the parish office" : "Bank transfer"}
                  </label>
                ))}
                {options && options.payment_methods.length === 0 && <p className="text-sm text-muted-foreground">No payment method is available yet.</p>}
              </fieldset>
              {fieldErrors.email && <p className="text-sm text-destructive">{fieldErrors.email}</p>}
              {draft.method === "bank_transfer" && options?.bank && (
                <div className="rounded-md border p-4 text-sm space-y-1">
                  <p><strong>{options.bank.bank_name}</strong></p>
                  <p>{options.bank.account_name}</p>
                  <p>{options.bank.account_number}</p>
                  {options.bank.instructions && <p>{options.bank.instructions}</p>}
                  <Field label="Transfer reference" required error={fieldErrors.transferReference} hint="The reference on your bank receipt.">
                    <Input value={draft.transferReference} onChange={(event) => setDraft({ ...draft, transferReference: event.target.value })} />
                  </Field>
                  <Field label="Transfer date" required error={fieldErrors.transferDate} hint="The day the money left your account.">
                    <IsoDatePicker value={draft.transferDate} max={todayIso()} onChange={(value) => setDraft({ ...draft, transferDate: value })} />
                  </Field>
                  <Field label="Proof of payment" required={Boolean(options?.transfer_proof_required)} error={fieldErrors.proof} hint="JPEG, PNG, WebP, or PDF, up to 10 MB.">
                    <ProofFileField value={proof} onChange={setProof} />
                  </Field>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 text-sm">
              <p><strong>{draft.name}</strong><br />{draft.phone}{draft.email ? ` · ${draft.email}` : ""}</p>
              <ul className="space-y-3">
                {draft.intentions.map((item) => {
                  const mass = scheduleById(item.scheduleId);
                  return (
                    <li key={item.id} className="rounded-md border p-3">
                      <p className="font-medium">{item.categories.map((category) => labelFor(options?.categories, category)).join(", ")}</p>
                      <p>{item.beneficiaryType === "myself" ? draft.name : item.beneficiaryName}</p>
                      <p>{item.date} · {mass?.title} {formatTime(mass?.start_time)}</p>
                      {item.notes && <p className="text-muted-foreground">{item.notes}</p>}
                    </li>
                  );
                })}
              </ul>
              <p><strong>Offering:</strong> {draft.amount ? money(amountNumber) : "—"} · {draft.method ? labelFor([
                { value: "flutterwave", label: "Card or Flutterwave" },
                { value: "cash", label: "Cash" },
                { value: "bank_transfer", label: "Bank transfer" },
              ], draft.method) : "—"}</p>
              <p className="text-muted-foreground">Submitting sends a request. The Mass is confirmed only after the parish office accepts it. A card payment does not by itself confirm the Mass.</p>
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            {step > 1 ? (
              <Button type="button" variant="outline" className="min-h-11" onClick={() => setStep((current) => current - 1)}>
                <ChevronLeft className="mr-1 h-4 w-4" aria-hidden /> Back
              </Button>
            ) : <span />}
            {step < 4 ? (
              <Button type="button" variant="church" className="min-h-11" onClick={goNext}>Continue</Button>
            ) : (
              <Button type="submit" variant="church" className="min-h-11" disabled={submitting || !options?.offering.configured}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
                Submit booking
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
      <div className="hidden" aria-hidden>
        <label htmlFor="company-website">Company website</label>
        <input id="company-website" name="company_website" tabIndex={-1} autoComplete="off" value={draft.companyWebsite} onChange={(event) => setDraft({ ...draft, companyWebsite: event.target.value })} />
      </div>
    </form>
  );
};

const Field = ({ label, error, hint, required, children }: { label: string; error?: string; hint?: string; required?: boolean; children: ReactNode }) => {
  const id = useId();
  const errorId = useId();
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<{ id?: string; "aria-describedby"?: string; "aria-invalid"?: boolean; "aria-required"?: boolean }>, {
      id,
      "aria-invalid": Boolean(error) || undefined,
      "aria-describedby": error ? errorId : undefined,
      "aria-required": required || undefined,
    })
    : children;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id}>
          {label}
          {required ? <span className="text-destructive" aria-hidden="true"> *</span> : null}
        </Label>
        {hint ? <FieldHint text={hint} /> : null}
      </div>
      {control}
      {error && <p id={errorId} className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  );
};

export default MassBookingWizard;
