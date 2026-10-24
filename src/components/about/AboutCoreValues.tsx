import coreValues from "@/assets/images/outreach.jpg";
import { CommunityIcon, CompassIcon, HeartIcon } from "@/components/icons/ParishIcons";
import Reveal from "@/components/parish-home/Reveal";
import { cn } from "@/lib/utils";

const values = [
  {
    icon: HeartIcon,
    title: "Love",
    description: "We believe in showing God's love through our actions and relationships.",
  },
  {
    icon: CommunityIcon,
    title: "Community",
    description: "We value authentic relationships and doing life together.",
  },
  {
    icon: CompassIcon,
    title: "Purpose",
    description: "We help people discover and fulfill their God-given purpose.",
  },
] as const;

const AboutCoreValues = () => {
  return (
    <section
      id="core-values"
      aria-labelledby="core-values-heading"
      className="scroll-mt-24 bg-background py-16 md:py-20"
    >
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal from="left">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-church-gold">
                What shapes us
              </p>
              <h2
                id="core-values-heading"
                className="mb-4 font-heading text-3xl font-bold text-church-charcoal accent-line md:text-4xl"
              >
                Our Core Values
              </h2>
              <p className="mb-8 max-w-xl text-muted-foreground md:text-lg">
                These values guide how we worship, serve, and walk with one another as a parish family.
              </p>

              <ul className="space-y-4">
                {values.map((value, index) => {
                  const Icon = value.icon;
                  return (
                    <li key={value.title}>
                      <article
                        tabIndex={0}
                        className={cn(
                          "group rounded-lg border border-transparent bg-church-pearl/60 p-5 transition-all duration-300",
                          "hover:-translate-y-1 hover:border-church-gold/35 hover:bg-church-pearl hover:shadow-lg",
                          "focus-visible:outline-none focus-visible:-translate-y-1 focus-visible:border-church-gold/35 focus-visible:shadow-lg",
                          "motion-reduce:transform-none motion-reduce:transition-none",
                        )}
                        style={{ transitionDelay: `${index * 50}ms` }}
                      >
                        <div className="flex gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-church shadow-sm transition-transform duration-300 group-hover:scale-105 group-focus-within:scale-105 motion-reduce:transform-none">
                            <Icon framed={false} className="h-7 w-7" />
                          </div>
                          <div>
                            <h3 className="font-heading text-xl font-semibold text-church-charcoal">
                              {value.title}
                            </h3>
                            <p className="mt-1 text-muted-foreground leading-relaxed">{value.description}</p>
                          </div>
                        </div>
                      </article>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>

          <Reveal from="right" delay={80}>
            <div className="group overflow-hidden rounded-lg shadow-lg">
              <img
                src={coreValues}
                alt="Core values of St. Anthony Catholic Church, Gbaja"
                width={720}
                height={540}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default AboutCoreValues;
