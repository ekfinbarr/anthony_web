import { cloneElement, FormEvent, isValidElement, useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CheckCircle, ChevronLeft, Church, HandCoins, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IsoDatePicker } from "@/components/ui/date-picker";
import FieldHint from "@/components/forms/FieldHint";
import RegistrationWelcome from "@/components/registration/RegistrationWelcome";
import { HouseholdEditor, PillChoice, SacramentRows } from "@/components/registration/RegistrationChoices";
import {
  RELATIONSHIPS,
  SACRAMENT_LABELS,
  answerLabel,
  type HouseholdDraft,
  type Option,
} from "@/components/registration/registrationFields";
import { canonicalNigerianPhone } from "@/lib/phone";
import {
  parishRegistrationService,
  ParishRegistrationError,
  type HouseholdMember,
  type RegistrationOptions,
  type RegistrationResult,
  type SacramentKey,
  type Sacraments,
  type VerifiedProfile,
} from "@/services/parishRegistration.service";

const DRAFT_KEY = "parish-registration-draft";
const KEY_KEY = "parish-registration-idempotency";

type Intent = "new" | "complete" | "update";

type Draft = {
  intent: Intent | null;
  verifyEmail: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  contactMethod: "" | "phone" | "email" | "either";
  massId: string;
  groupKeys: string[];
  noGroup: boolean;
  otherOpen: boolean;
  otherGroup: string;
  privacy: boolean;
  token: string | null;
  dateOfBirth: string;
  gender: "" | "male" | "female";
  occupation: string;
  maritalStatus: "" | NonNullable<VerifiedProfile["marital_status"]>;
  faithStatus: "" | NonNullable<VerifiedProfile["faith_status"]>;
  sacraments: Sacraments;
  wantsPreparation: boolean;
  household: HouseholdDraft[];
  newsOptIn: boolean;
  givingPreference: "" | "envelopes" | "online";
};

const emptyDraft: Draft = {
  intent: null,
  verifyEmail: "",
  fullName: "",
  phone: "",
  email: "",
  address: "",
  contactMethod: "",
  massId: "",
  groupKeys: [],
  noGroup: false,
  otherOpen: false,
  otherGroup: "",
  privacy: false,
  token: null,
  dateOfBirth: "",
  gender: "",
  occupation: "",
  maritalStatus: "",
  faithStatus: "",
  sacraments: {},
  wantsPreparation: false,
  household: [],
  newsOptIn: false,
  givingPreference: "",
};

const steps = [
  { id: 1, label: "Start" },
  { id: 2, label: "About you" },
  { id: 3, label: "Faith" },
  { id: 4, label: "Groups" },
  { id: 5, label: "Review" },
];
const LAST_STEP = steps.length;

const GENDERS: Option<"male" | "female">[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
];

const MARITAL_STATUSES: Option<NonNullable<VerifiedProfile["marital_status"]>>[] = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "widowed", label: "Widowed" },
  { value: "separated", label: "Separated or divorced" },
];

const FAITH_STATUSES: Option<NonNullable<VerifiedProfile["faith_status"]>>[] = [
  { value: "catholic", label: "I am Catholic", description: "Baptised Catholic and practising the faith." },
  { value: "returning", label: "I am returning to the Church", description: "Welcome home, however long it has been." },
  { value: "exploring", label: "I am not Catholic, but would like to learn more", description: "We would love to walk with you through RCIA." },
];

const GIVING: Option<"envelopes" | "online">[] = [
  { value: "envelopes", label: "Offertory envelopes" },
  { value: "online", label: "I give online" },
];

const relationshipLabel = (value: string) => RELATIONSHIPS.find((option) => option.value === value)?.label ?? value;

/** Turns a stored household list (which staff may also have edited) into editable rows. */
function householdFromProfile(value: unknown[]): HouseholdDraft[] {
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const member = entry as Partial<HouseholdMember>;
    if (typeof member.name !== "string" || !member.name.trim()) return [];
    return [{
      key: crypto.randomUUID(),
      name: member.name,
      relationship: RELATIONSHIPS.some((option) => option.value === member.relationship) ? member.relationship! : "",
      dateOfBirth: typeof member.date_of_birth === "string" ? member.date_of_birth : "",
      sacraments: member.sacraments && typeof member.sacraments === "object" ? member.sacraments : {},
    }];
  });
}

