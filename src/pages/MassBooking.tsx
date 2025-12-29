import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, User, Heart, CreditCard, Building, History, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const intentionTypes = [
  { value: "thanksgiving", label: "Thanksgiving" },
  { value: "repose", label: "Repose of Soul" },
  { value: "healing", label: "Healing" },
  { value: "special", label: "Special Intention" },
  { value: "birthday", label: "Birthday" },
  { value: "anniversary", label: "Anniversary" },
  { value: "other", label: "Other" },
];

const MassBooking = () => {
  const [bookingFor, setBookingFor] = useState("self");
  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (paymentMethod === "paystack") {
      toast({
        title: "Redirecting to Payment",
        description: "You will be redirected to Paystack for payment...",
      });
      // Here you would integrate Paystack
    }

    setIsSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-heading font-bold mb-2">Booking Submitted!</h2>
            <p className="text-muted-foreground mb-6">
              Your Mass intention has been received. You will receive a confirmation email shortly.
            </p>
            <div className="flex flex-col gap-3">
              <Button asChild>
                <Link to="/booking-history">View Booking History</Link>
              </Button>
              <Button variant="outline" onClick={() => setSubmitted(false)}>
                Book Another Mass
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[35vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-br from-secondary via-secondary/90 to-primary/20" />
        </div>
        <div className="relative z-10 text-center text-secondary-foreground">
          <Badge className="mb-4 bg-primary text-primary-foreground">Mass Intentions</Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 animate-fade-in">
            Book a <span className="text-primary">Mass</span>
          </h1>
          <p className="text-lg max-w-xl mx-auto px-4 opacity-90">
            Request a Mass to be offered for your special intentions
          </p>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-end mb-6">
              <Button variant="outline" asChild>
                <Link to="/booking-history" className="gap-2">
                  <History className="h-4 w-4" />
                  View Booking History
                </Link>
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Mass Intention Booking Form
                </CardTitle>
                <CardDescription>
                  Fill out the form below to book a Mass intention. All fields marked * are required.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Booking For */}
                  <div className="space-y-3">
                    <Label>Who is this booking for? *</Label>
                    <RadioGroup value={bookingFor} onValueChange={setBookingFor} className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="self" id="self" />
                        <Label htmlFor="self" className="font-normal cursor-pointer">Myself</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="another" id="another" />
                        <Label htmlFor="another" className="font-normal cursor-pointer">Someone else</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Intention Type */}
                  <div className="space-y-2">
                    <Label htmlFor="intention-type">Intention Type *</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select intention type" />
                      </SelectTrigger>
                      <SelectContent>
                        {intentionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Intention Details */}
                  <div className="space-y-2">
                    <Label htmlFor="intention">Intention Details *</Label>
                    <Textarea
                      id="intention"
                      placeholder="Please describe your intention (e.g., For the repose of the soul of John Doe)"
                      className="min-h-[100px]"
                      required
                    />
                  </div>

                  {/* Preferred Date */}
                  <div className="space-y-2">
                    <Label htmlFor="date">Preferred Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Subject to availability. You will be contacted if the date is unavailable.
                    </p>
                  </div>

                  {/* Personal Information */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      {bookingFor === "self" ? "Your Information" : "Requester Information"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input id="name" placeholder="John Doe" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input id="phone" type="tel" placeholder="+234..." required />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" type="email" placeholder="john@example.com" required />
                      </div>
                    </div>
                  </div>

                  {/* Beneficiary Information (if booking for another) */}
                  {bookingFor === "another" && (
                    <div className="border-t pt-6">
                      <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Heart className="h-4 w-4 text-primary" />
                        Beneficiary Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="beneficiary-name">Beneficiary Name *</Label>
                          <Input id="beneficiary-name" placeholder="Name of the person" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="relationship">Relationship</Label>
                          <Input id="relationship" placeholder="e.g., Father, Friend" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional information..."
                    />
                  </div>

                  {/* Payment Method */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-primary" />
                      Payment Method
                    </h3>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted transition-colors">
                        <RadioGroupItem value="paystack" id="paystack" />
                        <Label htmlFor="paystack" className="flex-1 cursor-pointer">
                          <span className="font-medium">Pay Online with Paystack</span>
                          <span className="block text-sm text-muted-foreground">
                            Cards, Bank Transfer, USSD
                          </span>
                        </Label>
                        <Badge>Recommended</Badge>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted transition-colors">
                        <RadioGroupItem value="office" id="office" />
                        <Label htmlFor="office" className="flex-1 cursor-pointer">
                          <span className="font-medium flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Pay at Parish Office
                          </span>
                          <span className="block text-sm text-muted-foreground">
                            Visit the office during working hours
                          </span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start space-x-2">
                    <Checkbox id="terms" required />
                    <Label htmlFor="terms" className="text-sm font-normal leading-relaxed cursor-pointer">
                      I confirm that the information provided is accurate and I agree to the parish's 
                      Mass intention guidelines.
                    </Label>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    variant="church"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : paymentMethod === "paystack" ? "Proceed to Payment" : "Submit Booking"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-6 bg-muted">
              <CardContent className="pt-6">
                <h4 className="font-semibold mb-2">Mass Stipend Information</h4>
                <p className="text-sm text-muted-foreground">
                  The suggested stipend for a Mass intention is ₦2,000. This offering goes towards 
                  the support of the priest and the parish. If you are unable to make this offering, 
                  please contact the parish office.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MassBooking;