import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { CalendarIcon, Clock, Heart, User, FileText, Send, CheckCircle, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { apiClient } from "@/lib/apiClient";
import massBookingService from "@/services/massBooking.service";

/**
 * GuestMassBookingPage Component
 *
 * Allows visitors and non-registered users to book Mass intentions.
 * Includes additional contact fields and a banner encouraging registration.
 * Features the same comprehensive form as registered users with validation.
 */
const GuestMassBookingPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  type MassSchedule = { id: string; day_of_week: string; title?: string; start_time?: string };
  const [schedules, setSchedules] = useState<MassSchedule[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  type GuestMassBookingForm = {
    massScheduleId: string;
    intentionType: string;
    persons: string;
    additionalNotes: string;
    fullName: string;
    email: string;
    phone: string;
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<GuestMassBookingForm>({
    defaultValues: {
      massScheduleId: "",
      intentionType: "",
      persons: "",
      additionalNotes: "",
      fullName: "",
      email: "",
      phone: "",
    },
  });

  const intentionType = watch("intentionType");
  const massScheduleId = watch("massScheduleId");

  useEffect(() => {
    const loadSchedules = async () => {
      try {
        const response = await apiClient.get<{ data: MassSchedule[] }>("mass-schedules");
        const items = response.data?.data || [];
        setSchedules(items);
      } catch {
        setSchedules([]);
      }
    };
    loadSchedules();
  }, []);

  const filteredSchedules = useMemo(() => {
    if (!selectedDate || schedules.length === 0) return schedules;
    const day = format(selectedDate, "EEEE").toLowerCase();
    return schedules.filter((s) => String(s.day_of_week).toLowerCase() === day);
  }, [selectedDate, schedules]);

  const intentionOptions = [
    { value: "thanksgiving", label: "Thanksgiving", icon: Heart },
    { value: "sick", label: "For the Sick", icon: User },
    { value: "dead", label: "For the Dead", icon: Heart },
    { value: "birthday", label: "Birthday", icon: Heart },
    { value: "anniversary", label: "Wedding Anniversary", icon: Heart },
    { value: "vocations", label: "Vocations", icon: Heart },
    { value: "special", label: "Special Intentions", icon: FileText },
  ];

  const onSubmit = async (data: GuestMassBookingForm) => {
    if (!selectedDate) {
      toast({
        title: "Date Required",
        description: "Please select a preferred Mass date.",
        variant: "destructive",
      });
      return;
    }

    if (!data.massScheduleId) {
      toast({
        title: "Mass Schedule Required",
        description: "Please select a Mass schedule/time for your chosen date.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingDate = format(selectedDate, "yyyy-MM-dd");

      await massBookingService.createGuest(data.massScheduleId, {
        guest_name: data.fullName,
        guest_email: data.email,
        guest_phone: data.phone,
        booking_date: bookingDate,
        intention: `${data.intentionType}: ${data.additionalNotes || "No additional notes"}`,
        offered_by: data.persons,
        metadata: {
          intention_type: data.intentionType,
        },
      });

      setIsSubmitted(true);
      toast({
        title: "Mass Intention Submitted",
        description: "Your Mass intention request has been submitted. You will receive a confirmation shortly.",
      });

      reset();
      setSelectedDate(undefined);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to submit your Mass intention. Please try again.";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-heading font-bold text-church-charcoal mb-2">
            Mass Intention Booked
          </h1>
          <p className="text-muted-foreground mb-6">
            Your request has been submitted successfully. You will receive a confirmation email with your booking details.
          </p>
          <div className="space-y-4">
            <Button onClick={() => setIsSubmitted(false)} variant="outline">
              Book Another Intention
            </Button>
            <p className="text-sm text-muted-foreground">
              Want to track your bookings?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Register as a parishioner
              </Link>
            </p>
          </div>
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
              Book a Mass Intention
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              Request Mass intentions for thanksgiving, anniversary, healing, repose of souls, and more.
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-church-charcoal">
                <strong>Are you a registered parishioner?</strong>{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Log in
                </Link>{" "}
                to view booking history and manage your intentions.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Booking Form Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-heading text-center">
                  Guest Mass Intention Booking
                </CardTitle>
                <p className="text-sm text-muted-foreground text-center">
                  This option is for visitors or non-registered parishioners who wish to book a Mass intention.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Contact Information */}
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold text-church-charcoal">Contact Information</h3>

                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        Full Name
                      </Label>
                      <Input
                        id="fullName"
                        placeholder="Enter your full name"
                        {...register("fullName", { required: "Full name is required" })}
                      />
                      {errors.fullName && (
                        <p className="text-sm text-destructive">{errors.fullName.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-primary" />
                        Email Address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^\S+@\S+$/i,
                            message: "Please enter a valid email address",
                          },
                        })}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" />
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+234 xxx xxx xxxx"
                        {...register("phone", { required: "Phone number is required" })}
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Intention Type */}
                  <div className="space-y-2">
                    <Label htmlFor="intentionType" className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary" />
                      Type of Intention
                    </Label>
                    <Select onValueChange={(value) => setValue("intentionType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select intention type" />
                      </SelectTrigger>
                      <SelectContent>
                        {intentionOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <option.icon className="h-4 w-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.intentionType && (
                      <p className="text-sm text-destructive">{errors.intentionType.message}</p>
                    )}
                  </div>

                  {/* Person(s) */}
                  <div className="space-y-2">
                    <Label htmlFor="persons" className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      Person(s) the Mass is for
                    </Label>
                    <Input
                      id="persons"
                      placeholder="e.g., John Doe, Family Members"
                      {...register("persons", { required: "Please specify who the Mass is for" })}
                    />
                    {errors.persons && (
                      <p className="text-sm text-destructive">{errors.persons.message}</p>
                    )}
                  </div>

                  {/* Preferred Date */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      Preferred Mass Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Mass Schedule / Time */}
                  <div className="space-y-2">
                    <Label htmlFor="massScheduleId" className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Mass Schedule / Time
                    </Label>
                    <Select onValueChange={(value) => setValue("massScheduleId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a Mass schedule" />
                      </SelectTrigger>
                      <SelectContent>
                        {(filteredSchedules.length ? filteredSchedules : schedules).map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.title} — {s.day_of_week} {s.start_time} ({s.language})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {!massScheduleId && (
                      <p className="text-xs text-muted-foreground">
                        Tip: pick a date first to see schedules for that weekday.
                      </p>
                    )}
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="additionalNotes" className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Additional Notes (Optional)
                    </Label>
                    <Textarea
                      id="additionalNotes"
                      placeholder="Any special requests or additional information..."
                      {...register("additionalNotes")}
                      rows={4}
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full"
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Book Mass Intention
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default GuestMassBookingPage;
