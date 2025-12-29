/**
 * Empty State Component
 * 
 * Displays a helpful empty state when no posts are found.
 */

import { Button } from "@/components/ui/button";
import { FileText, Search } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: "file" | "search";
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = "file",
}: EmptyStateProps) {
  const Icon = icon === "search" ? Search : FileText;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Icon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}

