import { Link } from "react-router-dom";
import { Image as ImageIcon, Play } from "lucide-react";
import type { GalleryAlbumItem } from "@/services/galleryAlbum.service";
import { mediaAlt, mediaKind } from "@/lib/gallery";
import { cn } from "@/lib/utils";

type GalleryMediaCardProps = {
  item: GalleryAlbumItem;
  onOpen?: () => void;
  className?: string;
};

const GalleryMediaCard = ({ item, onOpen, className }: GalleryMediaCardProps) => {
  const kind = mediaKind(item);
  const isVideo = kind === "video";
  const albumSlug = item.album?.slug;
  const href = albumSlug ? `/gallery/${albumSlug}` : "/gallery";
  const alt = mediaAlt(item);

  const media = (
    <div className="relative aspect-[4/3] overflow-hidden bg-church-pearl">
      {item.media_url ? (
        isVideo ? (
          <>
            <video
              src={item.media_url}
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-cover opacity-80"
              aria-hidden="true"
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/65 text-white shadow-lg">
                <Play className="h-5 w-5 fill-current" aria-hidden="true" />
              </span>
            </span>
            <span className="sr-only">Video</span>
          </>
        ) : (
          <img
            src={item.media_url}
            alt={alt}
            width={480}
            height={360}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
          />
        )
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground/60" aria-hidden="true" />
        </div>
      )}
    </div>
  );

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-lg border border-church-gold-warm/15 bg-white shadow-sm transition-[box-shadow,transform] duration-300",
        "hover:shadow-md focus-within:ring-2 focus-within:ring-church-gold focus-within:ring-offset-2",
        "motion-safe:hover:-translate-y-0.5",
        className,
      )}
    >
      {onOpen ? (
        <button type="button" onClick={onOpen} className="block w-full text-left outline-none">
          {media}
        </button>
      ) : (
        <Link to={href} className="block outline-none">
          {media}
        </Link>
      )}

      <div className="space-y-1 p-4">
        <h3 className="line-clamp-1 font-heading text-base font-semibold text-church-charcoal">
          {onOpen ? (
            <button
              type="button"
              onClick={onOpen}
              className="outline-none transition-colors hover:text-church-gold-warm focus-visible:text-church-gold-warm"
            >
              {item.title}
            </button>
          ) : (
            <Link
              to={href}
              className="outline-none transition-colors hover:text-church-gold-warm focus-visible:text-church-gold-warm"
            >
              {item.title}
            </Link>
          )}
        </h3>
        {item.album?.title && (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            From{" "}
            <Link to={href} className="underline-offset-2 hover:underline">
              {item.album.title}
            </Link>
          </p>
        )}
      </div>
    </article>
  );
};

export default GalleryMediaCard;
