import { cloneElement, FormEvent, isValidElement, useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import FieldHint from "@/components/forms/FieldHint";
import { canonicalNigerianPhone } from "@/lib/phone";
import {
  parishRegistrationService,
  ParishRegistrationError,
  type RegistrationOptions,
  type RegistrationResult,
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
};

const steps = [
  { id: 1, label: "Type" },
  { id: 2, label: "Details" },
  { id: 3, label: "Groups" },
  { id: 4, label: "Review" },
];

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
  const [options, setOptions] = useState<RegistrationOptions | null>(null);
  const [optionsError, setOptionsError] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(true);
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

  const loadOptions = () => {
    setLoadingOptions(true);
    setOptionsError("");
    parishRegistrationService.options()
      .then((data) => setOptions(data))
      .catch((err: Error) => setOptionsError(err.message || "The group list could not be loaded."))
      .finally(() => setLoadingOptions(false));
  };

  useEffect(() => { loadOptions(); }, []);

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
      <ol className="grid grid-cols-4 gap-2" aria-label="Registration progress">
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
            {step === 2 && "Personal information"}
            {step === 3 && "Societies and groups"}
            {step === 4 && "Review and submit"}
          </h2>
          <CardDescription>
            {step === 1 && "You do not need an account to register. Existing parishioners confirm their email before any record is opened."}
            {step === 2 && "Only the details the parish office needs."}
            {step === 3 && "Choose your groups, or say that you do not belong to one."}
            {step === 4 && "Check your details, then accept the privacy notice."}
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
            </div>
          )}

          {step === 3 && (
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

          {step === 4 && (
            <div className="space-y-4 text-sm">
              <Summary label="Registration" value={draft.intent === "new" ? "New parishioner" : draft.intent === "complete" ? "Complete an existing record" : "Update an existing record"} />
              <Summary label="Name" value={draft.fullName} />
              <Summary label="Phone" value={draft.phone || "Not provided"} />
              <Summary label="Email" value={draft.email || "Not provided"} />
              <Summary label="Address" value={draft.address || "Not provided"} />
              <Summary label="Sunday Mass" value={mass ? `${mass.title} · ${mass.time}` : "No preference"} />
              <Summary label="Contact method" value={draft.contactMethod || "No preference"} />
              <Summary label="Groups" value={draft.noGroup ? "None" : [...selectedNames, draft.otherOpen ? `Other: ${draft.otherGroup}` : ""].filter(Boolean).join(", ") || "None selected"} />
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
            {step < 4 ? (
              <Button
                type="button"
                variant="church"
                className="min-h-11"
                disabled={busy}
                onClick={() => {
                  if (step === 1) { void continueFromType(); return; }
                  if (step === 2) {
                    const errors = validateDetails();
                    setFieldErrors(errors);
                    if (Object.keys(errors).length === 0) goTo(3);
                    return;
                  }
                  const errors = validateGroups();
                  setFieldErrors(errors);
                  if (Object.keys(errors).length === 0) goTo(4);
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

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b py-2 sm:grid-cols-[10rem_1fr]">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-words font-medium">{value}</dd>
    </div>
  );
}

export default RegistrationWizard;
