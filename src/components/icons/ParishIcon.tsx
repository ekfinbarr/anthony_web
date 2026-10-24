import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ParishIconSize = "sm" | "md" | "lg" | "hero";

export interface ParishIconProps {
  className?: string;
  size?: ParishIconSize;
  /** Full disc and long shadow. Turn off for tiny inline glyphs. */
  framed?: boolean;
  children?: ReactNode;
}

const sizeClass: Record<ParishIconSize, string> = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-14 w-14",
  hero: "h-28 w-28",
};

export function ParishIcon({
  className,
  size = "md",
  framed = true,
  children,
}: ParishIconProps) {
  const artwork = (
    <svg
      viewBox="0 0 64 64"
      className={cn("parish-icon", framed ? "h-full w-full" : sizeClass[size], !framed && className)}
      aria-hidden="true"
      focusable="false"
    >
      {framed ? (
        <>
          <circle cx="32" cy="32" r="32" className="pi-disc" />
          <path className="pi-shadow" d="M40 0H64v64H14Z" />
          {children}
        </>
      ) : (
        children
      )}
    </svg>
  );

  if (!framed) return artwork;

  return (
    <span
      className={cn("parish-icon-frame inline-flex shrink-0 overflow-hidden rounded-full", sizeClass[size], className)}
      data-animate="hover"
    >
      {artwork}
    </span>
  );
}
