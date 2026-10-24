import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Bulletin } from "@/services/bulletin.service";
import { formatLabel } from "@/services/bulletin.service";

type BulletinCoverProps = {
  bulletin: Bulletin;
  className?: string;
  priority?: boolean;
};

const BulletinCover = ({ bulletin, className, priority }: BulletinCoverProps) => {
  const src = bulletin.cover_url || bulletin.thumbnail_url || null;
  const alt = `${bulletin.title} cover`;

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        width={640}
        height={800}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-church-pearl via-white to-church-gold/20 p-6 text-center",
        className,
      )}
      role="img"
      aria-label={alt}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-church-gold/20 text-church-gold-warm">
        <FileText className="h-7 w-7" aria-hidden="true" />
      </div>
      <p className="font-serif text-sm font-semibold leading-snug text-church-charcoal line-clamp-3">
        {bulletin.title}
      </p>
      {bulletin.bulletin_date_formatted && (
        <p className="text-xs text-muted-foreground">{bulletin.bulletin_date_formatted}</p>
      )}
      <p className="text-[11px] font-semibold uppercase tracking-wider text-church-gold-warm">
        {formatLabel(bulletin.file_format)}
      </p>
    </div>
  );
};

export default BulletinCover;
