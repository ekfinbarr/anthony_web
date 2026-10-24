/* eslint-disable react-refresh/only-export-components */
import type { ComponentProps } from "react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from "lucide-react";

type ToasterProps = ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      closeButton
      richColors
      expand
      gap={10}
      duration={4500}
      visibleToasts={5}
      icons={{
        success: <CheckCircle2 className="size-4 text-emerald-600" aria-hidden />,
        error: <CircleAlert className="size-4 text-destructive" aria-hidden />,
        info: <Info className="size-4 text-sky-600" aria-hidden />,
        warning: <TriangleAlert className="size-4 text-amber-600" aria-hidden />,
        close: <X className="size-3.5" aria-hidden />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
          title: "group-[.toast]:text-sm group-[.toast]:font-semibold",
          description: "group-[.toast]:text-sm group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-md",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md",
          closeButton:
            "group-[.toast]:bg-background group-[.toast]:border-border group-[.toast]:text-foreground",
          success: "group-[.toaster]:border-emerald-200/80",
          error: "group-[.toaster]:border-destructive/30",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
