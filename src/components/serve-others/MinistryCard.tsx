import { Link } from "react-router-dom";
import { CommunityIcon } from "@/components/icons/ParishIcons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Ministry } from "@/services/ministry.service";
import { cn } from "@/lib/utils";

type MinistryCardProps = {
  ministry: Ministry;
  onJoin?: (ministry: Ministry) => void;
  className?: string;
};

const MinistryCard = ({ ministry, onJoin, className }: MinistryCardProps) => {
  const summary = ministry.short_description || ministry.description || "";
  const categories = ministry.categories?.length
    ? ministry.categories
    : ministry.category
      ? [ministry.category]
      : [];
  const canJoinOnline = (ministry.joining_methods || []).includes("online_eoi");

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border border-border/80 bg-background transition-shadow duration-300 hover:shadow-md motion-reduce:transition-none",
        className,
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-church-stone/40">
        {ministry.image ? (
          <img
            src={ministry.image}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-primary/70">
            <CommunityIcon className="h-12 w-12" aria-hidden />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {categories.slice(0, 2).map((cat) => (
              <Badge key={cat.id} variant="secondary" className="font-normal">
                {cat.name}
              </Badge>
            ))}
          </div>
        )}
        <h3 className="font-heading text-xl font-semibold text-foreground">
          <Link
            to={`/serve-others/${ministry.slug}`}
            className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {ministry.name}
          </Link>
        </h3>
        {summary && (
          <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
            {summary}
          </p>
        )}
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <Button asChild variant="default" size="sm">
            <Link to={`/serve-others/${ministry.slug}`}>Learn more</Link>
          </Button>
          {canJoinOnline && onJoin && (
            <Button type="button" variant="outline" size="sm" onClick={() => onJoin(ministry)}>
              Express interest
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};

export default MinistryCard;
