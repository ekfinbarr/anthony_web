import crucifix from "@/assets/images/crucifix.jpg";
import { Card } from "@/components/ui/card";
import { CrossIcon, LanternIcon } from "@/components/icons/ParishIcons";
import Reveal from "@/components/parish-home/Reveal";

const principles = [
  {
    id: "vision",
    title: "Our Vision",
    icon: LanternIcon,
    body: "To be a church where people encounter God, find community, and discover their purpose in advancing God's kingdom on earth.",
  },
  {
    id: "mission",
    title: "Our Mission",
    icon: CrossIcon,
    body: "To lead people into a growing relationship with Jesus Christ through worship, discipleship, fellowship, and service.",
  },
] as const;

const AboutGuidingPrinciples = () => {
  return (
    <section
      aria-labelledby="guiding-principles-heading"
      className="scroll-mt-24 bg-church-pearl py-16 md:py-20"
    >
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal from="left" className="order-2 lg:order-1">
            <div className="group overflow-hidden rounded-lg shadow-lg">
              <img
                src={crucifix}
                alt="Crucifix at St. Anthony Catholic Church, Gbaja"
                width={720}
                height={540}
                loading="lazy"
                decoding="async"
                className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            </div>
          </Reveal>

          <Reveal from="right" delay={60} className="order-1 lg:order-2">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-church-gold">
                Who we are
              </p>
              <h2
                id="guiding-principles-heading"
                className="mb-4 font-heading text-3xl font-bold text-church-charcoal md:text-4xl"
              >
                Our Guiding Principles
              </h2>
              <p className="mb-8 text-muted-foreground md:text-lg">
                We, the people of St. Anthony Catholic Church, Gbaja, gather in Surulere as one parish family —
                praying, welcoming, and serving together.
              </p>

              <div className="space-y-4">
                {principles.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Card
                      key={item.id}
                      id={item.id}
                      className="scroll-mt-24 border-transparent p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-church-gold/40 hover:shadow-lg focus-within:-translate-y-1 focus-within:border-church-gold/40 focus-within:shadow-lg motion-reduce:transform-none motion-reduce:transition-none"
                      style={{ transitionDelay: `${index * 40}ms` }}
                    >
                      <div className="flex gap-4">
                        <div className="shrink-0">
                          <Icon size="md" />
                        </div>
                        <div>
                          <h3 className="mb-2 font-heading text-xl font-bold text-church-charcoal">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">{item.body}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              <p className="mt-8 border-l-4 border-church-gold pl-4 font-heading text-lg font-semibold italic text-church-charcoal">
                A community of faith, welcome, and service.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default AboutGuidingPrinciples;
