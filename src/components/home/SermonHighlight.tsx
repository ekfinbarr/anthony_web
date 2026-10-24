import { useQuery } from "@tanstack/react-query";
import { Play, Headphones, FileText, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import sermonService from "@/services/sermon.service";
import {
  formatSermonDate,
  sermonThumbnail,
} from "@/components/sermons/sermonMedia";
import { PulpitIcon } from "@/components/icons/ParishIcons";

const SermonHighlight = () => {
  const { data: latest = [], isLoading } = useQuery({
    queryKey: ["sermons", "latest", 4],
    queryFn: () => sermonService.getLatest({ limit: 4 }),
  });

  const featured = latest[0];
  const recent = latest.slice(1, 4);
  const thumb = featured ? sermonThumbnail(featured) : undefined;
  const date = featured
    ? formatSermonDate(featured.preached_date || featured.date)
    : "";

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-church-pearl to-background">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-40" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!featured) {
    return (
      <section className="py-16 bg-gradient-to-b from-church-pearl to-background">
        <div className="container mx-auto flex flex-col items-center px-4 text-center">
          <PulpitIcon size="lg" className="mb-4 opacity-70" />
          <h2 className="font-heading text-2xl font-bold text-church-charcoal">Sermons</h2>
          <p className="mt-2 max-w-md text-muted-foreground">
            Homilies and teachings will appear here soon.
          </p>
          <Button variant="church" className="mt-6" asChild>
            <Link to="/sermons">Browse sermons</Link>
          </Button>
        </div>
      </section>
    );
  }

  const watchHref = `/sermons?sermon=${encodeURIComponent(featured.slug)}`;

  return (
    <section className="py-16 bg-gradient-to-b from-church-pearl to-background">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative group">
            <Link
              to={watchHref}
              className="relative block overflow-hidden rounded-lg shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {thumb ? (
                <img
                  loading="lazy"
                  decoding="async"
                  src={thumb}
                  alt={featured.title}
                  className="w-full h-auto aspect-video object-cover"
                />
              ) : (
                <div className="flex aspect-video w-full items-center justify-center bg-church-brown text-church-gold-soft">
                  <PulpitIcon size="hero" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-church-charcoal/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                    <Play className="h-8 w-8 ml-1" />
                  </span>
                </div>
              </div>
            </Link>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-church shape-diamond opacity-20" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-church-stone shape-hexagon" />
          </div>

          <div>
            <div className="mb-6">
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">
                Latest Message
              </span>
              <h2 className="text-4xl font-heading font-bold text-church-charcoal mt-2 mb-4">
                {featured.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-4">
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  {featured.speaker}
                </span>
                {date ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {date}
                  </span>
                ) : null}
              </div>
              {featured.description ? (
                <p className="text-base text-muted-foreground mb-6 line-clamp-3">
                  {featured.description}
                </p>
              ) : null}
              {featured.series ? (
                <div className="inline-block px-4 py-2 bg-church-stone rounded-lg mb-8">
                  <span className="text-sm font-medium">Series: {featured.series}</span>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              <Button variant="church" size="lg" asChild>
                <Link to={watchHref}>
                  <Play className="mr-2 h-5 w-5" />
                  Watch Sermon
                </Link>
              </Button>
              {featured.audio_url ? (
                <Button variant="outlineGold" size="lg" asChild>
                  <Link to={watchHref}>
                    <Headphones className="mr-2 h-5 w-5" />
                    Listen
                  </Link>
                </Button>
              ) : null}
              {featured.notes_url || featured.sermon_notes ? (
                <Button variant="outline" size="lg" asChild>
                  <Link to={watchHref}>
                    <FileText className="mr-2 h-5 w-5" />
                    Notes
                  </Link>
                </Button>
              ) : null}
            </div>

            <Card className="p-6 bg-card hover:bg-card-hover transition-colors">
              <h3 className="font-heading font-semibold text-lg mb-4">Recent Messages</h3>
              <div className="space-y-3">
                {recent.length === 0 ? (
                  <p className="text-sm text-muted-foreground">More messages coming soon.</p>
                ) : (
                  recent.map((sermon) => (
                    <Link
                      key={sermon.id}
                      to={`/sermons?sermon=${encodeURIComponent(sermon.slug)}`}
                      className="flex items-center justify-between py-2 hover:text-primary transition-colors"
                    >
                      <div>
                        <p className="font-medium">{sermon.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatSermonDate(sermon.preached_date || sermon.date)}
                        </p>
                      </div>
                      <Play className="h-4 w-4 text-primary shrink-0" />
                    </Link>
                  ))
                )}
              </div>
              <Button variant="link" className="p-0 mt-4" asChild>
                <Link to="/sermons">View All Sermons →</Link>
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SermonHighlight;
