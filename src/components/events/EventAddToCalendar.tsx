import { CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Event } from "@/services/event.service";
import { buildGoogleCalendarUrl, downloadIcs } from "@/lib/events";

type EventAddToCalendarProps = {
  event: Event;
};

const EventAddToCalendar = ({ event }: EventAddToCalendarProps) => {
  const { toast } = useToast();
  const googleUrl = buildGoogleCalendarUrl(event);

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Add to calendar">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => {
          const ok = downloadIcs(event);
          toast({
            title: ok ? "Calendar file downloaded" : "Could not create calendar file",
            description: ok
              ? "Open the .ics file in your calendar app."
              : "This event is missing a valid start date.",
            variant: ok ? "default" : "destructive",
          });
        }}
      >
        <CalendarPlus className="h-3.5 w-3.5" aria-hidden="true" />
        Download ICS
      </Button>
      {googleUrl && (
        <Button type="button" variant="outline" size="sm" asChild>
          <a href={googleUrl} target="_blank" rel="noopener noreferrer">
            Google Calendar
          </a>
        </Button>
      )}
    </div>
  );
};

export default EventAddToCalendar;
