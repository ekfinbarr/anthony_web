import { Link } from "react-router-dom";
import { ArrowRight, Image as ImageIcon, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GalleryAlbum } from "@/services/galleryAlbum.service";
import { albumCoverSrc, albumDateLabel, formatMediaCounts, primaryAlbumCategory } from "@/lib/gallery";

type GalleryFeaturedProps = {
  album: GalleryAlbum;
};

const GalleryFeatured = ({ album }: GalleryFeaturedProps) => {
  const href = `/gallery/${album.slug}`;
  const cover = albumCoverSrc(album);
  const category = primaryAlbumCategory(album);
  const dateLabel = albumDateLabel(album);
  const counts = formatMediaCounts(album.photo_count, album.video_count, album.items_count);
  const hasVideo = (album.video_count ?? 0) > 0;

  return (
    <section aria-labelledby="featured-collection-heading" className="mb-14">
      <div className="mb-6 flex items-center gap-3">
        <span className="h-px max-w-[3rem] flex-1 bg-gradient-church" aria-hidden="true" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-church-gold-warm">Featured Collection</p>
      </div>

      <article className="overflow-hidden rounded-xl border border-church-gold-warm/20 bg-white shadow-sm lg:grid lg:grid-cols-5">
        <Link
          to={href}
          className="relative block aspect-[16/11] overflow-hidden bg-church-pearl lg:col-span-3 lg:aspect-auto lg:min-h-[22rem]"
        >
          {cover ? (
            <img
              src={cover}
              alt=""
              width={900}
              height={620}
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full min-h-[16rem] w-full items-center justify-center bg-gradient-to-br from-church-pearl to-church-stone/50">
              <ImageIcon className="h-14 w-14 text-muted-foreground/50" aria-hidden="true" />
            </div>
          )}
          {hasVideo && (
            <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
              <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
              Includes video
            </span>
          )}
        </Link>

        <div className="flex flex-col justify-center p-6 sm:p-8 lg:col-span-2 lg:p-10">
          {category && (
            <span className="mb-3 inline-flex w-fit rounded bg-church-gold/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-church-gold-warm">
              {category.label}
            </span>
          )}

          <h2
            id="featured-collection-heading"
            className="font-serif text-2xl font-semibold leading-tight text-church-charcoal sm:text-3xl lg:text-[2rem]"
          >
            <Link
              to={href}
              className="outline-none transition-colors hover:text-church-gold-warm focus-visible:text-church-gold-warm"
            >
              {album.title}
            </Link>
          </h2>

          {dateLabel && (
            <p className="mt-3 text-sm text-muted-foreground">
              <time dateTime={album.event_date ?? undefined}>{dateLabel}</time>
            </p>
          )}

          {album.description && (
            <p className="mt-4 line-clamp-4 text-base leading-relaxed text-muted-foreground">{album.description}</p>
          )}

          <p className="mt-4 text-sm text-muted-foreground">{counts}</p>

          <div className="mt-7">
            <Button variant="church" asChild className="group">
              <Link to={href}>
                Explore Event
                <ArrowRight
                  className="ml-2 h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </Button>
          </div>
        </div>
      </article>
    </section>
  );
};

export default GalleryFeatured;
