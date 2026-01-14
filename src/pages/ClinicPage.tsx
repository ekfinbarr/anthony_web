import React, { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Phone, Mail, MapPin, Clock, AlertTriangle } from 'lucide-react';
import ClinicServiceCard from '@/components/clinic/ClinicServiceCard';
import ClinicGallery from '@/components/clinic/ClinicGallery';
import ContactInfoSection from '@/components/clinic/ContactInfoSection';
import clinicData from '@/data/clinic.json';
import clinicService from '@/services/clinic.service';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  details: string;
}

interface Facility {
  id: number;
  title: string;
  image: string;
  description: string;
}

export default function ClinicPage() {
  const [services, setServices] = useState<Service[]>(clinicData.services as unknown as Service[]);
  const [facilities] = useState<Facility[]>(clinicData.facilities);
  const [searchTerm, setSearchTerm] = useState('');

  // Load clinic services from backend (fallback to bundled JSON if API is unavailable)
  useEffect(() => {
    const load = async () => {
      try {
        const response = await clinicService.listServices();

        // Map backend model into existing card-friendly shape
        const mapped: Service[] = (response.data || []).map((s) => {
          const category = (s.category || '').toLowerCase();
          const icon =
            category.includes('maternity') ? 'baby' :
            category.includes('heart') ? 'heart' :
            category.includes('lab') || category.includes('diagnostic') ? 'activity' :
            category.includes('drug') || category.includes('pharmacy') ? 'pill' :
            category.includes('counsel') || category.includes('mental') ? 'message-circle' :
            'stethoscope';

          return {
            id: s.id,
            title: s.name,
            description: s.description || '',
            icon,
            details: s.description || '',
          };
        });

        setServices(mapped.length ? mapped : (clinicData.services as unknown as Service[]));
      } catch {
        // keep bundled JSON
      }
    };
    load();
  }, []);

  // Filter services based on search
  const filteredServices = useMemo(() => {
    return services.filter(service =>
      service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-50 to-blue-100 py-20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5"></div>
        <div className="relative container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">
              St. Anthony Catholic Church Clinic
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Compassionate healthcare for our parish community. Our clinic provides
              essential medical services with care and dignity, reflecting the healing
              ministry of Christ.
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              <Phone className="h-5 w-5 mr-2" />
              Book Appointment
            </Button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">Our Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We offer a range of essential healthcare services to support the well-being
              of our parish community and visitors.
            </p>
          </div>

          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredServices.map((service) => (
                <ClinicServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {searchTerm ? 'No services found matching your search.' : 'No services available.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Facilities Gallery */}
      <ClinicGallery facilities={facilities} />

      {/* Contact & Information */}
      <ContactInfoSection />

      {/* Emergency Section */}
      <section className="py-12 bg-red-50 border-t border-red-200">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
              <h3 className="text-2xl font-bold text-red-800">Emergency Notice</h3>
            </div>
            <p className="text-red-700 text-lg leading-relaxed">
              In case of medical emergencies, please contact the Parish Office immediately
              or proceed to the nearest hospital. Our clinic provides basic healthcare services
              but is not equipped for emergency medical situations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}