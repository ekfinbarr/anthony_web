import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
// TikTok & X — re-enable when parish accounts are created and verified:
// import { FaTiktok, FaTwitter } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa6";
import { site } from "@/config/site";

type Platform = {
  name: string;
  href: string;
  label: string;
  icon: IconType;
  color: string;
};

const platforms: Platform[] = [
  { name: "Facebook", href: site.social.facebook, label: "St. Anthony, Gbaja on Facebook", icon: FaFacebookF, color: "#1877F2" },
  { name: "Instagram", href: site.social.instagram, label: "St. Anthony, Gbaja on Instagram", icon: FaInstagram, color: "#E4405F" },
  { name: "YouTube", href: site.social.youtube, label: "St. Anthony, Gbaja on YouTube", icon: FaYoutube, color: "#FF0000" },
  // { name: "TikTok", href: site.social.tiktok, label: "St. Anthony, Gbaja on TikTok", icon: FaTiktok, color: "#111111" },
  // { name: "X", href: site.social.twitter, label: "St. Anthony, Gbaja on X", icon: FaTwitter, color: "#111111" },
  ...(site.social.whatsapp
    ? [{ name: "WhatsApp", href: site.social.whatsapp, label: "Join St. Anthony, Gbaja on WhatsApp", icon: FaWhatsapp, color: "#25D366" }]
    : []),
].filter((platform) => Boolean(platform.href));

const SocialPlatforms = ({ children }: { children?: ReactNode }) => {
  if (platforms.length === 0 && !children) return null;

  return (
    <section aria-labelledby="social-platforms-heading" className="bg-background py-14 md:py-16">
      <div className="container mx-auto px-4 text-center">
        <h2 id="social-platforms-heading" className="mb-3 font-heading text-3xl font-bold text-church-charcoal md:text-4xl">
          Stay connected
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
          Follow the parish on social media for news, Mass, and parish life.
        </p>
        <ul className="flex flex-wrap items-start justify-center gap-x-6 gap-y-8 sm:gap-x-10">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <li key={platform.name}>
                <a
                  href={platform.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={platform.label}
                  className="group flex w-24 flex-col items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background transition-colors group-hover:border-church-gold">
                    <Icon aria-hidden="true" className="h-7 w-7" style={{ color: platform.color }} />
                  </span>
                  <span className="text-sm font-bold text-church-charcoal">{platform.name}</span>
                </a>
              </li>
            );
          })}
        </ul>
        {children}
      </div>
    </section>
  );
};

export default SocialPlatforms;
