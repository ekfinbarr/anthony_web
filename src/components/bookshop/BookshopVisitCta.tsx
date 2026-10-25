import { Mail, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/parish-home/Reveal";
import { mapsSearchUrl, site } from "@/config/site";
import { bookshopContact, bookshopCopy } from "@/data/bookshopContent";

const BookshopVisitCta = () => {
  return (
    <section
      aria-labelledby="bookshop-visit-heading"
      className="bg-secondary py-16 text-secondary-foreground md:py-20"
    >
      <div className="container mx-auto px-4 text-center">
        <Reveal>
          <h2
            id="bookshop-visit-heading"
            className="mb-4 font-heading text-3xl font-bold md:text-4xl"
          >
            {bookshopCopy.visitHeadline}
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-base opacity-85 md:text-lg">
            {bookshopCopy.visitBody}
          </p>
          <p className="mb-8 text-sm opacity-70 md:text-base">
            {bookshopContact.hours}
            <span className="mx-2" aria-hidden="true">
              ·
            </span>
            {bookshopContact.location}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {bookshopContact.phoneHref && (
              <Button size="lg" variant="church" asChild>
                <a href={bookshopContact.phoneHref} className="gap-2">
                  <Phone className="h-5 w-5" aria-hidden="true" />
                  Call {bookshopContact.phone}
                </a>
              </Button>
            )}
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary "
              asChild
            >
              <a
                href={mapsSearchUrl(site)}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <MapPin className="h-5 w-5" aria-hidden="true" />
                Get Directions
              </a>
            </Button>
            {/* <Button
              size="lg"
              variant="outline"
              className="border-primary/60 text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
              asChild
            >
              <a href={bookshopContact.emailHref} className="gap-2">
                <Mail className="h-5 w-5" aria-hidden="true" />
                Email Bookshop
              </a>
            </Button> */}
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default BookshopVisitCta;
