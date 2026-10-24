import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ArrowRight, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import eventService, { type Event } from "@/services/event.service";
import { BannerIcon } from "@/components/icons/ParishIcons";
import { mediaUrl, unwrapList } from "./media";
import Reveal from "./Reveal";

function eventWhen(event: Event): string {
  let dateLabel: string;
  try {
    dateLabel = format(parseISO(event.start_date), "MMM d, yyyy");
  } catch {
    dateLabel = event.start_date;
  }
  const time = event.start_time?.slice(0, 5);
  return time ? `${dateLabel} · ${time}` : dateLabel;
}

const EventsPreview = () => {
  const query = useQuery({
    queryKey: ["events", "public-upcoming", "parish-home"],
    queryFn: () => eventService.getPublicUpcoming({ per_page: 3 }),
    staleTime: 5 * 60 * 1000,
  });

  const events = unwrapList<Event>(query.data).slice(0, 3);

  return (
    <section id="events" aria-labelledby="events-heading" className="scroll-mt-24 bg-church-pearl py-14 md:py-16">
      <Reveal>
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 id="events-heading" className="mb-3 font-heading text-3xl font-bold text-church-charcoal md:text-4xl">
              Events and activities
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Come and take part in what the parish is celebrating next.
            </p>
          </div>

          {query.isLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-40 w-full" />
              ))}
            </div>
          ) : query.isError ? (
            <p className="text-center text-muted-foreground">We couldn&apos;t load events just now. Please try again later.</p>
          ) : events.length === 0 ? (
            <p className="text-center text-muted-foreground">No upcoming events have been published yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {events.map((event) => {
                const image = mediaUrl(event.image);
                return (
                  <Card key={event.id} className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                    {image ? (
                      <img src={image} alt="" width={400} height={128} loading="lazy" decoding="async" className="h-32 w-full object-cover" />
                    ) : (
                      <div className="flex h-24 items-center justify-center bg-primary/10">
                        <BannerIcon size="md" />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <h3 className="mb-2 font-heading text-lg font-bold text-church-charcoal">
                        <Link to={event.slug ? `/events/${event.slug}` : "/events"} className="hover:text-church-gold-warm">
                          {event.name}
                        </Link>
                      </h3>
                      <p className="text-sm text-muted-foreground">{eventWhen(event)}</p>
                      {event.location && (
                        <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                          {event.location}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="mt-8 text-center">
            <Button variant="church" className="group" asChild>
              <Link to="/events">
                View events
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default EventsPreview;
