import { Link } from "react-router-dom";
import { EnvelopeIcon, PhoneIcon, PinIcon } from "@/components/icons/ParishIcons";
import { Separator } from "@/components/ui/separator";
import logo from "@/assets/images/logo-128.webp";
import SocialMediaLinks from "@/components/ui/SocialMediaLinks";
import { formatAddress, mapsSearchUrl, site } from "@/config/site";

const exploreLinks = [
  { to: "/visit", label: "Mass Times & Visit" },
  { to: "/serve-others", label: "Serve Others" },
  { to: "/groups", label: "Groups & Organizations" },
  { to: "/sacraments", label: "Sacraments" },
  { to: "/daily-readings", label: "Daily Readings" },
  { to: "/order-of-mass", label: "Order of Mass & Rites" },
  { to: "/news", label: "Parish News" },
  { to: "/contact", label: "Contact Us" },
];

const Footer = () => {
  return (
    <footer className="border-t border-church-pearl/10 bg-church-charcoal text-church-pearl">
      <div className="container mx-auto px-4 pt-14 pb-8">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-gradient-gold p-1.5">
                <img
                  src={logo}
                  alt=""
                  width={56}
                  height={56}
                  loading="lazy"
                  decoding="async"
                  className="h-12 w-12 object-contain"
                />
              </div>
              <p className="font-heading text-xl font-bold">{site.name}</p>
            </div>
            <p className="mb-5 text-sm text-church-pearl/80">{site.slogan}</p>
            <SocialMediaLinks size="small" color="white" variant="outline" />
          </div>

          {/* Explore */}
          <nav aria-labelledby="footer-explore">
            <h2 id="footer-explore" className="mb-4 font-heading text-lg font-semibold">
              Explore
            </h2>
            <ul className="space-y-2.5">
              {exploreLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-church-pearl/80 transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h2 className="mb-4 font-heading text-lg font-semibold">Contact</h2>
            <address className="not-italic space-y-3">
              <div className="flex items-start gap-2">
                <PinIcon className="mt-0.5 h-5 w-5 shrink-0" />
                <a
                  href={mapsSearchUrl(site)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-church-pearl/80 transition-colors hover:text-primary"
                >
                  {formatAddress(site.address)}
                </a>
              </div>
              {site.telephone && (
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-5 w-5 shrink-0" />
                  <a
                    href={`tel:${site.telephone.replace(/[^+\d]/g, "")}`}
                    className="text-sm text-church-pearl/80 transition-colors hover:text-primary"
                  >
                    {site.telephone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <EnvelopeIcon className="h-5 w-5 shrink-0" />
                <a
                  href={`mailto:${site.email}`}
                  className="text-sm text-church-pearl/80 transition-colors hover:text-primary"
                >
                  {site.email}
                </a>
              </div>
            </address>
          </div>
        </div>

        <Separator className="mb-6 bg-church-pearl/20" />

        <div className="flex flex-col items-center gap-4 text-sm md:flex-row md:justify-between">
          <nav
            aria-label="Legal"
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
          >
            <Link
              to="/privacy-policy"
              className="text-church-pearl/80 transition-colors hover:text-primary"
            >
              Privacy Policy
            </Link>
            <span className="text-church-pearl/40" aria-hidden="true">
              •
            </span>
            <Link
              to="/terms-of-service"
              className="text-church-pearl/80 transition-colors hover:text-primary"
            >
              Terms of Service
            </Link>
            <span className="text-church-pearl/40" aria-hidden="true">
              •
            </span>
            <Link
              to="/cookies"
              className="text-church-pearl/80 transition-colors hover:text-primary"
            >
              Cookie Policy
            </Link>
          </nav>
          <div className="flex flex-col items-center gap-1 text-center text-church-pearl/60 md:items-end md:text-right">
            <p>© {new Date().getFullYear()} {site.name}. All rights reserved.</p>
            <p>
              Powered by{" "}
              <a
                href="https://profinek.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-church-pearl/80 transition-colors hover:text-primary"
              >
                Profinek
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
