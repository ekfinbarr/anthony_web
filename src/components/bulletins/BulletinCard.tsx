import { Link } from "react-router-dom";
import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Bulletin } from "@/services/bulletin.service";
import BulletinCover from "./BulletinCover";
import BulletinFormatBadge from "./BulletinFormatBadge";

type BulletinCardProps = {
  bulletin: Bulletin;
  onDownload?: (bulletin: Bulletin) => void;
};

const BulletinCard = ({ bulletin, onDownload }: BulletinCardProps) => {
  const href = `/bulletin/${bulletin.slug}`;

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-church-gold-warm/15 bg-white shadow-sm transition-shadow motion-safe:hover:shadow-md">
      <Link
        to={href}
        className="relative block aspect-[3/4] overflow-hidden bg-church-pearl outline-none focus-visible:ring-2 focus-visible:ring-church-gold-warm focus-visible:ring-offset-2"
        aria-label={`Read ${bulletin.title}`}
      >
        <BulletinCover
          bulletin={bulletin}
          className="transition-transform duration-300 motion-safe:group-hover:scale-[1.02]"
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <BulletinFormatBadge format={bulletin.file_format} />
          {bulletin.file_size_formatted && (
            <span className="text-xs text-muted-foreground">{bulletin.file_size_formatted}</span>
          )}
        </div>

        <h3 className="font-serif text-lg font-semibold leading-snug text-church-charcoal">
          <Link
            to={href}
            className="outline-none transition-colors hover:text-church-gold-warm focus-visible:text-church-gold-warm"
          >
            {bulletin.title}
          </Link>
        </h3>

        <time
          dateTime={bulletin.bulletin_date}
          className="mt-1.5 text-sm text-muted-foreground"
        >
          {bulletin.bulletin_date_formatted || bulletin.bulletin_date}
        </time>

        {bulletin.description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {bulletin.description}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="church" size="sm" asChild className="flex-1 sm:flex-none">
            <Link to={href}>
              <Eye className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Read
            </Link>
          </Button>
          {bulletin.file_url && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-church-gold-warm/30 sm:flex-none"
              onClick={() => onDownload?.(bulletin)}
              aria-label={`Download ${bulletin.title}`}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Download
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};

export default BulletinCard;
