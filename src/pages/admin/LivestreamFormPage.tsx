/**
 * Livestream Form Page
 * 
 * Full-page form for creating and editing livestreams.
 * Accessible via /admin/livestream/new and /admin/livestream/:id/edit routes.
 * 
 * @package Lovable/src/pages/admin
 */

import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Save,
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  MonitorPlay,
  CheckCircle2,
  XCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import livestreamService, { CreateLivestreamPayload, UpdateLivestreamPayload } from "@/services/livestream.service";

// Define the schema for the form
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  platform: z.enum(["youtube", "facebook", "tiktok", "twitch", "instagram", "twitter", "rumble", "bitchute", "brighteon", "odysee", "peerTube", "others"]),
  platform_video_id: z.string().optional(),
  embed_html: z.string().optional(),
  scheduled_date: z.date().optional(),
  scheduled_time: z.object({ hours: z.number(), minutes: z.number() }).optional(),
  actual_date: z.date().optional(),
  actual_time: z.object({ hours: z.number(), minutes: z.number() }).optional(),
  end_date: z.date().optional(),
  end_time: z.object({ hours: z.number(), minutes: z.number() }).optional(),
  is_live: z.boolean().default(false),
}).refine((data) => {
  if (data.platform !== 'others' && !data.platform_video_id && !data.embed_html) {
    return false;
  }
  return true;
}, {
  message: "Either Video ID or Embed HTML is required for this platform",
  path: ["platform_video_id"],
});

type FormValues = z.infer<typeof formSchema>;

const LivestreamFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  // Fetch livestream if editing
  const { data: livestream, isLoading: isLoadingLivestream } = useQuery({
    queryKey: ["livestream", id],
    queryFn: () => livestreamService.getById(id!),
    enabled: isEditMode && !!id,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      platform: "youtube",
      is_live: false,
      platform_video_id: "",
      embed_html: "",
      scheduled_date: undefined,
      scheduled_time: undefined,
      actual_date: undefined,
      actual_time: undefined,
      end_date: undefined,
      end_time: undefined,
    },
  });


  // Populate form when data is loaded
  useEffect(() => {
    if (livestream) {
      const livestreamData = { ...livestream?.data };
      form.reset({
        title: livestreamData.title,
        description: livestreamData.description || "",
        platform: livestreamData.platform,
        platform_video_id: livestreamData.platform_video_id || "",
        embed_html: livestreamData.embed_html || "",
        is_live: livestreamData.is_live,
        scheduled_date: livestreamData.scheduled_start_time ? new Date(livestreamData.scheduled_start_time) : undefined,
        scheduled_time: livestreamData.scheduled_start_time ? {
          hours: new Date(livestreamData.scheduled_start_time).getHours(),
          minutes: new Date(livestreamData.scheduled_start_time).getMinutes()
        } : undefined,
        actual_date: livestreamData.actual_start_time ? new Date(livestreamData.actual_start_time) : undefined,
        actual_time: livestreamData.actual_start_time ? {
          hours: new Date(livestreamData.actual_start_time).getHours(),
          minutes: new Date(livestreamData.actual_start_time).getMinutes()
        } : undefined,
        end_date: livestreamData.end_time ? new Date(livestreamData.end_time) : undefined,
        end_time: livestreamData.end_time ? {
          hours: new Date(livestreamData.end_time).getHours(),
          minutes: new Date(livestreamData.end_time).getMinutes()
        } : undefined,
      });
    }
  }, [livestream, form]);

  const watchedPlatform = form.watch("platform");
  const watchedVideoId = form.watch("platform_video_id");
  const watchedEmbedHtml = form.watch("embed_html");

  // Helper to combine date and time
  const combineDateAndTime = (date?: Date, time?: { hours: number; minutes: number }) => {
    if (!date) return undefined;
    const result = new Date(date);
    if (time) {
      result.setHours(time.hours);
      result.setMinutes(time.minutes);
    }
    return result.toISOString();
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateLivestreamPayload) => livestreamService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["livestreams"] });
      toast({ title: "Success", description: "Livestream created successfully" });
      navigate("/admin/livestream");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLivestreamPayload }) =>
      livestreamService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["livestreams"] });
      queryClient.invalidateQueries({ queryKey: ["livestream", id] });
      toast({ title: "Success", description: "Livestream updated successfully" });
      navigate("/admin/livestream");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const onSubmit = (data: FormValues) => {
    const payload: CreateLivestreamPayload = {
      title: data.title,
      description: data.description,
      platform: data.platform,
      platform_video_id: data.platform_video_id,
      embed_html: data.embed_html,
      is_live: data.is_live,
      scheduled_start_time: combineDateAndTime(data.scheduled_date, data.scheduled_time),
      actual_start_time: combineDateAndTime(data.actual_date, data.actual_time),
      end_time: combineDateAndTime(data.end_date, data.end_time),
    };

    if (isEditMode && id) {
      updateMutation.mutate({ id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Preview Generation Logic
  const getPreviewContent = () => {
    if (watchedEmbedHtml) {
      return <div dangerouslySetInnerHTML={{ __html: watchedEmbedHtml }} className="aspect-video w-full rounded-md overflow-hidden bg-black" />;
    }

    if (watchedPlatform === 'youtube' && watchedVideoId) {
      return (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${watchedVideoId}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="aspect-video w-full rounded-md bg-black"
        ></iframe>
      );
    }

    if (watchedPlatform === 'vimeo' && watchedVideoId) {
      return (
        <iframe
          src={`https://player.vimeo.com/video/${watchedVideoId}`}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="aspect-video w-full rounded-md bg-black"
        ></iframe>
      );
    }

    return (
      <div className="aspect-video w-full rounded-md bg-muted flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
        <MonitorPlay className="h-12 w-12 mb-2 opacity-50" />
        <p>Preview will appear here when you add a valid Video ID or Embed HTML</p>
      </div>
    );
  };

  if (isEditMode && isLoadingLivestream) {
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
          </CardContent>
        </Card>
      </div>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
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
              <Link to="/admin/livestream">Live Streaming</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {isEditMode ? "Edit Stream" : "Create Stream"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/livestream")}
          className="shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            {isEditMode ? "Edit Livestream" : "Create Livestream"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEditMode
              ? "Update livestream details and settings"
              : "Schedule or start a new livestream"}
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Video className="h-5 w-5 text-primary" />
                    Stream Details
                  </CardTitle>
                  <CardDescription>
                    Provide the core details for your livestream event.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Sunday Morning Mass" {...field} className="text-lg" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add details about the event..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Platform & Source */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MonitorPlay className="h-5 w-5 text-primary" />
                    Platform & Source
                  </CardTitle>
                  <CardDescription>
                    Configure where your stream is hosted and how it should appear.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="youtube">YouTube</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                            <SelectItem value="tiktok">TikTok</SelectItem>
                            <SelectItem value="twitch">Twitch</SelectItem>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="twitter">X (Twitter)</SelectItem>
                            <SelectItem value="rumble">Rumble</SelectItem>
                            <SelectItem value="bitchute">BitChute</SelectItem>
                            <SelectItem value="brighteon">Brighteon</SelectItem>
                            <SelectItem value="odysee">Odysee</SelectItem>
                            <SelectItem value="peerTube">PeerTube</SelectItem>
                            <SelectItem value="others">Other / Custom Embed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="platform_video_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Video ID</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. dQw4w9WgXcQ" {...field} />
                          </FormControl>
                          <FormDescription>
                            The unique ID from the platform URL.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="col-span-full">
                      <FormField
                        control={form.control}
                        name="embed_html"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Embed Code (HTML)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="<iframe src='...'></iframe>"
                                className="font-mono text-sm"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Paste full embed code here if not using Video ID.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  {/* Live Preview */}
                  <div className="space-y-2 pt-4">
                    <Label className="text-base font-semibold">Preview</Label>
                    <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
                      {getPreviewContent()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scheduling - Start Time */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Calendar className="h-5 w-5 text-primary" />
                    Schedule & Timing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Scheduled Start */}
                    <div className="space-y-4">
                      <Label className="text-muted-foreground font-semibold uppercase text-xs tracking-wider">Scheduled Start</Label>
                      <div className="flex gap-2">
                        <FormField
                          control={form.control}
                          name="scheduled_date"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <DatePicker
                                  date={field.value}
                                  onDateChange={field.onChange}
                                  placeholder="Select date"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="scheduled_time"
                          render={({ field }) => (
                            <FormItem className="w-[140px]">
                              <FormControl>
                                <TimePicker
                                  time={field.value}
                                  onTimeChange={field.onChange}
                                  format="12h"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* End Time */}
                    <div className="space-y-4">
                      <Label className="text-muted-foreground font-semibold uppercase text-xs tracking-wider">End Time (Optional)</Label>
                      <div className="flex gap-2">
                        <FormField
                          control={form.control}
                          name="end_date"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <DatePicker
                                  date={field.value}
                                  onDateChange={field.onChange}
                                  placeholder="Select date"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="end_time"
                          render={({ field }) => (
                            <FormItem className="w-[140px]">
                              <FormControl>
                                <TimePicker
                                  time={field.value}
                                  onTimeChange={field.onChange}
                                  format="12h"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Actual Start Time (for manual override or records) */}
                    <div className="space-y-4 border-t pt-4 md:col-span-2">
                      <Label className="text-muted-foreground font-semibold uppercase text-xs tracking-wider flex items-center gap-2">
                        Actual Start Time
                        <span className="text-[10px] font-normal normal-case bg-muted px-2 py-0.5 rounded text-foreground">Usually auto-set when you go live</span>
                      </Label>
                      <div className="flex gap-2 md:w-1/2 pr-1">
                        <FormField
                          control={form.control}
                          name="actual_date"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <DatePicker
                                  date={field.value}
                                  onDateChange={field.onChange}
                                  placeholder="Select date"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="actual_time"
                          render={({ field }) => (
                            <FormItem className="w-[140px]">
                              <FormControl>
                                <TimePicker
                                  time={field.value}
                                  onTimeChange={field.onChange}
                                  format="12h"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publication Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Visibility & Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="is_live"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Live Status</FormLabel>
                            <FormDescription>
                              Toggle this to show the stream as "LIVE" on the site.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />

                  <div className={`p-4 rounded-md border text-sm flex gap-3 ${watchedPlatform === 'youtube' ? 'bg-red-50 text-red-900 border-red-100' : 'bg-muted/50'}`}>
                    <div className="shrink-0 mt-0.5">
                      {watchedPlatform === 'youtube' ? <Video className="h-4 w-4" /> : <MonitorPlay className="h-4 w-4" />}
                    </div>
                    <div>
                      <p className="font-medium mb-1">Platform: {watchedPlatform?.charAt(0)?.toUpperCase() + watchedPlatform?.slice(1)}</p>
                      <p className="opacity-90 leading-relaxed">
                        Ensure your stream privacy settings on {watchedPlatform} correspond to your intent (Public/Unlisted).
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card className="lg:sticky lg:top-6">
                <CardContent className="p-4 space-y-3">
                  <Button
                    type="submit"
                    className="w-full text-base font-semibold shadow-md transition-all hover:translate-y-[-1px]"
                    size="lg"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="h-5 w-5" />
                        {isEditMode ? "Update Stream" : "Create Stream"}
                      </span>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/admin/livestream")}
                    disabled={isSaving}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default LivestreamFormPage;
