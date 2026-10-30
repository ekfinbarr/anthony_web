import { Fragment, useMemo } from "react";
import { parseLiturgyText } from "@/lib/liturgyText";
import { cn } from "@/lib/utils";

/**
 * Renders a liturgy section body written in pamphlet markup.
 * Ministers' lines carry a role tag; the people's parts are bold; rubrics are red.
 */
const LiturgyTextRenderer = ({ body, className }: { body: string; className?: string }) => {
  const blocks = useMemo(() => parseLiturgyText(body), [body]);

  return (
    <div className={cn("space-y-3 font-serif text-[1.0625em] leading-relaxed text-church-charcoal", className)}>
      {blocks.map((block, i) => {
        switch (block.kind) {
          case "heading":
            return (
              <h4
                key={i}
                className="!mt-7 font-heading text-[0.8em] font-bold uppercase tracking-[0.16em] text-church-gold-warm first:!mt-0"
              >
                {block.text}
              </h4>
            );
          case "rubric":
            return (
              <p key={i} className="text-[0.9em] italic text-[hsl(355_60%_40%)]">
                {block.text}
              </p>
            );
          case "speech":
            return (
              <div key={i} className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-3">
                <span
                  className={cn(
                    "min-w-[2.25rem] rounded-md px-1.5 py-0.5 text-center font-heading text-[0.7em] font-bold uppercase tracking-wide",
                    block.people ? "bg-church-gold/25 text-church-brown" : "bg-church-stone text-church-charcoal/70",
                  )}
                >
                  {block.speaker}
                </span>
                <p className={cn(block.people && "font-semibold")}>
                  {block.lines.map((line, j) => (
                    <Fragment key={j}>
                      {j > 0 && <br />}
                      {line}
                    </Fragment>
                  ))}
                </p>
              </div>
            );
          default:
            return (
              <p key={i}>
                {block.lines.map((line, j) => (
                  <Fragment key={j}>
                    {j > 0 && <br />}
                    {line}
                  </Fragment>
                ))}
              </p>
            );
        }
      })}
    </div>
  );
};

export default LiturgyTextRenderer;
