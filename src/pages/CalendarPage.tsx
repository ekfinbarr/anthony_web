import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import calendarService, { CalendarEvent } from "@/services/calendar.service";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Copy, ExternalLink } from "lucide-react";

/**
 * Public Calendar Page
 *
 * - Shows a month view as a grouped list (simple and fast).
 * - Provides an iCal subscription URL so users can subscribe with Google/Apple/Outlook.
 */
export default function CalendarPage() {
  const { toast } = useToast();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12

  const monthQuery = useQuery({
    queryKey: ["calendar-month", year, month],
    queryFn: () => calendarService.getMonth(year, month),
  });

  const groupedByDay = useMemo(() => {
    const events = (monthQuery.data?.data || []) as CalendarEvent[];
    const map = new Map<string, CalendarEvent[]>();

    for (const e of events) {
      const day = new Date(e.start_datetime).toISOString().slice(0, 10);
      const list = map.get(day) || [];
      list.push(e);
      map.set(day, list);
    }

    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [monthQuery.data]);

  const monthName = monthQuery.data?.meta?.month_name || new Date(year, month - 1, 1).toLocaleString("en", { month: "long" });

  const handlePrevMonth = () => {
    const d = new Date(year, month - 2, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  };

  const handleNextMonth = () => {
    const d = new Date(year, month, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  };

  const icsUrl = useMemo(() => calendarService.getIcsUrl(), []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(icsUrl);
      toast({ title: "Copied", description: "Calendar subscription link copied." });
    } catch {
      toast({ title: "Copy failed", description: "Please copy the link manually.", variant: "destructive" });
    }
  };

  const googleSubscribeUrl = useMemo(() => {
    // Google Calendar "Add by URL" uses the `cid` query param (calendar ID = ICS URL).
    const url = new URL("https://calendar.google.com/calendar/u/0/r");
    url.searchParams.set("cid", icsUrl);
    return url.toString();
  }, [icsUrl]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="mx-auto mb-3 w-12 h-12 rounded-lg bg-gradient-church flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-church-charcoal mb-3">Parish Calendar</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A bird-eye view of parish celebrations and liturgical observances—subscribe to receive reminders in your calendar app.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 space-y-8">
        <Card>
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              {monthName} {year}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrevMonth} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextMonth} className="gap-2">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {monthQuery.isLoading ? (
              <p className="text-muted-foreground">Loading events…</p>
            ) : monthQuery.isError ? (
              <p className="text-destructive">Failed to load calendar events.</p>
            ) : groupedByDay.length === 0 ? (
              <p className="text-muted-foreground">No events for this month.</p>
            ) : (
              <div className="space-y-6">
                {groupedByDay.map(([day, events]) => (
                  <div key={day} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="font-semibold text-foreground">{new Date(day).toDateString()}</div>
                    <div className="mt-3 space-y-3">
                      {events.map((e) => (
                        <div key={e.id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-3 rounded-lg bg-muted/40">
                          <div>
                            <div className="font-medium text-foreground flex items-center gap-2">
                              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: e.color || "#007bff" }} />
                              {e.title}
                            </div>
                            {e.location && <div className="text-sm text-muted-foreground">{e.location}</div>}
                          </div>
                          <div className="flex items-center gap-2">
                            {e.category && <Badge variant="secondary" className="capitalize">{e.category}</Badge>}
                            {e.liturgical_rank && <Badge variant="outline" className="capitalize">{e.liturgical_rank.replace(/_/g, " ")}</Badge>}
                            <Badge variant="outline" className="capitalize">{e.type}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscribe to the Calendar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-muted-foreground">
              Use the link below to subscribe in Google Calendar, Apple Calendar, or Outlook. Your calendar app will handle reminders/notifications.
            </p>
            <div className="p-3 rounded-md bg-muted text-sm break-all">
              {icsUrl}
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleCopy} className="gap-2">
                <Copy className="h-4 w-4" />
                Copy link
              </Button>
              <Button asChild className="gap-2">
                <a href={googleSubscribeUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="h-4 w-4" />
                  Open in Google Calendar
                </a>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Apple Calendar: “File → New Calendar Subscription…” (Mac) or “Settings → Calendar → Accounts → Add Subscribed Calendar” (iPhone).
              Outlook: “Add calendar → Subscribe from web”.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


