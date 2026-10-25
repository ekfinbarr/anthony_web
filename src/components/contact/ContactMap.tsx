import { Button } from "@/components/ui/button";
import Reveal from "@/components/parish-home/Reveal";
import { mapsEmbedUrl, mapsSearchUrl, site } from "@/config/site";

const ContactMap = () => {
  return (
    <section
      aria-labelledby="contact-map-heading"
      className="scroll-mt-24 bg-background py-16 md:py-20"
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <Reveal from="left">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-church-gold">
                Find us
              </p>
              <h2
                id="contact-map-heading"
                className="mb-4 font-heading text-3xl font-bold text-church-charcoal md:text-4xl"
              >
                Location &amp; Directions
              </h2>
              <p className="mb-6 text-muted-foreground md:text-lg">
                We are in the heart of Surulere, Lagos — easy to reach by car or public transport.
              </p>
              <Button variant="church" size="lg" asChild>
                <a href={mapsSearchUrl(site)} target="_blank" rel="noopener noreferrer">
                  Get Directions
                </a>
              </Button>
            </div>
          </Reveal>

          <Reveal from="right" delay={60}>
            <div className="h-[280px] overflow-hidden rounded-lg shadow-card-soft md:h-[400px]">
              <iframe
                src={mapsEmbedUrl(site)}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map showing the location of ${site.name}`}
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default ContactMap;
