import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Eye, Plus, Search, CheckCircle, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock booking data
const mockBookings = [
  {
    id: "MB001",
    date: "2024-01-15",
    intentionType: "Thanksgiving",
    intention: "For successful completion of my son's education",
    beneficiary: "Self",
    status: "completed",
    amount: 2000,
    paymentMethod: "Paystack",
    createdAt: "2024-01-10",
  },
  {
    id: "MB002",
    date: "2024-01-22",
    intentionType: "Repose of Soul",
    intention: "For the repose of the soul of Mrs. Mary Adebayo",
    beneficiary: "Mrs. Mary Adebayo",
    status: "pending",
    amount: 2000,
    paymentMethod: "Parish Office",
    createdAt: "2024-01-18",
  },
  {
    id: "MB003",
    date: "2024-02-01",
    intentionType: "Healing",
    intention: "For the healing of my mother from illness",
    beneficiary: "Mrs. Janet Okafor",
    status: "scheduled",
    amount: 2000,
    paymentMethod: "Paystack",
    createdAt: "2024-01-25",
  },
  {
    id: "MB004",
    date: "2024-02-14",
    intentionType: "Special Intention",
    intention: "For a successful job interview",
    beneficiary: "Self",
    status: "scheduled",
    amount: 2000,
    paymentMethod: "Paystack",
    createdAt: "2024-02-01",
  },
  {
    id: "MB005",
    date: "2023-12-25",
    intentionType: "Thanksgiving",
    intention: "Christmas thanksgiving for the family",
    beneficiary: "The Adeyemi Family",
    status: "completed",
    amount: 5000,
    paymentMethod: "Paystack",
    createdAt: "2023-12-20",
  },
];

const statusConfig = {
  completed: { label: "Completed", icon: CheckCircle, color: "bg-green-100 text-green-800" },
  pending: { label: "Pending Payment", icon: Clock, color: "bg-yellow-100 text-yellow-800" },
  scheduled: { label: "Scheduled", icon: Calendar, color: "bg-blue-100 text-blue-800" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "bg-red-100 text-red-800" },
};

const BookingHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<typeof mockBookings[0] | null>(null);

  const filteredBookings = mockBookings.filter(
    (booking) =>
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.intention.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.intentionType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[30vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-br from-secondary via-secondary/90 to-primary/20" />
        </div>
        <div className="relative z-10 text-center text-secondary-foreground">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 animate-fade-in">
            Booking <span className="text-primary">History</span>
          </h1>
          <p className="text-lg max-w-xl mx-auto px-4 opacity-90">
            View and manage your Mass intention bookings
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search bookings..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button asChild variant="church">
                <Link to="/mass-booking" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Book New Mass
                </Link>
              </Button>
            </div>

            {/* Desktop Table View */}
            <Card className="hidden md:block">
              <CardHeader>
                <CardTitle>Your Mass Bookings</CardTitle>
                <CardDescription>
                  {filteredBookings.length} booking(s) found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => {
                      const status = statusConfig[booking.status as keyof typeof statusConfig];
                      const StatusIcon = status.icon;
                      return (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.id}</TableCell>
                          <TableCell>{formatDate(booking.date)}</TableCell>
                          <TableCell>{booking.intentionType}</TableCell>
                          <TableCell>
                            <Badge className={status.color}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{formatCurrency(booking.amount)}</TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedBooking(booking)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Booking Details - {booking.id}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Mass Date</p>
                                      <p className="font-medium">{formatDate(booking.date)}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Status</p>
                                      <Badge className={status.color}>{status.label}</Badge>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Intention Type</p>
                                      <p className="font-medium">{booking.intentionType}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Amount</p>
                                      <p className="font-medium">{formatCurrency(booking.amount)}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Beneficiary</p>
                                    <p className="font-medium">{booking.beneficiary}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Intention</p>
                                    <p className="font-medium">{booking.intention}</p>
                                  </div>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-sm text-muted-foreground">Payment Method</p>
                                      <p className="font-medium">{booking.paymentMethod}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm text-muted-foreground">Booked On</p>
                                      <p className="font-medium">{formatDate(booking.createdAt)}</p>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredBookings.map((booking) => {
                const status = statusConfig[booking.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;
                return (
                  <Card key={booking.id} className="animate-fade-in">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-semibold">{booking.id}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(booking.date)}</p>
                        </div>
                        <Badge className={status.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2">
                        <span className="text-muted-foreground">Type:</span> {booking.intentionType}
                      </p>
                      <p className="text-sm mb-4 line-clamp-2">
                        <span className="text-muted-foreground">Intention:</span> {booking.intention}
                      </p>
                      <div className="flex justify-between items-center">
                        <p className="font-semibold text-primary">{formatCurrency(booking.amount)}</p>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Booking Details - {booking.id}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Mass Date</p>
                                <p className="font-medium">{formatDate(booking.date)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Intention Type</p>
                                <p className="font-medium">{booking.intentionType}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Intention</p>
                                <p className="font-medium">{booking.intention}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Beneficiary</p>
                                <p className="font-medium">{booking.beneficiary}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Payment Method</p>
                                <p className="font-medium">{booking.paymentMethod}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredBookings.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No bookings found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? "Try a different search term" : "You haven't made any Mass bookings yet"}
                  </p>
                  <Button asChild variant="church">
                    <Link to="/mass-booking">Book Your First Mass</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default BookingHistory;