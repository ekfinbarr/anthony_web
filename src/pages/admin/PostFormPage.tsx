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

const PostFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    summary: "",
    content: "",
    type: "post",
    published: false,
    image: "",
    allow_comment: true,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [autoGenerateSlug, setAutoGenerateSlug] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch post if editing
  const { data: post, isLoading: isLoadingPost } = useQuery({
    queryKey: ["post", id],
    queryFn: () => postService.getById(id!),
    enabled: isEditMode && !!id,
  });

  // Initialize form data
  useEffect(() => {
    // Use setTimeout to avoid synchronous state update in effect
    const timeoutId = setTimeout(() => {
      if (isEditMode && post) {
        setFormData({
          title: post.title || "",
          slug: post.slug || "",
          summary: post.summary || "",
          content: post.content || "",
          type: post.type || "post",
          published: post.published || false,
          image: post.image || "",
          allow_comment: post.allow_comment ?? true,
        });
        setImagePreview(post.image || null);
        setAutoGenerateSlug(false);
      } else if (!isEditMode) {
        // Reset form for new post
        setFormData({
          title: "",
          slug: "",
          summary: "",
          content: "",
          type: "post",
          published: false,
          image: "",
          allow_comment: true,
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
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to a server
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData((prev) => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: "" }));
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
      published: saveAsDraft ? false : formData.published,
      image: formData.image || undefined,
      allow_comment: formData.allow_comment,
      author_id: user?.id || "",
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

              <div className="space-y-2">
                <Label htmlFor="content">
                  Content <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="Write your post content here..."
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  rows={16}
                  className="font-mono text-sm min-h-[400px]"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.content.length} characters
                </p>
              </div>
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
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <span className="text-sm text-muted-foreground block mb-2">
                      Click to upload or drag and drop
                    </span>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={isSubmitting}
                    />
                    <Button type="button" variant="outline" size="sm" asChild>
                      <span>Choose File</span>
                    </Button>
                  </Label>
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
                  value={formData.type}
                  onValueChange={(value) => handleInputChange("type", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="type">
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

              <Separator />

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
    </div>
  );
};

export default PostFormPage;

