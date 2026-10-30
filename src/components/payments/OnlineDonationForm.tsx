import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import AmountInput from "@/components/forms/AmountInput";
import { getApiErrorMessage } from "@/lib/api-error";
import { notify } from "@/lib/notify";
import paymentService, { DonationType, formatMoney } from "@/services/payment.service";
import { cn } from "@/lib/utils";
import { PRESET_AMOUNTS } from "@/components/donations/givingCategories";


interface OnlineDonationFormProps {
  donationType: DonationType;
  purposeLabel: string;
}

/**
 * Card / bank / USSD giving through Flutterwave. Guests give their name and
 * email for the receipt; signed-in parishioners skip those fields.
 */
const OnlineDonationForm = ({ donationType, purposeLabel }: OnlineDonationFormProps) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState<string>("5000");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dedication, setDedication] = useState("");
  const [notes, setNotes] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const configQuery = useQuery({ queryKey: ["payment-config"], queryFn: paymentService.getConfig, staleTime: 5 * 60_000 });
  const config = configQuery.data;
  const currency = config?.currency ?? "NGN";
  const minAmount = config?.donation_min_amount ?? 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);

    if (!Number.isFinite(value) || value < minAmount) {
      notify.error("Check the amount", `The minimum donation is ${formatMoney(minAmount, currency)}.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await notify.promise(
        paymentService
          .checkoutDonation({
            amount: value,
            type: donationType,
            name: user ? undefined : name.trim(),
            email: user ? undefined : email.trim(),
            phone: phone.trim() || undefined,
            is_anonymous: isAnonymous,
            dedication: dedication.trim() || undefined,
            notes: notes.trim() || undefined,
          })
          .then((res) => res.data),
        {
          loading: "Preparing secure checkout…",
          success: "Redirecting to payment…",
          error: (error) => getApiErrorMessage(error, "Payment could not start. Please try again."),
        }
      );
      paymentService.redirectToCheckout(data.checkout_url);
    } catch {
      setIsSubmitting(false);
    }
  };

  if (config && !config.enabled) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Online giving is not available right now. Please use bank transfer or contact the parish office.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label>Amount ({currency}) *</Label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {PRESET_AMOUNTS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setAmount(String(preset))}
              className={cn(
                "rounded-md border px-2 py-2 text-sm font-semibold transition-colors",
                Number(amount) === preset ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary"
              )}
            >
              {formatMoney(preset, currency).replace(/\.00$/, "")}
            </button>
          ))}
        </div>
        <AmountInput
          id="online-amount"
          currency={currency}
          value={amount === "" ? null : Number(amount)}
          onValueChange={(next) => setAmount(next === null ? "" : String(next))}
          placeholder="Or enter another amount"
        />
      </div>

      {user ? (
        <p className="text-sm text-muted-foreground">
          Giving as <span className="font-medium text-foreground">{user.name}</span> ({user.email}). Your receipt will be emailed to you.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="online-name">Full name *</Label>
            <Input id="online-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="online-email">Email (for your receipt) *</Label>
            <Input id="online-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="online-phone">Phone (optional)</Label>
          <Input id="online-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" placeholder="+234..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="online-dedication">In honour of (optional)</Label>
          <Input id="online-dedication" value={dedication} onChange={(e) => setDedication(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="online-notes">Message (optional)</Label>
        <Textarea id="online-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>

      <label className="flex items-center gap-3 text-sm">
        <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
        Give anonymously (your name won't appear in parish records)
      </label>

      {/* Long fund names wrap onto a second line on phones instead of spilling out. */}
      <Button
        type="submit"
        variant="church"
        size="lg"
        className="h-auto min-h-11 w-full gap-2 whitespace-normal py-3 text-center leading-snug"
        disabled={isSubmitting || configQuery.isLoading}
      >
        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
        {isSubmitting ? (
          "Opening secure checkout…"
        ) : (
          <span>
            Give{" "}
            {Number(amount) > 0 ? <span className="whitespace-nowrap">{formatMoney(Number(amount), currency)}</span> : null}{" "}
            to {purposeLabel}
          </span>
        )}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" /> Secure payment by Flutterwave · Card, bank transfer and USSD
      </p>
    </form>
  );
};

export default OnlineDonationForm;
