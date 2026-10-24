import { ChevronRight } from "lucide-react";
import Reveal from "@/components/parish-home/Reveal";
import { cn } from "@/lib/utils";
import type { Sacrament } from "@/data/sacraments";
import { getSacramentIcon } from "./sacramentIcons";

type SacramentCardProps = {
  sacrament: Sacrament;
  index: number;
  onOpen: (sacrament: Sacrament) => void;
};

const SacramentCard = ({ sacrament, index, onOpen }: SacramentCardProps) => {
  const Icon = getSacramentIcon(sacrament.iconKey);

  return (
    <Reveal delay={index * 60} className="h-full">
      <button
        type="button"
        onClick={() => onOpen(sacrament)}
        aria-label={`Learn more about ${sacrament.name}`}
        className={cn(
          "group flex h-full w-full flex-col gap-4 rounded-xl border border-church-gold-warm/15 bg-white p-5 text-left shadow-card-soft",
          "sm:flex-row sm:items-start sm:gap-5",
          "outline-none transition-[transform,box-shadow,border-color] duration-300",
          "hover:border-church-gold-warm/40 hover:shadow-lg",
          "focus-visible:ring-2 focus-visible:ring-church-gold-warm focus-visible:ring-offset-2 focus-visible:ring-offset-church-ivory",
          "active:scale-[0.99] motion-safe:hover:-translate-y-1"
        )}
      >
        <div className="shrink-0">
          <Icon size="md" className="[&_.parish-icon]:[--pi-disc:38_45%_72%]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading text-lg font-semibold text-church-charcoal sm:text-xl">
              {sacrament.name}
            </h3>
            <span
              className={cn(
                "mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                "bg-church-gold-warm/10 text-church-gold-warm",
                "transition-transform duration-300 motion-safe:group-hover:translate-x-0.5"
              )}
              aria-hidden="true"
            >
              <ChevronRight className="h-4 w-4" strokeWidth={2.25} />
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {sacrament.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-md border border-church-gold-warm/20 bg-church-pearl/60 px-2.5 py-1 text-xs font-medium text-church-charcoal">
              {sacrament.category}
            </span>
            {sacrament.schedule && (
              <>
                <span className="inline-flex items-center rounded-md border border-church-gold-warm/15 bg-white px-2.5 py-1 text-xs text-muted-foreground">
                  {sacrament.schedule.date}
                </span>
                <span className="inline-flex items-center rounded-md border border-church-gold-warm/15 bg-white px-2.5 py-1 text-xs text-muted-foreground">
                  {sacrament.schedule.location}
                </span>
              </>
            )}
          </div>
        </div>
      </button>
    </Reveal>
  );
};

export default SacramentCard;
