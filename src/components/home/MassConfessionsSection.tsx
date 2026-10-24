import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock, Cross } from "lucide-react";
import { BellIcon, ConfessionalIcon } from "@/components/icons/ParishIcons";
import Reveal from "@/components/parish-home/Reveal";
import { Button } from "@/components/ui/button";
import {
  formatTime,
  getMassScheduleGroups,
  otherServices,
  type MassScheduleGroup,
} from "@/config/parish";
import { cn } from "@/lib/utils";

const confessions = otherServices.find((service) => service.name === "Confessions");

function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group/panel relative flex h-full flex-col overflow-hidden rounded-2xl",
        "border border-church-gold/20 bg-church-charcoal/80",
        "shadow-[0_12px_40px_-16px_rgba(0,0,0,0.55)]",
        "transition-[transform,border-color,box-shadow] duration-300",
        "motion-safe:hover:-translate-y-0.5 hover:border-church-gold/45",
        "hover:shadow-[0_18px_48px_-18px_rgba(0,0,0,0.65)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function PanelHeader({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-church-gold/15 px-5 py-5 sm:px-6 sm:py-6">
      <div className="shrink-0" aria-hidden>
        {icon}
      </div>
      <div className="min-w-0 pt-0.5">
        <h3 className="font-heading text-xl font-bold tracking-tight text-church-pearl sm:text-2xl">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 text-sm text-church-pearl/65 sm:text-[0.9375rem]">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function SundayMassList({ group }: { group: MassScheduleGroup }) {
  return (
    <div>
      <p className="mb-3 font-heading text-xs font-bold uppercase tracking-[0.2em] text-church-gold">
        {group.title}
        <span className="ml-2 font-medium tracking-normal text-church-pearl/50 normal-case">
          {group.dayRange}
        </span>
      </p>
      <ul className="space-y-1.5" role="list">
        {group.masses.map((mass) => (
          <li
            key={`sunday-${mass.time}-${mass.label}`}
            className={cn(
              "flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5 rounded-lg px-2.5 py-2",
              "text-church-pearl/90 transition-colors duration-200",
              "hover:bg-church-gold/10",
            )}
          >
            <span className="inline-flex items-center gap-1.5 font-semibold tabular-nums text-church-pearl">
              <Clock className="h-3.5 w-3.5 shrink-0 text-church-gold" aria-hidden />
              <time dateTime={mass.time}>{formatTime(mass.time)}</time>
            </span>
            <span className="text-church-pearl/40" aria-hidden>
              ·
            </span>
            <span className="text-sm text-church-pearl/70 sm:text-[0.9375rem]">{mass.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SecondaryMassBlock({ group }: { group: MassScheduleGroup }) {
  return (
    <div>
      <p className="mb-2 font-heading text-xs font-bold uppercase tracking-[0.18em] text-church-gold">
        {group.title}
      </p>
      <p className="text-sm text-church-pearl/55">{group.dayRange}</p>
      <ul className="mt-2 space-y-1" role="list">
        {group.masses.map((mass) => (
          <li
            key={`${group.id}-${mass.time}-${mass.label}`}
            className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm text-church-pearl/85"
          >
            <time dateTime={mass.time} className="font-medium tabular-nums text-church-pearl">
              {formatTime(mass.time)}
            </time>
            {mass.label && (
              <>
                <span className="text-church-pearl/35" aria-hidden>
                  ·
                </span>
                <span className="text-church-pearl/60">{mass.label}</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

const MassConfessionsSection = () => {
  const groups = getMassScheduleGroups();
  const sunday = groups.find((g) => g.id === "sunday");
  const secondary = groups.filter((g) => g.id !== "sunday");

  return (
    <section
      className="relative overflow-hidden bg-church-charcoal py-14 text-church-pearl md:py-16 lg:py-20"
      aria-labelledby="mass-confessions-heading"
    >
      {/* Soft gold atmosphere */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 50% -10%, hsl(38 66% 61% / 0.14), transparent 55%), radial-gradient(ellipse 45% 40% at 85% 80%, hsl(29 44% 53% / 0.08), transparent 50%)",
        }}
      />

      <div className="container relative mx-auto px-4">
        <Reveal className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <div className="mb-4 flex items-center justify-center gap-3" aria-hidden>
            <span className="h-px w-10 bg-church-gold sm:w-14" />
            <Cross className="h-5 w-5 text-church-gold" strokeWidth={2.25} />
            <span className="h-px w-10 bg-church-gold sm:w-14" />
          </div>
          <h2
            id="mass-confessions-heading"
            className="font-heading text-3xl font-bold tracking-tight text-church-pearl sm:text-4xl"
          >
            Mass &amp; Confessions
            <span className="hidden md:inline"> Schedule</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-church-pearl/70 sm:text-lg">
            Join us for Holy Mass and the Sacrament of Reconciliation.
          </p>
        </Reveal>

        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-5 md:gap-6 lg:gap-8">
          {/* Mass — ~60% */}
          <Reveal delay={80} className="h-full md:col-span-3">
            <Panel>
              <PanelHeader
                icon={<BellIcon className="h-11 w-11 sm:h-12 sm:w-12" />}
                title="Mass Schedule"
                subtitle="Times for Sunday, weekdays, and holy days"
              />
              <div className="flex flex-1 flex-col px-5 py-5 sm:px-6 sm:py-6">
                {sunday && <SundayMassList group={sunday} />}

                <div className="my-5 h-px bg-church-gold/25" aria-hidden />

                <div className="grid gap-4 sm:grid-cols-3 sm:gap-4">
                  {secondary.map((group, index) => (
                    <div
                      key={group.id}
                      className={cn(
                        index > 0 &&
                          "border-t border-church-gold/15 pt-4 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0",
                      )}
                    >
                      <SecondaryMassBlock group={group} />
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </Reveal>

          {/* Confessions — ~40% */}
          <Reveal delay={160} className="h-full md:col-span-2">
            <Panel>
              <PanelHeader
                icon={<ConfessionalIcon className="h-11 w-11 sm:h-12 sm:w-12" />}
                title="Confessions"
                subtitle="Sacrament of Reconciliation"
              />
              <div className="flex flex-1 flex-col px-5 py-5 sm:px-6 sm:py-6">
                <div>
                  <p className="mb-3 font-heading text-xs font-bold uppercase tracking-[0.2em] text-church-gold">
                    Regular Times
                  </p>
                  {confessions ? (
                    <div
                      className={cn(
                        "rounded-xl border border-church-gold/20 bg-church-gold/10 px-4 py-4",
                        "transition-colors duration-200 hover:border-church-gold/40 hover:bg-church-gold/15",
                      )}
                    >
                      <p className="text-sm font-medium text-church-pearl/70">{confessions.day}</p>
                      <p className="mt-1 font-heading text-2xl font-bold tabular-nums text-church-pearl sm:text-3xl">
                        <time dateTime={confessions.time}>{formatTime(confessions.time)}</time>
                      </p>
                    </div>
                  ) : (
                    <p className="text-church-pearl/70">Please check the bulletin for confession times.</p>
                  )}
                </div>

                <div className="my-5 h-px bg-church-gold/25" aria-hidden />

                <div className="flex-1">
                  <p className="mb-2 font-heading text-xs font-bold uppercase tracking-[0.2em] text-church-gold">
                    Special Times
                  </p>
                  <p className="text-sm leading-relaxed text-church-pearl/70 sm:text-[0.9375rem]">
                    During Advent and Lent, additional times are available. Please check the bulletin
                    for updates.
                  </p>
                </div>
              </div>
            </Panel>
          </Reveal>
        </div>

        {/* Shared CTAs */}
        <Reveal delay={220} className="mx-auto mt-8 flex max-w-5xl flex-col gap-3 sm:mt-10 sm:flex-row sm:justify-center sm:gap-4">
          <Button variant="church" size="lg" className="group w-full sm:w-auto" asChild>
            <Link to="/visit">
              Plan Your Visit
              <ArrowRight className="transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            variant="outlineGold"
            size="lg"
            className="w-full border-church-gold/50 text-church-pearl hover:border-church-gold-soft hover:bg-church-gold-soft hover:text-church-charcoal sm:w-auto"
            asChild
          >
            <Link to="/book-mass">Book Mass</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
};

export default MassConfessionsSection;
