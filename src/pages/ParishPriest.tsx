import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { mediaUrl, unwrapList } from "@/components/parish-home/media";
import leadershipService, { type Leadership } from "@/services/leadership.service";
import PageHeader from "@/components/layout/PageHeader";
import PersonSchema from "@/components/seo/schemas/PersonSchema";
import { cn } from "@/lib/utils";
import priestPortrait from "@/assets/images/parish_priest.jpg";

const PRIEST_NAME = "Very Rev. Fr. Sylvester Oladunjoye";
const PRIEST_ROLE = "Parish Priest";

const INTRO =
  "Very Rev. Fr. Sylvester Tolulope Oladunjoye is a Catholic priest of the Catholic Archdiocese of Lagos, Nigeria. He currently serves as the Parish Priest of St. Anthony Catholic Church, Gbaja, Surulere, Lagos — a position he assumed in October 2025.";

const education = [
  {
    label: "Priesthood Ordination",
    text: "Ordained into the priesthood on June 25, 2011, by Cardinal Anthony Olubunmi Okogie at St. Dominic’s Catholic Church, Yaba, alongside six other priests.",
  },
  {
    label: "Academic Qualifications",
    text: "Holds a Master of Science (M.S.) degree in Psychology from Divine Mercy University.",
  },
];

const appointments = [
  {
    label: "Archdiocesan Roles",
    text: "Coordinator for the Propagation of Faith within the Lagos Archdiocese.",
  },
  {
    label: "Youth Ministry",
    text: "Chaplain / chaplaincy head for the Young Missionary Movement of Nigeria (YOMM) for the Lagos Archdiocese.",
  },
  {
    label: "Inter-Diocesan Collaboration",
    text: "Actively involved in training and congress leadership, facilitating strategic missionary collaboration sessions across dioceses in South-West Nigeria.",
  },
];

const aboutLinks = [
  { name: "Parish Priest", href: "/parish-priest" },
  { name: "Our Story", href: "/about#our-story" },
  { name: "Leadership & Staff", href: "/about#leadership" },
  { name: "Mass Times", href: "/visit" },
];

function displayName(leader: Leadership): string {
  if (!leader.title) return leader.name;
  if (leader.name.toLowerCase().includes(leader.title.toLowerCase())) return leader.name;
  if (/^(very\s+)?rev\.?/i.test(leader.name)) return leader.name;
  return `${leader.title} ${leader.name}`;
}

function isParishPriest(leader: Leadership): boolean {
  const role = `${leader.position} ${leader.title}`.toLowerCase();
  if (role.includes("assistant")) return false;
  return /\bparish priest\b/.test(role);
}

function isOladunjoye(leader: Leadership): boolean {
  return /oladunjoye/i.test(`${leader.name} ${leader.title}`);
}

const AboutSidebar = () => {
  const { pathname } = useLocation();

  return (
    <nav
      aria-label="About"
      className="rounded-lg border border-border/70 bg-background p-6 shadow-sm lg:sticky lg:top-28"
    >
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-church-gold">About</h2>
      <ul className="divide-y divide-border">
        {aboutLinks.map((link) => {
          const current = link.href === pathname;
          return (
            <li key={link.href}>
              <Link
                to={link.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "block py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  current ? "text-church-gold" : "text-church-charcoal hover:text-church-gold",
                )}
              >
                {link.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

type DetailItem = { label: string; text: string };

const DetailList = ({ items, columns = 1 }: { items: DetailItem[]; columns?: 1 | 2 }) => (
  <ul
    className={cn(
      "grid gap-6",
      columns === 2 && "sm:grid-cols-2 sm:gap-x-8 sm:gap-y-7",
    )}
  >
    {items.map((item) => (
      <li key={item.label} className="border-l-2 border-church-gold/70 pl-4">
        <p className="mb-1.5 font-heading text-base font-semibold text-church-charcoal">{item.label}</p>
        <p className="text-sm leading-relaxed text-muted-foreground md:text-[0.95rem]">{item.text}</p>
      </li>
    ))}
  </ul>
);

const ParishPriest = () => {
  const query = useQuery({
    queryKey: ["leadership", "current", "parish-priest"],
    queryFn: () => leadershipService.getCurrent(),
    staleTime: 5 * 60 * 1000,
  });

  const priest = unwrapList<Leadership>(query.data).find(
    (leader) => isParishPriest(leader) && isOladunjoye(leader),
  );
  const name = priest ? displayName(priest) : PRIEST_NAME;
  const role = priest?.position || PRIEST_ROLE;
  const portrait = mediaUrl(priest?.image_url) || priestPortrait;

  return (
    <div className="bg-church-stone">
      <PersonSchema
        person={{
          name,
          jobTitle: role,
          image: portrait,
          description: INTRO,
        }}
      />

      <PageHeader
        eyebrow="Parish Priest"
        title={name}
        description="Shepherd of St. Anthony Catholic Church, Gbaja"
        size="compact"
      />

      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16.5rem] lg:items-start lg:gap-12 xl:gap-16">
          <article className="min-w-0 space-y-12 md:space-y-14">
            {/* Profile band — portrait + introduction */}
            <div className="grid items-center gap-8 md:grid-cols-[minmax(0,17.5rem)_minmax(0,1fr)] md:gap-10 lg:grid-cols-[minmax(0,19rem)_minmax(0,1fr)] lg:gap-12">
              <div className="mx-auto w-full max-w-[17.5rem] md:mx-0 md:max-w-none">
                <div className="voices-frame">
                  <img
                    src={portrait}
                    alt={`${name}, ${role} of St. Anthony Catholic Church, Gbaja`}
                    width={480}
                    height={600}
                    decoding="async"
                    className="voices-portrait-image aspect-[4/5] w-full object-cover object-top"
                  />
                </div>
              </div>

              <div className="max-w-xl">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-church-gold">{role}</p>
                <h2 className="mb-5 font-heading text-2xl font-bold leading-tight text-church-charcoal md:text-3xl">
                  Serving St. Anthony, Gbaja
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground md:text-lg">{INTRO}</p>
                <div className="mt-6">
                  <div className="mb-4 h-0.5 w-12 rounded-full bg-gradient-church" aria-hidden="true" />
                  <p className="font-heading text-lg font-semibold text-church-charcoal">{name}</p>
                  <p className="text-sm text-muted-foreground">Catholic Archdiocese of Lagos</p>
                </div>
              </div>
            </div>

            {/* Background */}
            <section aria-labelledby="background-education-heading" className="max-w-3xl">
              <h2
                id="background-education-heading"
                className="mb-6 font-heading text-2xl font-bold text-church-charcoal accent-line md:text-[1.75rem]"
              >
                Background and Education
              </h2>
              <DetailList items={education} columns={2} />
            </section>

            {/* Appointments */}
            <section aria-labelledby="appointments-ministry-heading" className="max-w-3xl">
              <h2
                id="appointments-ministry-heading"
                className="mb-3 font-heading text-2xl font-bold text-church-charcoal accent-line md:text-[1.75rem]"
              >
                Current Appointments &amp; Ministry
              </h2>
              <p className="mb-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
                Beyond his pastoral duties as parish priest, he actively oversees administrative and missionary roles
                within and outside the Archdiocese.
              </p>
              <DetailList items={appointments} />
            </section>
          </article>

          <aside className="lg:pt-1">
            <AboutSidebar />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ParishPriest;
