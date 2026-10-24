import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Livestream } from "@/services/livestream.service";
import { formatLagosCompact } from "@/lib/liveTimezone";
import { livestreamThumbnail } from "@/components/live/liveMedia";
import { site } from "@/config/site";

type RecentCelebrationsProps = {
  items: Livestream[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
};

const RecentCelebrations = ({
  items,
  isLoading,
  hasMore,
  onLoadMore,
  loadingMore,
}: RecentCelebrationsProps) => {
  return (
    <section id="recent-celebrations" className="scroll-mt-24" aria-labelledby="recent-heading">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-church-gold-warm">
          Archive
        </p>
        <h2 id="recent-heading" className="mt-1 font-serif text-2xl font-bold text-church-charcoal sm:text-3xl">
          Recent celebrations
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-church-charcoal/70 sm:text-base">
          Watch previous Masses and parish celebrations when recordings have been published.
        </p>
      </div>

      {isLoading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-video w-full" />
          ))}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="rounded-lg border border-dashed border-church-stone/40 bg-white/50 px-5 py-10 text-center">
          <p className="text-sm text-church-charcoal/75">
            No recordings are published yet. When previous livestreams are made available, they will
            appear here.
          </p>
          <Button asChild variant="outline" className="mt-4 rounded-full">
            <a href={site.social.youtube} target="_blank" rel="noopener noreferrer">
              Visit our YouTube channel
            </a>
          </Button>
        </div>
      )}

      {!isLoading && items.length > 0 && (
        <>
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => {
              const thumb = livestreamThumbnail(item);
              return (
                <li key={item.id}>
                  <Link
                    to={`/live/${item.id}`}
                    className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-gold-warm focus-visible:ring-offset-2"
                  >
                    <div className="relative aspect-video overflow-hidden bg-church-stone/25">
                      {thumb ? (
                        <img
                          src={thumb}
                          alt=""
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                          loading="lazy"
                        />
                      ) : (
                        <span className="flex h-full items-center justify-center bg-church-brown/90 text-white">
                          <Play className="h-10 w-10" aria-hidden="true" />
                        </span>
                      )}
                      <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/35 motion-reduce:group-hover:bg-transparent">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-church-brown opacity-0 shadow transition group-hover:opacity-100 motion-reduce:opacity-100">
                          <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                          Watch
                        </span>
                      </span>
                    </div>
                    <h3 className="mt-3 font-serif text-lg font-semibold text-church-charcoal group-hover:text-church-gold-warm">
                      {item.title}
                    </h3>
                    {(item.end_time || item.scheduled_start_time) && (
                      <p className="mt-1 text-sm text-church-charcoal/65">
                        {formatLagosCompact(item.end_time || item.scheduled_start_time)}
                      </p>
                    )}
                    {item.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-church-charcoal/70">
                        {item.description}
                      </p>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {hasMore && onLoadMore && (
            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={onLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading…" : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default RecentCelebrations;
