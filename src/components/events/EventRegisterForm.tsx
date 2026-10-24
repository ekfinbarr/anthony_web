import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-error";
import { notify } from "@/lib/notify";
import eventService from "@/services/event.service";
import type { Event } from "@/services/event.service";

type EventRegisterFormProps = {
  event: Event;
};

const EventRegisterForm = ({ event }: EventRegisterFormProps) => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    guest_name: "",
    contact_email: "",
    contact_phone: "",
    guest_count: "1",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () =>
      notify.promise(
        eventService.registerGuest(event.slug!, {
          guest_name: form.guest_name.trim(),
          contact_email: form.contact_email.trim(),
          contact_phone: form.contact_phone.trim() || undefined,
          guest_count: Math.max(1, Number(form.guest_count) || 1),
          notes: form.notes.trim() || undefined,
          status: "attending",
        }),
        {
          loading: "Submitting your registration…",
          success: "Registration received. We look forward to welcoming you.",
          error: (err) =>
            getApiErrorMessage(err, "Registration could not be completed. Please try again."),
        }
      ),
    onSuccess: () => setSubmitted(true),
  });

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.guest_name.trim()) next.guest_name = "Full name is required.";
    if (!form.contact_email.trim()) next.contact_email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email.trim())) {
      next.contact_email = "Enter a valid email address.";
    }
    if (!form.guest_count || Number(form.guest_count) < 1) {
      next.guest_count = "At least one attendee is required.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  if (!event.rsvp_enabled) return null;

  if (event.event_state === "cancelled") {
    return (
      <div id="register" className="border border-destructive/30 bg-destructive/5 p-6">
        <h2 className="font-serif text-xl font-semibold text-church-charcoal">Registration closed</h2>
        <p className="mt-2 text-sm text-muted-foreground">This event has been cancelled.</p>
      </div>
    );
  }

  if (event.registration_open === false) {
    return (
      <div id="register" className="border border-church-gold-warm/25 bg-church-pearl/40 p-6">
        <h2 className="font-serif text-xl font-semibold text-church-charcoal">Registration closed</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {event.available_spaces === 0
            ? "This event is fully booked."
            : "Registration is no longer available for this event."}
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div id="register" className="border border-church-gold-warm/30 bg-white p-6" role="status">
        <h2 className="font-serif text-xl font-semibold text-church-charcoal">You’re registered</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A confirmation has been recorded for {form.contact_email}. If email delivery is configured, you’ll also receive a confirmation message.
        </p>
      </div>
    );
  }

  return (
    <div id="register" className="border border-church-gold-warm/20 bg-white p-6 sm:p-8">
      <h2 className="font-serif text-xl font-semibold text-church-charcoal">Register / RSVP</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Fields marked with <span aria-hidden="true">*</span>
        <span className="sr-only">asterisk</span> are required.
        {typeof event.available_spaces === "number" && (
          <> {event.available_spaces} space{event.available_spaces === 1 ? "" : "s"} remaining.</>
        )}
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!validate() || mutation.isPending) return;
          mutation.mutate();
        }}
        noValidate
      >
        <div>
          <Label htmlFor="guest_name">
            Full name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="guest_name"
            value={form.guest_name}
            onChange={(e) => setForm((f) => ({ ...f, guest_name: e.target.value }))}
            aria-invalid={Boolean(errors.guest_name)}
            aria-describedby={errors.guest_name ? "guest_name-error" : undefined}
            className="mt-1.5"
            autoComplete="name"
          />
          {errors.guest_name && (
            <p id="guest_name-error" className="mt-1 text-xs text-destructive">
              {errors.guest_name}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="contact_email">
            Email <span className="text-destructive">*</span>
          </Label>
          <Input
            id="contact_email"
            type="email"
            value={form.contact_email}
            onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
            aria-invalid={Boolean(errors.contact_email)}
            aria-describedby={errors.contact_email ? "contact_email-error" : undefined}
            className="mt-1.5"
            autoComplete="email"
          />
          {errors.contact_email && (
            <p id="contact_email-error" className="mt-1 text-xs text-destructive">
              {errors.contact_email}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="contact_phone">Phone</Label>
            <Input
              id="contact_phone"
              type="tel"
              value={form.contact_phone}
              onChange={(e) => setForm((f) => ({ ...f, contact_phone: e.target.value }))}
              className="mt-1.5"
              autoComplete="tel"
            />
          </div>
          <div>
            <Label htmlFor="guest_count">
              Number of attendees <span className="text-destructive">*</span>
            </Label>
            <Input
              id="guest_count"
              type="number"
              min={1}
              max={50}
              value={form.guest_count}
              onChange={(e) => setForm((f) => ({ ...f, guest_count: e.target.value }))}
              aria-invalid={Boolean(errors.guest_count)}
              className="mt-1.5"
            />
            {errors.guest_count && (
              <p className="mt-1 text-xs text-destructive">{errors.guest_count}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            className="mt-1.5"
            rows={3}
          />
        </div>

        <Button type="submit" variant="church" disabled={mutation.isPending}>
          {mutation.isPending ? "Submitting…" : "Submit registration"}
        </Button>
      </form>
    </div>
  );
};

export default EventRegisterForm;
