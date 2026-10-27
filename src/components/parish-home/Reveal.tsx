import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type RevealFrom = "up" | "left" | "right";

/**
 * Fades a block in when it enters the viewport.
 * Visitors who prefer reduced motion see the content immediately.
 */
const Reveal = ({
  children,
  className,
  from = "up",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  from?: RevealFrom;
  delay?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const visible = revealed || reduceMotion;

  useEffect(() => {
    const node = ref.current;
    if (!node || reduceMotion || revealed) return;

    // Reveal once the block is within the bottom 8% of the viewport (or above it).
    // The observer also reports blocks that are already on screen when it starts.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduceMotion, revealed]);

  const style: CSSProperties | undefined = delay > 0 ? { transitionDelay: `${delay}ms` } : undefined;

  return (
    <div
      ref={ref}
      data-reveal={from === "up" ? undefined : from}
      style={style}
      className={cn("parish-reveal", visible && "is-visible", className)}
    >
      {children}
    </div>
  );
};

export default Reveal;
