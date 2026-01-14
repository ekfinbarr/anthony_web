/**
 * Mass Schedule Form Page
 * 
 * Full-page form for creating and editing mass schedules.
 * Accessible via /admin/schedules/new and /admin/schedules/:id/edit routes.
 * 
 * @package Lovable/src/pages/admin
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
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
  Clock,
  Calendar,
  MapPin,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import massScheduleService, { MassSchedule, CreateMassSchedulePayload, UpdateMassSchedulePayload } from "@/services/massSchedule.service";

const ScheduleFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    day_of_week: "",
    start_time: "",
    end_time: "",
    language: "",
    type: "",
    description: "",
    location: "",
    capacity: "",
    is_active: true,
    booking_required: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch schedule if editing
  const { data: schedule, isLoading: isLoadingSchedule } = useQuery({
    queryKey: ["mass-schedule", id],
    queryFn: () => massScheduleService.getById(id!),
    enabled: isEditMode && !!id,
  });

  // Initialize form data
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isEditMode && schedule) {
        const scheduleData = { ...(schedule as MassSchedule)?.data || {} };
        setFormData({
          title: scheduleData.title || "",
          day_of_week: schedule.day_of_week || "",
          start_time: scheduleData.start_time || "",
          end_time: scheduleData.end_time || "",
          language: scheduleData.language || "",
          type: scheduleData.type || "",
          description: scheduleData.description || "",
          location: scheduleData.location || "",
          capacity: scheduleData.capacity?.toString() || "",
          is_active: scheduleData.is_active ?? true,
          booking_required: scheduleData.booking_required ?? false,
        });
      } else if (!isEditMode) {
        setFormData({
          title: "",
          day_of_week: "",
          start_time: "",
          end_time: "",
          language: "",
          type: "",
          description: "",
          location: "",
          capacity: "",
          is_active: true,
          booking_required: false,
        });
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [schedule, isEditMode]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateMassSchedulePayload) => massScheduleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mass-schedules"] });
      toast({
        title: "Success",
        description: "Schedule created successfully",
      });
      navigate("/admin/schedules");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create schedule",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMassSchedulePayload }) =>
      massScheduleService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mass-schedules"] });
      queryClient.invalidateQueries({ queryKey: ["mass-schedule", id] });
      toast({
        title: "Success",
        description: "Schedule updated successfully",
      });
      navigate("/admin/schedules");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update schedule",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Schedule title is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.day_of_week) {
      toast({
        title: "Validation Error",
        description: "Day of week is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.start_time) {
      toast({
        title: "Validation Error",
        description: "Start time is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const payload: CreateMassSchedulePayload | UpdateMassSchedulePayload = {
      title: formData.title.trim(),
      day_of_week: formData.day_of_week,
      start_time: formData.start_time,
      end_time: formData.end_time || undefined,
      language: formData.language || undefined,
      type: formData.type || undefined,
      description: formData.description.trim() || undefined,
      location: formData.location.trim() || undefined,
      capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
      is_active: formData.is_active,
      booking_required: formData.booking_required,
    };

    if (isEditMode && id) {
      updateMutation.mutate({ id, data: payload });
    } else {
      createMutation.mutate(payload as CreateMassSchedulePayload);
    }
  };

  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];

  if (isEditMode && isLoadingSchedule) {
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
              <Link to="/admin/schedules">Schedules</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {isEditMode ? "Edit Schedule" : "Create Schedule"}
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
            onClick={() => navigate("/admin/schedules")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              {isEditMode ? "Edit Mass Schedule" : "Create Mass Schedule"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode
                ? "Update schedule details and information"
                : "Fill in the details to create a new mass schedule"}
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
                <Clock className="h-5 w-5" />
                Schedule Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="e.g., Sunday Morning Mass"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  disabled={isSubmitting}
                  className="text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="day_of_week">
                    Day of Week <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.day_of_week}
                    onValueChange={(value) => handleInputChange("day_of_week", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Mass Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange("type", value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="special">Special</SelectItem>
                      <SelectItem value="holiday">Holiday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">
                    Start Time <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => handleInputChange("start_time", e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => handleInputChange("end_time", e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    placeholder="e.g., English, Igbo, Yoruba"
                    value={formData.language}
                    onChange={(e) => handleInputChange("language", e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="Maximum capacity"
                    value={formData.capacity}
                    onChange={(e) => handleInputChange("capacity", e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="e.g., Main Church, Chapel"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                    className="pl-9"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Additional details about this schedule..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Active
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {formData.is_active
                      ? "Schedule is visible"
                      : "Schedule is hidden"}
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                  disabled={isSubmitting}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="booking_required" className="cursor-pointer">
                    Booking Required
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {formData.booking_required
                      ? "Attendees must book in advance"
                      : "No booking required"}
                  </p>
                </div>
                <Switch
                  id="booking_required"
                  checked={formData.booking_required}
                  onCheckedChange={(checked) => handleInputChange("booking_required", checked)}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="lg:sticky lg:top-6">
            <CardContent className="p-4 space-y-2">
              <Button
                onClick={handleSubmit}
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
                    ? "Update Schedule"
                    : "Create Schedule"}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/admin/schedules")}
                disabled={isSubmitting}
                className="w-full"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ScheduleFormPage;

