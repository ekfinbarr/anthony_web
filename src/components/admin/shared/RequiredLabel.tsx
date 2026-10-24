import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

type RequiredLabelProps = ComponentPropsWithoutRef<typeof Label> & {
  required?: boolean;
};

/**
 * Form label with optional required asterisk (*).
 */
export function RequiredLabel({
  children,
  required = true,
  className,
  ...props
}: RequiredLabelProps) {
  return (
    <Label className={cn(className)} {...props}>
      {children}
      {required ? <span className="text-destructive ml-0.5" aria-hidden="true">*</span> : null}
    </Label>
  );
}

export default RequiredLabel;
