import { Fragment } from "react";
import { Link } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { site } from "@/config/site";
import { breadcrumbSchema, type BreadcrumbItem as Crumb } from "@/lib/seo/schema";
import { cn } from "@/lib/utils";
import JsonLd from "./JsonLd";

interface BreadcrumbsProps {
  /** Full trail starting at Home; the last item is the current page. */
  items: Crumb[];
  className?: string;
  /** strip sits on its own bar. onDark and onLight sit inside a page header. */
  tone?: "strip" | "onDark" | "onLight";
}

/**
 * Visible breadcrumb trail plus matching BreadcrumbList JSON-LD.
 * Both are generated from the same items, so they can never disagree.
 */
const Breadcrumbs = ({ items, className, tone = "strip" }: BreadcrumbsProps) => {
  if (items.length < 2) return null;

  const onDark = tone === "onDark";
  const embedded = tone !== "strip";

  const trail = (
    <>
      <Breadcrumb>
        <BreadcrumbList
          className={cn(
            onDark ? "text-church-pearl/75" : embedded ? "text-church-charcoal/70" : undefined,
            embedded && className,
          )}
        >
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <Fragment key={`${item.path}-${index}`}>
                <BreadcrumbItem className={isLast ? "min-w-0 max-w-full" : undefined}>
                  {isLast ? (
                    <BreadcrumbPage
                      className={cn(
                        "line-clamp-1 max-w-[14rem] sm:max-w-xs md:max-w-md",
                        onDark ? "text-church-pearl" : "text-church-charcoal",
                      )}
                    >
                      {item.name}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      asChild
                      className={cn(
                        "rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-gold focus-visible:ring-offset-2",
                        onDark
                          ? "hover:text-church-gold focus-visible:ring-offset-church-charcoal"
                          : "hover:text-church-charcoal",
                      )}
                    >
                      <Link to={item.path}>{item.name}</Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator className={onDark ? "text-church-pearl/45" : undefined} />}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
      <JsonLd data={breadcrumbSchema(site, items)} />
    </>
  );

  if (embedded) {
    return <div className="mb-5">{trail}</div>;
  }

  return (
    <div className={cn("border-b border-border bg-muted/40", className)}>
      <div className="container mx-auto px-4 py-3">{trail}</div>
    </div>
  );
};

export default Breadcrumbs;
