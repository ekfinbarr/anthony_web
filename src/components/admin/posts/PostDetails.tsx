/**
 * Post Details View Component
 * 
 * Read-only detailed view of a post with metadata and content preview.
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Post } from "@/services/post.service";
import { PostStatusBadge } from "./PostStatusBadge";
import {
  Calendar,
  User,
  Eye,
  FileText,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PostDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | null;
  onEdit?: (post: Post) => void;
  onDelete?: () => void;
}

export default function PostDetails({
  open,
  onOpenChange,
  post,
  onEdit,
  onDelete,
}: PostDetailsProps) {
  if (!post) return null;

  // Determine status
  const status: "draft" | "pending" | "approved" | "rejected" | "published" =
    post.archived
      ? "rejected"
      : post.published
      ? "published"
      : "draft";

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const timeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{post.title}</DialogTitle>
              <DialogDescription>
                <PostStatusBadge status={status} className="mt-2" />
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cover Image */}
          {post.image && (
            <div className="rounded-lg overflow-hidden border">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-64 object-cover"
              />
            </div>
          )}

          {/* Summary */}
          {post.summary && (
            <div className="bg-muted rounded-lg p-4 border-l-4 border-primary">
              <p className="text-sm font-medium mb-1">Summary</p>
              <p className="text-sm text-muted-foreground">{post.summary}</p>
            </div>
          )}

          {/* Content */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">Content</h3>
            </div>
            <div className="prose prose-sm max-w-none">
              <div
                className="text-sm text-foreground whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Post Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Author:</span>
                  <span className="font-medium">Unknown</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{post.type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Views:</span>
                  <span className="font-medium">{post.views || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Comments:</span>
                  <span className="font-medium">
                    {post.allow_comment ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Created:</span>
                  </div>
                  <p className="text-sm font-medium ml-6">
                    {formatDate(post.created_at)}
                  </p>
                  <p className="text-xs text-muted-foreground ml-6">
                    {timeAgo(post.created_at)}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Last Updated:</span>
                  </div>
                  <p className="text-sm font-medium ml-6">
                    {formatDate(post.updated_at)}
                  </p>
                  <p className="text-xs text-muted-foreground ml-6">
                    {timeAgo(post.updated_at)}
                  </p>
                </div>
                {post.slug && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Slug:</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {post.slug}
                    </code>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(post)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
          {post.published && (
            <Button variant="default" asChild>
              <a href={`/posts/${post.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Live
              </a>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

