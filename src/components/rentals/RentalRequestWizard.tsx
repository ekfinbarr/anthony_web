import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { IsoDatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import facilityService, { Facility, FacilityTimeBlockDto } from "@/services/facility.service";
import facilityBookingService from "@/services/facilityBooking.service";

const schema = z.object({
  full_name: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email recommended for notifications").or(z.literal("")).optional(),
  organization: z.string().optional(),
  preferred_contact: z.enum(["phone", "email", "whatsapp"]).optional(),
  applicant_type: z.enum(["parishioner", "organization", "guest", "other"]).optional(),
  booking_date: z.string().min(1, "Select a date"),
  time_block_ids: z.array(z.string()).min(1, "Select at least one time block"),
  event_title: z.string().min(2, "Event title is required"),
  event_category: z.string().optional(),
  // Number inputs yield strings; coerce while typing the form input honestly.
  expected_attendance: z.coerce.number<string | number>().min(1, "Expected attendance is required"),
  event_description: z.string().optional(),
  setup_requirements: z.string().optional(),
  accessibility_requirements: z.string().optional(),
  accept_terms: z.literal(true, { message: "You must accept the rental terms" }),
  accept_privacy: z.literal(true, { message: "You must accept the privacy notice" }),
});

// Defaults/coercion make the form's input type differ from its parsed output.
type FormInput = z.input<typeof schema>;
type FormValues = z.output<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facilitySlug?: string | null;
}

const steps = ["Applicant", "Venue & time", "Event", "Review"] as const;

