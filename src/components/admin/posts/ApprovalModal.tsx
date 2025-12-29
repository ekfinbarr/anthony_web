/**
 * Approval Workflow Modal
 * 
 * Handles post approval and rejection with optional comments.
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Post } from "@/services/post.service";
import { CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

interface ApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post | null;
  action: "approve" | "reject";
  onSubmit: (comment?: string) => void;
  isLoading?: boolean;
}

export default function ApprovalModal({
  open,
  onOpenChange,
  post,
  action,
  onSubmit,
  isLoading = false,
}: ApprovalModalProps) {
  const [comment, setComment] = useState("");

  if (!post) return null;

  const isApprove = action === "approve";
  const isReject = action === "reject";

  const handleSubmit = () => {
    onSubmit(comment.trim() || undefined);
    setComment("");
  };

  const handleClose = () => {
    setComment("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`rounded-full p-2 ${
                isApprove
                  ? "bg-green-100 text-green-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {isApprove ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
            </div>
            <div>
              <DialogTitle>
                {isApprove ? "Approve Post" : "Reject Post"}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {isApprove
                  ? "Approve this post for publication"
                  : "Reject this post and provide a reason"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="bg-muted rounded-lg p-4 border">
            <p className="font-medium text-sm mb-1">Post Title</p>
            <p className="text-sm">{post.title}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="comment">
              {isApprove ? "Optional Comment" : "Rejection Reason *"}
            </Label>
            <Textarea
              id="comment"
              placeholder={
                isApprove
                  ? "Add a comment about this approval (optional)..."
                  : "Explain why this post is being rejected..."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              required={isReject}
            />
            {isReject && (
              <p className="text-xs text-muted-foreground">
                A rejection reason is required to help the author improve their
                content.
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || (isReject && !comment.trim())}
            className={
              isApprove
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }
          >
            {isLoading
              ? isApprove
                ? "Approving..."
                : "Rejecting..."
              : isApprove
              ? "Approve Post"
              : "Reject Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