function loadDraft(): Draft {
  try {
    const saved = sessionStorage.getItem(DRAFT_KEY);
    return saved ? { ...emptyDraft, ...JSON.parse(saved) } : emptyDraft;
  } catch {
    return emptyDraft;
  }
}

function groupKey(type: string, id: string) {
  return `${type}:${id}`;
}

const RegistrationWizard = () => {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(loadDraft);
  const [code, setCode] = useState("");
  // Options carry a single-use form nonce: never serve them from cache.
  const optionsQuery = useQuery({
    queryKey: ["parish-registration-options"],
    queryFn: () => parishRegistrationService.options(),
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
    retry: false,
  });
  const options: RegistrationOptions | null = optionsQuery.data ?? null;
  const optionsError = optionsQuery.error ? optionsQuery.error.message || "The group list could not be loaded." : "";
  const loadingOptions = optionsQuery.isFetching;
  const loadOptions = () => {
    void optionsQuery.refetch();
  };
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const honeypotId = useId();
  const idempotencyKey = useRef(sessionStorage.getItem(KEY_KEY) || crypto.randomUUID());

  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    sessionStorage.setItem(KEY_KEY, idempotencyKey.current);
  }, []);


  useEffect(() => {
    if (!options?.turnstile_site_key || document.querySelector("script[data-turnstile]")) return;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.dataset.turnstile = "true";
    document.body.appendChild(script);
  }, [options?.turnstile_site_key]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step, result]);

  const policy = options?.policy ?? { phone_required: true, email_required: false, address_required: true };
  const allGroups = options?.categories.flatMap((category) => category.groups) ?? [];

  const patch = (values: Partial<Draft>) => setDraft((current) => ({ ...current, ...values }));
  const today = format(new Date(), "yyyy-MM-dd");
  const married = draft.maritalStatus === "married";
  const ownSacramentKeys: SacramentKey[] = married
    ? ["baptism", "first_communion", "confirmation", "marriage"]
    : ["baptism", "first_communion", "confirmation"];
  const anyNotYet = [draft.sacraments, ...draft.household.map((member) => member.sacraments)].some((answers) =>
    Object.entries(answers).some(([key, answer]) => answer === "not_yet" && (key !== "marriage" || married))
  );
  const offerPreparation = anyNotYet || draft.faithStatus === "exploring";

  const rotateKey = () => {
    idempotencyKey.current = crypto.randomUUID();
    sessionStorage.setItem(KEY_KEY, idempotencyKey.current);
  };

  const goTo = (next: number) => {
    setError("");
    setFieldErrors({});
    if (next < step) rotateKey();
    setStep(next);
  };

  const validateDetails = () => {
    const errors: Record<string, string> = {};
    if (draft.fullName.trim().length < 2) errors.full_name = "Enter your full name.";
    if (policy.phone_required && !draft.phone.trim()) errors.phone = "A phone number is required.";
    if (draft.phone.trim() && !canonicalNigerianPhone(draft.phone)) {
      errors.phone = "Enter a valid Nigerian phone number, such as 08012345678 or +2348012345678.";
    }
    if (policy.email_required && !draft.email.trim()) errors.email = "An email address is required.";
    if (draft.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) errors.email = "Enter a valid email address.";
    if (policy.address_required && draft.address.trim().length < 5) errors.address = "Enter your residential address.";
    return errors;
  };

  const validateFaith = () => {
    const errors: Record<string, string> = {};
    draft.household.forEach((member, index) => {
      if (member.name.trim().length < 2) errors[`household.${index}.name`] = "Enter this person's full name, or remove them.";
      if (!member.relationship) errors[`household.${index}.relationship`] = "Choose how this person is related to you.";
    });
    return errors;
  };

  const validateGroups = () => {
    if (draft.noGroup && (draft.groupKeys.length > 0 || (draft.otherOpen && draft.otherGroup.trim()))) {
      return { no_group: "Choose either no group, or the groups you belong to." };
    }
    if (!draft.noGroup && draft.groupKeys.length === 0 && !(draft.otherOpen && draft.otherGroup.trim())) {
      return { groups: "Select the groups you belong to, choose no group, or name a group that is not listed." };
    }
    if (draft.otherOpen && !draft.otherGroup.trim()) return { other_group: "Enter the name of the group." };
    return {};
  };

  const continueFromType = async () => {
    if (!draft.intent) {
      setError("Choose how you would like to register.");
      return;
    }
    if (draft.intent === "new") {
      goTo(2);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.verifyEmail.trim())) {
      setFieldErrors({ verifyEmail: "Enter the email address on your parish record." });
      return;
    }
    if (!code.trim()) {
      setFieldErrors({ code: "Enter the code from your email." });
      return;
    }
    setBusy(true);
    setError("");
    try {
      const confirmed = await parishRegistrationService.confirmCode(draft.verifyEmail.trim(), code.trim());
      const profile = confirmed.profile;
      patch({
        token: confirmed.token,
        fullName: profile.full_name || "",
        phone: profile.phone || "",
        email: profile.email || draft.verifyEmail.trim(),
        address: profile.address || "",
        contactMethod: profile.preferred_contact_method || "",
        massId: profile.preferred_mass_schedule_id || "",
        groupKeys: profile.groups.map((group) => groupKey(group.type, group.id)),
        noGroup: profile.groups.length === 0,
        dateOfBirth: profile.date_of_birth || "",
        gender: profile.gender || "",
        occupation: profile.occupation || "",
        maritalStatus: profile.marital_status || "",
        faithStatus: profile.faith_status || "",
        sacraments: profile.sacraments || {},
        wantsPreparation: profile.wants_preparation,
        household: householdFromProfile(profile.household ?? []),
        newsOptIn: profile.news_opt_in,
        givingPreference: profile.giving_preference || "",
      });
      setCode("");
      goTo(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code is incorrect or has expired.");
    } finally {
      setBusy(false);
    }
  };

  const sendCode = async () => {
    setFieldErrors({});
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.verifyEmail.trim())) {
      setFieldErrors({ verifyEmail: "Enter a valid email address." });
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await parishRegistrationService.requestCode(draft.verifyEmail.trim());
      setNotice(response.message);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "The code could not be requested.");
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.privacy) {
      setFieldErrors({ privacy: "Please acknowledge the privacy notice before submitting." });
      return;
    }
    if (!options) return;
    const turnstile = document.querySelector<HTMLInputElement>('[name="cf-turnstile-response"]')?.value;
    if (options.turnstile_site_key && !turnstile) {
      setError("Complete the security check and try again.");
      return;
    }

    const body = {
      intent: draft.intent,
      full_name: draft.fullName.trim(),
      phone: draft.phone.trim() || null,
      email: draft.email.trim() || null,
      address: draft.address.trim() || null,
      preferred_contact_method: draft.contactMethod || null,
      preferred_mass_schedule_id: draft.massId || null,
      no_group: draft.noGroup,
      groups: draft.noGroup ? [] : draft.groupKeys.map((key) => {
        const [type, id] = key.split(":");
        return { type, id };
      }),
      other_group: !draft.noGroup && draft.otherOpen ? draft.otherGroup.trim() : null,
      privacy_accepted: true,
      date_of_birth: draft.dateOfBirth || null,
      gender: draft.gender || null,
      occupation: draft.occupation.trim() || null,
      marital_status: draft.maritalStatus || null,
      faith_status: draft.faithStatus || null,
      sacraments: Object.fromEntries(Object.entries(draft.sacraments).filter(([key]) => key !== "marriage" || married)),
      wants_preparation: offerPreparation && draft.wantsPreparation,
      household: draft.household.map((member) => ({
        name: member.name.trim(),
        relationship: member.relationship,
        date_of_birth: member.dateOfBirth || null,
        sacraments: member.sacraments,
      })),
      news_opt_in: draft.newsOptIn,
      giving_preference: draft.givingPreference || null,
      form_nonce: options.form_nonce,
      company_website: honeypot,
      turnstile_token: turnstile || null,
    };

    setBusy(true);
    setError("");
    try {
      const response = draft.intent === "new"
        ? await parishRegistrationService.submit(body, idempotencyKey.current)
        : await parishRegistrationService.update(body, idempotencyKey.current, draft.token || "");
      sessionStorage.removeItem(DRAFT_KEY);
      sessionStorage.removeItem(KEY_KEY);
      setResult(response);
    } catch (err) {
      if (err instanceof ParishRegistrationError && err.errors.form_nonce) {
        loadOptions();
      }
      const first = err instanceof ParishRegistrationError ? Object.values(err.errors)[0]?.[0] : undefined;
      if (err instanceof ParishRegistrationError) {
        const household = Object.fromEntries(
          Object.entries(err.errors).filter(([key]) => key.startsWith("household.")).map(([key, messages]) => [key, messages[0]])
        );
        if (Object.keys(household).length) {
          setFieldErrors(household);
          setStep(3);
        }
      }
      setError(first || (err instanceof Error ? err.message : "The registration could not be submitted."));
    } finally {
      setBusy(false);
    }
  };

  if (result) {
    return (
      <Card className="motion-safe:animate-fade-in">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-church-gold/20">
            <CheckCircle className="h-10 w-10 text-church-charcoal" aria-hidden="true" />
          </div>
          <h2 ref={headingRef} tabIndex={-1} className="font-heading text-2xl font-bold outline-none">Registration received</h2>
          <p className="mt-3 text-muted-foreground">{result.message}</p>
          <p className="mt-6 text-sm uppercase tracking-wide text-muted-foreground">Reference</p>
          <p className="font-heading text-2xl font-bold text-church-charcoal">{result.reference}</p>
          <div className="mt-8 rounded-xl border bg-muted/40 p-5 text-left">
            <h3 className="font-heading text-lg font-semibold">What happens next</h3>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>The parish office reviews your registration and adds you to the parish record.</li>
              <li>Someone from the parish will contact you to welcome you{draft.wantsPreparation ? " and talk about sacrament preparation" : ""}.</li>
              <li>Come and say hello after Mass. We look forward to meeting you.</li>
            </ol>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                { to: "/sacraments", label: "Sacraments", icon: Church },
                { to: "/groups", label: "Parish groups", icon: Users },
                { to: "/donations", label: "Giving", icon: HandCoins },
              ].map(({ to, label, icon: Icon }) => (
                <Button key={to} variant="outline" className="min-h-11 hover:border-church-gold hover:bg-church-gold/10" asChild>
                  <Link to={to}><Icon className="mr-2 h-4 w-4" aria-hidden="true" />{label}</Link>
                </Button>
              ))}
            </div>
          </div>
          {(options?.contact.phone || options?.contact.email) && (
            <p className="mt-4 text-sm text-muted-foreground">
              Parish office
              {options.contact.phone ? ` · ${options.contact.phone}` : ""}
              {options.contact.email ? ` · ${options.contact.email}` : ""}
            </p>
          )}
          <div className="mt-8 space-y-3">
            <Button className="min-h-11 w-full" variant="church" asChild>
              <Link to="/">Return to the homepage</Link>
            </Button>
            <Button className="min-h-11 w-full" variant="outline" onClick={() => { setResult(null); setDraft(emptyDraft); setStep(1); rotateKey(); }}>
              Register another person
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedNames = allGroups.filter((group) => draft.groupKeys.includes(groupKey(group.type, group.id))).map((group) => group.name);
  const mass = options?.masses.find((item) => item.id === draft.massId);

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      {step === 1 && <RegistrationWelcome />}
      <ol className="grid grid-cols-5 gap-1.5 sm:gap-2" aria-label="Registration progress">
        {steps.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={`flex min-h-11 w-full flex-col items-center justify-center rounded-md px-1 text-xs sm:text-sm ${step === item.id ? "bg-primary text-primary-foreground" : step > item.id ? "bg-church-gold/20 text-church-charcoal" : "bg-muted text-muted-foreground"}`}
              aria-current={step === item.id ? "step" : undefined}
              disabled={item.id > step}
              onClick={() => item.id < step && goTo(item.id)}
            >
              <span className="font-semibold">{item.id}</span>
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ol>

      <Card className="motion-safe:animate-fade-in">
        <CardHeader>
          <h2 ref={headingRef} tabIndex={-1} className="font-heading text-2xl font-bold leading-none tracking-tight outline-none">
            {step === 1 && "How would you like to register?"}
            {step === 2 && "About you"}
            {step === 3 && "Faith and family"}
            {step === 4 && "Societies and groups"}
            {step === 5 && "Review and submit"}
          </h2>
          <CardDescription>
            {step === 1 && "You do not need an account to register. Existing parishioners confirm their email before any record is opened."}
            {step === 2 && "Name, phone and address are required. Everything else is optional."}
            {step === 3 && "All optional. This helps us welcome you and prepare you or your family for the sacraments."}
            {step === 4 && "Choose your groups, or say that you do not belong to one."}
            {step === 5 && "Check your details, then accept the privacy notice."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {notice && <p role="status" className="rounded-md border bg-muted px-3 py-2 text-sm">{notice}</p>}
          {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

          {step === 1 && (
            <fieldset className="space-y-4">
              <legend className="sr-only">Registration type</legend>
              <RadioGroup value={draft.intent ?? ""} onValueChange={(value) => patch({ intent: value as Intent, token: null })} className="gap-3">
                {[
                  ["new", "I am new to the parish", "Create a parish record. No password is required."],
                  ["complete", "I already have an account, but my parish record is incomplete", "We will email a code before opening your record."],
                  ["update", "I am a parishioner and want to update my details", "We will email a code. Your record is changed only after that code is confirmed."],
                ].map(([value, title, help]) => (
                  <label key={value} className="flex min-h-11 cursor-pointer gap-3 rounded-md border p-4 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring">
                    <RadioGroupItem value={value} id={`intent-${value}`} className="mt-1" />
                    <span>
                      <span className="block font-medium">{title}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">{help}</span>
                    </span>
                  </label>
                ))}
              </RadioGroup>

              {draft.intent && draft.intent !== "new" && (
                <div className="space-y-4 rounded-md bg-muted/60 p-4">
                  <Field id="verify-email" label="Email address" required error={fieldErrors.verifyEmail} hint="The email already on your parish record.">
                    <Input id="verify-email" type="email" autoComplete="email" value={draft.verifyEmail} onChange={(event) => patch({ verifyEmail: event.target.value })} placeholder="name@example.com" />
                  </Field>
                  <Button type="button" variant="outline" className="min-h-11" onClick={sendCode} disabled={busy}>Send a code</Button>
                  <Field id="verify-code" label="Verification code" required error={fieldErrors.code} hint="From the email. It expires in 15 minutes.">
                    <Input id="verify-code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="6-digit code" />
                  </Field>
                </div>
              )}
            </fieldset>
          )}

          {step === 2 && (
            <div className="grid gap-4">
              <Field id="full-name" label="Full name" required error={fieldErrors.full_name} hint="First name and surname.">
                <Input id="full-name" autoComplete="name" value={draft.fullName} onChange={(event) => patch({ fullName: event.target.value })} />
              </Field>
              <Field id="phone" label="Phone number" required={policy.phone_required} error={fieldErrors.phone} hint="Nigerian number, such as 080… or +234…">
                <Input id="phone" type="tel" autoComplete="tel" placeholder="08012345678" value={draft.phone} onChange={(event) => patch({ phone: event.target.value })} />
              </Field>
              <Field id="email" label="Email address" required={policy.email_required} error={fieldErrors.email} hint={policy.email_required ? "Used for confirmation and sign-in." : "Optional. Used for confirmation and sign-in."}>
                <Input id="email" type="email" autoComplete="email" placeholder="name@example.com" value={draft.email} onChange={(event) => patch({ email: event.target.value })} />
              </Field>
              <Field id="address" label="Residential address" required={policy.address_required} error={fieldErrors.address} hint="Street and area. For example, 14 Gbaja Road, Surulere.">
                <Textarea id="address" autoComplete="street-address" value={draft.address} onChange={(event) => patch({ address: event.target.value })} />
              </Field>
              <Field id="mass" label="Preferred Sunday Mass" hint="The Sunday Mass you usually attend.">
                <Select value={draft.massId || "none"} onValueChange={(value) => patch({ massId: value === "none" ? "" : value })}>
                  <SelectTrigger id="mass" className="min-h-11"><SelectValue placeholder="No preference" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No preference</SelectItem>
                    {options?.masses.map((item) => (
                      <SelectItem key={item.id} value={item.id}>{item.title} · {item.time} · {item.language}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field id="contact-method" label="Preferred contact method" hint="How the office should reach you.">
                <Select value={draft.contactMethod || "none"} onValueChange={(value) => patch({ contactMethod: value === "none" ? "" : value as Draft["contactMethod"] })}>
                  <SelectTrigger id="contact-method" className="min-h-11"><SelectValue placeholder="No preference" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No preference</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="either">Either</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
                <Field id="dob" label="Date of birth" hint="Optional. Helps us celebrate with you.">
                  <IsoDatePicker id="dob" value={draft.dateOfBirth} onChange={(value) => patch({ dateOfBirth: value })} min="1900-01-01" max={today} yearDropdown placeholder="Choose a date" />
                </Field>
                <Field id="occupation" label="Occupation" hint="Optional. Your skills may bless a parish ministry.">
                  <Input id="occupation" autoComplete="organization-title" value={draft.occupation} onChange={(event) => patch({ occupation: event.target.value })} />
                </Field>
              </div>
              <PillChoice name="gender" legend="Gender" value={draft.gender} options={GENDERS} onChange={(value) => patch({ gender: value ?? "" })} />
              <PillChoice name="marital-status" legend="Marital status" value={draft.maritalStatus} options={MARITAL_STATUSES} onChange={(value) => patch({ maritalStatus: value ?? "" })} />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <PillChoice
                name="faith-status"
                legend="Where are you in your faith journey?"
                value={draft.faithStatus}
                options={FAITH_STATUSES}
                onChange={(value) => patch({ faithStatus: value ?? "" })}
              />
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Sacraments you have received</h3>
                <p className="text-sm text-muted-foreground">
                  {draft.faithStatus === "exploring"
                    ? "Baptism in another Christian church counts as received. Leave anything you are unsure of."
                    : "Tap an answer for each. Leave blank anything you would rather discuss in person."}
                </p>
                <SacramentRows idPrefix="own" keys={ownSacramentKeys} value={draft.sacraments} onChange={(sacraments) => patch({ sacraments })} />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Your household <span className="font-normal text-muted-foreground">(optional)</span></h3>
                <p className="text-sm text-muted-foreground">Add your spouse, children or others who live with you and will worship with us. They are registered with you.</p>
                <HouseholdEditor members={draft.household} onChange={(household) => patch({ household })} errors={fieldErrors} today={today} />
              </div>
              {offerPreparation && (
                <label className="flex min-h-11 items-start gap-3 rounded-lg border border-church-gold/40 bg-church-gold/10 p-4 motion-safe:animate-fade-in">
                  <Checkbox className="mt-0.5" checked={draft.wantsPreparation} onCheckedChange={(value) => patch({ wantsPreparation: value === true })} />
                  <span>
                    <span className="block font-medium">Please contact me about preparation</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {draft.faithStatus === "exploring"
                        ? "We will tell you about RCIA and the sacraments, with no pressure."
                        : "For the sacraments marked “Not yet”, for you or your household."}
                    </span>
                  </span>
                </label>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              {loadingOptions && <p className="text-sm text-muted-foreground">Loading groups…</p>}
              {optionsError && (
                <div role="alert" className="space-y-3 rounded-md border px-3 py-3">
                  <p>{optionsError}</p>
                  <Button type="button" variant="outline" className="min-h-11" onClick={loadOptions}>Try again</Button>
                </div>
              )}
              {!loadingOptions && !optionsError && allGroups.length === 0 && (
                <p className="text-sm text-muted-foreground">No groups are listed yet. You can say you do not belong to a group, or name one for the office to review.</p>
              )}
              {allGroups.length > 0 && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Label htmlFor="group-search">Search groups</Label>
                      <FieldHint text="Type part of a name to shorten the list." />
                    </div>
                    <Input id="group-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name" />
                  </div>
                  <div className="max-h-80 space-y-4 overflow-y-auto pr-1">
                    {options?.categories.map((category) => {
                      const groups = category.groups.filter((group) => group.name.toLowerCase().includes(query.trim().toLowerCase()));
                      if (groups.length === 0) return null;
                      return (
                        <fieldset key={category.key}>
                          <legend className="mb-2 font-medium">{category.label}</legend>
                          <div className="space-y-2">
                            {groups.map((group) => {
                              const key = groupKey(group.type, group.id);
                              const checked = draft.groupKeys.includes(key);
                              return (
                                <label key={key} className="flex min-h-11 items-start gap-3 rounded-md border px-3 py-2">
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={(value) => {
                                      const next = value
                                        ? [...draft.groupKeys, key]
                                        : draft.groupKeys.filter((item) => item !== key);
                                      patch({ groupKeys: next, noGroup: false });
                                    }}
                                    className="mt-1"
                                  />
                                  <span>
                                    <span className="block">{group.name}</span>
                                    {group.description && <span className="block text-sm text-muted-foreground">{group.description}</span>}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </fieldset>
                      );
                    })}
                  </div>
                </>
              )}
              {fieldErrors.groups && <p role="alert" className="text-sm text-destructive">{fieldErrors.groups}</p>}
              <label className="flex min-h-11 items-center gap-3">
                <Checkbox
                  checked={draft.noGroup}
                  onCheckedChange={(value) => patch({ noGroup: value === true, groupKeys: [], otherOpen: false, otherGroup: "" })}
                />
                <span>I do not currently belong to any group</span>
              </label>
              {fieldErrors.no_group && <p role="alert" className="text-sm text-destructive">{fieldErrors.no_group}</p>}
              <label className="flex min-h-11 items-center gap-3">
                <Checkbox checked={draft.otherOpen} disabled={draft.noGroup} onCheckedChange={(value) => patch({ otherOpen: value === true, noGroup: false })} />
                <span>Other group not listed</span>
              </label>
              {draft.otherOpen && (
                <Field id="other-group" label="Group name" required error={fieldErrors.other_group} hint="Reviewed by the office. Not added yet.">
                  <Input id="other-group" value={draft.otherGroup} onChange={(event) => patch({ otherGroup: event.target.value })} />
                </Field>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 text-sm">
              <Summary label="Registration" value={draft.intent === "new" ? "New parishioner" : draft.intent === "complete" ? "Complete an existing record" : "Update an existing record"} />
              <Summary label="Name" value={draft.fullName} />
              <Summary label="Phone" value={draft.phone || "Not provided"} />
              <Summary label="Email" value={draft.email || "Not provided"} />
              <Summary label="Address" value={draft.address || "Not provided"} />
              <Summary label="Sunday Mass" value={mass ? `${mass.title} · ${mass.time}` : "No preference"} />
              <Summary label="Contact method" value={draft.contactMethod || "No preference"} />
              <Summary label="Groups" value={draft.noGroup ? "None" : [...selectedNames, draft.otherOpen ? `Other: ${draft.otherGroup}` : ""].filter(Boolean).join(", ") || "None selected"} />
              {draft.dateOfBirth && <Summary label="Date of birth" value={format(new Date(`${draft.dateOfBirth}T12:00:00`), "d MMMM yyyy")} />}
              {draft.gender && <Summary label="Gender" value={GENDERS.find((g) => g.value === draft.gender)?.label ?? ""} />}
              {draft.occupation.trim() && <Summary label="Occupation" value={draft.occupation.trim()} />}
              {draft.maritalStatus && <Summary label="Marital status" value={MARITAL_STATUSES.find((m) => m.value === draft.maritalStatus)?.label ?? ""} />}
              {draft.faithStatus && <Summary label="Faith" value={FAITH_STATUSES.find((f) => f.value === draft.faithStatus)?.label ?? ""} />}
              {sacramentText(draft.sacraments, ownSacramentKeys) && <Summary label="Sacraments" value={sacramentText(draft.sacraments, ownSacramentKeys)} />}
              {draft.household.length > 0 && (
                <Summary
                  label="Household"
                  value={draft.household.map((member) => `${member.name.trim()} (${relationshipLabel(member.relationship)})`).join(", ")}
                />
              )}
              {offerPreparation && draft.wantsPreparation && <Summary label="Preparation" value="Please contact me" />}

              <div className="space-y-4 rounded-lg border bg-muted/40 p-4">
                <h3 className="font-medium">Stay connected <span className="font-normal text-muted-foreground">(optional)</span></h3>
                <label className="flex min-h-11 items-start gap-3">
                  <Checkbox className="mt-0.5" checked={draft.newsOptIn} onCheckedChange={(value) => patch({ newsOptIn: value === true })} />
                  <span>
                    Send me parish news and updates
                    {!draft.email.trim() && <span className="block text-muted-foreground">Add an email address in “About you” to receive them by email.</span>}
                  </span>
                </label>
                <PillChoice name="giving" legend="How would you like to give?" value={draft.givingPreference} options={GIVING} onChange={(value) => patch({ givingPreference: value ?? "" })} />
              </div>
              <p className="text-muted-foreground">Keep your reference number. A confirmation is sent only if you gave an email.</p>
              <label className="flex min-h-11 items-start gap-3">
                <Checkbox checked={draft.privacy} onCheckedChange={(value) => patch({ privacy: value === true })} />
                <span className="inline-flex flex-wrap items-center gap-1">
                  I have read the <Link className="underline" to="/privacy-policy">privacy notice</Link> and agree to the parish using these details for membership.
                  <span className="text-destructive" aria-hidden="true">*</span>
                  <FieldHint text="Required before you can submit." />
                </span>
              </label>
              {fieldErrors.privacy && <p role="alert" className="text-sm text-destructive">{fieldErrors.privacy}</p>}
              {options?.turnstile_site_key && <div className="cf-turnstile" data-sitekey={options.turnstile_site_key} />}
              <input id={honeypotId} name="company_website" value={honeypot} onChange={(event) => setHoneypot(event.target.value)} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            {step > 1 ? (
              <Button type="button" variant="outline" className="min-h-11" onClick={() => goTo(step - 1)}>
                <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" /> Back
              </Button>
            ) : <span />}
            {step < LAST_STEP ? (
              <Button
                type="button"
                variant="church"
                className="min-h-11"
                disabled={busy}
                onClick={() => {
                  if (step === 1) { void continueFromType(); return; }
                  const errors = step === 2 ? validateDetails() : step === 3 ? validateFaith() : validateGroups();
                  setFieldErrors(errors);
                  if (Object.keys(errors).length === 0) goTo(step + 1);
                }}
              >
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                Continue
              </Button>
            ) : (
              <Button type="submit" variant="church" className="min-h-11" disabled={busy}>
                {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                Submit registration
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

function Field({ id, label, required, hint, error, children }: { id: string; label: string; required?: boolean; hint?: string; error?: string; children: ReactNode }) {
  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<{ "aria-describedby"?: string; "aria-invalid"?: boolean; "aria-required"?: boolean }>, {
        "aria-describedby": error ? `${id}-error` : undefined,
        "aria-invalid": Boolean(error) || undefined,
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
      {error && <p id={`${id}-error`} role="alert" className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function sacramentText(answers: Sacraments, keys: SacramentKey[]): string {
  return keys
    .filter((key) => answers[key])
    .map((key) => `${SACRAMENT_LABELS[key]}: ${answerLabel(key, answers[key]!)}`)
    .join(" · ");
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b py-2 sm:grid-cols-[10rem_1fr]">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words font-medium">{value}</dd>
    </div>
  );
}

export default RegistrationWizard;
