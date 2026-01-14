/**
 * Sermon Form Page
 * 
 * Full-page form for creating and editing sermons.
 * Accessible via /admin/sermons/new and /admin/sermons/:id/edit routes.
 * 
 * Includes support for:
 * - Basic info (Title, Slug, Speaker, Preached Date)
 * - Taxonomy (Categories, Tags)
 * - Media (Audio, Video, Notes, Thumbnail)
 * - Enhanced editing (Rich Text for sermon notes)
 * - Settings (Featured, Published)
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  BookOpen,
  User,
  Calendar as CalendarIcon,
  Link as LinkIcon,
  FileText,
  Image as ImageIcon,
  X,
  Clock,
  Tag,
  Layers,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import sermonService, { Sermon, CreateSermonPayload, UpdateSermonPayload } from "@/services/sermon.service";
import categoryService from "@/services/category.service";
import tagService from "@/services/tag.service";
import { MultiSelect } from "@/components/ui/multi-select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { DatePicker } from "@/components/ui/date-picker";
import AttachmentUploadModal from "@/components/attachments/AttachmentUploadModal";
import { format } from "date-fns";

const SermonFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    speaker: "",
    preached_date: new Date(),
    series: "",
    scripture_reference: "",
    duration: "",
    video_url: "",
    audio_url: "",
    notes_url: "",
    thumbnail_url: "",
    sermon_notes: "",
    description: "",
    is_featured: false,
    is_published: true,
    category_ids: [] as string[],
    tag_ids: [] as string[],
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Draft attachment group id for new sermons
   */
  const [draftAttachmentGroupId] = useState(() => `sermon-draft-${Date.now()}`);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);

  // Fetch sermon if editing
  const { data: sermonData, isLoading: isLoadingSermon } = useQuery({
    queryKey: ["sermon", id],
    queryFn: () => sermonService.getById(id!),
    enabled: isEditMode && !!id,
  });

  // Fetch categories and tags
  const categoriesQuery = useQuery({
    queryKey: ["categories", "active"],
    queryFn: () => categoryService.list({ active: true }),
  });

  const tagsQuery = useQuery({
    queryKey: ["tags", "active"],
    queryFn: () => tagService.list({ active: true }),
  });

  // Initialize form data
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isEditMode && sermonData) {
        const sermon = {...sermonData?.data}
        setFormData({
          title: sermon.title || "",
          slug: sermon.slug || "",
          speaker: sermon.speaker || "",
          preached_date: sermon.preached_date || sermon.date ? new Date(sermon.preached_date || sermon.date || "") : new Date(),
          series: sermon.series || "",
          scripture_reference: sermon.scripture_reference || "",
          duration: sermon.duration || "",
          video_url: sermon.video_url || "",
          audio_url: sermon.audio_url || "",
          notes_url: sermon.notes_url || "",
          thumbnail_url: sermon.thumbnail_url || "",
          sermon_notes: sermon.sermon_notes || "",
          description: sermon.description || "",
          is_featured: sermon.is_featured ?? false,
          is_published: sermon.is_published ?? true,
          category_ids: (sermon.categories || []).map((c: any) => c.id),
          tag_ids: (sermon.tags || []).map((t: any) => t.id),
        });
        setImagePreview(sermon.thumbnail_url || null);
        setAutoGenerateSlug(false);
      } else if (!isEditMode) {
        setFormData({
          title: "",
          slug: "",
          speaker: "",
          preached_date: new Date(),
          series: "",
          scripture_reference: "",
          duration: "",
          video_url: "",
          audio_url: "",
          notes_url: "",
          thumbnail_url: "",
          sermon_notes: "",
          description: "",
          is_featured: false,
          is_published: true,
          category_ids: [],
          tag_ids: [],
        });
        setImagePreview(null);
        setAutoGenerateSlug(true);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [sermonData, isEditMode]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!autoGenerateSlug || !formData.title || isEditMode) return;

    const timeoutId = setTimeout(() => {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [formData.title, autoGenerateSlug, isEditMode]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateSermonPayload) => sermonService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sermons"] });
      toast({
        title: "Success",
        description: "Sermon created successfully",
      });
      navigate("/admin/sermons");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create sermon",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSermonPayload }) =>
      sermonService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sermons"] });
      queryClient.invalidateQueries({ queryKey: ["sermon", id] });
      toast({
        title: "Success",
        description: "Sermon updated successfully",
      });
      navigate("/admin/sermons");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update sermon",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const handleInputChange = (
    field: keyof typeof formData,
    value: any
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, thumbnail_url: "" }));
  };

  const handleSubmit = (saveAsPublished: boolean = true) => {
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Sermon title is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.speaker.trim()) {
      toast({
        title: "Validation Error",
        description: "Speaker is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const payload: CreateSermonPayload | UpdateSermonPayload = {
      title: formData.title.trim(),
      slug: formData.slug.trim() || undefined,
      speaker: formData.speaker.trim(),
      preached_date: format(formData.preached_date, "yyyy-MM-dd"),
      series: formData.series.trim() || undefined,
      scripture_reference: formData.scripture_reference.trim() || undefined,
      duration: formData.duration.trim() || undefined,
      video_url: formData.video_url.trim() || undefined,
      audio_url: formData.audio_url.trim() || undefined,
      notes_url: formData.notes_url.trim() || undefined,
      thumbnail_url: formData.thumbnail_url || undefined,
      sermon_notes: formData.sermon_notes.trim() || undefined,
      description: formData.description.trim() || undefined,
      is_featured: formData.is_featured,
      is_published: saveAsPublished ? formData.is_published : false,
      category_ids: formData.category_ids,
      tag_ids: formData.tag_ids,
    };

    if (isEditMode && id) {
      updateMutation.mutate({ id, data: payload });
    } else {
      createMutation.mutate(payload as CreateSermonPayload);
    }
  };

  if (isEditMode && isLoadingSermon) {
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
              <Link to="/admin/sermons">Sermons</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {isEditMode ? "Edit Sermon" : "Create Sermon"}
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
            onClick={() => navigate("/admin/sermons")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              {isEditMode ? "Edit Sermon" : "Create New Sermon"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode
                ? "Update sermon details and information"
                : "Fill in the details to create a new sermon"}
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
                <BookOpen className="h-5 w-5" />
                Sermon Information
              </CardTitle>
              <CardDescription>Basic details about the sermon preaching.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Sermon Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter sermon title..."
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  disabled={isSubmitting}
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="slug"
                    placeholder="sermon-url-slug"
                    value={formData.slug}
                    onChange={(e) => {
                      setAutoGenerateSlug(false);
                      handleInputChange("slug", e.target.value);
                    }}
                    disabled={isSubmitting}
                  />
                  {autoGenerateSlug && !isEditMode && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      Auto-generated
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="speaker">Speaker/Preacher <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="speaker"
                      placeholder="e.g., Fr. Anthony"
                      value={formData.speaker}
                      onChange={(e) => handleInputChange("speaker", e.target.value)}
                      className="pl-9"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="space-y-2 flex flex-col">
                  <Label htmlFor="preached_date">Preached Date <span className="text-destructive">*</span></Label>
                  <DatePicker
                    date={formData.preached_date}
                    onDateChange={(date) => handleInputChange("preached_date", date || new Date())}
                    placeholder="Select date"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="series">Sermon Series</Label>
                  <Input
                    id="series"
                    placeholder="e.g., Lenten Reflections"
                    value={formData.series}
                    onChange={(e) => handleInputChange("series", e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scripture_reference">Scripture Reference</Label>
                  <Input
                    id="scripture_reference"
                    placeholder="e.g., John 3:16"
                    value={formData.scripture_reference}
                    onChange={(e) => handleInputChange("scripture_reference", e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description/Summary</Label>
                <Textarea
                  id="description"
                  placeholder="Brief summary of the sermon..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Sermon Notes
              </CardTitle>
              <CardDescription>Full preaching notes or transcript.</CardDescription>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                value={formData.sermon_notes}
                onChange={(value) => handleInputChange("sermon_notes", value)}
                placeholder="Enter detailed sermon notes..."
                disabled={isSubmitting}
                minHeight="400px"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5" />
                Media & Resources
              </CardTitle>
              <CardDescription>Provide links to digital versions of the sermon.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="audio_url">Audio URL</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="audio_url"
                      type="url"
                      placeholder="https://..."
                      value={formData.audio_url}
                      onChange={(e) => handleInputChange("audio_url", e.target.value)}
                      className="pl-9"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="video_url">Video URL</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="video_url"
                      type="url"
                      placeholder="https://..."
                      value={formData.video_url}
                      onChange={(e) => handleInputChange("video_url", e.target.value)}
                      className="pl-9"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="notes_url">External Notes/PDF URL</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="notes_url"
                      type="url"
                      placeholder="https://..."
                      value={formData.notes_url}
                      onChange={(e) => handleInputChange("notes_url", e.target.value)}
                      className="pl-9"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="duration"
                      placeholder="e.g., 45:30"
                      value={formData.duration}
                      onChange={(e) => handleInputChange("duration", e.target.value)}
                      className="pl-9"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Thumbnail Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Thumbnail Preview"
                    className="w-full aspect-video object-cover rounded-lg border shadow-sm"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={removeImage}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setIsImageUploadOpen(true)}>
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Click to upload sermon thumbnail
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Taxonomy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <Layers className="h-3 w-3" /> Categories
                </Label>
                <MultiSelect
                  label={undefined}
                  options={(categoriesQuery.data?.data || []).map((c: any) => ({
                    value: c.id,
                    label: c.label,
                    description: c.slug,
                  }))}
                  value={formData.category_ids}
                  onValueChange={(next) => handleInputChange("category_ids", next)}
                  placeholder={categoriesQuery.isLoading ? "Loading..." : "Select categories..."}
                  searchPlaceholder="Search categories..."
                  disabled={isSubmitting || categoriesQuery.isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                  <Tag className="h-3 w-3" /> Tags
                </Label>
                <MultiSelect
                  label={undefined}
                  options={(tagsQuery.data?.data || []).map((t: any) => ({
                    value: t.id,
                    label: t.label,
                    description: t.slug,
                  }))}
                  value={formData.tag_ids}
                  onValueChange={(next) => handleInputChange("tag_ids", next)}
                  placeholder={tagsQuery.isLoading ? "Loading..." : "Select tags..."}
                  searchPlaceholder="Search tags..."
                  disabled={isSubmitting || tagsQuery.isLoading}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_published" className="cursor-pointer font-medium">
                    Published
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {formData.is_published ? "Visible to everyone" : "Hidden from public"}
                  </p>
                </div>
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => handleInputChange("is_published", checked)}
                  disabled={isSubmitting}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_featured" className="cursor-pointer font-medium">
                    Featured
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show in highlighted sections
                  </p>
                </div>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleInputChange("is_featured", checked)}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="lg:sticky lg:top-6">
            <CardContent className="p-4 space-y-2">
              <Button
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                <Save className="mr-2 h-5 w-5" />
                {isSubmitting
                  ? isEditMode ? "Updating..." : "Creating..."
                  : isEditMode ? "Update Sermon" : "Create Sermon"}
              </Button>
              {!isEditMode && (
                <Button
                  variant="secondary"
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  Save as Draft
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => navigate("/admin/sermons")}
                disabled={isSubmitting}
                className="w-full"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reusable Attachment Upload Modal for Thumbnail */}
      <AttachmentUploadModal
        open={isImageUploadOpen}
        onOpenChange={setIsImageUploadOpen}
        title="Upload Sermon Thumbnail"
        description="Upload an image to represent this sermon."
        relatedType="sermon"
        relatedId={isEditMode && id ? id : draftAttachmentGroupId}
        kinds={["image"]}
        onUploaded={(url) => {
          handleInputChange("thumbnail_url", url);
          setImagePreview(url);
        }}
      />
    </div>
  );
};

export default SermonFormPage;
