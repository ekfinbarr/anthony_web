import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const FieldHint = ({ text }: { text: string }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={text}
        onPointerDown={(event) => event.preventDefault()}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </TooltipTrigger>
    <TooltipContent side="top" className="max-w-56 text-left leading-snug">
      {text}
    </TooltipContent>
  </Tooltip>
);

export default FieldHint;
