import { Link } from "react-router-dom";
import { Calendar, Clock, MapPin, ChevronRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import eventService, { Event } from "@/services/event.service";
import bannerPhoto from "@/assets/images/church_banner.jpg";
import EventSchema from "@/components/seo/schemas/EventSchema";
import { toIsoDateTime } from "@/lib/seo/schema";

/**
 * UpcomingEvents Component
 * 
 * Displays upcoming public events on the home page.
 * Fetches events from the backend API with proper business logic filtering:
 * - Only shows public events (is_public = true)
 * - Only shows published events (is_published = true)
 * - Only shows approved events (is_approved = true)
 * - Only shows events with status = 'published'
 * - Only shows upcoming events (start_date >= current date)
 * 
 * Features:
 * - Real-time data fetching with React Query
 * - Loading skeleton states
 * - Error handling with user-friendly messages
 * - Empty state when no events available
 * - Proper date/time formatting
 * - Image handling with fallback
 * - Responsive grid layout
 * 
 * @component
 */
const UpcomingEvents = () => {
  /**
   * Fetch upcoming public events from the backend
   * 
   * Uses React Query for:
   * - Automatic caching
   * - Background refetching
   * - Loading and error states
   * - Stale-while-revalidate pattern
   */
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['events', 'public-upcoming', { per_page: 3 }],
    queryFn: () => eventService.getPublicUpcoming({ per_page: 3 }),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  /**
   * Format date to human-readable format
   * Example: "2024-11-18T09:00:00Z" -> "Nov 18, 2024"
   */
  const formatDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  /**
   * Format time to 12-hour format
   * Example: "2024-11-18T09:00:00Z" -> "9:00 AM"
   */
  const formatTime = (dateTimeString: string): string => {
    try {
      const date = parseISO(dateTimeString);
      return format(date, 'h:mm a');
    } catch {
      return dateTimeString;
    }
  };

  /**
   * Format time range for display
   * Handles cases where end_time might be null
   */
  const formatTimeRange = (event: Event): string => {
    const startTime = formatTime(event.start_time);

    if (event.end_time) {
      const endTime = formatTime(event.end_time);
      return `${startTime} - ${endTime}`;
    }

    return startTime;
  };

  /**
   * Get image URL with fallback
   * Handles both full URLs and relative paths from backend
   * Also handles File objects (though in practice, fetched events will always have string URLs)
   */
  const getImageUrl = (image: string | File | undefined): string => {
    if (!image) return bannerPhoto;

    // If image is a File object, create an object URL
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }

    // If image is already a full URL, use it
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }

    // If image is a relative path, prepend the storage URL
    // Assuming Laravel storage is accessible via /storage
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';
    return `${baseUrl}/storage/${image}`;
  };

  return (
    <section className="py-16 bg-church-pearl">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-4 accent-line inline-block">
            Upcoming Events
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join us for Mass, fellowship, and parish events throughout the month
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load events. {error instanceof Error ? error.message : 'Please try again later.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!isLoading && !isError && data?.data.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No upcoming events at the moment. Check back soon!
            </p>
          </div>
        )}

        {/* Events Grid */}
        {!isLoading && !isError && data && data.data.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {data.data.map((event) => (
                <Card key={event.id} className="overflow-hidden card-hover group">
                  {/* Event Image */}
                  <div className="h-48 overflow-hidden">
                    <img
                      src={getImageUrl(event?.image)}
                      alt=""
                      width={400}
                      height={192}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback to default image if loading fails
                        const target = e.target as HTMLImageElement;
                        target.src = bannerPhoto;
                      }}
                    />
                  </div>

                  {(() => {
                    const startDate = toIsoDateTime(event.start_date, event.start_time);
                    return startDate ? (
                      <EventSchema
                        event={{
                          name: event.name,
                          description: event.description || undefined,
                          startDate,
                          endDate: event.end_time || event.end_date ? toIsoDateTime(event.end_date ?? event.start_date, event.end_time) : undefined,
                          location: event.location || undefined,
                          image: typeof event.image === "string" && event.image ? getImageUrl(event.image) : undefined,
                          url: event.slug ? `/events/${event.slug}` : "/events",
                        }}
                      />
                    ) : null;
                  })()}
                  <CardHeader>
                    {/* Event Status Badge (optional - could show event type/category if available) */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold px-3 py-1 bg-gradient-church text-church-charcoal rounded-full">
                        Event
                      </span>
                    </div>

                    {/* Event Title */}
                    <CardTitle className="font-heading text-xl line-clamp-2">
                      <Link to={event.slug ? `/events/${event.slug}` : "/events"} className="hover:text-church-gold-warm">
                        {event.name}
                      </Link>
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    {/* Event Description */}
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {event.description || 'No description available'}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-2">
                      {/* Date */}
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 text-primary mr-2 flex-shrink-0" aria-hidden="true" />
                        <time dateTime={event.start_date}>{formatDate(event.start_date)}</time>
                      </div>

                      {/* Time */}
                      <div className="flex items-center text-sm">
                        <Clock className="h-4 w-4 text-primary mr-2 flex-shrink-0" aria-hidden="true" />
                        <span>{formatTimeRange(event)}</span>
                      </div>

                      {/* Location */}
                      {event.location && (
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 text-primary mr-2 flex-shrink-0" aria-hidden="true" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Learn More Link */}
                    <Button variant="link" className="p-0 mt-4 group" asChild>
                      <Link
                        to={event.slug ? `/events/${event.slug}` : "/events"}
                        aria-label={`View details for ${event.name}`}
                      >
                        View details
                        <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <Button variant="church" size="lg" asChild>
                <Link to="/events">
                  View All Events
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default UpcomingEvents;