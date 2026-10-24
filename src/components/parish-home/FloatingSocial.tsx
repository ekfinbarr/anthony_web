import type { IconType } from "react-icons";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
// TikTok & X — re-enable when parish accounts are created and verified:
// import { FaTiktok, FaTwitter } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa6";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

type SocialLink = {
  name: string;
  href: string;
  label: string;
  icon: IconType;
};

const links: SocialLink[] = [
  { name: "Facebook", href: site.social.facebook, label: "St. Anthony, Gbaja on Facebook", icon: FaFacebookF },
  { name: "Instagram", href: site.social.instagram, label: "St. Anthony, Gbaja on Instagram", icon: FaInstagram },
  { name: "YouTube", href: site.social.youtube, label: "St. Anthony, Gbaja on YouTube", icon: FaYoutube },
  // { name: "TikTok", href: site.social.tiktok, label: "St. Anthony, Gbaja on TikTok", icon: FaTiktok },
  // { name: "X", href: site.social.twitter, label: "St. Anthony, Gbaja on X", icon: FaTwitter },
  ...(site.social.whatsapp
    ? [{ name: "WhatsApp", href: site.social.whatsapp, label: "Join St. Anthony, Gbaja on WhatsApp", icon: FaWhatsapp }]
    : []),
].filter((link) => Boolean(link.href));

const FloatingSocial = () => {
  if (links.length === 0) return null;

  return (
    <nav
      aria-label="Parish social media"
      className="fixed right-0 top-1/2 z-40 flex -translate-y-1/2 flex-col bg-church-gold shadow-md"
    >
      {links.map((link, index) => {
        const Icon = link.icon;
        return (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className={cn(
              "flex h-11 w-11 items-center justify-center text-church-charcoal transition-colors hover:bg-church-charcoal hover:text-church-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-church-charcoal",
              index > 0 && "border-t border-church-charcoal/20",
            )}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
          </a>
        );
      })}
    </nav>
  );
};

export default FloatingSocial;
