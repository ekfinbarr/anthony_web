import { useState } from "react";
import { Search, Phone, Mail } from "lucide-react";
import { BandageIcon, ClockIcon, CounselIcon, CradleIcon, DropIcon, EnvelopeIcon, FlaskIcon, GaugeIcon, LungsIcon, MotherIcon, PhoneIcon, PinIcon, ScopeIcon, ShieldIcon, TabletIcon, ThermoIcon } from "@/components/icons/ParishIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/layout/PageHeader";
import { formatAddress, mapsEmbedUrl, site } from "@/config/site";

const services = [
  { id: 1, name: "Maternity Care", category: "maternity", icon: CradleIcon, description: "Comprehensive care for expectant mothers including delivery services" },
  { id: 2, name: "Antenatal Care", category: "maternity", icon: MotherIcon, description: "Regular checkups and monitoring throughout pregnancy" },
  { id: 3, name: "Laboratory Tests", category: "diagnostics", icon: FlaskIcon, description: "Full range of diagnostic testing services" },
  { id: 4, name: "Malaria Treatment", category: "treatment", icon: TabletIcon, description: "Diagnosis and treatment of malaria cases" },
  { id: 5, name: "Typhoid Treatment", category: "treatment", icon: ThermoIcon, description: "Comprehensive typhoid fever care and management" },
  { id: 6, name: "Ulcer Management", category: "treatment", icon: BandageIcon, description: "Treatment for gastric and peptic ulcers" },
  { id: 7, name: "Infection Treatment", category: "treatment", icon: ShieldIcon, description: "Care for various bacterial and viral infections" },
  { id: 8, name: "Counselling Services", category: "wellness", icon: CounselIcon, description: "Mental health support and counselling" },
  { id: 9, name: "Asthma Treatment", category: "treatment", icon: LungsIcon, description: "Management and treatment of respiratory conditions" },
  { id: 10, name: "Health Screenings", category: "diagnostics", icon: ScopeIcon, description: "Preventive health checkups and screenings" },
  { id: 11, name: "Blood Pressure Check", category: "diagnostics", icon: GaugeIcon, description: "Regular BP monitoring and management" },
  { id: 12, name: "Diabetes Screening", category: "diagnostics", icon: DropIcon, description: "Blood sugar testing and diabetes care" },
];

const categories = [
  { id: "all", name: "All Services" },
  { id: "maternity", name: "Maternity" },
  { id: "diagnostics", name: "Diagnostics" },
  { id: "treatment", name: "Treatment" },
  { id: "wellness", name: "Wellness" },
];

const Clinic = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      <PageHeader
        eyebrow="Healthcare Ministry"
        title="St. Anthony Parish Clinic"
        description="Compassionate healthcare services for our community"
      />

      {/* Info Bar */}
      <section className="bg-primary py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-primary-foreground">
            <div className="flex items-center gap-3">
              <ClockIcon className="h-9 w-9 shrink-0" />
              <div>
                <p className="font-semibold">Weekdays</p>
                <p className="text-sm opacity-90">8am – 7pm</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ClockIcon className="h-9 w-9 shrink-0" />
              <div>
                <p className="font-semibold">Weekends</p>
                <p className="text-sm opacity-90">9am – 12pm</p>
              </div>
            </div>
            {site.telephone && (
              <div className="flex items-center gap-3">
                <PhoneIcon className="h-9 w-9 shrink-0" />
                <div>
                  <p className="font-semibold">Phone</p>
                  <p className="text-sm opacity-90">{site.telephone}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3">
              <EnvelopeIcon className="h-9 w-9 shrink-0" />
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-sm opacity-90">{site.email}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="py-8 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-left sm:text-center mb-8 sm:mb-12">
            Our <span className="text-primary">Services</span>
          </h2>

          {/* Mobile: horizontal list rows */}
          <div className="flex flex-col gap-3 sm:hidden">
            {filteredServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.id}
                  className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3.5 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Icon size="md" className="shrink-0" />
                  <div className="min-w-0 flex-1 text-left">
                    <p className="font-semibold leading-snug">{service.name}</p>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                      {service.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tablet / desktop: card grid */}
          <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={service.id} className="group card-hover animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <CardHeader>
                    <Icon size="md" className="mb-4" />
                    <Badge variant="secondary" className="w-fit mb-2 capitalize">{service.category}</Badge>
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-heading font-bold mb-4">
                Book an <span className="text-primary">Appointment</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                Our dedicated medical team is ready to provide you with quality healthcare.
                Call us to schedule your visit or walk in during our opening hours.
              </p>
              <div className="flex flex-wrap gap-4">
                {site.telephone && (
                  <Button size="lg" variant="church" asChild>
                    <a href={`tel:${site.telephone.replace(/[^+\d]/g, "")}`} className="gap-2">
                      <Phone className="h-5 w-5" />
                      Call to Book
                    </a>
                  </Button>
                )}
                <Button size="lg" variant="outline" asChild>
                  <a href={`mailto:${site.email}`} className="gap-2">
                    <Mail className="h-5 w-5" />
                    Send Email
                  </a>
                </Button>
              </div>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <PinIcon className="h-8 w-8" />
                Get Directions
              </h3>
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <iframe
                  src={mapsEmbedUrl(site)}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Clinic Location"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                {site.name} — {formatAddress(site.address)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {site.telephone && (
        <section className="py-8 bg-destructive text-destructive-foreground">
          <div className="container mx-auto px-4 text-center">
            <p className="text-lg font-semibold">
              For emergencies, please call:{" "}
              <a href={`tel:${site.telephone.replace(/[^+\d]/g, "")}`} className="underline">
                {site.telephone}
              </a>
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

export default Clinic;