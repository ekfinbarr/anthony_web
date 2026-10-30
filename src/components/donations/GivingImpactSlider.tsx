/**
 * "Where your gift goes": photos of parish projects and programmes, shown
 * below the donation form. Each slide can pick its fund and return the giver
 * to the form.
 */

import { useEffect, useState } from "react";
import { ArrowRight, Pause, Play } from "lucide-react";
import charityFund from "@/assets/images/giving/charity_for_needy.jpg";
import tithesOfferings from "@/assets/images/giving/tithes-offerings.jpg";
import harvestThanksgiving from "@/assets/images/giving/harvest.jpg";
import churchRenovation from "@/assets/images/giving/renovation.jpg";
import pastoralCentre from "@/assets/images/giving/pastoral_centre_lagos.webp";
import altarFlowers from "@/assets/images/giving/flower_decoration.jpeg";
import otherGiving from "@/assets/images/giving/other-giving.jpg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { FUND_TONE, fundMeta, givingCategories, type GivingCategory } from "@/components/donations/givingCategories";
import { TONE_BADGE } from "@/lib/bookingStatus";
import { useCarouselValue } from "@/hooks/useCarouselValue";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

const SLIDES: Array<{ title: string; image: string; story: string; categoryId: GivingCategory["id"] }> = [
  { title: "Church Renovation", image: churchRenovation, categoryId: "projects", story: "New pews, a sound roof and a church that stays open to everyone." },
  { title: "Pastoral Centre Project", image: pastoralCentre, categoryId: "projects", story: "Rooms for catechism, meetings and parish life to grow." },
  { title: "Charity Fund", image: charityFund, categoryId: "charity", story: "Food, school fees and care for families who need a hand." },
  { title: "Tithes & Offerings", image: tithesOfferings, categoryId: "tithe", story: "Keeps Masses, sacraments and daily parish work going." },
  { title: "Harvest & Thanksgiving", image: harvestThanksgiving, categoryId: "tithe", story: "Our yearly thanks to God, shared with the whole parish." },
  { title: "Altar Flowers", image: altarFlowers, categoryId: "freewill", story: "Beauty at the altar for Sundays, feasts and celebrations." },
  { title: "Other Parish Needs", image: otherGiving, categoryId: "freewill", story: "Wherever the need is greatest, from liturgy to outreach." },
];

const AUTOPLAY_MS = 5000;

/** Scattered coins and hearts behind the heading. */
function ImpactDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 120" fill="none" aria-hidden className={className}>
      <circle cx="40" cy="60" r="26" fill="currentColor" opacity="0.10" />
      <circle cx="40" cy="60" r="16" stroke="currentColor" strokeWidth="3" opacity="0.35" />
      <circle cx="180" cy="38" r="18" fill="currentColor" opacity="0.10" />
      <circle cx="180" cy="38" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
      <path d="M110 92c-10-8-18-14-18-22a9 9 0 0 1 18-2 9 9 0 0 1 18 2c0 8-8 14-18 22z" fill="currentColor" opacity="0.25" className="motion-safe:animate-pulse" />
      <path d="M150 96l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" fill="currentColor" opacity="0.35" />
      <path d="M78 18l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

interface GivingImpactSliderProps {
  /** Called with the fund a slide belongs to when the giver taps "Give to this". */
  onGive: (category: GivingCategory) => void;
}

