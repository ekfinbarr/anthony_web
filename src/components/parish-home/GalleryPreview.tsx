import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import galleryAlbumService from "@/services/galleryAlbum.service";
import { albumCoverSrc } from "@/lib/gallery";
import Reveal from "./Reveal";

const GalleryPreview = () => {
  const query = useQuery({
    queryKey: ["gallery-albums", "featured", "parish-home"],
    queryFn: async () => {
      const featured = await galleryAlbumService.listPublicAlbums({
        is_featured: true,
        sort: "newest",
        per_page: 6,
      });
      if (featured.data?.length) return featured.data;
      const latest = await galleryAlbumService.listPublicAlbums({ sort: "newest", per_page: 6 });
      return latest.data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const albums = (query.data ?? [])
    .map((album) => ({ album, src: albumCoverSrc(album) }))
    .filter((row) => row.src)
    .slice(0, 6);

  return (
    <section id="gallery" aria-labelledby="gallery-heading" className="scroll-mt-24 bg-church-pearl py-14 md:py-16">
      <Reveal>
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 id="gallery-heading" className="mb-3 font-heading text-3xl font-bold text-church-charcoal md:text-4xl">
              Gallery
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              A few moments from worship and parish life.
            </p>
          </div>

          {query.isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <Skeleton key={item} className="aspect-square w-full" />
              ))}
            </div>
          ) : query.isError || albums.length === 0 ? (
            <p className="text-center text-muted-foreground">
              {query.isError
                ? "We couldn't load the gallery just now."
                : "Photographs will appear here when albums are published."}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {albums.map(({ album, src }) => (
                <Link
                  key={album.id}
                  to={`/gallery/${album.slug}`}
                  className="group overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <img
                    src={src!}
                    alt=""
                    width={400}
                    height={400}
                    loading="lazy"
                    decoding="async"
                    className="aspect-square w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-105"
                  />
                  <span className="sr-only">{album.title}</span>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Button variant="church" className="group" asChild>
              <Link to="/gallery">
                Open the gallery
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default GalleryPreview;
