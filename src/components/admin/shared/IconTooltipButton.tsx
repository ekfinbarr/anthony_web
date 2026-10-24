import { forwardRef } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type IconTooltipButtonProps = ButtonProps & {
  label: string;
};

/**
 * Icon-only button with an accessible tooltip label.
 */
export const IconTooltipButton = forwardRef<HTMLButtonElement, IconTooltipButtonProps>(
  ({ label, children, ...props }, ref) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button ref={ref} variant="ghost" size="icon" aria-label={label} {...props}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
);

IconTooltipButton.displayName = "IconTooltipButton";

export default IconTooltipButton;
