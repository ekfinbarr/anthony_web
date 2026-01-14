/**
 * Generic Delete Confirmation Modal
 * 
 * Reusable delete confirmation modal for all admin modules.
 * Provides a safe confirmation dialog for destructive actions.
 * 
 * @package Lovable/src/components/admin/shared
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
import { AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  itemName?: string;
  itemDetails?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function DeleteConfirmModal({
  open,
  onOpenChange,
  title,
  description = "This action cannot be undone.",
  itemName,
  itemDetails,
  onConfirm,
  isLoading = false,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
}: DeleteConfirmModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-destructive/10 p-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        {(itemName || itemDetails) && (
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">
              {itemName ? `Are you sure you want to delete the following item?` : "Please confirm this action."}
            </p>
            {(itemName || itemDetails) && (
              <div className="bg-muted rounded-lg p-4 border">
                {itemName && <p className="font-medium">{itemName}</p>}
                {itemDetails && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {itemDetails}
                  </p>
                )}
              </div>
            )}
            <p className="text-sm text-destructive mt-4 font-medium">
              ⚠️ This will permanently delete this item and all associated data.
            </p>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? "Deleting..." : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

