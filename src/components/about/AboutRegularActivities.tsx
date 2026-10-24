import { Card } from "@/components/ui/card";
import Reveal from "@/components/parish-home/Reveal";
import { regularActivities } from "./regularActivities";

const AboutRegularActivities = () => {
  return (
    <section
      id="regular-activities"
      aria-labelledby="regular-activities-heading"
      className="scroll-mt-24 bg-background py-16 md:py-20"
    >
      <div className="container mx-auto px-4">
        <Reveal>
          <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
            <h2
              id="regular-activities-heading"
              className="mb-3 font-heading text-3xl font-bold text-church-charcoal md:text-4xl"
            >
              Regular Activities
            </h2>
            <p className="text-muted-foreground md:text-lg">
              We have weekly gatherings and activities for all ages. Everyone is welcome!
            </p>
          </div>
        </Reveal>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {regularActivities.map((activity, index) => {
            const Icon = activity.icon;
            return (
              <Reveal key={activity.title} delay={index * 60}>
                <Card
                  tabIndex={0}
                  className="h-full border-border/60 p-6 text-center transition-all duration-300 hover:-translate-y-1.5 hover:border-church-gold/40 hover:shadow-lg focus-visible:outline-none focus-visible:-translate-y-1.5 focus-visible:border-church-gold/40 focus-visible:shadow-lg motion-reduce:transform-none motion-reduce:transition-none"
                >
                  <Icon size="md" className="mx-auto mb-4" />
                  <h3 className="mb-2 font-heading text-lg font-semibold text-church-charcoal">
                    {activity.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{activity.details}</p>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default AboutRegularActivities;
