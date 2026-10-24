import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DOMPurify from "dompurify";
import { Calendar, Clock, MapPin, ExternalLink, Images } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/layout/PageHeader";
import SEOHead from "@/components/seo/SEOHead";
import EventSchema from "@/components/seo/schemas/EventSchema";
import EventCard from "@/components/events/EventCard";
import EventRegisterForm from "@/components/events/EventRegisterForm";
import EventShare from "@/components/events/EventShare";
import EventAddToCalendar from "@/components/events/EventAddToCalendar";
import eventService from "@/services/event.service";
import {
  eventCoverAlt,
  eventCoverSrc,
  eventExcerpt,
  formatEventDate,
  formatEventTime,
  mapsDirectionsUrl,
  primaryCategory,
  registrationStatusLabel,
} from "@/lib/events";

const EventDetail = () => {
  const { slug = "" } = useParams<{ slug: string }>();

  const eventQuery = useQuery({
    queryKey: ["events", "slug", slug],
    queryFn: () => eventService.getBySlug(slug),
    enabled: Boolean(slug),
  });

  const relatedQuery = useQuery({
    queryKey: ["events", "related", slug],
    queryFn: () => eventService.getRelated(slug, 3),
    enabled: Boolean(slug) && eventQuery.isSuccess,
  });

  const event = eventQuery.data;
  const safeDescription = useMemo(
    () => DOMPurify.sanitize(event?.description ?? "", { USE_PROFILES: { html: true } }),
    [event?.description],
  );

  if (eventQuery.isLoading) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-16">
        <Skeleton className="mb-6 h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (eventQuery.isError || !event) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="font-serif text-3xl font-semibold text-church-charcoal">Event not found</h1>
        <p className="mt-3 text-muted-foreground">This event may have been unpublished or the link is incorrect.</p>
        <Button asChild variant="church" className="mt-6">
          <Link to="/events">Back to events</Link>
        </Button>
      </div>
    );
  }

  const category = primaryCategory(event);
  const time = formatEventTime(event);
  const reg = registrationStatusLabel(event);
  const directions = mapsDirectionsUrl(event);
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/events/${event.slug}` : `/events/${event.slug}`;
  const cancelled = event.event_state === "cancelled";
  const rescheduled = event.event_state === "rescheduled";
  const gallery = event.gallery_albums?.[0];

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <SEOHead
        title={event.name}
        description={eventExcerpt(event, 160)}
        path={`/events/${event.slug}`}
        image={eventCoverSrc(event)}
        imageAlt={eventCoverAlt(event)}
      />
      <EventSchema
        event={{
          name: event.name,
          description: eventExcerpt(event, 300),
          startDate: event.start_date,
          endDate: event.end_date || undefined,
          location: event.location || undefined,
          image: eventCoverSrc(event),
          url: `/events/${event.slug}`,
        }}
      />

      <PageHeader
        title={event.name}
        description={event.summary || undefined}
        eyebrow={category?.label || "Parish Event"}
        image={{ src: eventCoverSrc(event), alt: eventCoverAlt(event) }}
        tone="dark"
        size="compact"
        breadcrumbs={[
          { name: "Home", path: "/" },
          { name: "Events", path: "/events" },
          { name: event.name, path: `/events/${event.slug}` },
        ]}
      />

      <div className="container mx-auto max-w-5xl px-4 py-10 sm:py-12">
        {(cancelled || rescheduled) && (
          <div
            role="status"
            className={`mb-8 border px-4 py-3 text-sm ${
              cancelled
                ? "border-destructive/40 bg-destructive/5 text-destructive"
                : "border-church-gold-warm/40 bg-church-gold/10 text-church-charcoal"
            }`}
          >
            {cancelled
              ? "This event has been cancelled."
              : "This event has been rescheduled. Please review the updated date and time below."}
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <div className="overflow-hidden border border-church-gold-warm/15 bg-white">
              <img
                src={eventCoverSrc(event)}
                alt={eventCoverAlt(event)}
                width={900}
                height={560}
                className="aspect-[16/10] w-full object-cover"
              />
            </div>

            <div className="prose prose-neutral mt-8 max-w-none text-muted-foreground">
              <h2 className="font-serif text-xl font-semibold text-church-charcoal">About this event</h2>
              {safeDescription ? (
                <div
                  className="mt-3 space-y-3 leading-relaxed [&_a]:text-church-gold-warm [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: safeDescription }}
                />
              ) : (
                <p className="mt-3 whitespace-pre-wrap">{event.summary || "Details for this celebration will be shared soon."}</p>
              )}
            </div>

            {event.rsvp_enabled && (
              <div className="mt-10">
                <EventRegisterForm event={event} />
              </div>
            )}
          </div>

          <aside className="space-y-6 lg:col-span-5">
            <div className="border border-church-gold-warm/20 bg-white p-6">
              <h2 className="font-serif text-lg font-semibold text-church-charcoal">Event details</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-church-gold-warm" aria-hidden="true" />
                  <span>{formatEventDate(event)}</span>
                </li>
                {time && (
                  <li className="flex gap-2">
                    <Clock className="mt-0.5 h-4 w-4 shrink-0 text-church-gold-warm" aria-hidden="true" />
                    <span>{time}</span>
                  </li>
                )}
                {event.location && (
                  <li className="flex gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-church-gold-warm" aria-hidden="true" />
                    <span>
                      {event.location}
                      {event.venue_address ? (
                        <>
                          <br />
                          <span className="text-xs">{event.venue_address}</span>
                        </>
                      ) : null}
                    </span>
                  </li>
                )}
                {event.online_url && (
                  <li className="flex gap-2">
                    <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-church-gold-warm" aria-hidden="true" />
                    <a href={event.online_url} target="_blank" rel="noopener noreferrer" className="text-church-gold-warm underline-offset-4 hover:underline">
                      Join online
                    </a>
                  </li>
                )}
              </ul>

              {reg && (
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-church-gold-warm">{reg}</p>
              )}

              <div className="mt-6 flex flex-col gap-2">
                {event.rsvp_enabled && event.registration_open && !cancelled && (
                  <Button asChild variant="church">
                    <a href="#register">Register / RSVP</a>
                  </Button>
                )}
                {directions && (
                  <Button asChild variant="outlineGold">
                    <a href={directions} target="_blank" rel="noopener noreferrer">
                      Get directions
                    </a>
                  </Button>
                )}
                {gallery && (
                  <Button asChild variant="outline">
                    <Link to={`/gallery/${gallery.slug}`} className="gap-1.5">
                      <Images className="h-4 w-4" aria-hidden="true" />
                      View gallery
                    </Link>
                  </Button>
                )}
              </div>

              <div className="mt-6 space-y-3 border-t border-church-gold-warm/15 pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Add to calendar</p>
                <EventAddToCalendar event={event} />
              </div>

              <div className="mt-6 space-y-3 border-t border-church-gold-warm/15 pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Share</p>
                <EventShare title={event.name} url={shareUrl} />
              </div>
            </div>
          </aside>
        </div>

        {(relatedQuery.data?.length || 0) > 0 && (
          <section className="mt-16" aria-labelledby="related-events-heading">
            <h2 id="related-events-heading" className="mb-6 font-serif text-2xl font-semibold text-church-charcoal">
              Related upcoming events
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedQuery.data!.map((item) => (
                <EventCard key={item.id} event={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default EventDetail;
