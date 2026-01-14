import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import calendarService, { CalendarEvent } from "@/services/calendar.service";
import { Plus, Trash2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Admin Calendar Management
 *
 * Minimal CRUD UI:
 * - List current month events (public/published in backend; admin endpoints return all via middleware)
 * - Create event
 * - Delete event
 *
 * This follows the existing admin UI patterns (cards + tables + dialogs).
 */
export default function AdminCalendar() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const now = new Date();
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth() + 1);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [start, setStart] = useState("");
  const [startTime, setStartTime] = useState<{ hours: number; minutes: number } | undefined>();
  const [end, setEnd] = useState("");
  const [endTime, setEndTime] = useState<{ hours: number; minutes: number } | undefined>();
  const [category, setCategory] = useState<"parish" | "liturgical" | "general">("parish");
  const [liturgicalRank, setLiturgicalRank] = useState("");
  const [type, setType] = useState("event");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const query = useQuery({
    queryKey: ["admin-calendar-month", year, month],
    queryFn: () => calendarService.getMonth(year, month),
  });

  const events = useMemo(() => query.data?.data || [], [query.data]);

  const createMutation = useMutation({
    mutationFn: () =>
      calendarService.createEvent({
        title,
        start_datetime: start,
        end_datetime: end || undefined,
        category,
        liturgical_rank: liturgicalRank || undefined,
        type,
        location: location || undefined,
        description: description || undefined,
        is_all_day: false,
        is_public: true,
        is_published: true,
      }),
    onSuccess: () => {
      toast({ title: "Created", description: "Calendar event created." });
      setOpen(false);
      setTitle("");
      setStart("");
      setEnd("");
      setCategory("parish");
      setLiturgicalRank("");
      setType("event");
      setLocation("");
      setDescription("");
      qc.invalidateQueries({ queryKey: ["admin-calendar-month", year, month] });
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to create event";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => calendarService.deleteEvent(id),
    onSuccess: () => {
      toast({ title: "Deleted", description: "Event deleted." });
      qc.invalidateQueries({ queryKey: ["admin-calendar-month", year, month] });
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to delete event";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground mt-1">Manage parish celebrations and liturgical observances.</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create Calendar Event</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="cal-title">Title</Label>
                <Input id="cal-title" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="cal-type">Type (legacy)</Label>
                {/* <Input id="cal-type" value={type} onChange={(e) => setType(e.target.value)} placeholder="event | mass | service ..." /> */}
                <Select
                  value={type}
                  onValueChange={(value) => setType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="mass">Mass</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="cal-start">Start (datetime)</Label>
                {/* <Input id="cal-start" value={start} onChange={(e) => setStart(e.target.value)} placeholder="2026-01-01 09:00:00" /> */}

                <DatePicker
                  date={new Date(start)}
                  onDateChange={(date) => setStart(date?.toISOString() || "")}
                  placeholder="Select start date"
                  minDate={new Date()} // Prevent selecting past dates
                />
                <TimePicker
                  time={startTime}
                  onTimeChange={(time) => {
                    if (start && time) {
                      const startDate = new Date(start);
                      startDate.setHours(time.hours || 0, time.minutes || 0);
                      setStart(startDate.toISOString());
                    }
                    setStartTime(time);
                  }}
                  placeholder="Select start time"
                  disabled={!start}
                  format="24h"
                  minuteInterval={5} // 5-minute intervals for easier selection
                />

              </div>
              <div className="space-y-1">
                <Label htmlFor="cal-end">End (datetime, optional)</Label>
                {/* <Input id="cal-end" value={end} onChange={(e) => setEnd(e.target.value)} placeholder="2026-01-01 10:00:00" /> */}
                <DatePicker
                  date={new Date(end)}
                  onDateChange={(date) => setEnd(date?.toISOString() || "")}
                  placeholder="Select end date"
                  minDate={new Date(start)} // Prevent selecting past dates
                  disabled={!start}
                />

                <TimePicker
                  time={endTime}
                  onTimeChange={(time) => {
                    if (end && time) {
                      const endDate = new Date(end);
                      endDate.setHours(time.hours || 0, time.minutes || 0);
                      setEnd(endDate.toISOString());
                    }
                    setEndTime(time);
                  }}
                  placeholder="Select end time"
                  disabled={!end}
                  format="24h"
                  minuteInterval={5} // 5-minute intervals for easier selection
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cal-category">Category</Label>
                {/* <Input
                  id="cal-category"
                  value={category}
                  onChange={(e) => {
                    const v = e.target.value as "parish" | "liturgical" | "general";
                    setCategory(v);
                  }}
                  placeholder="parish | liturgical | general"
                /> */}
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value as "parish" | "liturgical" | "general")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="parish">Parish</SelectItem>
                    <SelectItem value="liturgical">Liturgical</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="cal-rank">Liturgical rank (optional)</Label>
                {/* <Input id="cal-rank" value={liturgicalRank} onChange={(e) => setLiturgicalRank(e.target.value)} placeholder="solemnity | feast | memorial ..." /> */}
                <Select
                  value={liturgicalRank}
                  onValueChange={(value) => setLiturgicalRank(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select liturgical rank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solemnity">Solemnity</SelectItem>
                    <SelectItem value="feast">Feast</SelectItem>
                    <SelectItem value="memorial">Memorial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="cal-location">Location</Label>
                {/* Link or address input */}
                <Input id="cal-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Link or address..." />
              </div>
              <div className="space-y-1 md:col-span-2">
                <Label htmlFor="cal-desc">Description</Label>
                <Textarea id="cal-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Description..." />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Events ({query.data?.meta?.month_name} {year})</CardTitle>
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <p className="text-muted-foreground">Loading…</p>
          ) : query.isError ? (
            <p className="text-destructive">Failed to load events.</p>
          ) : events.length === 0 ? (
            <p className="text-muted-foreground">No events yet.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="w-[90px] text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((e: CalendarEvent) => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">{e.title}</TableCell>
                      <TableCell>{new Date(e.start_datetime).toLocaleString()}</TableCell>
                      <TableCell className="capitalize">{e.category || "parish"}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(e.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


