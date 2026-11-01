import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import useFeatures from "@/hooks/useFeatures";
import { getMyOrders, type BookingOrder } from "@/services/massBookingOrder.service";
import { formatMoney } from "@/services/payment.service";

const MassBookingHistory = () => {
  const { user, isLoading } = useAuth();
  const { isOn } = useFeatures();
  const [orders, setOrders] = useState<BookingOrder[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    getMyOrders().then(setOrders).catch((caught: unknown) => {
      setError(caught instanceof Error ? caught.message : "Your bookings could not be loaded.");
    });
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="My Mass bookings" description="Requests you have made while signed in." tone="light" />
      <section className="container mx-auto max-w-3xl px-4 py-10 space-y-4">
        {!isLoading && !user && (
          <Card>
            <CardContent className="space-y-3 pt-6">
              <p>Sign in to see bookings linked to your account. Guest bookings stay on the private link shown after you submit.</p>
              {isOn("login") && <Link className="text-primary underline" to="/auth/login?redirect=/my-mass-bookings">Sign in</Link>}
            </CardContent>
          </Card>
        )}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        {user && orders.length === 0 && !error && <p>You have no Mass bookings yet. <Link className="text-primary underline" to="/book-mass">Book a Mass</Link></p>}
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <CardTitle className="text-xl">{order.reference}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Booking: {order.status.replaceAll("_", " ")}. Payment: {order.payment_status.replaceAll("_", " ")}.</p>
              <p>Offering: {formatMoney(order.amount, order.currency)}</p>
              <ul className="space-y-2">
                {order.intentions?.map((item) => (
                  <li key={item.id} className="rounded-md border p-3">
                    <p className="font-medium">{item.mass_schedule?.title}</p>
                    <p>{item.booking_date} · {item.offered_by}</p>
                    {item.intention_labels?.length ? <p>{item.intention_labels.join(", ")}</p> : null}
                    {item.intention && item.intention !== item.intention_labels?.join(", ") && <p className="text-muted-foreground">{item.intention}</p>}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
};

export default MassBookingHistory;
