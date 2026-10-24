import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import MassBookingWizard from "@/components/mass-booking/MassBookingWizard";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrderByToken, type BookingOrder } from "@/services/massBookingOrder.service";
import { formatMoney } from "@/services/payment.service";

const MassBookingPage = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [order, setOrder] = useState<BookingOrder | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    getOrderByToken(token).then(setOrder).catch(() => setError("That booking link is not valid."));
  }, [token]);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Book a Mass"
        description="Request one or more Mass intentions. Guests and parishioners can book the same Mass."
        tone="light"
      />
      <section className="container mx-auto max-w-2xl px-4 py-10">
        {token ? (
          <Card>
            <CardHeader>
              <CardTitle>{error ? "Booking unavailable" : order ? `Booking ${order.reference}` : "Loading booking"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {error && <p role="alert">{error}</p>}
              {order && (
                <>
                  <p>Status: {order.status.replaceAll("_", " ")}. Payment: {order.payment_status.replaceAll("_", " ")}.</p>
                  <p>Offering: {formatMoney(order.amount, order.currency)}. This {order.status === "approved" ? "booking is confirmed." : "request is not confirmed until the parish office accepts it."}</p>
                  <ul className="space-y-2">
                    {order.intentions?.map((item) => (
                      <li key={item.id} className="rounded-md border p-3">
                        {item.mass_schedule?.title} · {item.booking_date} · {item.offered_by}
                        {item.intention_labels?.length ? ` · ${item.intention_labels.join(", ")}` : ""}
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <Link className="text-primary underline" to="/book-mass">Book another Mass</Link>
            </CardContent>
          </Card>
        ) : (
          <MassBookingWizard />
        )}
      </section>
    </div>
  );
};

export default MassBookingPage;
