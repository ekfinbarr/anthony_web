import { ArrowRight } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import Reveal from "@/components/parish-home/Reveal";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Conspicuous invite to the parish WhatsApp community.
 * Renders only when `VITE_SOCIAL_WHATSAPP` is set (group invite or chat link).
 */
const WhatsAppCommunitySection = () => {
  const href = site.social.whatsapp;
  if (!href) return null;

  return (
    <section
      className="relative overflow-hidden bg-[#0B3D2E] py-14 text-white md:py-16 lg:py-20"
      aria-labelledby="whatsapp-community-heading"
    >
      {/* Soft green atmosphere */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 15% 40%, rgba(37, 211, 102, 0.28), transparent 55%), radial-gradient(ellipse 60% 50% at 90% 80%, rgba(37, 211, 102, 0.12), transparent 50%)",
        }}
      />
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full border border-white/10 sm:h-72 sm:w-72"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-10 h-64 w-64 rounded-full border border-[#25D366]/20"
        aria-hidden
      />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-8 text-center sm:gap-10 lg:max-w-5xl lg:flex-row lg:items-center lg:gap-14 lg:text-left">
          <Reveal className="shrink-0">
            <div
              className={cn(
                "mx-auto flex h-28 w-28 items-center justify-center rounded-full sm:h-32 sm:w-32 lg:mx-0 lg:h-36 lg:w-36",
                "bg-[#25D366] text-white shadow-[0_16px_48px_-12px_rgba(37,211,102,0.55)]",
                "ring-8 ring-[#25D366]/20",
                "transition-transform duration-500 motion-safe:hover:scale-105",
              )}
            >
              <FaWhatsapp className="h-14 w-14 sm:h-16 sm:w-16 lg:h-[4.5rem] lg:w-[4.5rem]" aria-hidden />
            </div>
          </Reveal>

          <div className="min-w-0 flex-1">
            <Reveal delay={80}>
              <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[#25D366] sm:text-xs">
                Parish community
              </p>
              <h2
                id="whatsapp-community-heading"
                className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl"
              >
                Join us on WhatsApp
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg lg:mx-0">
                Get parish announcements, Mass reminders, and community updates in our WhatsApp group.
                Stay connected with St. Anthony, Gbaja wherever you are.
              </p>
            </Reveal>

            <Reveal delay={160} className="mt-7 sm:mt-8">
              <Button
                size="lg"
                className={cn(
                  "group h-12 w-full rounded-full border-0 bg-[#25D366] px-8 text-base font-semibold text-white",
                  "shadow-[0_10px_28px_-10px_rgba(37,211,102,0.65)]",
                  "transition-[transform,background-color,box-shadow] duration-300",
                  "hover:bg-[#1EBE57] hover:shadow-[0_14px_32px_-10px_rgba(37,211,102,0.75)]",
                  "focus-visible:ring-[#25D366] focus-visible:ring-offset-[#0B3D2E]",
                  "active:scale-[0.98] sm:w-auto",
                )}
                asChild
              >
                <a href={href} target="_blank" rel="noopener noreferrer">
                  Join the WhatsApp group
                  <ArrowRight className="transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
                </a>
              </Button>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatsAppCommunitySection;
