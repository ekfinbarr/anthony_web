import type { ReactNode } from "react";
import { EnvelopeIcon, PhoneIcon, PinIcon } from "@/components/icons/ParishIcons";
import { Skeleton } from "@/components/ui/skeleton";
import Reveal from "@/components/parish-home/Reveal";
import type { PublicContactInfo } from "@/hooks/usePublicSiteSettings";
import { site } from "@/config/site";

type ContactInfoProps = {
  contact: PublicContactInfo;
  isLoading?: boolean;
};

const telHref = (phone: string) => `tel:${phone.replace(/[^+\d]/g, "")}`;

const ContactInfo = ({ contact, isLoading }: ContactInfoProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Loading contact details">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const rows: Array<{
    key: string;
    icon: typeof PinIcon;
    title: string;
    body: ReactNode;
  }> = [
    {
      key: "address",
      icon: PinIcon,
      title: "Address",
      body: (
        <address className="not-italic text-muted-foreground">
          <span className="block font-medium text-church-charcoal">{site.name}</span>
          {contact.address}
        </address>
      ),
    },
  ];

  if (contact.phone) {
    rows.push({
      key: "phone",
      icon: PhoneIcon,
      title: "Phone",
      body: (
        <a
          href={telHref(contact.phone)}
          className="text-muted-foreground transition-colors hover:text-primary"
        >
          {contact.phone}
        </a>
      ),
    });
  }

  rows.push({
    key: "email",
    icon: EnvelopeIcon,
    title: "Email",
    body: (
      <a
        href={`mailto:${contact.email}`}
        className="break-all text-muted-foreground transition-colors hover:text-primary"
      >
        {contact.email}
      </a>
    ),
  });

  if (contact.emergency) {
    rows.push({
      key: "emergency",
      icon: PhoneIcon,
      title: "Emergency",
      body: (
        <a
          href={telHref(contact.emergency)}
          className="text-muted-foreground transition-colors hover:text-primary"
        >
          {contact.emergency}
        </a>
      ),
    });
  }

  return (
    <Reveal from="right" delay={40}>
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-church-gold">
          Visit Us
        </p>
        <h2
          id="contact-info-heading"
          className="mb-2 font-heading text-3xl font-bold text-church-charcoal md:text-4xl"
        >
          Parish Contact
        </h2>
        <p className="mb-8 text-muted-foreground md:text-lg">
          Reach the parish office by phone, email, or in person.
        </p>

        <ul className="space-y-3">
          {rows.map(({ key, icon: Icon, title, body }, index) => (
            <li
              key={key}
              className="group flex gap-4 rounded-lg border border-transparent bg-background/80 p-4 shadow-card-soft transition-all duration-300 hover:border-church-gold/40 hover:shadow-md motion-reduce:transition-none"
              style={{ transitionDelay: `${index * 40}ms` }}
            >
              <span className="mt-0.5 shrink-0 transition-transform duration-300 group-hover:scale-110 motion-reduce:group-hover:scale-100">
                <Icon size="md" />
              </span>
              <div className="min-w-0">
                <h3 className="mb-1 font-heading text-lg font-semibold text-church-charcoal">{title}</h3>
                {body}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  );
};

export default ContactInfo;
