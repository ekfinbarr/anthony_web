import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import {
  BellIcon,
  CandleIcon,
  ChurchFrontIcon,
  CrossIcon,
} from "@/components/icons/ParishIcons";
import { Button } from "@/components/ui/button";
import {
  formatTime,
  getMassScheduleGroups,
  type MassScheduleGroup,
  type MassScheduleGroupId,
} from "@/config/parish";
import { cn } from "@/lib/utils";

const groupIcons: Record<MassScheduleGroupId, typeof ChurchFrontIcon> = {
  sunday: ChurchFrontIcon,
  weekdays: BellIcon,
  saturdays: CandleIcon,
  "public-holidays": CrossIcon,
};

function MassCountLabel({ count }: { count: number }) {
  return (
    <p className="font-heading text-lg font-bold tabular-nums text-church-charcoal sm:text-xl">
      {count}
      <span className="ml-1 text-sm font-semibold text-muted-foreground sm:text-base">
        {count === 1 ? "Mass" : "Masses"}
      </span>
    </p>
  );
}

function MassScheduleCard({ group }: { group: MassScheduleGroup }) {
  const Icon = groupIcons[group.id];
  const firstTime = group.masses[0] ? formatTime(group.masses[0].time) : null;

  return (
    <li
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/80 bg-white",
        "shadow-[0_1px_2px_rgba(15,15,15,0.04)] transition-shadow duration-300",
        "hover:shadow-[0_8px_24px_-12px_rgba(15,15,15,0.18)]",
        group.recommended && "border-church-gold/45 ring-1 ring-church-gold/20",
      )}
    >
      {group.recommended && (
        <span className="absolute left-3 top-0 z-10 -translate-y-1/2 rounded-full bg-church-gold/20 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-church-charcoal">
          Recommended
        </span>
      )}

      <div
        className={cn(
          "flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5",
          group.recommended && "pt-5 sm:pt-6",
        )}
      >
        <div
          className={cn(
            "flex h-16 w-16 shrink-0 items-center justify-center rounded-xl sm:h-[4.5rem] sm:w-[4.5rem]",
            group.recommended ? "bg-church-gold/15" : "bg-church-pearl",
          )}
          aria-hidden
        >
          <Icon framed={false} className="h-9 w-9 sm:h-10 sm:w-10" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <h3 className="font-heading text-xl font-bold text-church-charcoal sm:text-2xl">
              {group.title}
            </h3>
            <span className="text-sm text-muted-foreground">{group.dayRange}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground sm:text-[15px]">{group.description}</p>

          <ul className="mt-3 flex flex-col gap-1.5 sm:mt-3.5">
            {group.masses.map((mass) => (
              <li
                key={`${group.id}-${mass.time}-${mass.label}`}
                className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-church-charcoal/85"
              >
                <span className="inline-flex items-center gap-1.5 font-medium tabular-nums">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-church-gold" aria-hidden />
                  <time dateTime={mass.time}>{formatTime(mass.time)}</time>
                </span>
                <span className="text-muted-foreground" aria-hidden>
                  ·
                </span>
                <span className="text-muted-foreground">{mass.label}</span>
              </li>
            ))}
          </ul>
        </div>

<div className="flex items-center justify-between gap-3 border-t border-border/70 pt-3 sm:w-[8.5rem] sm:shrink-0 sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:pt-0">
          <div className="text-left sm:text-right">
            <MassCountLabel count={group.masses.length} />
            {firstTime && (
              <p className="mt-0.5 text-xs text-muted-foreground sm:text-right">
                From {firstTime}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="min-h-10 shrink-0 rounded-xl px-4 text-church-charcoal"
            asChild
          >
            <Link to="/book-mass">Book Mass</Link>
          </Button>
        </div>
      </div>
    </li>
  );
}

const MassScheduleList = () => {
  const groups = getMassScheduleGroups();

  return (
    <ul className="mx-auto flex max-w-4xl flex-col gap-3 sm:gap-3.5" role="list">
      {groups.map((group) => (
        <MassScheduleCard key={group.id} group={group} />
      ))}
    </ul>
  );
};

export default MassScheduleList;
