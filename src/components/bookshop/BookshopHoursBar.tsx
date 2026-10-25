import { Clock, MapPin, Phone } from "lucide-react";
import Reveal from "@/components/parish-home/Reveal";
import { bookshopContact } from "@/data/bookshopContent";

const BookshopHoursBar = () => {
  return (
    <section aria-label="Bookshop hours and contact" className="bg-primary py-4 md:py-5">
      <div className="container mx-auto px-4">
        <Reveal>
          <ul className="flex flex-col items-center justify-center gap-4 text-primary-foreground sm:flex-row sm:flex-wrap sm:gap-8 md:gap-12">
            <li className="flex items-center gap-2.5">
              <Clock className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium md:text-base">{bookshopContact.hours}</span>
            </li>
            {bookshopContact.phoneHref && (
              <li>
                <a
                  href={bookshopContact.phoneHref}
                  className="flex items-center gap-2.5 transition-opacity hover:opacity-90"
                >
                  <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span className="text-sm font-medium md:text-base">{bookshopContact.phone}</span>
                </a>
              </li>
            )}
            <li className="flex items-center gap-2.5">
              <MapPin className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="text-sm font-medium md:text-base">{bookshopContact.location}</span>
            </li>
          </ul>
        </Reveal>
      </div>
    </section>
  );
};

export default BookshopHoursBar;
