import { useState } from "react";
import { Search, Phone, Mail, MapPin, Clock, Stethoscope, Heart, Baby, TestTube, Brain, Pill, Activity, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const services = [
  { id: 1, name: "Maternity Care", category: "maternity", icon: Baby, description: "Comprehensive care for expectant mothers including delivery services" },
  { id: 2, name: "Antenatal Care", category: "maternity", icon: Heart, description: "Regular checkups and monitoring throughout pregnancy" },
  { id: 3, name: "Laboratory Tests", category: "diagnostics", icon: TestTube, description: "Full range of diagnostic testing services" },
  { id: 4, name: "Malaria Treatment", category: "treatment", icon: Pill, description: "Diagnosis and treatment of malaria cases" },
  { id: 5, name: "Typhoid Treatment", category: "treatment", icon: Pill, description: "Comprehensive typhoid fever care and management" },
  { id: 6, name: "Ulcer Management", category: "treatment", icon: Activity, description: "Treatment for gastric and peptic ulcers" },
  { id: 7, name: "Infection Treatment", category: "treatment", icon: Shield, description: "Care for various bacterial and viral infections" },
  { id: 8, name: "Counselling Services", category: "wellness", icon: Brain, description: "Mental health support and counselling" },
  { id: 9, name: "Asthma Treatment", category: "treatment", icon: Activity, description: "Management and treatment of respiratory conditions" },
  { id: 10, name: "Health Screenings", category: "diagnostics", icon: Stethoscope, description: "Preventive health checkups and screenings" },
  { id: 11, name: "Blood Pressure Check", category: "diagnostics", icon: Heart, description: "Regular BP monitoring and management" },
  { id: 12, name: "Diabetes Screening", category: "diagnostics", icon: TestTube, description: "Blood sugar testing and diabetes care" },
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
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200"
            alt="Healthcare"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/80 to-secondary/60" />
        </div>
        <div className="relative z-10 text-center text-secondary-foreground">
          <Badge className="mb-4 bg-primary text-primary-foreground">Healthcare Ministry</Badge>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4 animate-fade-in">
            St. Anthony <span className="text-primary">Clinic</span>
          </h1>
          <p className="text-xl max-w-2xl mx-auto px-4 opacity-90">
            Compassionate healthcare services for our community
          </p>
        </div>
      </section>

      {/* Info Bar */}
      <section className="bg-primary py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-primary-foreground">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Clock className="h-6 w-6" />
              <div>
                <p className="font-semibold">Weekdays</p>
                <p className="text-sm opacity-90">8am – 7pm</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Clock className="h-6 w-6" />
              <div>
                <p className="font-semibold">Weekends</p>
                <p className="text-sm opacity-90">9am – 12pm</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Phone className="h-6 w-6" />
              <div>
                <p className="font-semibold">Phone</p>
                <p className="text-sm opacity-90">+234 803 456 7890</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <Mail className="h-6 w-6" />
              <div>
                <p className="font-semibold">Email</p>
                <p className="text-sm opacity-90">clinic@stanthonygbaja.org</p>
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

      {/* Services Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-heading font-bold text-center mb-12">
            Our <span className="text-primary">Services</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
            {filteredServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card key={service.id} className="group card-hover animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <CardHeader>
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
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
                <Button size="lg" variant="church" asChild>
                  <a href="tel:+2348034567890" className="gap-2">
                    <Phone className="h-5 w-5" />
                    Call to Book
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="mailto:clinic@stanthonygbaja.org" className="gap-2">
                    <Mail className="h-5 w-5" />
                    Send Email
                  </a>
                </Button>
              </div>
            </div>
            <div className="bg-card rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Get Directions
              </h3>
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.9!2d3.35!3d6.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMzAnMDAuMCJOIDPCsDIxJzAwLjAiRQ!5e0!3m2!1sen!2sng!4v1234567890"
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
                St. Anthony Catholic Church Premises, Gbaja, Surulere, Lagos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Banner */}
      <section className="py-8 bg-destructive text-destructive-foreground">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-semibold">
            For emergencies, please call: <a href="tel:+2348034567890" className="underline">+234 803 456 7890</a>
          </p>
        </div>
      </section>
    </div>
  );
};

export default Clinic;