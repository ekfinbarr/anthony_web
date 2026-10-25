import type { IconType } from "react-icons";
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa6";
import Reveal from "@/components/parish-home/Reveal";
import type { PublicContactInfo } from "@/hooks/usePublicSiteSettings";

type ContactSocialProps = {
  social: PublicContactInfo["social"];
};

type Platform = {
  name: string;
  href: string;
  label: string;
  icon: IconType;
  color: string;
};

const ContactSocial = ({ social }: ContactSocialProps) => {
  const platforms: Platform[] = [
    social.facebook && {
      name: "Facebook",
      href: social.facebook,
      label: "St. Anthony, Gbaja on Facebook",
      icon: FaFacebookF,
      color: "#1877F2",
    },
    social.instagram && {
      name: "Instagram",
      href: social.instagram,
      label: "St. Anthony, Gbaja on Instagram",
      icon: FaInstagram,
      color: "#E4405F",
    },
    social.youtube && {
      name: "YouTube",
      href: social.youtube,
      label: "St. Anthony, Gbaja on YouTube",
      icon: FaYoutube,
      color: "#FF0000",
    },
    // social.twitter && {
    //   name: "X",
    //   href: social.twitter,
    //   label: "St. Anthony, Gbaja on X",
    //   icon: FaTwitter,
    //   color: "#111111",
    // },
    social.whatsapp && {
      name: "WhatsApp",
      href: social.whatsapp,
      label: "Join St. Anthony, Gbaja on WhatsApp",
      icon: FaWhatsapp,
      color: "#25D366",
    },
  ].filter((p): p is Platform => Boolean(p));

  if (platforms.length === 0) return null;

  return (
    <section
      aria-labelledby="contact-social-heading"
      className="scroll-mt-24 bg-church-pearl py-14 md:py-16"
    >
      <div className="container mx-auto px-4 text-center">
        <Reveal>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-church-gold">
            Stay connected
          </p>
          <h2
            id="contact-social-heading"
            className="mb-3 font-heading text-3xl font-bold text-church-charcoal md:text-4xl"
          >
            Follow the Parish
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-muted-foreground md:text-lg">
            News, Mass updates, and parish life on our social channels.
          </p>
        </Reveal>

        <Reveal delay={80}>
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
                    <span className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-background transition-all duration-300 group-hover:border-church-gold group-hover:shadow-md motion-reduce:transition-none">
                      <Icon
                        aria-hidden="true"
                        className="h-7 w-7 transition-transform duration-300 group-hover:scale-110 motion-reduce:group-hover:scale-100"
                        style={{ color: platform.color }}
                      />
                    </span>
                    <span className="text-sm font-bold text-church-charcoal">{platform.name}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
};

export default ContactSocial;
