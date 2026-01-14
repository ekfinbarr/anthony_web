/**
 * Sacrament Details View Component
 * 
 * Read-only detailed view of a sacrament with metadata and information preview.
 * 
 * @package Lovable/src/components/admin/sacraments
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
import { Sacrament } from "@/services/sacrament.service";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import {
  Church,
  Phone,
  Calendar,
  FileText,
  Edit,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface SacramentDetailsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sacrament: Sacrament | null;
  onEdit?: (sacrament: Sacrament) => void;
  onDelete?: () => void;
}

export default function SacramentDetails({
  open,
  onOpenChange,
  sacrament,
  onEdit,
  onDelete,
}: SacramentDetailsProps) {
  if (!sacrament) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
              <DialogTitle className="text-2xl mb-2">{sacrament.name}</DialogTitle>
              <DialogDescription>
                <StatusBadge status={sacrament.is_active ? "active" : "inactive"} className="mt-2" />
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Description */}
          {sacrament.description && (
            <div className="bg-muted rounded-lg p-4 border-l-4 border-primary">
              <p className="text-sm font-medium mb-1">Description</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{sacrament.description}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {sacrament.contact && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Contact:</span>
                    <span className="font-medium">{sacrament.contact}</span>
                  </div>
                )}
                {sacrament.schedule && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Schedule:</span>
                    <span className="font-medium">{sacrament.schedule}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {sacrament.requirements && sacrament.requirements.length > 0 ? (
                  <ul className="space-y-2">
                    {sacrament.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No requirements listed</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Timestamps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                </div>
                <p className="text-sm font-medium ml-6">
                  {formatDate(sacrament.created_at)}
                </p>
                <p className="text-xs text-muted-foreground ml-6">
                  {timeAgo(sacrament.created_at)}
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Last Updated:</span>
                </div>
                <p className="text-sm font-medium ml-6">
                  {formatDate(sacrament.updated_at)}
                </p>
                <p className="text-xs text-muted-foreground ml-6">
                  {timeAgo(sacrament.updated_at)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(sacrament)}>
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

