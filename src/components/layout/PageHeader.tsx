import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Breadcrumbs from "@/components/seo/Breadcrumbs";
import { getBreadcrumbTrail } from "@/config/routes.seo";
import type { BreadcrumbItem } from "@/lib/seo/schema";
import { cn } from "@/lib/utils";
import stAnthony from "@/assets/images/st_anthony.webp";

const defaultHeaderImage = { src: stAnthony, alt: "" };

type PageHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  eyebrow?: ReactNode;
  icon?: ReactNode;
  align?: "center" | "start";
  tone?: "dark" | "light";
  image?: { src: string; alt: string };
  /** "auto" shows a trail only when the route has a parent. Pass items for dynamic pages. */
  breadcrumbs?: BreadcrumbItem[] | "auto" | false;
  children?: ReactNode;
  className?: string;
  size?: "default" | "compact";
};

const PageHeader = ({
  title,
  description,
  eyebrow,
  icon,
  align = "center",
  tone = "dark",
  image = defaultHeaderImage,
  breadcrumbs = "auto",
  children,
  className,
  size = "default",
}: PageHeaderProps) => {
  const { pathname } = useLocation();
  const items =
    breadcrumbs === false ? [] : breadcrumbs === "auto" ? getBreadcrumbTrail(pathname) : breadcrumbs;
  const showCrumbs = breadcrumbs === "auto" ? items.length >= 3 : items.length >= 2;
  const centered = align === "center";
  const onPhoto = Boolean(image);
  const dark = onPhoto || tone === "dark";

  return (
    <header
      className={cn(
        "page-header relative overflow-hidden",
        dark ? "bg-gradient-dark text-church-pearl" : "bg-church-stone text-church-charcoal",
        size === "compact" ? "py-8 md:py-10" : "py-12 md:py-16",
        className,
      )}
    >
      {!onPhoto && !dark && <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-church" aria-hidden="true" />}
      {onPhoto && image ? (
        <>
          <img
            src={image.src}
            alt={image.alt}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-church-charcoal/85 via-church-charcoal/70 to-church-charcoal/85"
            aria-hidden="true"
          />
        </>
      ) : (
        dark && <div className="pointer-events-none absolute inset-0 pattern-geometric" aria-hidden="true" />
      )}

      <div className={cn("container relative mx-auto px-4", centered && "text-center")}>
        {showCrumbs && (
          <Breadcrumbs
            items={items}
            tone={dark ? "onDark" : "onLight"}
            className={centered ? "justify-center" : undefined}
          />
        )}

        {icon && (
          <div className={cn("mb-4 flex", centered ? "justify-center" : "justify-start")}>{icon}</div>
        )}

        {eyebrow && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-church-gold">{eyebrow}</p>
        )}

        <div className="animate-fade-in">
          <h1
            className={cn(
              "text-balance font-heading text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl",
              dark ? "text-church-pearl" : "text-church-charcoal",
              image && "text-shadow-hero",
            )}
          >
            {title}
          </h1>
          <div
            className={cn("mt-4 h-0.5 w-12 rounded-full bg-gradient-church", centered && "mx-auto")}
            aria-hidden="true"
          />
          {description && (
            <p
              className={cn(
                "mt-4 max-w-3xl text-base sm:text-lg md:text-xl",
                dark ? "text-church-pearl/90" : "text-church-charcoal/75",
                centered && "mx-auto",
                image && "text-shadow-hero",
              )}
            >
              {description}
            </p>
          )}
        </div>

        {children && <div className="mt-8">{children}</div>}
      </div>
    </header>
  );
};

export default PageHeader;
