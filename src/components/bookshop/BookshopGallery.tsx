import { useCallback, useEffect, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { bookshopSlides } from "@/data/bookshopContent";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 4500;

const BookshopGallery = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const onSelect = useCallback((carousel: CarouselApi) => {
    if (!carousel) return;
    setCurrent(carousel.selectedScrollSnap());
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
      className="overflow-hidden rounded-lg shadow-lg"
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
        opts={{ loop: true, duration: 30 }}
        className="w-full"
        aria-label="Parish bookshop photos"
      >
        <CarouselContent className="-ml-0">
          {bookshopSlides.map((slide, index) => (
            <CarouselItem key={slide.alt} className="pl-0">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-church-pearl">
                <img
                  src={slide.src}
                  alt={slide.alt}
                  width={640}
                  height={480}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={index === 0 ? "high" : undefined}
                  className="h-full w-full object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-church-charcoal/55 via-church-charcoal/20 to-transparent"
          aria-hidden="true"
        />

        <CarouselPrevious
          className={cn(
            "left-2 top-1/2 z-10 h-9 w-9 -translate-y-1/2 border-0 bg-white/90 text-church-charcoal shadow-md",
            "hover:bg-white hover:text-church-charcoal",
            "disabled:opacity-40 sm:h-10 sm:w-10",
          )}
        />
        <CarouselNext
          className={cn(
            "right-2 top-1/2 z-10 h-9 w-9 -translate-y-1/2 border-0 bg-white/90 text-church-charcoal shadow-md",
            "hover:bg-white hover:text-church-charcoal",
            "disabled:opacity-40 sm:h-10 sm:w-10",
          )}
        />

        <div
          className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 sm:bottom-4"
          role="tablist"
          aria-label="Bookshop photo slides"
        >
          {bookshopSlides.map((slide, index) => (
            <button
              key={slide.alt}
              type="button"
              role="tab"
              aria-selected={index === current}
              aria-label={`Show photo ${index + 1}: ${slide.alt}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === current
                  ? "w-6 bg-church-gold shadow-sm sm:w-7"
                  : "w-2 bg-white/70 hover:bg-white",
              )}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
};

export default BookshopGallery;
