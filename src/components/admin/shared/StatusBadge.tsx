/**
 * Generic Status Badge Component
 * 
 * Reusable status badge component for displaying entity statuses
 * across different admin modules (Events, Posts, etc.)
 * 
 * @package Lovable/src/components/admin/shared
 */

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusType = 
  | "draft" 
  | "pending" 
  | "approved" 
  | "rejected" 
  | "published"
  | "upcoming"
  | "ongoing"
  | "recurring"
  | "past"
  | "active"
  | "inactive"
  | "completed"
  | "cancelled";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  customLabel?: string;
}

const statusConfig: Record<
  StatusType,
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
  upcoming: {
    label: "Upcoming",
    variant: "default",
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  ongoing: {
    label: "Ongoing",
    variant: "secondary",
    className: "bg-purple-100 text-purple-700 border-purple-200",
  },
  recurring: {
    label: "Recurring",
    variant: "outline",
    className: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  past: {
    label: "Past",
    variant: "secondary",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  active: {
    label: "Active",
    variant: "default",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  inactive: {
    label: "Inactive",
    variant: "secondary",
    className: "bg-gray-100 text-gray-700 border-gray-200",
  },
  completed: {
    label: "Completed",
    variant: "default",
    className: "bg-green-100 text-green-700 border-green-200",
  },
  cancelled: {
    label: "Cancelled",
    variant: "destructive",
    className: "bg-red-100 text-red-700 border-red-200",
  },
};

export function StatusBadge({ status, className, customLabel }: StatusBadgeProps) {
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
      {customLabel || config.label}
    </Badge>
  );
}

