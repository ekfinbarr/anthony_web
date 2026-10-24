import { Link } from "react-router-dom";
import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Bulletin } from "@/services/bulletin.service";
import BulletinCover from "./BulletinCover";
import BulletinFormatBadge from "./BulletinFormatBadge";

type BulletinFeaturedProps = {
  bulletin: Bulletin;
  onDownload?: (bulletin: Bulletin) => void;
};

const BulletinFeatured = ({ bulletin, onDownload }: BulletinFeaturedProps) => {
  const href = `/bulletin/${bulletin.slug}`;

  return (
    <section aria-labelledby="latest-bulletin-heading" className="mb-14">
      <div className="mb-6 flex items-center gap-3">
        <span className="h-px max-w-[3rem] flex-1 bg-gradient-church" aria-hidden="true" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-church-gold-warm">
          This Sunday
        </p>
      </div>

      <article className="overflow-hidden rounded-xl border border-church-gold-warm/20 bg-white shadow-sm lg:grid lg:grid-cols-2">
        <Link
          to={href}
          className="relative block aspect-[4/5] overflow-hidden bg-church-pearl outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-church-gold-warm lg:aspect-auto lg:min-h-[24rem]"
          aria-label={`Read ${bulletin.title}`}
        >
          <BulletinCover bulletin={bulletin} priority className="absolute inset-0" />
        </Link>

        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <BulletinFormatBadge format={bulletin.file_format} />
            {bulletin.file_size_formatted && (
              <span className="text-xs text-muted-foreground">{bulletin.file_size_formatted}</span>
            )}
          </div>

          <h2
            id="latest-bulletin-heading"
            className="font-serif text-2xl font-semibold leading-tight text-church-charcoal sm:text-3xl lg:text-[2rem]"
          >
            <Link
              to={href}
              className="outline-none transition-colors hover:text-church-gold-warm focus-visible:text-church-gold-warm"
            >
              {bulletin.title}
            </Link>
          </h2>

          <time
            dateTime={bulletin.bulletin_date}
            className="mt-3 text-sm font-medium text-church-gold-warm"
          >
            {bulletin.bulletin_date_formatted || bulletin.bulletin_date}
          </time>

          {bulletin.description && (
            <p className="mt-4 text-base leading-relaxed text-muted-foreground line-clamp-4">
              {bulletin.description}
            </p>
          )}

          <div className="mt-7 flex flex-wrap gap-3">
            <Button variant="church" asChild className="group">
              <Link to={href}>
                Read Bulletin
                <ArrowRight
                  className="ml-2 h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </Button>
            {bulletin.file_url && (
              <Button
                variant="outline"
                className="border-church-gold-warm/40"
                onClick={() => onDownload?.(bulletin)}
              >
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                Download
              </Button>
            )}
          </div>
        </div>
      </article>
    </section>
  );
};

export default BulletinFeatured;
