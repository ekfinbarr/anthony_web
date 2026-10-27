/**
 * Event Form Page
 * 
 * Full-page form for creating and editing events.
 * Accessible via /admin/events/new and /admin/events/:id/edit routes.
 * 
 * @package Lovable/src/pages/admin
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Save,
  ArrowLeft,
  Image as ImageIcon,
  X,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Globe,
  Lock
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import eventService, { Event, CreateEventPayload, UpdateEventPayload } from "@/services/event.service";
import categoryService from "@/services/category.service";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import AttachmentUploadModal from "@/components/attachments/AttachmentUploadModal";
import { ExternalLink } from "lucide-react";

import SubmitForReviewButton from "@/components/admin/shared/SubmitForReviewButton";
const EventFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEditMode = !!id;
  // "Create from calendar" passes ?date=YYYY-MM-DD&time=HH:mm to prefill the schedule.
  const [searchParams] = useSearchParams();
  const prefillDate = searchParams.get("date");
  const prefillTime = searchParams.get("time");
  const [draftAttachmentGroupId] = useState(() => `event-draft-${Date.now()}`);

  // Shared open states for the reusable upload modal.
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);

  // Form data state using Date objects and time objects for better UX
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    summary: "",
    start_date: undefined as Date | undefined,
    start_time: undefined as { hours: number; minutes: number } | undefined,
    end_date: undefined as Date | undefined,
    end_time: undefined as { hours: number; minutes: number } | undefined,
    is_all_day: false,
    location: "",
    venue_address: "",
    online_url: "",
    is_public: true,
    is_featured: false,
    is_published: true,
    rsvp_enabled: false,
    max_attendees: "",
    registration_deadline: undefined as Date | undefined,
    event_state: "scheduled",
    category_ids: [] as string[],
    image: "" as string,
  });

  const categoriesQuery = useQuery({
    queryKey: ["admin-event-categories"],
    queryFn: async () => {
      const res = await categoryService.list({ active: true });
      const all = res.data || [];
      const children = all.filter((c) => {
        const parent = all.find((p) => p.id === c.parent_id);
        return parent?.slug === "events";
      });
      return children.length ? children : all;
    },
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch event if editing
  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ["event", id],
    queryFn: () => eventService.getById(id!),
    enabled: isEditMode && !!id,
  });

  // Initialize form data from event
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isEditMode && event) {
        const eventData = event as Event;
        const startDate = eventData.start_date ? new Date(eventData.start_date) : undefined;
        const endDate = eventData.end_date ? new Date(eventData.end_date) : undefined;
        const startTime = eventData.start_date ? new Date(eventData.start_date) : undefined;
        const endTime = eventData.end_date ? new Date(eventData.end_date) : undefined;
        const isValidStartTime = startTime && !isNaN(startTime.getTime());
        const isValidEndTime = endTime && !isNaN(endTime.getTime());

        setFormData({
          name: eventData.name || "",
          slug: eventData.slug || "",
          description: eventData.description || "",
          summary: eventData.summary || "",
          start_date: startDate,
          start_time: isValidStartTime
            ? { hours: startTime!.getHours(), minutes: startTime!.getMinutes() }
            : undefined,
          end_date: endDate,
          end_time: isValidEndTime
            ? { hours: endTime!.getHours(), minutes: endTime!.getMinutes() }
            : undefined,
          is_all_day: Boolean(eventData.is_all_day),
          location: eventData.location || "",
          venue_address: eventData.venue_address || "",
          online_url: eventData.online_url || "",
          is_public: eventData.is_public ?? true,
          is_featured: Boolean(eventData.is_featured),
          is_published: eventData.is_published ?? true,
          rsvp_enabled: Boolean(eventData.rsvp_enabled),
          max_attendees: eventData.max_attendees ? String(eventData.max_attendees) : "",
          registration_deadline: eventData.registration_deadline
            ? new Date(eventData.registration_deadline)
            : undefined,
          event_state: eventData.event_state || "scheduled",
          category_ids: (eventData.categories || []).map((c) => c.id),
          image: typeof eventData.image === "string" ? eventData.image : "",
        });

        if (typeof eventData.image === "string" && eventData.image) {
          setImagePreview(eventData.image);
        } else {
          setImagePreview(null);
        }
      } else if (!isEditMode) {
        const date = prefillDate && /^\d{4}-\d{2}-\d{2}$/.test(prefillDate) ? new Date(`${prefillDate}T12:00:00`) : undefined;
        const timeMatch = prefillTime ? /^(\d{1,2}):(\d{2})$/.exec(prefillTime) : null;
        const start = timeMatch ? { hours: Number(timeMatch[1]), minutes: Number(timeMatch[2]) } : undefined;
        const end = start ? { hours: Math.min(start.hours + 1, 23), minutes: start.hours >= 23 ? 59 : start.minutes } : undefined;
        setFormData({
          name: "",
          slug: "",
          description: "",
          summary: "",
          start_date: date,
          start_time: start,
          end_date: undefined,
          end_time: end,
          is_all_day: false,
          location: "",
          venue_address: "",
          online_url: "",
          is_public: true,
          is_featured: false,
          is_published: true,
          rsvp_enabled: false,
          max_attendees: "",
          registration_deadline: undefined,
          event_state: "scheduled",
          category_ids: [],
          image: "",
        });
        setImagePreview(null);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [event, isEditMode, prefillDate, prefillTime]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateEventPayload) => eventService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Success",
        description: "Event created successfully",
      });
      navigate("/admin/events");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create event",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventPayload }) =>
      eventService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", id] });
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
      navigate("/admin/events");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  /**
   * Handle input field changes
   * Supports string, boolean, Date, and time object values
   */
  const handleInputChange = <K extends keyof typeof formData>(
    field: K,
    value: typeof formData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setFormData((prev) => ({ ...prev, image: result }));
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: "" }));
    setImagePreview(null);
  };

  /**
   * Handle form submission
   * Combines Date objects and time objects into ISO datetime strings for the API
   * Uses FormData when image file is present, otherwise uses JSON payload
   */
  const handleSubmit = (saveAsDraft: boolean = false) => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Event name is required *",
        variant: "destructive",
      });
      return;
    }

    if (!formData.start_date) {
      toast({
        title: "Validation Error",
        description: "Start date is required *",
        variant: "destructive",
      });
      return;
    }

    if (!formData.is_all_day && !formData.start_time) {
      toast({
        title: "Validation Error",
        description: "Start time is required unless the event is all-day *",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const startDateTime = new Date(formData.start_date);
    if (formData.is_all_day) {
      startDateTime.setHours(0, 0, 0, 0);
    } else if (formData.start_time) {
      startDateTime.setHours(formData.start_time.hours, formData.start_time.minutes, 0, 0);
    }

    const endDateTime =
      formData.end_date
        ? (() => {
            const end = new Date(formData.end_date);
            if (formData.is_all_day) end.setHours(23, 59, 0, 0);
            else if (formData.end_time) end.setHours(formData.end_time.hours, formData.end_time.minutes, 0, 0);
            return end;
          })()
        : undefined;

    const payload: CreateEventPayload | UpdateEventPayload = {
      name: formData.name.trim(),
      slug: formData.slug.trim() || undefined,
      description: formData.description.trim() || undefined,
      summary: formData.summary.trim() || undefined,
      image: formData.image || undefined,
      start_date: startDateTime.toISOString(),
      start_time: formData.is_all_day ? undefined : startDateTime.toISOString(),
      end_date: endDateTime?.toISOString(),
      end_time: endDateTime && !formData.is_all_day ? endDateTime.toISOString() : undefined,
      is_all_day: formData.is_all_day,
      location: formData.location.trim() || undefined,
      venue_address: formData.venue_address.trim() || undefined,
      online_url: formData.online_url.trim() || undefined,
      is_public: formData.is_public,
      is_featured: formData.is_featured,
      is_published: saveAsDraft ? false : formData.is_published,
      is_approved: saveAsDraft ? false : true,
      status: saveAsDraft ? "draft" : "published",
      rsvp_enabled: formData.rsvp_enabled,
      max_attendees: formData.max_attendees ? parseInt(formData.max_attendees, 10) : null,
      registration_deadline: formData.registration_deadline
        ? formData.registration_deadline.toISOString()
        : null,
      event_state: formData.event_state,
      category_ids: formData.category_ids,
    };

    if (isEditMode && id) {
      updateMutation.mutate({ id, data: payload });
    } else {
      createMutation.mutate(payload as CreateEventPayload);
    }
  };

  if (isEditMode && isLoadingEvent) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin">Admin</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/events">Events</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {isEditMode ? "Edit Event" : "Create Event"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/events")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              {isEditMode ? "Edit Event" : "Create New Event"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode
                ? "Update event details and information"
                : "Fill in the details to create a new event"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Event Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Event Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter event name..."
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={isSubmitting}
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug (optional)</Label>
                <Input
                  id="slug"
                  placeholder="auto-generated-from-name"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Short summary</Label>
                <Textarea
                  id="summary"
                  placeholder="Brief description for listings…"
                  value={formData.summary}
                  onChange={(e) => handleInputChange("summary", e.target.value)}
                  rows={2}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the event..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={6}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description.length} characters
                </p>
              </div>

              <div className="space-y-2">
                <Label>Categories</Label>
                <div className="flex flex-wrap gap-2">
                  {(categoriesQuery.data || []).map((cat) => {
                    const selected = formData.category_ids.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        disabled={isSubmitting}
                        onClick={() =>
                          handleInputChange(
                            "category_ids",
                            selected
                              ? formData.category_ids.filter((cid) => cid !== cat.id)
                              : [...formData.category_ids, cat.id],
                          )
                        }
                        className={`rounded border px-2.5 py-1 text-xs font-medium ${
                          selected
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Start Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <DatePicker
                    date={formData.start_date}
                    onDateChange={(date) => handleInputChange("start_date", date)}
                    placeholder="Select start date"
                    disabled={isSubmitting}
                    minDate={new Date()} // Prevent selecting past dates
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_time">
                    Start Time {!formData.is_all_day && <span className="text-destructive">*</span>}
                  </Label>
                  <TimePicker
                    time={formData.start_time}
                    onTimeChange={(time) => handleInputChange("start_time", time)}
                    placeholder="Select start time"
                    disabled={isSubmitting}
                    format="24h"
                    minuteInterval={5} // 5-minute intervals for easier selection
                  />
                </div>
              </div>

              {/* End Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <DatePicker
                    date={formData.end_date}
                    onDateChange={(date) => handleInputChange("end_date", date)}
                    placeholder="Select end date (optional)"
                    disabled={isSubmitting}
                    minDate={formData.start_date || new Date()} // End date must be after start date
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <TimePicker
                    time={formData.end_time}
                    onTimeChange={(time) => handleInputChange("end_time", time)}
                    placeholder="Select end time (optional)"
                    disabled={isSubmitting}
                    format="24h"
                    minuteInterval={5} // 5-minute intervals for easier selection
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-md border px-3 py-2">
                <div>
                  <Label htmlFor="is_all_day">All-day event</Label>
                  <p className="text-xs text-muted-foreground">No specific start/end time</p>
                </div>
                <Switch
                  id="is_all_day"
                  checked={formData.is_all_day}
                  onCheckedChange={(checked) => handleInputChange("is_all_day", checked)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Venue / Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="Event location..."
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="pl-9"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue_address">Full address</Label>
                <Input
                  id="venue_address"
                  placeholder="Street, city…"
                  value={formData.venue_address}
                  onChange={(e) => handleInputChange("venue_address", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="online_url">Online meeting URL</Label>
                <Input
                  id="online_url"
                  type="url"
                  placeholder="https://"
                  value={formData.online_url}
                  onChange={(e) => handleInputChange("online_url", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>

          {/* Banner Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Banner Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload an image for the banner
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsImageUploadOpen(true)}
                    disabled={isSubmitting}
                  >
                    Upload Banner Image
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Event Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_public" className="cursor-pointer">
                    Public Event
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {formData.is_public ? (
                      <span className="flex items-center gap-1">
                        <Globe className="h-3 w-3" />
                        Visible to all visitors
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Lock className="h-3 w-3" />
                        Only visible to members
                      </span>
                    )}
                  </p>
                </div>
                <Switch
                  id="is_public"
                  checked={formData.is_public}
                  onCheckedChange={(checked) => handleInputChange("is_public", checked)}
                  disabled={isSubmitting}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_featured" className="cursor-pointer">
                    Featured
                  </Label>
                  <p className="text-xs text-muted-foreground">Highlight on the Events page</p>
                </div>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleInputChange("is_featured", checked)}
                  disabled={isSubmitting}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_published" className="cursor-pointer">
                    Published
                  </Label>
                  <p className="text-xs text-muted-foreground">Visible on the public site</p>
                </div>
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => handleInputChange("is_published", checked)}
                  disabled={isSubmitting}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="event_state">Event status</Label>
                <Select
                  value={formData.event_state}
                  onValueChange={(v) => handleInputChange("event_state", v)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="event_state">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="rescheduled">Rescheduled</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="rsvp_enabled" className="cursor-pointer">
                    Enable RSVP
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Allow public registration for this event.
                  </p>
                </div>
                <Switch
                  id="rsvp_enabled"
                  checked={formData.rsvp_enabled}
                  onCheckedChange={(checked) => handleInputChange("rsvp_enabled", checked)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_attendees">Max attendees (blank = unlimited)</Label>
                <Input
                  id="max_attendees"
                  type="number"
                  min={0}
                  value={formData.max_attendees}
                  onChange={(e) => handleInputChange("max_attendees", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registration_deadline">Registration deadline</Label>
                <DatePicker
                  date={formData.registration_deadline}
                  onDateChange={(date) => handleInputChange("registration_deadline", date)}
                  placeholder="Optional"
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="lg:sticky lg:top-6">
            <CardContent className="p-4 space-y-2">
              <Button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                <Save className="mr-2 h-5 w-5" />
                {isSubmitting
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                    ? "Update Event"
                    : "Publish Event"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="w-full"
              >
                Save as draft
              </Button>
              {isEditMode && event?.slug && event.is_published && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={`/events/${event.slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Preview public page
                  </a>
                </Button>
              )}
              {isEditMode && id && formData.rsvp_enabled && (
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={() => {
                    const token = (() => {
                      try {
                        return JSON.parse(localStorage.getItem("church_user") || "{}")?.token;
                      } catch {
                        return null;
                      }
                    })();
                    const url = eventService.exportRsvpsUrl(id);
                    if (!token) {
                      toast({ title: "Sign in required", variant: "destructive" });
                      return;
                    }
                    fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: "text/csv" } })
                      .then(async (res) => {
                        if (!res.ok) throw new Error("Export failed");
                        const blob = await res.blob();
                        const href = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = href;
                        a.download = `event-${id}-rsvps.csv`;
                        a.click();
                        URL.revokeObjectURL(href);
                      })
                      .catch(() =>
                        toast({
                          title: "Could not export RSVPs",
                          variant: "destructive",
                        }),
                      );
                  }}
                >
                  Export RSVPs (CSV)
                </Button>
              )}
              <SubmitForReviewButton contentType="event" contentId={id} className="w-full" />
              <Button
                variant="outline"
                onClick={() => navigate("/admin/events")}
                disabled={isSubmitting}
                className="w-full"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Reusable Attachment Upload Modals */}
      {/* These modals upload to the backend and return a final public URL. */}
      <AttachmentUploadModal
        open={isImageUploadOpen}
        onOpenChange={setIsImageUploadOpen}
        title="Upload Image"
        description="Upload a photo."
        relatedType="event"
        relatedId={isEditMode && id ? id : draftAttachmentGroupId}
        kinds={["image"]}
        onUploaded={(url) => {
          setFormData((prev) => ({ ...prev, image: url }));
          setImagePreview(url);
        }}
      />
    </div>
  );
};

export default EventFormPage;

