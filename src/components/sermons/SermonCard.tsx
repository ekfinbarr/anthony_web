import { Calendar, Clock, Headphones, Play, FileText, User } from "lucide-react";
import { motion } from "framer-motion";
import type { Sermon } from "@/services/sermon.service";
import { PulpitIcon } from "@/components/icons/ParishIcons";
import {
  formatSermonDate,
  sermonMediaKinds,
  sermonThumbnail,
} from "@/components/sermons/sermonMedia";
import { cn } from "@/lib/utils";

type SermonCardProps = {
  sermon: Sermon;
  onSelect: (sermon: Sermon) => void;
  layout?: "list" | "grid";
  index?: number;
};

const mediaIcon = {
  video: Play,
  audio: Headphones,
  notes: FileText,
  none: PulpitIcon,
} as const;

const SermonCard = ({ sermon, onSelect, layout = "grid", index = 0 }: SermonCardProps) => {
  const thumb = sermonThumbnail(sermon);
  const kinds = sermonMediaKinds(sermon).filter((k) => k !== "none");
  const date = formatSermonDate(sermon.preached_date || sermon.date);
  const isList = layout === "list";

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(sermon)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.28) }}
      className={cn(
        "group w-full overflow-hidden rounded-xl border border-border/70 bg-background text-left shadow-sm transition-all duration-300",
        "hover:border-church-gold/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        isList ? "flex gap-3 p-2.5 sm:gap-4 sm:p-3" : "flex flex-col",
      )}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-church-brown/10",
          isList
            ? "h-24 w-32 shrink-0 rounded-lg sm:h-28 sm:w-40"
            : "aspect-video w-full",
        )}
      >
        {thumb ? (
          <img
            src={thumb}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-church-brown to-church-charcoal text-church-gold-soft">
            <PulpitIcon size="lg" className="opacity-90" />
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-church-charcoal/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
            <Play className="ml-0.5 h-5 w-5" />
          </span>
        </div>
        {sermon.duration ? (
          <span className="absolute bottom-2 right-2 rounded bg-church-charcoal/85 px-1.5 py-0.5 text-[10px] font-medium text-church-pearl sm:text-xs">
            {sermon.duration}
          </span>
        ) : null}
      </div>

      <div className={cn("flex min-w-0 flex-1 flex-col", isList ? "justify-center py-0.5 pr-1" : "p-4 pt-3")}>
        {sermon.series ? (
          <span className="mb-1 inline-flex w-fit max-w-full truncate rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary sm:text-xs">
            {sermon.series}
          </span>
        ) : null}

        <h3
          className={cn(
            "font-heading font-semibold text-church-charcoal transition-colors group-hover:text-primary",
            isList ? "line-clamp-2 text-sm sm:text-base" : "line-clamp-2 text-lg",
          )}
        >
          {sermon.title}
        </h3>

        {sermon.description && !isList ? (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{sermon.description}</p>
        ) : null}

        <div
          className={cn(
            "mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground",
            isList && "mt-1.5",
          )}
        >
          <span className="inline-flex items-center gap-1">
            <User className="h-3 w-3 shrink-0" />
            <span className="truncate">{sermon.speaker}</span>
          </span>
          {date ? (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3 shrink-0" />
              {date}
            </span>
          ) : null}
          {sermon.duration && isList ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 shrink-0" />
              {sermon.duration}
            </span>
          ) : null}
        </div>

        {kinds.length > 0 ? (
          <div className={cn("mt-2 flex gap-1.5", isList && "mt-1.5")}>
            {kinds.map((kind) => {
              const Icon = mediaIcon[kind];
              return (
                <span
                  key={kind}
                  className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-muted/40 px-2 py-0.5 text-[10px] font-medium capitalize text-muted-foreground"
                >
                  <Icon className="h-3 w-3" />
                  {kind}
                </span>
              );
            })}
          </div>
        ) : null}
      </div>
    </motion.button>
  );
};

export default SermonCard;
