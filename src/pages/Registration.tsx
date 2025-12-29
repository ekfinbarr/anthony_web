import { useState } from "react";
import { User, Mail, Phone, MapPin, Users, Church, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const parishes = [
  "St. Anthony Catholic Church, Gbaja",
  "Other (Transferring)",
];

const societies = [
  { id: "cwo", name: "Catholic Women Organization (CWO)" },
  { id: "cmn", name: "Catholic Men Organization (CMO)" },
  { id: "cyon", name: "Catholic Youth Organization (CYON)" },
  { id: "legion", name: "Legion of Mary" },
  { id: "knights", name: "Knights of St. Mulumba" },
  { id: "charismatic", name: "Charismatic Renewal" },
  { id: "choir", name: "Church Choir" },
  { id: "altar", name: "Altar Servers" },
  { id: "lectors", name: "Lectors/Readers" },
  { id: "ushers", name: "Ushers/Church Wardens" },
  { id: "catechists", name: "Catechists" },
  { id: "ssvp", name: "St. Vincent de Paul Society" },
  { id: "none", name: "None (I'll decide later)" },
];

const Registration = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedSocieties, setSelectedSocieties] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSocietyToggle = (societyId: string) => {
    setSelectedSocieties((prev) =>
      prev.includes(societyId)
        ? prev.filter((id) => id !== societyId)
        : [...prev, societyId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
    toast({
      title: "Registration Successful!",
      description: "Please check your email for verification.",
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-heading font-bold mb-2">Registration Complete!</h2>
            <p className="text-muted-foreground mb-6">
              Welcome to St. Anthony Catholic Church, Gbaja. Please check your email to verify your 
              account and complete your registration.
            </p>
            <div className="space-y-3">
              <Button className="w-full" variant="church" onClick={() => window.location.href = "/"}>
                Return to Homepage
              </Button>
              <Button variant="outline" className="w-full" onClick={() => { setSubmitted(false); setStep(1); }}>
                Register Another Person
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
          <Badge className="mb-4 bg-primary text-primary-foreground">Join Our Parish</Badge>
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 animate-fade-in">
            Parish <span className="text-primary">Registration</span>
          </h1>
          <p className="text-lg max-w-xl mx-auto px-4 opacity-90">
            Become a registered member of St. Anthony Catholic Church, Gbaja
          </p>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Progress Steps */}
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-4">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                        step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s}
                    </div>
                    {s < 3 && (
                      <div className={`w-12 h-1 ${step > s ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {step === 1 && <><User className="h-5 w-5 text-primary" /> Personal Information</>}
                  {step === 2 && <><MapPin className="h-5 w-5 text-primary" /> Contact Details</>}
                  {step === 3 && <><Users className="h-5 w-5 text-primary" /> Parish Involvement</>}
                </CardTitle>
                <CardDescription>
                  {step === 1 && "Tell us about yourself"}
                  {step === 2 && "How can we reach you?"}
                  {step === 3 && "How would you like to be involved?"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit}>
                  {/* Step 1: Personal Information */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input id="firstName" placeholder="John" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input id="lastName" placeholder="Doe" required />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="middleName">Middle Name</Label>
                        <Input id="middleName" placeholder="Optional" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="dob">Date of Birth *</Label>
                          <Input id="dob" type="date" required />
                        </div>
                        <div className="space-y-2">
                          <Label>Gender *</Label>
                          <RadioGroup defaultValue="male" className="flex gap-4">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="male" id="male" />
                              <Label htmlFor="male" className="font-normal">Male</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="female" id="female" />
                              <Label htmlFor="female" className="font-normal">Female</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Marital Status *</Label>
                        <Select required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="married">Married</SelectItem>
                            <SelectItem value="widowed">Widowed</SelectItem>
                            <SelectItem value="religious">Religious</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="occupation">Occupation</Label>
                        <Input id="occupation" placeholder="Your profession" />
                      </div>
                      
                      <Button type="button" className="w-full" onClick={() => setStep(2)}>
                        Continue
                      </Button>
                    </div>
                  )}

                  {/* Step 2: Contact Details */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" type="email" placeholder="john@example.com" required />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input id="phone" type="tel" placeholder="+234..." required />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="altPhone">Alternative Phone</Label>
                        <Input id="altPhone" type="tel" placeholder="+234..." />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Home Address *</Label>
                        <Input id="address" placeholder="Your full address" required />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="lga">Local Government Area</Label>
                          <Input id="lga" placeholder="e.g., Surulere" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State *</Label>
                          <Select required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lagos">Lagos</SelectItem>
                              <SelectItem value="ogun">Ogun</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="password">Create Password *</Label>
                        <Input id="password" type="password" placeholder="Min. 8 characters" required />
                      </div>
                      
                      <div className="flex gap-3">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                          Back
                        </Button>
                        <Button type="button" className="flex-1" onClick={() => setStep(3)}>
                          Continue
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Parish Involvement */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Previous/Current Parish *</Label>
                        <Select required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select parish" />
                          </SelectTrigger>
                          <SelectContent>
                            {parishes.map((parish) => (
                              <SelectItem key={parish} value={parish.toLowerCase()}>
                                {parish}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-3">
                        <Label>Select Societies/Groups to Join</Label>
                        <p className="text-sm text-muted-foreground">
                          Choose the organizations you'd like to be part of
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                          {societies.map((society) => (
                            <div
                              key={society.id}
                              className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedSocieties.includes(society.id)
                                  ? "border-primary bg-primary/5"
                                  : "hover:bg-muted"
                              }`}
                              onClick={() => handleSocietyToggle(society.id)}
                            >
                              <Checkbox
                                checked={selectedSocieties.includes(society.id)}
                                onCheckedChange={() => handleSocietyToggle(society.id)}
                              />
                              <Label className="font-normal cursor-pointer flex-1">
                                {society.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Preferred Mass Time</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select preferred Mass" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="6am">6:00 AM (First Mass)</SelectItem>
                            <SelectItem value="8am">8:00 AM (Second Mass)</SelectItem>
                            <SelectItem value="10am">10:00 AM (Third Mass)</SelectItem>
                            <SelectItem value="varies">Varies</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex items-start space-x-2 pt-4">
                        <Checkbox id="terms" required />
                        <Label htmlFor="terms" className="text-sm font-normal leading-relaxed cursor-pointer">
                          I confirm that the information provided is accurate. I agree to receive 
                          communications from St. Anthony Catholic Church, Gbaja.
                        </Label>
                      </div>
                      
                      <div className="flex gap-3">
                        <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(2)}>
                          Back
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1"
                          variant="church"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Submitting..." : "Complete Registration"}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="mt-6 bg-muted">
              <CardContent className="pt-6 flex gap-4">
                <Church className="h-8 w-8 text-primary flex-shrink-0" />
                <div>
                  <h4 className="font-semibold mb-1">Why Register?</h4>
                  <p className="text-sm text-muted-foreground">
                    Registration helps us serve you better, keeps you informed about parish activities, 
                    and enables you to participate fully in the life of the Church.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Registration;