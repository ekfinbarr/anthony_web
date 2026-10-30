import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Cross } from "lucide-react";
import {
  ChaliceIcon,
  CommunityIcon,
  HandsIcon,
  ProjectorIcon,
} from "@/components/icons/ParishIcons";
import type { ParishIconProps } from "@/components/icons/ParishIcon";
import Reveal from "@/components/parish-home/Reveal";
import SectionWaveTransition from "@/components/home/SectionWaveTransition";
import { cn } from "@/lib/utils";

type QuickAccessItem = {
  label: string;
  description: string;
  to: string;
  Icon: ComponentType<ParishIconProps>;
};

const quickAccessItems: QuickAccessItem[] = [
  {
    label: "Join Parish",
    description: "Become a member of our faith community.",
    to: "/register",
    Icon: CommunityIcon,
  },
  {
    label: "Livestream",
    description: "Watch our Masses and special events online.",
    to: "/live",
    Icon: ProjectorIcon,
  },
  {
    label: "Mass Intentions",
    description: "Offer Mass for your loved ones and special intentions.",
    to: "/book-mass",
    Icon: ChaliceIcon,
  },
  {
    label: "Support",
    description: "Help us continue our mission and ministries.",
    to: "/donations",
    Icon: HandsIcon,
  },
];

const QuickAccessSection = () => {
  return (
    <section
      className="relative bg-church-ivory"
      aria-labelledby="quick-access-heading"
    >
      <div className="container mx-auto px-4 pb-5 pt-10 sm:pb-7 sm:pt-12 md:pt-14">
        <Reveal className="mx-auto mb-7 max-w-2xl text-center sm:mb-9">
          <div className="mb-4 flex items-center justify-center gap-3" aria-hidden="true">
            <span className="h-px w-10 bg-church-gold-warm sm:w-14" />
            <Cross className="h-5 w-5 text-church-gold-warm" strokeWidth={2.25} />
            <span className="h-px w-10 bg-church-gold-warm sm:w-14" />
          </div>
          {/* <h2
            id="quick-access-heading"
            className="font-heading text-2xl font-bold tracking-tight text-church-charcoal sm:text-3xl md:text-4xl"
          >
            Quick Access
          </h2> */}
          {/* <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:mt-3 sm:text-base md:text-lg">
            Explore our key services and stay connected with our parish community.
          </p> */}
        </Reveal>

        {/* Mobile: stacked list · Tablet: 2-up · Desktop: 4-up — all use the same compact horizontal card */}
        <ul className="mx-auto grid max-w-6xl list-none grid-cols-1 gap-3 p-0 md:grid-cols-2 md:gap-4 xl:grid-cols-4">
          {quickAccessItems.map(({ label, description, to, Icon }, index) => (
            <li key={label} className="min-w-0">
              <Reveal delay={index * 50} className="h-full">
                <Link
                  to={to}
                  className={cn(
                    "quick-access-card group flex h-full items-center gap-3 rounded-2xl border border-church-brown/8 bg-white",
                    "px-3.5 py-3 shadow-card-soft sm:gap-3.5 sm:px-4 sm:py-3.5",
                    "outline-none transition-[transform,box-shadow,border-color] duration-300",
                    "hover:border-church-gold-warm/35 hover:shadow-lg",
                    "focus-visible:ring-2 focus-visible:ring-church-gold-warm focus-visible:ring-offset-2 focus-visible:ring-offset-church-ivory",
                    "active:scale-[0.99] motion-safe:hover:-translate-y-0.5"
                  )}
                >
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[hsl(30_42%_90%)] text-church-brown sm:h-12 sm:w-12"
                    aria-hidden="true"
                  >
                    <Icon
                      framed={false}
                      size="sm"
                      className="h-6 w-6 sm:h-7 sm:w-7"
                    />
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-[0.95rem] font-semibold leading-tight text-church-brown sm:text-base">
                      {label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted-foreground sm:text-[0.8125rem] sm:leading-relaxed">
                      {description}
                    </span>
                  </span>

                  <span
                    className={cn(
                      "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9",
                      "bg-church-gold-warm text-white shadow-sm",
                      "transition-transform duration-300 motion-safe:group-hover:translate-x-0.5"
                    )}
                    aria-hidden="true"
                  >
                    <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.25} />
                  </span>
                </Link>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>

      <SectionWaveTransition />
    </section>
  );
};

export default QuickAccessSection;
