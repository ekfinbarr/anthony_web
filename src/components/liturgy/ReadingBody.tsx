import { useMemo } from "react";
import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

/**
 * Renders a reading's HTML. The backend already reduces it to a few tags;
 * DOMPurify is a second line of defence for third-party text.
 */
const ReadingBody = ({ html, className }: { html: string; className?: string }) => {
  const clean = useMemo(
    () => DOMPurify.sanitize(html, { ALLOWED_TAGS: ["p", "i", "b", "em", "strong", "br"], ALLOWED_ATTR: ["class"] }),
    [html],
  );

  return <div className={cn("reading-body", className)} dangerouslySetInnerHTML={{ __html: clean }} />;
};

export default ReadingBody;
