/**
 * Generic Empty State Component
 * 
 * Reusable empty state component for displaying helpful messages
 * when no data is found across different admin modules.
 * 
 * @package Lovable/src/components/admin/shared
 */

import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Search, 
  Calendar, 
  Image, 
  Users, 
  Church,
  CreditCard,
  Clock,
  BookOpen,
  Radio,
  Building,
  ShoppingCart,
  Activity,
  UserCircle,
  Video
} from "lucide-react";
import { LucideIcon } from "lucide-react";

export type EmptyStateIcon = 
  | "file" 
  | "search" 
  | "calendar" 
  | "image" 
  | "users" 
  | "church"
  | "credit-card"
  | "clock"
  | "book"
  | "radio"
  | "building"
  | "shopping"
  | "activity"
  | "user"
  | "video";

interface GenericEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: EmptyStateIcon;
  customIcon?: LucideIcon;
}

const iconMap: Record<EmptyStateIcon, LucideIcon> = {
  file: FileText,
  search: Search,
  calendar: Calendar,
  image: Image,
  users: Users,
  church: Church,
  "credit-card": CreditCard,
  clock: Clock,
  book: BookOpen,
  radio: Radio,
  building: Building,
  shopping: ShoppingCart,
  activity: Activity,
  user: UserCircle,
  video: Video,
};

export function GenericEmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon = "file",
  customIcon,
}: GenericEmptyStateProps) {
  const Icon = customIcon || iconMap[icon];

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

