import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import facilityBookingService, { FacilityBooking } from "@/services/facilityBooking.service";
import { paymentReturnUrl } from "@/services/payment.service";

import { IsoDatePicker } from "@/components/ui/date-picker";
function money(amount: string | number | null | undefined, currency = "NGN") {
  return `${currency === "NGN" ? "₦" : currency + " "}${Number(amount ?? 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
  })}`;
}

export default function RentalStatus() {
  const { token = "" } = useParams();
  const { toast } = useToast();
  const [booking, setBooking] = useState<FacilityBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [transferRef, setTransferRef] = useState("");
  const [transferDate, setTransferDate] = useState("");
  const [evidence, setEvidence] = useState<File | null>(null);

  const reload = async () => {
    const data = await facilityBookingService.getByToken(token);
    setBooking(data);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await facilityBookingService.getByToken(token);
        if (!cancelled) setBooking(data);
      } catch {
        if (!cancelled) {
          toast({ title: "Request not found", description: "Check your private status link.", variant: "destructive" });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, toast]);

  const payOnline = async (full = false) => {
    setPaying(true);
    try {
      const res = await facilityBookingService.checkout(token, {
        purpose: booking?.next_payable_purpose,
        full,
        return_url: paymentReturnUrl(),
      });
      if (res.data.checkout_url) {
        window.location.href = res.data.checkout_url;
        return;
      }
      toast({ title: "Checkout unavailable", variant: "destructive" });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Payment could not be started.";
      toast({ title: "Payment not available", description: message, variant: "destructive" });
    } finally {
      setPaying(false);
    }
  };

  const submitTransfer = async () => {
    if (!transferRef.trim()) {
      toast({ title: "Transfer reference required", variant: "destructive" });
      return;
    }
    setPaying(true);
    try {
      const fd = new FormData();
      fd.append("transfer_reference", transferRef);
      if (transferDate) fd.append("transfer_date", transferDate);
      if (booking?.next_payable_purpose) fd.append("purpose", booking.next_payable_purpose);
      if (evidence) fd.append("evidence", evidence);
      await facilityBookingService.submitTransfer(token, fd);
      toast({
        title: "Transfer submitted",
        description: "Awaiting parish office verification. This is not yet marked as paid.",
      });
      await reload();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Could not submit transfer.";
      toast({ title: "Submission failed", description: message, variant: "destructive" });
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="container max-w-lg py-16 text-center space-y-4">
        <h1 className="font-heading text-2xl">Request not found</h1>
        <Button asChild>
          <Link to="/rentals">Back to Hall & Rentals</Link>
        </Button>
      </div>
    );
  }

  const methods = booking.enabled_payment_methods ?? [];

  return (
    <>
      <PageHeader
        title="Venue request status"
        description={booking.public_status || booking.status}
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Hall & Rentals", path: "/rentals" },
          { name: booking.reference, path: `/rentals/status/${token}` },
        ]}
      />
      <div className="container max-w-2xl py-8 space-y-6">
        <div className="rounded-lg border p-5 space-y-2 text-sm">
          <p><strong>Reference:</strong> {booking.reference}</p>
          <p><strong>Status:</strong> {booking.public_status}</p>
          <p><strong>Venue:</strong> {booking.facility?.name}</p>
          <p>
            <strong>Date & time:</strong> {booking.booking_date} · {booking.start_time} – {booking.end_time}
          </p>
          <p><strong>Event:</strong> {booking.event_title || booking.purpose}</p>
          <p><strong>Total fee:</strong> {money(booking.total_amount, booking.currency)}</p>
          <p><strong>Deposit:</strong> {money(booking.deposit_amount)} (paid {money(booking.deposit_paid)})</p>
          <p><strong>Balance:</strong> {money(booking.balance_amount)} (paid {money(booking.balance_paid)})</p>
          {booking.deposit_due_at && (
            <p><strong>Deposit deadline:</strong> {new Date(booking.deposit_due_at).toLocaleString()}</p>
          )}
          {booking.needs_info_message && (
            <p className="text-amber-800 bg-amber-50 p-3 rounded">{booking.needs_info_message}</p>
          )}
          {booking.admin_suggested_alternative && (
            <p className="bg-muted p-3 rounded"><strong>Suggested alternative:</strong> {booking.admin_suggested_alternative}</p>
          )}
          {booking.rejected_reason && <p className="text-destructive">Reason: {booking.rejected_reason}</p>}
          {booking.cancelled_reason && <p>Reason: {booking.cancelled_reason}</p>}
          {booking.receipt_number && <p><strong>Receipt:</strong> {booking.receipt_number}</p>}
        </div>

        {booking.can_pay && (
          <div className="rounded-lg border p-5 space-y-4">
            <h2 className="font-heading text-xl">Payment due</h2>
            <p className="text-sm text-muted-foreground">
              Amount due now ({booking.next_payable_purpose}): {money(booking.next_payable_amount)}
            </p>

            {methods.includes("flutterwave") && (
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => payOnline(false)} disabled={paying}>
                  {paying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Pay {booking.next_payable_purpose} online
                </Button>
              </div>
            )}

            {methods.includes("bank_transfer") && booking.bank_details && (
              <div className="space-y-3 border-t pt-4">
                <h3 className="font-medium">Bank transfer</h3>
                <ul className="text-sm space-y-1">
                  {Object.entries(booking.bank_details).map(([k, v]) => (
                    <li key={k}>
                      <strong className="capitalize">{k.replace(/_/g, " ")}:</strong> {v}
                    </li>
                  ))}
                </ul>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="tr">Transfer reference</Label>
                    <Input id="tr" value={transferRef} onChange={(e) => setTransferRef(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="td">Transfer date</Label>
                    <IsoDatePicker id="td" value={transferDate} onChange={setTransferDate} max={new Date().toISOString().slice(0, 10)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="ev">Payment evidence (optional)</Label>
                  <Input
                    id="ev"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setEvidence(e.target.files?.[0] ?? null)}
                  />
                </div>
                <Button type="button" variant="secondary" onClick={submitTransfer} disabled={paying}>
                  Submit transfer for verification
                </Button>
                <p className="text-xs text-muted-foreground">
                  Submitted transfers remain unverified until the parish office confirms receipt.
                </p>
              </div>
            )}

            {methods.includes("cash") && (
              <p className="text-sm text-muted-foreground">
                Cash payments can be made at the parish office. Staff will record and verify the payment — you cannot mark cash as paid yourself.
              </p>
            )}
          </div>
        )}

        <Button asChild variant="outline">
          <Link to="/rentals">Back to Hall & Rentals</Link>
        </Button>
      </div>
    </>
  );
}
