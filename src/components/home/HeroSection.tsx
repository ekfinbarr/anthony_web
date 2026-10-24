import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { BellIcon, ChurchFrontIcon, CommunityIcon, FontIcon } from "@/components/icons/ParishIcons";
import { Link } from "react-router-dom";
import churchHero from "@/assets/images/congregation.jpg";
import droneVideo from "@/assets/videos/drone_spec.mp4";
import { site } from "@/config/site";

const HERO_SLIDES = [
  {
    title: "Welcome Home",
    subtitle: site.slogan,
    image: churchHero,
    cta: "Join Parish",
    link: "/register",
  },
  {
    title: "Join Us for Holy Mass",
    subtitle: "Holy Mass at Mornings and Evenings",
    image: churchHero,
    cta: "Attend Mass",
    link: "/visit",
  },
  {
    title: "Making a Difference",
    subtitle: "Serving Our Community Together",
    image: churchHero,
    cta: "Get Involved",
    link: "/groups",
  },
] as const;

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  // Rotation pauses while the visitor hovers or focuses the hero (WCAG 2.2.2)
  // and never starts for visitors who prefer reduced motion.
  const [paused, setPaused] = useState(false);
  const [reducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (paused || reducedMotion) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [paused, reducedMotion]);

  return (
    <section
      className="relative -mt-20 flex min-h-svh flex-col overflow-hidden"
      aria-label="Welcome"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Background Video (decorative). The poster paints immediately while the video loads. */}
      <video
        src={droneVideo}
        poster={churchHero}
        autoPlay={!reducedMotion}
        loop
        muted
        playsInline
        preload={reducedMotion ? "none" : "auto"}
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-church-charcoal/80 via-church-charcoal/50 to-church-charcoal/20" />

      {/* Background Images */}
      {/* {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="absolute inset-0 hero-overlay" />
        </div>
      ))} */}

      {/* Geometric Pattern Overlay */}
      {/* <div className="absolute inset-0 pattern-geometric pointer-events-none" /> */}

      {/* Content */}
      <div className="relative container mx-auto flex flex-1 items-center px-4 pb-24 pt-28 md:pb-32">
        <div className="max-w-3xl">
          <div className="animate-fade-in">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-church-pearl/30 bg-church-charcoal/30 px-3 py-1 text-sm text-church-pearl">
              <ChurchFrontIcon framed={false} className="h-4 w-4" />
              {site.shortName}
            </p>
            {/* Rotating slogan — styled as a headline, but the page's h1 is the parish name below. */}
            <p className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-church-pearl mb-4 text-shadow-hero">
              {HERO_SLIDES[currentSlide].title}
            </p>
            <p className="text-xl md:text-2xl text-church-pearl/90 mb-8 text-shadow-hero">
              {HERO_SLIDES[currentSlide].subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="church" size="xl" className="group" asChild>
                <Link to={HERO_SLIDES[currentSlide].link}>
                  {HERO_SLIDES[currentSlide].cta}
                  <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" className="bg-church-pearl/10 border-church-pearl text-church-pearl hover:bg-church-pearl/20" asChild>
                <Link to="/events">
                  Upcoming Events
                </Link>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-12 max-w-md">
            <Link to="/visit" className="text-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-pearl">
              <BellIcon className="mx-auto mb-2 h-10 w-10" />
              <span className="block text-sm text-church-pearl/80">Mass Schedule</span>
            </Link>
            <Link to="/sacraments" className="text-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-pearl">
              <FontIcon className="mx-auto mb-2 h-10 w-10" />
              <span className="block text-sm text-church-pearl/80">Sacraments</span>
            </Link>
            <Link to="/groups" className="text-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-pearl">
              <CommunityIcon className="mx-auto mb-2 h-10 w-10" />
              <span className="block text-sm text-church-pearl/80">Organizations</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-16 left-1/2 flex -translate-x-1/2 space-x-4 md:bottom-28 lg:bottom-32">
        {HERO_SLIDES.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Show slide ${index + 1}: ${HERO_SLIDES[index].title}`}
            aria-current={index === currentSlide ? "true" : undefined}
            onClick={() => setCurrentSlide(index)}
            className={`relative w-2 h-2 rounded-full transition-all after:absolute after:-inset-2 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-pearl ${index === currentSlide
              ? "w-8 bg-primary"
              : "bg-church-pearl/50 hover:bg-church-pearl/70"
              }`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;