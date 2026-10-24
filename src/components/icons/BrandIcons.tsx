/**
 * Outline brand icons matching lucide-react's original Facebook / Instagram / Youtube icons
 * (removed from lucide-react 1.x). Same 24×24 grid, stroke and API as lucide icons.
 * Icon geometry © Lucide contributors, ISC License.
 */
import { forwardRef, type SVGProps } from "react";
import { cn } from "@/lib/utils";

type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };

const createIcon = (name: string, children: React.ReactNode) => {
  const Icon = forwardRef<SVGSVGElement, IconProps>(({ size = 24, className, strokeWidth = 2, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={props["aria-label"] ? undefined : true}
      className={cn("lucide", `lucide-${name}`, className)}
      {...props}
    >
      {children}
    </svg>
  ));
  Icon.displayName = name;
  return Icon;
};

export const Facebook = createIcon(
  "facebook",
  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
);

export const Instagram = createIcon(
  "instagram",
  <>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </>,
);

export const Youtube = createIcon(
  "youtube",
  <>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </>,
);
