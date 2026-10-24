import { Calendar, Headphones, Play, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Reveal from "@/components/parish-home/Reveal";
import type { Sermon } from "@/services/sermon.service";
import {
  formatSermonDate,
  sermonThumbnail,
} from "@/components/sermons/sermonMedia";
import monstrance from "@/assets/images/monstrance_full.png";

type SermonFeaturedHeroProps = {
  sermon: Sermon | null | undefined;
  isLoading?: boolean;
  onOpen: (sermon: Sermon) => void;
};

const SermonFeaturedHero = ({ sermon, isLoading, onOpen }: SermonFeaturedHeroProps) => {
  if (isLoading) {
    return (
      <section className="relative overflow-hidden bg-church-brown text-white">
        <div className="container mx-auto grid gap-8 px-4 py-12 lg:grid-cols-2 lg:items-center lg:py-14">
          <div className="space-y-4">
            <Skeleton className="h-4 w-32 bg-white/20" />
            <Skeleton className="h-12 w-3/4 bg-white/20" />
            <Skeleton className="h-20 w-full bg-white/15" />
            <Skeleton className="h-11 w-40 bg-white/20" />
          </div>
          <Skeleton className="aspect-video w-full rounded-xl bg-white/15" />
        </div>
      </section>
    );
  }

  if (!sermon) return null;

  const thumb = sermonThumbnail(sermon);
  const date = formatSermonDate(sermon.preached_date || sermon.date);

  return (
    <section
      className="relative overflow-hidden bg-church-brown text-white"
      aria-labelledby="featured-sermon-heading"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <img
          src={monstrance}
          alt=""
          className="h-full w-full object-cover object-center opacity-25"
          loading="lazy"
          decoding="async"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, hsl(var(--church-brown) / 0.97) 0%, hsl(var(--church-brown) / 0.88) 42%, hsl(var(--church-brown) / 0.72) 70%, hsl(var(--church-brown) / 0.82) 100%)",
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto grid items-center gap-10 px-4 py-12 sm:py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(260px,0.95fr)] lg:gap-10">
        <Reveal className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
          <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-church-gold-soft sm:text-xs">
            {sermon.is_featured ? "Featured message" : "Latest message"}
          </p>
          <h2
            id="featured-sermon-heading"
            className="font-serif text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-tight text-white"
          >
            {sermon.title}
          </h2>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-white/75 lg:justify-start">
            <span className="inline-flex items-center gap-1.5">
              <User className="h-3.5 w-3.5" />
              {sermon.speaker}
            </span>
            {date ? (
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {date}
              </span>
            ) : null}
            {sermon.series ? (
              <span className="rounded-full border border-white/20 px-2.5 py-0.5 text-xs text-church-gold-soft">
                {sermon.series}
              </span>
            ) : null}
          </div>
          {sermon.description ? (
            <p className="mt-4 text-base leading-relaxed text-white/80 line-clamp-3 sm:text-lg">
              {sermon.description}
            </p>
          ) : null}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            {sermon.video_url ? (
              <Button variant="church" size="lg" onClick={() => onOpen(sermon)}>
                <Play className="mr-2 h-5 w-5" />
                Watch now
              </Button>
            ) : (
              <Button variant="church" size="lg" onClick={() => onOpen(sermon)}>
                View sermon
              </Button>
            )}
            {sermon.audio_url ? (
              <Button
                variant="outlineGold"
                size="lg"
                className="border-white/40 text-white hover:bg-white/10"
                onClick={() => onOpen(sermon)}
              >
                <Headphones className="mr-2 h-5 w-5" />
                Listen
              </Button>
            ) : null}
            {sermon.notes_url || sermon.sermon_notes ? (
              <Button
                variant="ghost"
                size="lg"
                className="text-white hover:bg-white/10 hover:text-white"
                onClick={() => onOpen(sermon)}
              >
                <FileText className="mr-2 h-5 w-5" />
                Notes
              </Button>
            ) : null}
          </div>
        </Reveal>

        <Reveal from="right" delay={80} className="relative mx-auto w-full max-w-lg lg:mx-0">
          <button
            type="button"
            onClick={() => onOpen(sermon)}
            className="group relative block w-full overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-gold"
          >
            {thumb ? (
              <img
                src={thumb}
                alt=""
                className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className="flex aspect-video w-full items-center justify-center bg-church-charcoal/40">
                <img src={monstrance} alt="" className="h-2/3 w-auto object-contain opacity-80" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-church-charcoal/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl">
                <Play className="ml-1 h-8 w-8" />
              </span>
            </div>
            {sermon.duration ? (
              <span className="absolute bottom-3 right-3 rounded bg-church-charcoal/90 px-2 py-1 text-xs font-medium text-church-pearl">
                {sermon.duration}
              </span>
            ) : null}
          </button>
        </Reveal>
      </div>
    </section>
  );
};

export default SermonFeaturedHero;
