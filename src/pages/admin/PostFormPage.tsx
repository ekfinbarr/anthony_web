/**
 * Post Form Page
 * 
 * Full-page form for creating and editing posts.
 * Accessible via /admin/posts/new and /admin/posts/:id/edit routes.
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  Image as ImageIcon,
  X,
  FileText,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import postService, { Post, CreatePostPayload, UpdatePostPayload } from "@/services/post.service";
import AttachmentUploadModal from "@/components/attachments/AttachmentUploadModal";
import { MultiSelect } from "@/components/ui/multi-select";
import categoryService from "@/services/category.service";
import tagService from "@/services/tag.service";

const PostFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    type: "text",
    slug: "",
    summary: "",
    content: "",
    published: false,
    image: "",
    // Video URL (optional). For video posts, this is the primary media URL.
    video: "",
    allow_comment: true,
    postType: "post",
    // Taxonomy selections (UUID arrays)
    category_ids: [] as string[],
    tag_ids: [] as string[],
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Draft attachment group id:
   * - Backend requires `related_id` for uploads.
   * - For new posts (no id yet), we upload under a stable "draft" id so multiple uploads
   *   in one session stay grouped.
   */
  const [draftAttachmentGroupId] = useState(() => `post-draft-${Date.now()}`);

  // Shared open states for the reusable upload modal.
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [isVideoUploadOpen, setIsVideoUploadOpen] = useState(false);

  // Fetch post if editing
  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ["post", id],
    queryFn: () => postService.getById(id!),
    enabled: isEditMode && !!id,
  });

  // Fetch categories/tags for the multi-selects
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
    // Use setTimeout to avoid synchronous state update in effect
    const timeoutId = setTimeout(() => {
      if (isEditMode && post) {
        const postData = { ...(post as Post)?.data || {} };
        setFormData({
          title: postData.title || "",
          slug: postData.slug || "",
          summary: postData.summary || "",
          content: postData.content || "",
          type: postData.type || "text",
          published: postData.published || false,
          image: postData.image || "",
          video: postData.video || "",
          allow_comment: postData.allow_comment ?? true,
          // Backend returns `post_type`. Keep a local `postType` for UI convenience.
          postType: postData.post_type || "post",
          category_ids: (postData.categories || []).map((c) => c.id),
          tag_ids: (postData.tags || []).map((t) => t.id),
        });
        setImagePreview(postData.image || null);
        setAutoGenerateSlug(false);

      } else if (!isEditMode) {
        // Reset form for new post
        setFormData({
          title: "",
          slug: "",
          summary: "",
          content: "",
          type: "text",
          published: false,
          image: "",
          video: "",
          allow_comment: true,
          postType: "post",
          category_ids: [],
          tag_ids: [],
        });
        setImagePreview(null);
        setAutoGenerateSlug(true);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [post, isEditMode]);

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
    mutationFn: (data: CreatePostPayload) => postService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Success",
        description: "Post created successfully",
      });
      navigate("/admin/posts");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostPayload }) =>
      postService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      toast({
        title: "Success",
        description: "Post updated successfully",
      });
      navigate("/admin/posts");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update post",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const removeVideo = () => {
    setFormData((prev) => ({ ...prev, video: "" }));
  };

  const handleSubmit = (saveAsDraft: boolean = false) => {
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Post title is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.content.trim()) {
      toast({
        title: "Validation Error",
        description: "Post content is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const payload: CreatePostPayload | UpdatePostPayload = {
      title: formData.title.trim(),
      slug: formData.slug.trim() || undefined,
      summary: formData.summary.trim() || undefined,
      content: formData.content.trim(),
      type: formData.type,
      // Backend expects snake_case `post_type`
      post_type: formData.postType || "post",
      published: saveAsDraft ? false : formData.published,
      image: formData.image || undefined,
      video: formData.video || undefined,
      allow_comment: formData.allow_comment,
      author_id: user?.id || "",
      // Taxonomy
      category_ids: formData.category_ids,
      tag_ids: formData.tag_ids,
    };

    if (isEditMode && id) {
      updateMutation.mutate({ id, data: payload });
    } else {
      createMutation.mutate(payload as CreatePostPayload);
    }
  };

  if (isEditMode && isLoadingPost) {
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
              <Link to="/admin/posts">Posts</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {isEditMode ? "Edit Post" : "Create Post"}
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
            onClick={() => navigate("/admin/posts")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              {isEditMode ? "Edit Post" : "Create New Post"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode
                ? "Update post details and content"
                : "Fill in the details to create a new post"}
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
                <FileText className="h-5 w-5" />
                Post Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter post title..."
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  disabled={isSubmitting}
                  className="text-base"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="slug"
                    placeholder="post-url-slug"
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

              {/* Select the type of content. Default is text */}
              <div className="space-y-2">
                <Label htmlFor="type">Content Type <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleInputChange("type", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>


              {/* Upload images form with preview. Only show if the post type is image */}
              {formData.type === "image" && (
                <div className="space-y-2">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-cover rounded-lg border"
                      />
                      {/* Remove current image */}
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
                        Upload an image and we’ll return the final URL for this post.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsImageUploadOpen(true)}
                        disabled={isSubmitting}
                      >
                        Upload Image
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Video section (upload OR paste a URL) */}
              {formData.type === "video" && (
                <div className="space-y-2">
                  <Label>Video</Label>

                  {/* Preview (if present) */}
                  {formData.video ? (
                    <div className="space-y-2">
                      {/* If it looks like a direct video file URL, show a player. Otherwise, show a link. */}
                      {/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(formData.video) ? (
                        <video src={formData.video} controls className="w-full h-64 rounded-lg border bg-black" />
                      ) : (
                        <a
                          href={formData.video}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-primary underline break-all"
                        >
                          {formData.video}
                        </a>
                      )}

                      <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsVideoUploadOpen(true)} disabled={isSubmitting}>
                          Change Video
                        </Button>
                        <Button type="button" variant="destructive" onClick={removeVideo} disabled={isSubmitting}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <p className="text-sm text-muted-foreground mb-3">
                        Upload a video file (recommended) or paste a video URL.
                      </p>
                      <Button type="button" variant="outline" onClick={() => setIsVideoUploadOpen(true)} disabled={isSubmitting}>
                        Upload / Paste Video URL
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="summary">Summary</Label>
                <Textarea
                  id="summary"
                  placeholder="Brief summary of the post (optional)..."
                  value={formData.summary}
                  onChange={(e) => handleInputChange("summary", e.target.value)}
                  rows={3}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.summary.length} characters
                </p>
              </div>



              {/* Content editor. Only show if the post type is text */}
              {formData.type === "text" && (
                <div className="space-y-2">
                  <Label htmlFor="content">
                    Content <span className="text-destructive">*</span>
                  </Label>
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => handleInputChange("content", value)}
                    placeholder="Write your post content here..."
                    disabled={isSubmitting}
                    minHeight="400px"
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.content.replace(/<[^>]*>/g, "").length} characters
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cover Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Cover Image
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
                    Upload a cover image and we’ll store the returned URL in the post.
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsImageUploadOpen(true)} disabled={isSubmitting}>
                    Upload Cover Image
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
              <CardTitle className="text-base">Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="type">Post Type</Label>
                <Select
                  value={formData.postType}
                  onValueChange={(value) => handleInputChange("postType", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="postType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="post">Post</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Categories: multi-select */}
              <div className="space-y-2">
                <Label htmlFor="categories">Categories</Label>
                <MultiSelect
                  label={undefined}
                  options={(categoriesQuery.data?.data || []).map((c) => ({
                    value: c.id,
                    label: c.label,
                    description: c.slug,
                  }))}
                  value={formData.category_ids}
                  onValueChange={(next) => handleInputChange("category_ids", next)}
                  placeholder={categoriesQuery.isLoading ? "Loading categories..." : "Select categories..."}
                  searchPlaceholder="Search categories..."
                  disabled={isSubmitting || categoriesQuery.isLoading}
                />
              </div>

              <Separator />

              {/* Tags: multi-select */}
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <MultiSelect
                  label={undefined}
                  options={(tagsQuery.data?.data || []).map((t) => ({
                    value: t.id,
                    label: t.label,
                    description: t.slug,
                  }))}
                  value={formData.tag_ids}
                  onValueChange={(next) => handleInputChange("tag_ids", next)}
                  placeholder={tagsQuery.isLoading ? "Loading tags..." : "Select tags..."}
                  searchPlaceholder="Search tags..."
                  disabled={isSubmitting || tagsQuery.isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="published">Status</Label>
                <Select
                  value={formData.published ? "published" : "draft"}
                  onValueChange={(value) =>
                    handleInputChange("published", value === "published")
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="published">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Label htmlFor="allow_comment" className="cursor-pointer">
                  Allow Comments
                </Label>
                <input
                  id="allow_comment"
                  type="checkbox"
                  checked={formData.allow_comment}
                  onChange={(e) =>
                    handleInputChange("allow_comment", e.target.checked)
                  }
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons - Sticky on mobile */}
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
                    ? "Update Post"
                    : "Create Post"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="w-full"
              >
                <Save className="mr-2 h-4 w-4" />
                Save as Draft
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/admin/posts")}
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
        relatedType="post"
        relatedId={isEditMode && id ? id : draftAttachmentGroupId}
        kinds={["image"]}
        onUploaded={(url) => {
          // Store the returned URL in the form (this is what gets saved in the Post record).
          setFormData((prev) => ({ ...prev, image: url }));
          // if content type is image, add the image to the content
          if (formData.type === "image") {
            setFormData((prev) => ({ ...prev, content: prev.content ? prev.content + `<img src="${url}" alt="Image" />` : `<img src="${url}" alt="Image" />` }));
          }
          setImagePreview(url);
        }}
      />

      <AttachmentUploadModal
        open={isVideoUploadOpen}
        onOpenChange={setIsVideoUploadOpen}
        title="Upload Video"
        description="Upload a video file or paste a URL."
        relatedType="post"
        relatedId={isEditMode && id ? id : draftAttachmentGroupId}
        kinds={["video"]}
        allowUrlPaste
        onUploaded={(url) => {
          setFormData((prev) => ({ ...prev, video: url, content: prev.content ? prev.content + `<video src="${url}" controls></video>` : `<video src="${url}" controls></video>` }));
        }}
      />
    </div>
  );
};

export default PostFormPage;