function formatNgn(amount: string | number | undefined) {
  const n = Number(amount ?? 0);
  return `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
}

function timeLabel(t: string) {
  const [h, m] = t.slice(0, 5).split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" });
}

export default function RentalRequestWizard({ open, onOpenChange, facilitySlug }: Props) {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [venues, setVenues] = useState<Facility[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [terms, setTerms] = useState<string>("");
  const [privacy, setPrivacy] = useState<string>("");
  const [availabilityMsg, setAvailabilityMsg] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [idempotencyKey] = useState(() => crypto.randomUUID());

  const form = useForm<FormInput, unknown, FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      phone: "",
      email: "",
      organization: "",
      preferred_contact: "phone",
      applicant_type: "guest",
      booking_date: "",
      time_block_ids: [],
      event_title: "",
      event_category: "",
      expected_attendance: 1,
      event_description: "",
      setup_requirements: "",
      accessibility_requirements: "",
      accept_terms: undefined as unknown as true,
      accept_privacy: undefined as unknown as true,
    },
  });

  // Start from the first step each time the wizard opens (adjusted during render).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setStep(0);
  }

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const [listRes, options] = await Promise.all([
          facilityService.list({ bookable: true }),
          facilityBookingService.getOptions(),
        ]);
        const bookable = (listRes.data ?? []).filter((f) => f.is_bookable);
        setVenues(bookable);
        setCategories(options.event_categories ?? []);
        setTerms(options.terms_notice || "I agree to the parish venue rental terms and conditions.");
        setPrivacy(options.privacy_notice || "I understand my details will be used to process this booking request in line with applicable data protection requirements.");
        const initial = facilitySlug || bookable[0]?.slug || "";
        setSelectedSlug(initial);
      } catch {
        toast({ title: "Could not load venues", description: "Please try again shortly.", variant: "destructive" });
      }
    })();
  }, [open, facilitySlug, toast]);

  useEffect(() => {
    if (!open || !user) return;
    form.setValue("full_name", user.name || "");
    form.setValue("email", user.email || "");
    form.setValue("phone", (user as { phone?: string }).phone || "");
    form.setValue("applicant_type", "parishioner");
  }, [open, user, form]);

  const venue = useMemo(
    () => venues.find((v) => v.slug === selectedSlug) ?? null,
    [venues, selectedSlug]
  );

  const blocks: FacilityTimeBlockDto[] = useMemo(
    () => (venue?.time_blocks ?? []).filter((b) => b.is_active !== false && b.is_online !== false),
    [venue]
  );

  const selectedBlockIds = useWatch({ control: form.control, name: "time_block_ids" }) ?? [];
  const selectedBlocks = blocks.filter((b) => selectedBlockIds.includes(b.id));
  const indicativeTotal = selectedBlocks.reduce((sum, b) => sum + Number(b.price || 0), 0);

  const checkSlot = async () => {
    if (!venue || !form.getValues("booking_date") || selectedBlocks.length === 0) return;
    const start = selectedBlocks[0].start_time.slice(0, 5);
    const end = selectedBlocks[selectedBlocks.length - 1].end_time.slice(0, 5);
    try {
      const res = await facilityBookingService.checkAvailability(venue.slug, {
        date: form.getValues("booking_date"),
        start_time: start,
        end_time: end,
        time_block_ids: selectedBlocks.map((b) => b.id),
      });
      setAvailabilityMsg(res.message);
    } catch {
      setAvailabilityMsg("Could not check availability. The parish office remains authoritative.");
    }
  };

  const next = async () => {
    const fields: (keyof FormValues)[][] = [
      ["full_name", "phone", "email", "applicant_type", "preferred_contact", "organization"],
      ["booking_date", "time_block_ids"],
      ["event_title", "event_category", "expected_attendance", "event_description", "setup_requirements", "accessibility_requirements"],
      ["accept_terms", "accept_privacy"],
    ];
    const ok = await form.trigger(fields[step]);
    if (!ok) return;
    if (step === 1) {
      if (venue?.capacity && Number(form.getValues("expected_attendance")) > venue.capacity) {
        // capacity checked on event step primarily
      }
      await checkSlot();
    }
    if (step === 2 && venue?.capacity && Number(form.getValues("expected_attendance")) > venue.capacity) {
      form.setError("expected_attendance", {
        message: `Attendance exceeds venue capacity (${venue.capacity}).`,
      });
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const onSubmit = async (values: FormValues) => {
    if (!venue) {
      toast({ title: "Select a venue", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...values,
        guest_name: values.full_name,
        guest_email: values.email || undefined,
        guest_phone: values.phone,
        accept_terms: true as const,
        accept_privacy: true as const,
        idempotency_key: idempotencyKey,
      };
      const result = user?.token
        ? await facilityBookingService.create(venue.slug, payload)
        : await facilityBookingService.createGuest(venue.slug, payload);

      toast({
        title: "Request received",
        description: "Your request is awaiting parish office review. No venue is reserved yet.",
      });
      onOpenChange(false);
      navigate(`/rentals/status/${result.access_token}`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err as Error)?.message ||
        "Could not submit request.";
      toast({ title: "Submission failed", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-heading">Request a venue</DialogTitle>
          <DialogDescription>
            Step {step + 1} of {steps.length}: {steps[step]}. Payment is not due until the parish office approves your request.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 mb-4" aria-hidden>
          {steps.map((label, i) => (
            <div
              key={label}
              className={`h-1 flex-1 rounded ${i <= step ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {step === 0 && (
              <>
                <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-2">
                  {user ? (
                    <p>
                      Signed in as <strong>{user.name}</strong>. Your request will be linked to your account.
                      You can still edit the details below before submitting.
                    </p>
                  ) : (
                    <>
                      <p>
                        <strong>Continue as a guest</strong> — no account required. Fill in your details below and submit your request.
                      </p>
                      <p className="text-muted-foreground">
                        Already registered?{" "}
                        <Link
                          to={`/auth/login?redirect=${encodeURIComponent("/rentals")}`}
                          className="text-primary underline underline-offset-2 font-medium"
                          onClick={() => onOpenChange(false)}
                        >
                          Sign in
                        </Link>{" "}
                        to prefill your profile, then return here to book.
                      </p>
                    </>
                  )}
                </div>
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full name</FormLabel>
                      <FormControl>
                        <Input {...field} autoComplete="name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} type="tel" autoComplete="tel" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (for notifications)</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" autoComplete="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="organization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="applicant_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Applicant type</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="parishioner">Parishioner</SelectItem>
                            <SelectItem value="organization">Organization</SelectItem>
                            <SelectItem value="guest">Guest</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferred_contact"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred contact</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="phone">Phone</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="space-y-2">
                  <FormLabel>Venue</FormLabel>
                  <Select value={selectedSlug} onValueChange={(v) => { setSelectedSlug(v); form.setValue("time_block_ids", []); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {venues.map((v) => (
                        <SelectItem key={v.id} value={v.slug}>
                          {v.name}
                          {v.capacity ? ` · up to ${v.capacity}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {venue?.description && (
                    <p className="text-sm text-muted-foreground">{venue.description}</p>
                  )}
                </div>
                <FormField
                  control={form.control}
                  name="booking_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Requested date</FormLabel>
                      <FormControl>
                        <IsoDatePicker value={field.value} onChange={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time_block_ids"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time blocks (fixed rates)</FormLabel>
                      {blocks.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No online time blocks are configured for this venue yet. Please contact the parish office.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {blocks.map((block) => {
                            const checked = field.value.includes(block.id);
                            return (
                              <label
                                key={block.id}
                                className={`flex items-start gap-3 rounded-md border p-3 cursor-pointer ${checked ? "border-primary bg-primary/5" : ""}`}
                              >
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={(v) => {
                                    const nextIds = v
                                      ? [...field.value, block.id]
                                      : field.value.filter((id) => id !== block.id);
                                    field.onChange(nextIds);
                                  }}
                                />
                                <span className="flex-1 text-sm">
                                  <span className="font-medium">{block.name}</span>
                                  <br />
                                  {timeLabel(block.start_time)} – {timeLabel(block.end_time)} · {formatNgn(block.price)}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {indicativeTotal > 0 && (
                  <p className="text-sm font-medium">Indicative fee: {formatNgn(indicativeTotal)}</p>
                )}
                {availabilityMsg && (
                  <p className="text-sm text-muted-foreground border-l-2 border-primary/40 pl-3">{availabilityMsg}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Availability shown here is informational. Submitting a request does not reserve the venue.
                </p>
              </>
            )}

            {step === 2 && (
              <>
                <FormField
                  control={form.control}
                  name="event_title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event title / purpose</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="event_category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="expected_attendance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected attendance{venue?.capacity ? ` (max ${venue.capacity})` : ""}</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="event_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brief description</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="setup_requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setup / equipment needs</FormLabel>
                      <FormControl>
                        <Textarea rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accessibility_requirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accessibility / other requests</FormLabel>
                      <FormControl>
                        <Textarea rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {step === 3 && (
              <div className="space-y-3 text-sm">
                <div className="rounded-md bg-muted/50 p-3 space-y-1">
                  <p><strong>Applicant:</strong> {form.getValues("full_name")} · {form.getValues("phone")}</p>
                  <p><strong>Venue:</strong> {venue?.name}</p>
                  <p><strong>Date:</strong> {form.getValues("booking_date")}</p>
                  <p><strong>Blocks:</strong> {selectedBlocks.map((b) => b.name).join(", ") || "—"}</p>
                  <p><strong>Event:</strong> {form.getValues("event_title")} ({form.getValues("expected_attendance")} guests)</p>
                  <p><strong>Indicative fee:</strong> {formatNgn(indicativeTotal)}</p>
                </div>
                <p className="text-muted-foreground">
                  This request is subject to parish office approval. No venue is reserved at submission, and payment is not yet due.
                </p>
                <FormField
                  control={form.control}
                  name="accept_terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                      </FormControl>
                      <div>
                        <FormLabel className="font-normal">{terms}</FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accept_privacy"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start gap-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                      </FormControl>
                      <div>
                        <FormLabel className="font-normal">{privacy}</FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex justify-between gap-2 pt-2">
              <Button type="button" variant="outline" disabled={step === 0 || submitting} onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
              {step < steps.length - 1 ? (
                <Button type="button" onClick={next}>
                  Continue
                </Button>
              ) : (
                <Button type="submit" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit request
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
