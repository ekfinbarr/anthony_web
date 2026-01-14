/**
 * Event Details View Component
 * 
 * Read-only detailed view of an event with metadata and information preview.
 * 
 * @package Lovable/src/components/admin/events
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
import { Event } from "@/services/event.service";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Edit,
  Trash2,
  ExternalLink,
  Globe,
  Lock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface EventDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event | null;
  onEdit?: (event: Event) => void;
  onDelete?: () => void;
}

export default function EventDetails({
  open,
  onOpenChange,
  event,
  onEdit,
  onDelete,
}: EventDetailsProps) {
  if (!event) return null;

  // Determine status based on dates
  const now = new Date();
  const startDate = new Date(event.start_date);
  const endDate = event.end_date ? new Date(event.end_date) : startDate;
  
  let status: "upcoming" | "ongoing" | "past" = "upcoming";
  if (startDate > now) {
    status = "upcoming";
  } else if (startDate <= now && endDate >= now) {
    status = "ongoing";
  } else {
    status = "past";
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
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

  const duration = () => {
    if (!event.end_date) return "—";
    const start = new Date(event.start_date);
    const end = new Date(event.end_date);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes > 0 ? `${diffMinutes}m` : ""}`;
    }
    return `${diffMinutes}m`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{event.name}</DialogTitle>
              <DialogDescription>
                <StatusBadge status={status} className="mt-2" />
                <StatusBadge 
                  status={event.is_public ? "active" : "inactive"}
                  customLabel={event.is_public ? "Public" : "Private"}
                  className="ml-2"
                />
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Cover Image */}
          {event.image && (
            <img
              src={event.image as string}
              alt={event.name}
              className="w-full h-64 object-cover rounded-lg border"
            />
          )}
          {/* Description */}
          {event.description && (
            <div className="bg-muted rounded-lg p-4 border-l-4 border-primary">
              <p className="text-sm font-medium mb-1">Description</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.description}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Event Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Start Date:</span>
                  </div>
                  <p className="text-sm font-medium ml-6">
                    {formatDate(event.start_date)}
                  </p>
                  <p className="text-xs text-muted-foreground ml-6">
                    {timeAgo(event.start_date)}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">End Date:</span>
                  </div>
                  <p className="text-sm font-medium ml-6">
                    {formatDate(event.end_date)}
                  </p>
                  <p className="text-xs text-muted-foreground ml-6">
                    {timeAgo(event.end_date)}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{duration()}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Location:</span>
                    <span className="font-medium">{event.location}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Visibility & Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  {event.is_public ? (
                    <Globe className="h-4 w-4 text-green-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-muted-foreground">Visibility:</span>
                  <span className="font-medium">
                    {event.is_public ? "Public" : "Private"}
                  </span>
                </div>
                <Separator />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Created:</span>
                  </div>
                  <p className="text-sm font-medium ml-6">
                    {formatDate(event.created_at)}
                  </p>
                  <p className="text-xs text-muted-foreground ml-6">
                    {timeAgo(event.created_at)}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Last Updated:</span>
                  </div>
                  <p className="text-sm font-medium ml-6">
                    {formatDate(event.updated_at)}
                  </p>
                  <p className="text-xs text-muted-foreground ml-6">
                    {timeAgo(event.updated_at)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(event)}>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

