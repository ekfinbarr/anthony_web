/**
 * Livestream Form Page — create/edit livestreams for the public /live experience.
 */

import { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Save,
  ArrowLeft,
  Calendar,
  Video,
  MonitorPlay,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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
import livestreamService, {
  CreateLivestreamPayload,
  LivestreamStatus,
  UpdateLivestreamPayload,
} from "@/services/livestream.service";
import { combineLagosDateAndTime, lagosDateAndTimeFromIso } from "@/lib/liveTimezone";

const formSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    platform: z.enum([
      "youtube",
      "facebook",
      "tiktok",
      "twitch",
      "instagram",
      "twitter",
      "rumble",
      "bitchute",
      "brighteon",
      "odysee",
      "peerTube",
      "others",
      "vimeo",
    ]),
    platform_video_id: z.string().optional(),
    embed_html: z.string().optional(),
    recorded_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
    thumbnail_url: z.string().url("Enter a valid URL").optional().or(z.literal("")),
    scheduled_date: z.date().optional(),
    scheduled_time: z.object({ hours: z.number(), minutes: z.number() }).optional(),
    actual_date: z.date().optional(),
    actual_time: z.object({ hours: z.number(), minutes: z.number() }).optional(),
    end_date: z.date().optional(),
    end_time: z.object({ hours: z.number(), minutes: z.number() }).optional(),
    status: z.enum(["scheduled", "live", "ended", "cancelled", "unavailable"]),
    is_published: z.boolean().default(true),
  })
  .refine(
    (data) => {
      if (data.platform !== "others" && !data.platform_video_id && !data.embed_html) {
        return false;
      }
      return true;
    },
    {
      message: "Either Video ID or Embed HTML is required for this platform",
      path: ["platform_video_id"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

const LivestreamFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

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
      status: "scheduled",
      is_published: true,
      platform_video_id: "",
      embed_html: "",
      recorded_url: "",
      thumbnail_url: "",
    },
  });

  useEffect(() => {
    if (!livestream) return;
    const scheduled = lagosDateAndTimeFromIso(livestream.scheduled_start_time);
    const actual = lagosDateAndTimeFromIso(livestream.actual_start_time);
    const end = lagosDateAndTimeFromIso(livestream.end_time);
    form.reset({
      title: livestream.title,
      description: livestream.description || "",
      platform: livestream.platform,
      platform_video_id: livestream.platform_video_id || "",
      embed_html: livestream.embed_html || "",
      recorded_url: livestream.recorded_url || "",
      thumbnail_url: livestream.thumbnail_url || "",
      status: (livestream.status as LivestreamStatus) || (livestream.is_live ? "live" : "scheduled"),
      is_published: livestream.is_published ?? true,
      scheduled_date: scheduled.date,
      scheduled_time: scheduled.time,
      actual_date: actual.date,
      actual_time: actual.time,
      end_date: end.date,
      end_time: end.time,
    });
  }, [livestream, form]);

  const watchedPlatform = form.watch("platform");
  const watchedVideoId = form.watch("platform_video_id");
  const watchedEmbedHtml = form.watch("embed_html");
  const watchedStatus = form.watch("status");

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
    mutationFn: ({ id: streamId, data }: { id: string; data: UpdateLivestreamPayload }) =>
      livestreamService.update(streamId, data),
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
      platform_video_id: data.platform_video_id || undefined,
      embed_html: data.embed_html || undefined,
      recorded_url: data.recorded_url || null,
      thumbnail_url: data.thumbnail_url || null,
      status: data.status,
      is_live: data.status === "live",
      is_published: data.is_published,
      scheduled_start_time: combineLagosDateAndTime(data.scheduled_date, data.scheduled_time),
      actual_start_time: combineLagosDateAndTime(data.actual_date, data.actual_time),
      end_time: combineLagosDateAndTime(data.end_date, data.end_time),
    };

    if (isEditMode && id) {
      updateMutation.mutate({ id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const getPreviewContent = () => {
    if (watchedEmbedHtml) {
      return (
        <div
          dangerouslySetInnerHTML={{ __html: watchedEmbedHtml }}
          className="aspect-video w-full overflow-hidden rounded-md bg-black"
        />
      );
    }
    if (watchedPlatform === "youtube" && watchedVideoId) {
      return (
        <iframe
          title="YouTube preview"
          src={`https://www.youtube.com/embed/${watchedVideoId}`}
          className="aspect-video w-full rounded-md bg-black"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      );
    }
    if (watchedPlatform === "vimeo" && watchedVideoId) {
      return (
        <iframe
          title="Vimeo preview"
          src={`https://player.vimeo.com/video/${watchedVideoId}`}
          className="aspect-video w-full rounded-md bg-black"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    }
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center rounded-md bg-muted p-6 text-center text-muted-foreground">
        <MonitorPlay className="mb-2 h-12 w-12 opacity-50" />
        <p>Preview appears when you add a Video ID or Embed HTML</p>
      </div>
    );
  };

  if (isEditMode && isLoadingLivestream) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6 pb-12">
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
            <BreadcrumbPage>{isEditMode ? "Edit Stream" : "Create Stream"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/livestream")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="font-heading text-3xl font-bold">
            {isEditMode ? "Edit Livestream" : "Create Livestream"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Times are entered in Africa/Lagos (WAT). The LIVE badge on the public site requires
            status Live or the Activate action.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Video className="h-5 w-5 text-primary" />
                    Stream Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Title <span className="text-destructive">*</span>
                        </FormLabel>
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
                          <Textarea placeholder="Add details about the celebration…" className="min-h-[120px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="thumbnail_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thumbnail URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://…" {...field} />
                        </FormControl>
                        <FormDescription>Optional poster image shown before playback.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MonitorPlay className="h-5 w-5 text-primary" />
                    Platform &amp; Source
                  </CardTitle>
                  <CardDescription>
                    Use an approved provider Video ID or a sanitized iframe embed.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="youtube">YouTube</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                            <SelectItem value="vimeo">Vimeo</SelectItem>
                            <SelectItem value="tiktok">TikTok</SelectItem>
                            <SelectItem value="twitch">Twitch</SelectItem>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="twitter">X (Twitter)</SelectItem>
                            <SelectItem value="rumble">Rumble</SelectItem>
                            <SelectItem value="odysee">Odysee</SelectItem>
                            <SelectItem value="peerTube">PeerTube</SelectItem>
                            <SelectItem value="others">Other / Custom Embed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="platform_video_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Video ID</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. dQw4w9WgXcQ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="embed_html"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Embed Code (HTML)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="<iframe …>" className="min-h-[100px] font-mono text-sm" {...field} />
                        </FormControl>
                        <FormDescription>
                          Only iframes from allowlisted hosts are kept after save.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="recorded_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recording URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://youtube.com/watch?v=…" {...field} />
                        </FormControl>
                        <FormDescription>
                          Published after the livestream ends. Shown under Recent Celebrations.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2 pt-2">
                    <Label className="text-base font-semibold">Preview</Label>
                    <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
                      {getPreviewContent()}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Calendar className="h-5 w-5 text-primary" />
                    Schedule (Africa/Lagos)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Scheduled start
                      </Label>
                      <div className="flex gap-2">
                        <FormField
                          control={form.control}
                          name="scheduled_date"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <DatePicker date={field.value} onDateChange={field.onChange} placeholder="Date" />
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
                                <TimePicker time={field.value} onTimeChange={field.onChange} format="12h" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        End time
                      </Label>
                      <div className="flex gap-2">
                        <FormField
                          control={form.control}
                          name="end_date"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <DatePicker date={field.value} onDateChange={field.onChange} placeholder="Date" />
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
                                <TimePicker time={field.value} onTimeChange={field.onChange} format="12h" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="space-y-4 border-t pt-4 md:col-span-2">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Actual start (optional)
                      </Label>
                      <div className="flex gap-2 md:w-1/2">
                        <FormField
                          control={form.control}
                          name="actual_date"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <DatePicker date={field.value} onDateChange={field.onChange} placeholder="Date" />
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
                                <TimePicker time={field.value} onTimeChange={field.onChange} format="12h" />
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

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Visibility &amp; Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Broadcast status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="live">Live</SelectItem>
                            <SelectItem value="ended">Ended</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="unavailable">Unavailable</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Prefer Activate/Deactivate on the list page for going live so other streams
                          are ended automatically.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {watchedStatus === "live" && (
                    <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                      LIVE will show on the public site only while status is Live and the stream is
                      published. Staff must update status when Mass ends (or set an end time).
                    </p>
                  )}
                  <FormField
                    control={form.control}
                    name="is_published"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Published</FormLabel>
                            <FormDescription>
                              Unpublished streams are hidden from the public /live page.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                  <div className="rounded-md border bg-muted/50 p-4 text-sm">
                    <p className="font-medium">Platform: {watchedPlatform}</p>
                    <p className="mt-1 leading-relaxed opacity-90">
                      Keep provider privacy settings aligned with your intent (Public / Unlisted).
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:sticky lg:top-6">
                <CardContent className="space-y-3 p-4">
                  <Button type="submit" className="w-full text-base font-semibold" size="lg" disabled={isSaving}>
                    {isSaving ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Saving…
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
