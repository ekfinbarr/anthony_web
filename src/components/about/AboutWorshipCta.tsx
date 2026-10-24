import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BellIcon, PinIcon } from "@/components/icons/ParishIcons";
import Reveal from "@/components/parish-home/Reveal";
import { formatAddress, site } from "@/config/site";
import { formatMassTimes, weekdayMassSummary } from "@/config/parish";

const AboutWorshipCta = () => {
  return (
    <section
      id="mass-schedule"
      aria-labelledby="worship-heading"
      className="scroll-mt-24 bg-gradient-church py-16 md:py-20"
    >
      <div className="container mx-auto px-4">
        <Reveal>
          <h2
            id="worship-heading"
            className="mb-10 text-center font-heading text-3xl font-bold text-church-charcoal md:mb-12 md:text-4xl"
          >
            Join Us for Mass
          </h2>
        </Reveal>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2 md:gap-8">
          <Reveal from="left">
            <Card className="h-full border-none p-8 text-center shadow-md transition-shadow duration-300 hover:shadow-lg">
              <BellIcon size="md" className="mx-auto mb-4" />
              <h3 className="mb-4 font-heading text-2xl font-semibold text-church-charcoal">Mass Times</h3>
              <div className="space-y-2 text-muted-foreground">
                <p>
                  <strong className="text-church-charcoal">Sunday Mass:</strong> {formatMassTimes("Sunday")}
                </p>
                {weekdayMassSummary().map((group) => (
                  <p key={group.days}>
                    <strong className="text-church-charcoal">Weekday Mass ({group.days}):</strong>{" "}
                    {group.times}
                  </p>
                ))}
              </div>
            </Card>
          </Reveal>

          <Reveal from="right" delay={60}>
            <Card className="h-full border-none p-8 text-center shadow-md transition-shadow duration-300 hover:shadow-lg">
              <PinIcon size="md" className="mx-auto mb-4" />
              <h3 className="mb-4 font-heading text-2xl font-semibold text-church-charcoal">Location</h3>
              <address className="not-italic text-muted-foreground">
                <p className="mb-2 font-semibold text-church-charcoal">{site.name}</p>
                <p>{formatAddress(site.address)}</p>
                {site.telephone && (
                  <p className="mt-4">
                    <a
                      href={`tel:${site.telephone.replace(/[^+\d]/g, "")}`}
                      className="transition-colors hover:text-primary"
                    >
                      {site.telephone}
                    </a>
                  </p>
                )}
                <p className={site.telephone ? "" : "mt-4"}>
                  <a href={`mailto:${site.email}`} className="transition-colors hover:text-primary">
                    {site.email}
                  </a>
                </p>
              </address>
            </Card>
          </Reveal>
        </div>

        <Reveal delay={100}>
          <div className="mt-8 text-center md:mt-10">
            <Button variant="secondary" size="xl" asChild>
              <Link to="/visit">Plan Your Visit</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default AboutWorshipCta;
