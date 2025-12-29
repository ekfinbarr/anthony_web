/**
 * Post Status Badge Component
 * 
 * Displays a colored badge indicating the current status of a post.
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PostStatus = "draft" | "pending" | "approved" | "rejected" | "published";

interface PostStatusBadgeProps {
  status: PostStatus;
  className?: string;
}

const statusConfig: Record<
  PostStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
> = {
  draft: {
    label: "Draft",
    variant: "secondary",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  pending: {
    label: "Pending Approval",
    variant: "outline",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
  },
  approved: {
    label: "Approved",
    variant: "default",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  rejected: {
    label: "Rejected",
    variant: "destructive",
    className: "bg-red-100 text-red-700 border-red-200",
  },
  published: {
    label: "Published",
    variant: "default",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
};

export function PostStatusBadge({ status, className }: PostStatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "font-medium text-xs px-2.5 py-0.5",
        config.className,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}

