import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/utils";

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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }

    let frame = 0;
    const revealIfNear = () => {
      const rect = node.getBoundingClientRect();
      const near = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
      if (near) setVisible(true);
      return near;
    };

    if (revealIfNear()) return;

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (revealIfNear()) {
          window.removeEventListener("scroll", onScroll);
          window.removeEventListener("resize", onScroll);
        }
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

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