export default function GivingImpactSlider({ onGive }: GivingImpactSliderProps) {
  const [api, setApi] = useState<CarouselApi>();
  const current = useCarouselValue(api, (carousel) => carousel.selectedScrollSnap(), 0);
  const snapCount = useCarouselValue(api, (carousel) => carousel.scrollSnapList().length, SLIDES.length);
  const [hovering, setHovering] = useState(false);
  const [stopped, setStopped] = useState(false);
  const reduceMotion = usePrefersReducedMotion();
  const playing = !stopped && !hovering && !reduceMotion;

  useEffect(() => {
    if (!api || !playing) return;
    const id = window.setInterval(() => api.scrollNext(), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [api, playing, current]);

  return (
    <section className="relative overflow-hidden bg-gradient-church py-14 md:py-20" aria-labelledby="impact-heading">
      <ImpactDoodle className="pointer-events-none absolute -left-10 top-6 h-32 w-56 text-church-charcoal md:left-8" />
      <ImpactDoodle className="pointer-events-none absolute -right-12 bottom-4 h-32 w-56 rotate-180 text-church-charcoal md:right-8" />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto mb-8 max-w-2xl text-center md:mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-church-charcoal/70">Where your gift goes</p>
          <h2 id="impact-heading" className="mt-2 text-3xl font-heading font-bold text-church-charcoal md:text-4xl">
            See what your generosity builds
          </h2>
          <p className="mt-3 text-church-charcoal/80">
            A quick look at the projects and programmes your donations keep alive.
          </p>
        </div>

        <div
          className="mx-auto max-w-6xl"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onFocusCapture={() => setHovering(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHovering(false);
          }}
        >
          <Carousel setApi={setApi} opts={{ loop: true, align: "start", duration: 30 }} className="w-full" aria-label="Parish projects and programmes">
            {/* Phones show most of one slide with the next peeking in, as a cue to swipe. */}
            <CarouselContent className="-ml-4">
              {SLIDES.map((slide, index) => {
                const category = givingCategories.find((c) => c.id === slide.categoryId) ?? givingCategories[0];
                const fund = fundMeta(category.type);
                const tone = FUND_TONE[fund.tone];
                return (
                  <CarouselItem
                    key={slide.title}
                    className="basis-[85%] pl-4 sm:basis-1/2 lg:basis-1/3"
                    aria-label={`${index + 1} of ${SLIDES.length}: ${slide.title}`}
                  >
                    <article className="group flex h-full flex-col overflow-hidden rounded-2xl bg-white/95 shadow-md transition-all duration-300 motion-safe:hover:-translate-y-1 hover:shadow-xl">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img
                          src={slide.image}
                          alt={slide.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out motion-safe:group-hover:scale-110"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                        <span className={cn("absolute left-3 top-3 rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-sm", TONE_BADGE[fund.tone])}>
                          {fund.label}
                        </span>
                        <h3 className="absolute inset-x-0 bottom-0 p-4 text-left font-heading text-xl font-semibold text-white drop-shadow">
                          {slide.title}
                        </h3>
                      </div>
                      <span aria-hidden className={cn("h-1 w-full origin-left scale-x-50 transition-transform duration-500 group-hover:scale-x-100", tone.bar)} />
                      <div className="flex flex-1 flex-col gap-4 p-4 text-left">
                        <p className="flex-1 text-sm text-muted-foreground">{slide.story}</p>
                        <button
                          type="button"
                          onClick={() => onGive(category)}
                          className={cn(
                            "inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            tone.bg,
                            tone.text,
                            "hover:brightness-95",
                          )}
                        >
                          Give to {category.name}
                          <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" aria-hidden />
                        </button>
                      </div>
                    </article>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <CarouselPrevious className="static left-auto top-auto translate-x-0 translate-y-0 border-0 bg-white/90 text-church-charcoal shadow-md hover:bg-white" />
              <div className="flex items-center gap-2" role="tablist" aria-label="Project slides">
                {Array.from({ length: snapCount }, (_, index) => {
                  const active = index === current;
                  return (
                    <button
                      key={SLIDES[index]?.title ?? index}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      aria-label={`Show ${SLIDES[index]?.title ?? `slide ${index + 1}`}`}
                      onClick={() => api?.scrollTo(index)}
                      className={cn(
                        "relative h-2.5 overflow-hidden rounded-full transition-all duration-300",
                        active ? "w-9 bg-church-charcoal/30" : "w-2.5 bg-church-charcoal/35 hover:bg-church-charcoal/60",
                      )}
                    >
                      {/* The active dot fills up while autoplay counts down to the next slide. */}
                      {active ? (
                        <span
                          key={`${current}-${playing}`}
                          className={cn(
                            "absolute inset-0 origin-left rounded-full bg-church-charcoal",
                            playing && "animate-[grow-x_var(--autoplay)_linear_both]",
                          )}
                          style={{ ["--autoplay" as string]: `${AUTOPLAY_MS}ms` }}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <CarouselNext className="static left-auto top-auto translate-x-0 translate-y-0 border-0 bg-white/90 text-church-charcoal shadow-md hover:bg-white" />
              {!reduceMotion ? (
                <button
                  type="button"
                  onClick={() => setStopped((value) => !value)}
                  aria-label={stopped ? "Play slideshow" : "Pause slideshow"}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-church-charcoal shadow-md transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-charcoal"
                >
                  {stopped ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />}
                </button>
              ) : null}
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
}
