/**
 * Toast bridge — preserves the shadcn `toast({ title, description, variant })` API
 * while rendering through Sonner for stacked, dismissible, interactive notifications.
 */
import * as React from "react";
import { toast as sonnerToast } from "sonner";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type ToastInput = Omit<ToasterToast, "id">;

function nodeToString(node: React.ReactNode): string | undefined {
  if (node == null || typeof node === "boolean") return undefined;
  if (typeof node === "string" || typeof node === "number") return String(node);
  return undefined;
}

function toast({ title, description, variant, ...rest }: ToastInput) {
  const titleText = nodeToString(title) ?? (variant === "destructive" ? "Error" : "Notice");
  const descriptionText = nodeToString(description);
  const duration = variant === "destructive" ? 6000 : 4500;

  const id =
    variant === "destructive"
      ? sonnerToast.error(titleText, { description: descriptionText, duration })
      : variant === "default" || variant == null
        ? // Prefer success when title looks affirmative; otherwise neutral message
          /success|saved|created|updated|deleted|sent|copied|booked|registered/i.test(titleText)
            ? sonnerToast.success(titleText, { description: descriptionText, duration })
            : sonnerToast.message(titleText, { description: descriptionText, duration })
        : sonnerToast.message(titleText, { description: descriptionText, duration });

  void rest;

  return {
    id: String(id),
    dismiss: () => sonnerToast.dismiss(id),
    update: (props: ToasterToast) => {
      const nextTitle = nodeToString(props.title) ?? titleText;
      const nextDescription = nodeToString(props.description) ?? descriptionText;
      if (props.variant === "destructive") {
        sonnerToast.error(nextTitle, { id, description: nextDescription });
      } else {
        sonnerToast.message(nextTitle, { id, description: nextDescription });
      }
    },
  };
}

function useToast() {
  return {
    toasts: [] as ToasterToast[],
    toast,
    dismiss: (toastId?: string) => sonnerToast.dismiss(toastId),
  };
}

export { useToast, toast };
export type { ToasterToast };
