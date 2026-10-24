import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChurchFrontIcon } from "@/components/icons/ParishIcons";
import HeroQuickLinks from "@/components/parish-home/HeroQuickLinks";
import { site } from "@/config/site";
import { formatMassTimes } from "@/config/parish";
import churchHero from "@/assets/images/congregation.jpg";
import droneVideo from "@/assets/videos/drone_spec.mp4";

const Hero = () => {
  const [reducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );

  return (
    <section className="relative -mt-20 flex min-h-svh flex-col overflow-hidden" aria-label="Welcome">
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
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-church-charcoal/80 via-church-charcoal/50 to-church-charcoal/20" />
      <div className="relative container mx-auto flex flex-1 items-center px-4 pb-10 pt-28">
        <div className="max-w-2xl animate-fade-in pr-14">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-church-pearl/30 bg-church-charcoal/30 px-3 py-1 text-sm text-church-pearl">
            <ChurchFrontIcon framed={false} className="h-4 w-4" />
            {site.shortName}
          </p>
          <h1 className="mb-4 font-heading text-4xl font-bold text-church-pearl text-shadow-hero md:text-5xl lg:text-6xl">
            {site.slogan}
          </h1>
          <p className="mb-3 text-xl text-church-pearl/95 text-shadow-hero md:text-2xl">{site.tagline}</p>
          {/* <p className="mb-6 max-w-xl text-base text-church-pearl/90 md:text-lg">
            A Catholic parish in Surulere where you are welcome at Mass, in prayer, and in the life of the community.
          </p> */}
          <p className="mb-8 text-sm text-church-pearl/90">
            Sunday Mass: <time>{formatMassTimes("Sunday")}</time>
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button variant="church" size="lg" className="group" asChild>
              <Link to="/registration">
                Join the parish
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button variant="outlineGold" size="lg" className="border-church-pearl text-church-pearl hover:bg-church-pearl hover:text-church-charcoal" asChild>
              <Link to="/visit">Mass times</Link>
            </Button>
          </div>
        </div>
      </div>
      {/* <HeroQuickLinks /> */}
    </section>
  );
};

export default Hero;
