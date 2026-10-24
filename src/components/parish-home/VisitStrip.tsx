import { EnvelopeIcon, PhoneIcon, PinIcon } from "@/components/icons/ParishIcons";
import { Button } from "@/components/ui/button";
import { formatAddress, mapsEmbedUrl, mapsSearchUrl, site } from "@/config/site";
import Reveal from "./Reveal";

const VisitStrip = () => {
  const address = formatAddress(site.address);

  return (
    <section id="visit" aria-labelledby="visit-heading" className="scroll-mt-24 bg-church-pearl py-14 md:py-16">
      <Reveal>
        <div className="container mx-auto px-4">
          <h2 id="visit-heading" className="mb-8 text-center font-heading text-3xl font-bold text-church-charcoal md:text-4xl">
            Visit the parish
          </h2>
          <div className="grid items-stretch gap-8 lg:grid-cols-2">
            <address className="not-italic space-y-4 rounded-lg bg-background p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <PinIcon className="mt-0.5 h-8 w-8 shrink-0" />
                <div>
                  <p className="font-heading font-semibold text-church-charcoal">{site.name}</p>
                  <p className="text-muted-foreground">{address}</p>
                </div>
              </div>
              {site.telephone && (
                <div className="flex items-center gap-3">
                  <PhoneIcon className="h-8 w-8 shrink-0" />
                  <a href={`tel:${site.telephone}`} className="text-muted-foreground hover:text-primary">
                    {site.telephone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="h-8 w-8 shrink-0" />
                <a href={`mailto:${site.email}`} className="text-muted-foreground hover:text-primary">
                  {site.email}
                </a>
              </div>
              <Button variant="church" asChild>
                <a href={mapsSearchUrl(site)} target="_blank" rel="noopener noreferrer">
                  Get directions
                </a>
              </Button>
            </address>
            <div className="min-h-64 overflow-hidden rounded-lg shadow-sm">
              <iframe
                src={mapsEmbedUrl(site)}
                title={`Map showing the location of ${site.name}`}
                className="h-full min-h-64 w-full"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default VisitStrip;
