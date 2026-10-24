import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import ministryEnquiryService from "@/services/ministryEnquiry.service";
import type { Ministry } from "@/services/ministry.service";

type Props = {
  ministry?: Pick<Ministry, "id" | "name"> | null;
  onSuccess?: () => void;
};

const MinistryEnquiryForm = ({ ministry, onSuccess }: Props) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!fullName.trim() || !email.trim() || !consent) {
      setError("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await ministryEnquiryService.submit({
        ministry_id: ministry?.id,
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        message: message.trim() || undefined,
        privacy_consent: true,
      });
      setSuccess(
        res.message ||
          "Thank you. Your expression of interest has been received. This is not a confirmation of membership."
      );
      setFullName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setConsent(false);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div
        className="rounded-lg border border-primary/20 bg-primary/5 p-5 text-sm leading-relaxed text-foreground"
        role="status"
      >
        <p className="font-medium">Enquiry received</p>
        <p className="mt-2 text-muted-foreground">{success}</p>
        <Button type="button" variant="outline" className="mt-4" onClick={() => setSuccess(null)}>
          Send another enquiry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {ministry && (
        <p className="text-sm text-muted-foreground">
          Preferred ministry: <span className="font-medium text-foreground">{ministry.name}</span>
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="eoi-name">
          Full name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="eoi-name"
          name="full_name"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={submitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="eoi-email">
          Email address <span className="text-destructive">*</span>
        </Label>
        <Input
          id="eoi-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={submitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="eoi-phone">Telephone</Label>
        <Input
          id="eoi-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={submitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="eoi-message">Message</Label>
        <Textarea
          id="eoi-message"
          name="message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={submitting}
          placeholder="Share any questions or availability (optional)"
        />
      </div>

      <label className="flex items-start gap-3 text-sm leading-relaxed">
        <Checkbox
          checked={consent}
          onCheckedChange={(v) => setConsent(v === true)}
          disabled={submitting}
          required
          aria-required
          id="eoi-consent"
        />
        <span>
          I agree to the processing of my details as described in the{" "}
          <Link to="/privacy-policy" className="text-primary underline underline-offset-2">
            privacy notice
          </Link>
          . <span className="text-destructive">*</span>
        </span>
      </label>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "Sending…" : "Submit expression of interest"}
      </Button>
      <p className="text-xs text-muted-foreground">
        Submitting this form expresses interest only. It does not confirm membership in a ministry.
      </p>
    </form>
  );
};

export default MinistryEnquiryForm;
