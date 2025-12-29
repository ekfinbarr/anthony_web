/**
 * Post Form Component
 * 
 * Create and edit post form with rich text editor, image upload, and metadata.
 */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Post, CreatePostPayload, UpdatePostPayload } from "@/services/post.service";
import { Save, FileText, Image as ImageIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PostFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | null;
  onSubmit: (data: CreatePostPayload | UpdatePostPayload) => void;
  isLoading?: boolean;
}

export default function PostForm({
  open,
  onOpenChange,
  post,
  onSubmit,
  isLoading = false,
}: PostFormProps) {
  const { toast } = useToast();
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

  // Initialize form data when post changes
  useEffect(() => {
    if (!open) return;
    
    // Use setTimeout to avoid synchronous state update in effect
    const timeoutId = setTimeout(() => {
      if (post) {
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
      } else {
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
  }, [post, open]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!autoGenerateSlug || !formData.title) return;
    
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    
    // Use setTimeout to avoid synchronous state update in effect
    const timeoutId = setTimeout(() => {
      setFormData((prev) => ({ ...prev, slug }));
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [formData.title, autoGenerateSlug]);

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
      // For now, create a preview URL
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

    const payload: CreatePostPayload | UpdatePostPayload = {
      title: formData.title.trim(),
      slug: formData.slug.trim() || undefined,
      summary: formData.summary.trim() || undefined,
      content: formData.content.trim(),
      type: formData.type,
      published: saveAsDraft ? false : formData.published,
      image: formData.image || undefined,
      allow_comment: formData.allow_comment,
    };

    onSubmit(payload);
  };

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{post ? "Edit Post" : "Create New Post"}</DialogTitle>
          <DialogDescription>
            {post
              ? "Update post details and content"
              : "Fill in the details to create a new post"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter post title..."
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                disabled={isLoading}
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
                  disabled={isLoading}
                />
                {autoGenerateSlug && (
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
                disabled={isLoading}
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
                rows={12}
                className="font-mono text-sm"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                {formData.content.length} characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Cover Image</Label>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <span className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </span>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                      disabled={isLoading}
                    />
                  </Label>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSubmit(true)}
            disabled={isLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            Save as Draft
          </Button>
          <Button onClick={() => handleSubmit(false)} disabled={isLoading}>
            {post ? "Update Post" : "Create Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

