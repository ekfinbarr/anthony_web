import { useEffect, useMemo, useState } from "react";
import { Calendar, Users, MapPin, Phone, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import PageHeader from "@/components/layout/PageHeader";
import RentalRequestWizard from "@/components/rentals/RentalRequestWizard";
import facilityService, { Facility } from "@/services/facility.service";
import { site } from "@/config/site";

const faqs = [
  {
    question: "Does submitting a request reserve the venue?",
    answer:
      "No. Every request requires parish office approval. Submitting a form does not hold or reserve the venue. Payment is only due after approval.",
  },
  {
    question: "How is pricing calculated?",
    answer:
      "Each venue has fixed bookable time blocks with set rates in Naira. Selecting multiple combinable blocks adds those fixed rates. The parish office confirms the final fee on approval.",
  },
  {
    question: "When do I pay?",
    answer:
      "After the parish office approves your request, you will be asked for a deposit (and later any balance) using the payment methods the parish has enabled.",
  },
  {
    question: "Can I bring my own caterer?",
    answer: "Yes, subject to venue rules. Note any catering or setup needs in your request.",
  },
  {
    question: "Is parking available?",
    answer: "Parking availability depends on the venue and event size. Ask the parish office when your request is reviewed.",
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(price);
}

function lowestBlockPrice(facility: Facility): number | null {
  const blocks = (facility.time_blocks ?? []).filter((b) => b.is_active !== false && b.is_online !== false);
  if (blocks.length === 0) {
    return facility.rental_fee != null ? Number(facility.rental_fee) : null;
  }
  return Math.min(...blocks.map((b) => Number(b.price)));
}

const Rentals = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [venues, setVenues] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await facilityService.list({ bookable: true });
        setVenues((res.data ?? []).filter((f) => f.is_bookable && f.is_active));
      } catch {
        setVenues([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return venues;
    return venues.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.description?.toLowerCase().includes(q) ||
        v.type.toLowerCase().includes(q)
    );
  }, [venues, searchTerm]);

  const openWizard = (slug?: string) => {
    setSelectedSlug(slug ?? null);
    setWizardOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        eyebrow="Event Spaces"
        title="Hall & Rentals"
        description="Request parish venues for gatherings, meetings, and celebrations. Every booking is reviewed by the parish office."
      />

      <section className="bg-primary py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 text-primary-foreground text-sm font-medium">
            <span className="flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Manual office approval
            </span>
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Fixed time-block rates
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-5 w-5" /> St. Anthony Catholic Church, Gbaja
            </span>
          </div>
        </div>
      </section>

      <section className="py-10 container mx-auto px-4">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center mb-8">
          <Input
            placeholder="Search venues…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <Button onClick={() => openWizard()}>
            <Calendar className="h-4 w-4 mr-2" />
            Request a venue
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            No bookable venues are published yet. Please contact the parish office.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((venue) => {
              const from = lowestBlockPrice(venue);
              const image = venue.images?.[0];
              return (
                <Card key={venue.id} className="overflow-hidden flex flex-col">
                  <div className="aspect-[16/10] bg-muted relative">
                    {image ? (
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        {venue.name}
                      </div>
                    )}
                    <Badge className="absolute top-3 left-3 capitalize">{venue.type}</Badge>
                  </div>
                  <CardHeader>
                    <CardTitle className="font-heading text-xl">{venue.name}</CardTitle>
                    <CardDescription className="line-clamp-3">{venue.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-sm space-y-1 flex-1">
                    {venue.capacity != null && (
                      <p className="flex items-center gap-2">
                        <Users className="h-4 w-4" /> Up to {venue.capacity} guests
                      </p>
                    )}
                    <p className="font-medium">
                      {from != null ? `From ${formatPrice(from)}` : "Rates on request"}
                    </p>
                    {(venue.time_blocks?.length ?? 0) > 0 && (
                      <p className="text-muted-foreground text-xs">
                        {venue.time_blocks!.filter((b) => b.is_online !== false).length} bookable time block(s)
                      </p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => openWizard(venue.slug)}>
                      Request this venue
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="py-14 bg-muted/40">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-heading text-3xl font-bold mb-6 text-center">How rental requests work</h2>
          <ol className="space-y-4 text-sm md:text-base">
            <li><strong>1. Submit a request</strong> — share your details, venue, date, and time blocks. Nothing is reserved.</li>
            <li><strong>2. Parish office review</strong> — staff check availability, conflicts, and parish priorities.</li>
            <li><strong>3. Approval & deposit</strong> — if approved, you receive deposit instructions and a deadline.</li>
            <li><strong>4. Confirmation</strong> — after a verified deposit (per parish policy), your booking is confirmed.</li>
          </ol>
        </div>
      </section>

      <section className="py-14 container mx-auto px-4 max-w-3xl">
        <h2 className="font-heading text-3xl font-bold mb-6 text-center">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.question} value={`faq-${i}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">Ready to request a venue?</h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            Start an online request, or contact the parish office for guidance.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" onClick={() => openWizard()}>
              <Calendar className="h-5 w-5 mr-2" />
              Request online
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <a href="/contact" className="gap-2">
                <Phone className="h-5 w-5" />
                Contact the office
              </a>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
              <a href={`mailto:${site.email}`} className="gap-2">
                <Mail className="h-5 w-5" />
                Email
              </a>
            </Button>
          </div>
        </div>
      </section>

      <RentalRequestWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        facilitySlug={selectedSlug}
      />
    </div>
  );
};

export default Rentals;
