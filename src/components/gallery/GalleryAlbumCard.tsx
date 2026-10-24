import { Link } from "react-router-dom";
import { ArrowRight, Image as ImageIcon, Play } from "lucide-react";
import type { GalleryAlbum } from "@/services/galleryAlbum.service";
import { albumCoverSrc, albumDateLabel, formatMediaCounts, primaryAlbumCategory } from "@/lib/gallery";
import { cn } from "@/lib/utils";

type GalleryAlbumCardProps = {
  album: GalleryAlbum;
  className?: string;
  featuredLayout?: boolean;
};

const GalleryAlbumCard = ({ album, className, featuredLayout }: GalleryAlbumCardProps) => {
  const href = `/gallery/${album.slug}`;
  const cover = albumCoverSrc(album);
  const category = primaryAlbumCategory(album);
  const dateLabel = albumDateLabel(album);
  const counts = formatMediaCounts(album.photo_count, album.video_count, album.items_count);
  const hasVideo = (album.video_count ?? 0) > 0;

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border border-church-gold-warm/15 bg-white shadow-sm transition-[box-shadow,transform] duration-300",
        "hover:shadow-md focus-within:ring-2 focus-within:ring-church-gold focus-within:ring-offset-2",
        "motion-safe:hover:-translate-y-0.5",
        featuredLayout && "sm:col-span-2 lg:col-span-2",
        className,
      )}
    >
      <Link
        to={href}
        className={cn(
          "relative block overflow-hidden bg-church-pearl",
          featuredLayout ? "aspect-[16/9]" : "aspect-[16/10]",
        )}
      >
        {cover ? (
          <img
            src={cover}
            alt=""
            width={640}
            height={400}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-church-pearl to-church-stone/40">
            <ImageIcon className="h-10 w-10 text-muted-foreground/60" aria-hidden="true" />
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {category && (
            <span className="rounded bg-church-charcoal/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-church-gold">
              {category.label}
            </span>
          )}
          {hasVideo && (
            <span className="inline-flex items-center gap-1 rounded bg-black/70 px-2 py-1 text-[11px] font-medium text-white">
              <Play className="h-3 w-3 fill-current" aria-hidden="true" />
              Video
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {dateLabel && (
          <p className="mb-2 text-xs text-muted-foreground">
            <time dateTime={album.event_date ?? undefined}>{dateLabel}</time>
          </p>
        )}

        <h3 className="font-serif text-xl font-semibold leading-snug text-church-charcoal">
          <Link
            to={href}
            className="outline-none transition-colors hover:text-church-gold-warm focus-visible:text-church-gold-warm"
          >
            {album.title}
          </Link>
        </h3>

        {album.description ? (
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            {album.description}
          </p>
        ) : (
          <div className="flex-1" />
        )}

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">{counts}</p>
          <Link
            to={href}
            className="inline-flex items-center gap-1 text-sm font-semibold text-church-gold-warm outline-none transition-colors hover:text-church-charcoal focus-visible:ring-2 focus-visible:ring-church-gold focus-visible:ring-offset-2"
            aria-label={`Explore event: ${album.title}`}
          >
            Explore
            <ArrowRight
              className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default GalleryAlbumCard;
