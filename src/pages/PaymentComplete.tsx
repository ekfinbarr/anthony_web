import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CheckCircle2, Clock, Loader2, XCircle, Ban, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import paymentService, { Payment, formatMoney } from "@/services/payment.service";
import { rememberedBookingToken } from "@/services/massBookingOrder.service";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 10;

const isMassPayment = (payment?: Payment) =>
  payment?.payable_type === "mass_booking" || payment?.payable_type === "mass_booking_order";

const retryPath = (payment?: Payment) => (isMassPayment(payment) ? "/book-mass" : "/donations");

/**
 * Landing page after hosted checkout. The API has already verified the payment
 * with the provider before redirecting here; if it is still pending (e.g. a
 * bank transfer settling), we keep asking the API to re-verify for a short while.
 */
const PaymentComplete = () => {
  const [params] = useSearchParams();
  const reference = params.get("reference") ?? "";
  const qc = useQueryClient();
  const [polls, setPolls] = useState(0);

  const query = useQuery({
    queryKey: ["payment", reference],
    queryFn: () => paymentService.getStatus(reference),
    enabled: !!reference,
    retry: 1,
  });

  const payment = query.data;
  const isPending = payment?.status === "pending";

  useEffect(() => {
    if (!isPending || polls >= MAX_POLLS) return;

    const timer = window.setTimeout(async () => {
      try {
        qc.setQueryData(["payment", reference], await paymentService.verify(reference));
      } catch {
        // Provider unreachable; the webhook will still settle it
        qc.invalidateQueries({ queryKey: ["payment", reference] });
      }
      setPolls((n) => n + 1);
    }, POLL_INTERVAL_MS);

    return () => window.clearTimeout(timer);
  }, [isPending, polls, qc, reference]);

  if (!reference || query.isError) {
    return (
      <ResultShell icon={<XCircle className="h-16 w-16 text-destructive" />} title="We couldn't find that payment">
        <p className="text-muted-foreground">If you were charged, please contact the parish office with your bank statement and we'll sort it out.</p>
        <Actions primary={{ to: "/donations", label: "Go to giving" }} secondary={{ to: "/contact", label: "Contact us" }} />
      </ResultShell>
    );
  }

  if (query.isLoading || !payment) {
    return (
      <ResultShell icon={<Loader2 className="h-16 w-16 animate-spin text-primary" />} title="Confirming your payment…">
        <p className="text-muted-foreground">Please don't close this page.</p>
      </ResultShell>
    );
  }

  const amount = formatMoney(payment.amount_paid ?? payment.amount, payment.currency);
  const isMass = isMassPayment(payment);
  const bookingToken = rememberedBookingToken();

  if (payment.status === "successful") {
    return (
      <ResultShell icon={<CheckCircle2 className="h-16 w-16 text-green-600" />} title={isMass ? "Your Mass intention has been received" : "Thank you for your generosity!"}>
        <p className="text-muted-foreground">
          {payment.payer_first_name ? `${payment.payer_first_name}, we` : "We"} received your payment of <strong className="text-foreground">{amount}</strong>.
          {isMass ? " The parish office will confirm your intention shortly." : " May God bless you abundantly."}
        </p>
        <Summary payment={payment} />
        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" /> {isMass ? "The Mass is not confirmed until the parish office accepts it. A receipt email is sent only after the mail provider accepts it." : "A receipt email is sent when the mail provider accepts it."}
        </p>
        <Actions
          primary={{ to: bookingToken ? `/book-mass?token=${encodeURIComponent(bookingToken)}` : "/", label: bookingToken ? "View booking" : "Back to home" }}
          secondary={{ to: retryPath(payment), label: isMass ? "Book another Mass" : "Give again" }}
        />
      </ResultShell>
    );
  }

  if (isPending) {
    const stillPolling = polls < MAX_POLLS;
    return (
      <ResultShell icon={stillPolling ? <Loader2 className="h-16 w-16 animate-spin text-primary" /> : <Clock className="h-16 w-16 text-amber-500" />} title={stillPolling ? "Confirming your payment…" : "Your payment is being processed"}>
        <p className="text-muted-foreground">
          {stillPolling
            ? "This usually takes a few seconds."
            : "Some payment methods, such as bank transfers, take a little longer. We'll email you as soon as it's confirmed. There's no need to pay again."}
        </p>
        <Summary payment={payment} />
        {!stillPolling && <Actions primary={{ to: "/", label: "Back to home" }} />}
      </ResultShell>
    );
  }

  const cancelled = payment.status === "cancelled";
  return (
    <ResultShell
      icon={cancelled ? <Ban className="h-16 w-16 text-muted-foreground" /> : <XCircle className="h-16 w-16 text-destructive" />}
      title={cancelled ? "Payment cancelled" : "Payment not completed"}
    >
      <p className="text-muted-foreground">
        {cancelled ? "You left the checkout before paying." : payment.failure_reason || "Your payment didn't go through."} No money was taken.
      </p>
      <Summary payment={payment} />
      <Actions primary={{ to: retryPath(payment), label: "Try again" }} secondary={{ to: "/contact", label: "Need help?" }} />
    </ResultShell>
  );
};

const ResultShell = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <section className="min-h-[70vh] bg-muted/40 py-16 px-4 flex items-center justify-center">
    <Card className="w-full max-w-lg">
      <CardContent className="pt-10 pb-8 px-6 sm:px-10 text-center space-y-5">
        <div className="flex justify-center">{icon}</div>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold">{title}</h1>
        {children}
      </CardContent>
    </Card>
  </section>
);

const Summary = ({ payment }: { payment: Payment }) => {
  const d = payment.details ?? {};
  const rows: [string, string | null | undefined][] = [
    ["Reference", payment.reference],
    ["For", payment.description],
    ["Amount", formatMoney(payment.amount_paid ?? payment.amount, payment.currency)],
    ["Booking reference", d.booking_reference as string | undefined],
    ["Mass date", d.booking_date ? format(new Date(String(d.booking_date)), "EEEE, d MMMM yyyy") : undefined],
    ["Paid", payment.paid_at ? format(new Date(payment.paid_at), "d MMM yyyy, h:mm a") : undefined],
  ];

  return (
    <dl className="rounded-lg border bg-background text-left text-sm divide-y">
      {rows.filter(([, v]) => v).map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 px-4 py-2.5">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="font-medium text-right break-all">{value}</dd>
        </div>
      ))}
    </dl>
  );
};

const Actions = ({ primary, secondary }: { primary: { to: string; label: string }; secondary?: { to: string; label: string } }) => (
  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
    <Button asChild variant="church" className="gap-2">
      <Link to={primary.to}>{primary.label} <ArrowRight className="h-4 w-4" /></Link>
    </Button>
    {secondary && (
      <Button asChild variant="outline">
        <Link to={secondary.to}>{secondary.label}</Link>
      </Button>
    )}
  </div>
);

export default PaymentComplete;
