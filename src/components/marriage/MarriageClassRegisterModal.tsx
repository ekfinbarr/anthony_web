import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, MapPin, User, Users, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MarriageClass {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  time: string;
  days: string[];
  facilitator: string;
  venue: string;
  seatsAvailable: number;
  totalSeats: number;
  description: string;
}

interface MarriageClassRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: MarriageClass;
  onRegistrationComplete: () => void;
}

const MarriageClassRegisterModal: React.FC<MarriageClassRegisterModalProps> = ({
  isOpen,
  onClose,
  classData,
  onRegistrationComplete,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    partnerName: '',
    partnerEmail: '',
    partnerPhone: '',
    address: '',
    weddingDate: '',
    specialRequests: '',
    agreeToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Details, 2: Partner Info, 3: Confirmation
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep1 = () => {
    return formData.fullName && formData.email && formData.phone && formData.address;
  };

  const validateStep2 = () => {
    return formData.partnerName && formData.partnerEmail && formData.partnerPhone && formData.weddingDate;
  };

  const validateStep3 = () => {
    return formData.agreeToTerms;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep3()) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, this would send data to the backend
      console.log('Registration data:', {
        classId: classData.id,
        ...formData,
        registrationDate: new Date().toISOString(),
      });

      toast({
        title: "Registration Successful!",
        description: "You have been registered for the marriage preparation class. Check your email for confirmation.",
      });

      onRegistrationComplete();
      setStep(1);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        partnerName: '',
        partnerEmail: '',
        partnerPhone: '',
        address: '',
        weddingDate: '',
        specialRequests: '',
        agreeToTerms: false,
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "There was an error processing your registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-heading text-church-charcoal">
            Register for {classData.title}
          </DialogTitle>
          <DialogDescription>
            Complete your registration for marriage preparation classes
          </DialogDescription>
        </DialogHeader>

        {/* Class Summary */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Class Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-2 text-primary" />
              <span>{formatDate(classData.startDate)} - {formatDate(classData.endDate)}</span>
            </div>
            <div className="flex items-center text-sm">
              <Clock className="h-4 w-4 mr-2 text-primary" />
              <span>{classData.time}</span>
            </div>
            <div className="flex items-center text-sm">
              <MapPin className="h-4 w-4 mr-2 text-primary" />
              <span>{classData.venue}</span>
            </div>
            <div className="flex items-center text-sm">
              <User className="h-4 w-4 mr-2 text-primary" />
              <span>Facilitator: {classData.facilitator}</span>
            </div>
          </CardContent>
        </Card>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= stepNumber
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step > stepNumber ? <CheckCircle className="h-4 w-4" /> : stepNumber}
              </div>
              {stepNumber < 3 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  step > stepNumber ? 'bg-primary' : 'bg-muted'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Your Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="weddingDate">Wedding Date</Label>
                <Input
                  id="weddingDate"
                  type="date"
                  value={formData.weddingDate}
                  onChange={(e) => handleInputChange('weddingDate', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Your complete address"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 2: Partner Information */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Partner Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partnerName">Partner's Full Name *</Label>
                <Input
                  id="partnerName"
                  value={formData.partnerName}
                  onChange={(e) => handleInputChange('partnerName', e.target.value)}
                  placeholder="Enter partner's full name"
                />
              </div>
              <div>
                <Label htmlFor="partnerEmail">Partner's Email *</Label>
                <Input
                  id="partnerEmail"
                  type="email"
                  value={formData.partnerEmail}
                  onChange={(e) => handleInputChange('partnerEmail', e.target.value)}
                  placeholder="partner.email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="partnerPhone">Partner's Phone *</Label>
                <Input
                  id="partnerPhone"
                  value={formData.partnerPhone}
                  onChange={(e) => handleInputChange('partnerPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="specialRequests">Special Requests or Notes</Label>
              <Textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                placeholder="Any special accommodations or additional information"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Review & Confirm</h3>

            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Your Information</h4>
                <p className="text-sm text-muted-foreground">{formData.fullName}</p>
                <p className="text-sm text-muted-foreground">{formData.email} • {formData.phone}</p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Partner Information</h4>
                <p className="text-sm text-muted-foreground">{formData.partnerName}</p>
                <p className="text-sm text-muted-foreground">{formData.partnerEmail} • {formData.partnerPhone}</p>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Class Details</h4>
                <p className="text-sm text-muted-foreground">{classData.title}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(classData.startDate)} - {formatDate(classData.endDate)}
                </p>
                <p className="text-sm text-muted-foreground">{classData.time} • {classData.venue}</p>
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="agreeToTerms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  I agree to the terms and conditions *
                </Label>
                <p className="text-xs text-muted-foreground">
                  By registering, I agree to participate fully in the marriage preparation program and understand the commitment required.
                </p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}

          {step < 3 ? (
            <Button
              onClick={handleNext}
              disabled={
                (step === 1 && !validateStep1()) ||
                (step === 2 && !validateStep2())
              }
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !validateStep3()}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? 'Registering...' : 'Complete Registration'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MarriageClassRegisterModal;