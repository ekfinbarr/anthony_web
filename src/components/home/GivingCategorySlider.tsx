import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
import { cn } from "@/lib/utils";

const GIVING_CATEGORIES = [
  { title: "Charity Fund", image: charityFund },
  { title: "Tithes & Offerings", image: tithesOfferings },
  { title: "Harvest & Thanksgiving", image: harvestThanksgiving },
  { title: "Church Renovation", image: churchRenovation },
  { title: "Pastoral Centre Project", image: pastoralCentre },
  { title: "Altar Flowers", image: altarFlowers },
  { title: "Other", image: otherGiving },
] as const;

const AUTOPLAY_MS = 4500;

const GivingCategorySlider = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [snapCount, setSnapCount] = useState(GIVING_CATEGORIES.length);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const onSelect = useCallback((carousel: CarouselApi) => {
    if (!carousel) return;
    setCurrent(carousel.selectedScrollSnap());
    setSnapCount(carousel.scrollSnapList().length);
  }, []);

  useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("select", onSelect);
    api.on("reInit", onSelect);
    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!api || paused || reduceMotion) return;
    const id = window.setInterval(() => api.scrollNext(), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [api, paused, reduceMotion]);

  const pause = () => setPaused(true);
  const resume = () => setPaused(false);

  return (
    <div
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          resume();
        }
      }}
    >
      <Carousel
        setApi={setApi}
        opts={{ loop: true, align: "start", duration: 30 }}
        className="w-full"
        aria-label="Parish giving categories"
      >
        <CarouselContent className="-ml-4">
          {GIVING_CATEGORIES.map((category) => (
            <CarouselItem key={category.title} className="pl-4 sm:basis-1/2 lg:basis-1/3">
              <Link
                to="/donations"
                className="group block overflow-hidden rounded-xl bg-white/90 shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-charcoal focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={category.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[hsl(43_70%_42%/0.45)] via-[hsl(43_96%_56%/0.12)] to-transparent" />
                </div>
                <p className="bg-white/95 px-4 py-3 text-center font-heading text-lg font-semibold text-church-charcoal">
                  {category.title}
                </p>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div className="mt-6 flex items-center justify-center gap-3">
          <CarouselPrevious className="static left-auto top-auto translate-x-0 translate-y-0 border-0 bg-white/90 text-church-charcoal shadow-md hover:bg-white" />
          <div className="flex items-center justify-center gap-2" role="tablist" aria-label="Giving category slides">
            {Array.from({ length: snapCount }, (_, index) => (
              <button
                key={GIVING_CATEGORIES[index]?.title ?? index}
                type="button"
                role="tab"
                aria-selected={index === current}
                aria-label={`Show ${GIVING_CATEGORIES[index]?.title ?? `slide ${index + 1}`}`}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300",
                  index === current ? "w-7 bg-church-charcoal" : "w-2.5 bg-church-charcoal/35 hover:bg-church-charcoal/60",
                )}
                onClick={() => api?.scrollTo(index)}
              />
            ))}
          </div>
          <CarouselNext className="static right-auto top-auto translate-x-0 translate-y-0 border-0 bg-white/90 text-church-charcoal shadow-md hover:bg-white" />
        </div>
      </Carousel>
    </div>
  );
};

export default GivingCategorySlider;
