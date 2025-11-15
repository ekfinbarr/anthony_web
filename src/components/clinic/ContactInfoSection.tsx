import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import clinicData from '@/data/clinic.json';

export default function ContactInfoSection() {
  const contact = clinicData.contact;

  const handleCall = () => {
    window.location.href = `tel:${contact.phone}`;
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent("Hello, I'd like to inquire about clinic services.");
    window.open(`https://wa.me/${contact.whatsapp.replace(/\s+/g, '')}?text=${message}`, '_blank');
  };

  const handleEmail = () => {
    window.location.href = `mailto:${contact.email}?subject=Clinic Inquiry`;
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary mb-4">Contact & Information</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get in touch with our clinic for appointments, inquiries, or emergency assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Phone className="h-5 w-5 mr-2 text-blue-600" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">{contact.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MessageCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-medium">WhatsApp</p>
                  <p className="text-muted-foreground">{contact.whatsapp}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">{contact.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-muted-foreground">{contact.address}</p>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button onClick={handleCall} className="flex-1">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
                <Button onClick={handleWhatsApp} variant="outline" className="flex-1">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
              </div>
              <Button onClick={handleEmail} variant="outline" className="w-full">
                <Mail className="h-4 w-4 mr-2" />
                Send Email
              </Button>
            </CardContent>
          </Card>

          {/* Opening Hours */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                Opening Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium">Monday</span>
                  <span className="text-muted-foreground">{contact.hours.monday}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium">Tuesday</span>
                  <span className="text-muted-foreground">{contact.hours.tuesday}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium">Wednesday</span>
                  <span className="text-muted-foreground">{contact.hours.wednesday}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium">Thursday</span>
                  <span className="text-muted-foreground">{contact.hours.thursday}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium">Friday</span>
                  <span className="text-muted-foreground">{contact.hours.friday}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium">Saturday</span>
                  <span className="text-muted-foreground">{contact.hours.saturday}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium text-red-600">Sunday</span>
                  <span className="text-red-600 font-medium">{contact.hours.sunday}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Emergency services are available 24/7 through the parish office.
                  For medical emergencies, please contact the nearest hospital immediately.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}