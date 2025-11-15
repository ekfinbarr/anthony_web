import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User, FileText, Search, Filter, Eye, CheckCircle, Clock as ClockIcon, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

/**
 * MassBookingHistory Component
 *
 * Displays a comprehensive history of Mass intention bookings for registered users.
 * Features search, filtering, responsive card/table layout, and status tracking.
 * Includes empty state for new users and detailed booking information.
 */
const MassBookingHistory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [intentionFilter, setIntentionFilter] = useState("all");

  // Sample booking data - in real app, this would come from API
  const bookings = [
    {
      id: 1,
      date: new Date("2024-12-25"),
      time: "morning",
      intentionType: "thanksgiving",
      persons: "John and Mary Smith",
      status: "completed",
      additionalNotes: "Thanksgiving for successful surgery",
      bookedOn: new Date("2024-12-15"),
    },
    {
      id: 2,
      date: new Date("2024-12-28"),
      time: "evening",
      intentionType: "sick",
      persons: "Grandmother Elizabeth",
      status: "accepted",
      additionalNotes: "Prayers for recovery from illness",
      bookedOn: new Date("2024-12-18"),
    },
    {
      id: 3,
      date: new Date("2025-01-05"),
      time: "morning",
      intentionType: "anniversary",
      persons: "Parents - 25th Wedding Anniversary",
      status: "pending",
      additionalNotes: "Special prayers for continued love and happiness",
      bookedOn: new Date("2024-12-20"),
    },
    {
      id: 4,
      date: new Date("2024-12-22"),
      time: "evening",
      intentionType: "dead",
      persons: "Uncle Michael (RIP)",
      status: "completed",
      additionalNotes: "Monthly remembrance Mass",
      bookedOn: new Date("2024-12-10"),
    },
    {
      id: 5,
      date: new Date("2025-01-15"),
      time: "morning",
      intentionType: "birthday",
      persons: "Daughter Sarah - 16th Birthday",
      status: "accepted",
      additionalNotes: "Prayers for guidance and protection",
      bookedOn: new Date("2024-12-22"),
    },
  ];

  const intentionOptions = [
    { value: "thanksgiving", label: "Thanksgiving" },
    { value: "sick", label: "For the Sick" },
    { value: "dead", label: "For the Dead" },
    { value: "birthday", label: "Birthday" },
    { value: "anniversary", label: "Wedding Anniversary" },
    { value: "vocations", label: "Vocations" },
    { value: "special", label: "Special Intentions" },
  ];

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "accepted", label: "Accepted" },
    { value: "completed", label: "Completed" },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: ClockIcon, label: "Pending" },
      accepted: { variant: "default" as const, icon: CheckCircle, label: "Accepted" },
      completed: { variant: "default" as const, icon: CheckCircle, label: "Completed" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getIntentionLabel = (type: string) => {
    return intentionOptions.find(option => option.value === type)?.label || type;
  };

  const getTimeLabel = (time: string) => {
    return time === "morning" ? "Morning Mass (7:00 AM - 9:00 AM)" : "Evening Mass (6:00 PM - 7:00 PM)";
  };

  // Filter bookings based on search and filters
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.persons.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.additionalNotes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesIntention = intentionFilter === "all" || booking.intentionType === intentionFilter;

    return matchesSearch && matchesStatus && matchesIntention;
  });

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold text-church-charcoal mb-2">
            No Mass Bookings Yet
          </h1>
          <p className="text-muted-foreground mb-6">
            You haven't booked any Mass intentions yet. Start by booking your first intention.
          </p>
          <Button asChild>
            <a href="/book-mass">Book Your First Mass Intention</a>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-church-charcoal mb-4">
              My Mass Bookings
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              View and manage your Mass intention bookings and their current status.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters and Search Section */}
      <section className="py-8 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {/* Search */}
              <div className="relative flex-1 md:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Intention Filter */}
              <Select value={intentionFilter} onValueChange={setIntentionFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Intentions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Intentions</SelectItem>
                  {intentionOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button asChild>
              <a href="/book-mass">Book New Intention</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Bookings List */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="space-y-6">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-church-charcoal mb-2">No bookings found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
              </div>
            ) : (
              filteredBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-5 w-5 text-primary" />
                              <span className="font-semibold text-church-charcoal">
                                {format(booking.date, "EEEE, MMMM d, yyyy")}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-5 w-5 text-primary" />
                              <span className="text-muted-foreground">
                                {getTimeLabel(booking.time)}
                              </span>
                            </div>
                            {getStatusBadge(booking.status)}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4 text-primary" />
                                <span className="font-medium text-church-charcoal">For:</span>
                              </div>
                              <p className="text-muted-foreground ml-6">{booking.persons}</p>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="font-medium text-church-charcoal">Intention:</span>
                              </div>
                              <p className="text-muted-foreground ml-6">{getIntentionLabel(booking.intentionType)}</p>
                            </div>
                          </div>

                          {booking.additionalNotes && (
                            <div className="mt-4">
                              <p className="text-sm text-muted-foreground">
                                <strong>Notes:</strong> {booking.additionalNotes}
                              </p>
                            </div>
                          )}

                          <div className="mt-4 text-xs text-muted-foreground">
                            Booked on {format(booking.bookedOn, "MMM d, yyyy 'at' h:mm a")}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MassBookingHistory;
