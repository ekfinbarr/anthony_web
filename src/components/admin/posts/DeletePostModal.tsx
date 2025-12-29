/**
 * Delete Post Confirmation Modal
 * 
 * Provides a safe confirmation dialog for deleting posts.
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Post } from "@/services/post.service";
import { AlertTriangle } from "lucide-react";

interface DeletePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | null;
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function DeletePostModal({
  open,
  onOpenChange,
  post,
  onConfirm,
  isLoading = false,
}: DeletePostModalProps) {
  if (!post) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-destructive/10 p-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle>Delete Post</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-2">
            Are you sure you want to delete the following post?
          </p>
          <div className="bg-muted rounded-lg p-4 border">
            <p className="font-medium">{post.title}</p>
            {post.summary && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {post.summary}
              </p>
            )}
          </div>
          <p className="text-sm text-destructive mt-4 font-medium">
            ⚠️ This will permanently delete the post and all associated data.
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Deleting..." : "Delete Post"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

