import { useCallback, useEffect, useRef, useState } from "react";
import dap from "@/assets/images/about/monstrance.jpg";
import churchHero from "@/assets/images/about/drone_spec.mp4";
import churchBanner from "@/assets/images/about/altar.png";
import pastoralCentre from "@/assets/images/pastoral_centre_lagos.webp";
import harvest from "@/assets/images/about/altar.png";
import charity from "@/assets/images/about/stanthony.jpg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type StorySlide =
  | { type: "image"; src: string; alt: string }
  | { type: "video"; src: string; alt: string };

const SLIDES: StorySlide[] = [
  // {
  //   type: "image",
  //   src: dap,
  //   alt: "Aerial view of St. Anthony Catholic Church, Gbaja, with parishioners gathered at the entrance",
  // },
  {
    type: "video",
    src: churchHero,
    alt: "Aerial drone footage of St. Anthony Catholic Church, Gbaja",
  },
  // {
  //   type: "image",
  //   src: churchBanner,
  //   alt: "St. Anthony Catholic Church, Gbaja parish grounds and campus",
  // },
  // {
  //   type: "image",
  //   src: pastoralCentre,
  //   alt: "Pastoral centre at St. Anthony Catholic Church, Gbaja",
  // },
  // {
  //   type: "image",
  //   src: harvest,
  //   alt: "Parish community gathered for harvest thanksgiving at St. Anthony, Gbaja",
  // },
  {
    type: "image",
    src: charity,
    alt: "Parishioners serving the needy through charity outreach",
  },
];

const AUTOPLAY_MS = 4500;

const StoryVideo = ({ src, alt, active }: { src: string; alt: string; active: boolean }) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (active) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [active]);

  return (
    <video
      ref={ref}
      src={src}
      className="h-full w-full object-cover"
      muted
      loop
      playsInline
      aria-label={alt}
    />
  );
};

const AboutStorySlider = () => {
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
        aria-label="Parish life photos"
      >
        <CarouselContent className="-ml-0">
          {SLIDES.map((slide, index) => (
            <CarouselItem key={slide.alt} className="pl-0">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-church-pearl">
                {slide.type === "video" ? (
                  <StoryVideo src={slide.src} alt={slide.alt} active={index === current} />
                ) : (
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
                )}
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
          aria-label="Story photo slides"
        >
          {SLIDES.map((slide, index) => (
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

export default AboutStorySlider;
