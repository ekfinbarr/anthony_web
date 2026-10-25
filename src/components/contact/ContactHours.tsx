import { ClockIcon } from "@/components/icons/ParishIcons";
import Reveal from "@/components/parish-home/Reveal";
import {
  assistantParishPriestOfficeHours,
  parishOfficeHours,
  parishPriestOfficeHours,
} from "@/config/parish";

const blocks = [parishOfficeHours, parishPriestOfficeHours, assistantParishPriestOfficeHours];

const ContactHours = () => {
  return (
    <section
      aria-labelledby="contact-hours-heading"
      className="scroll-mt-24 bg-church-pearl py-16 md:py-20"
    >
      <div className="container mx-auto px-4">
        <Reveal>
          <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-church-gold">
              When to visit
            </p>
            <h2
              id="contact-hours-heading"
              className="mb-3 font-heading text-3xl font-bold text-church-charcoal md:text-4xl"
            >
              Office Hours
            </h2>
            <p className="text-muted-foreground md:text-lg">
              Plan your visit around parish and clergy office hours.
            </p>
          </div>
        </Reveal>

        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
          {blocks.map((block, index) => (
            <Reveal key={block.label} delay={index * 60} from={index === 0 ? "left" : index === 2 ? "right" : "up"}>
              <div className="h-full rounded-lg border border-border/50 bg-background p-6 shadow-card-soft transition-shadow duration-300 hover:shadow-md motion-reduce:transition-none">
                <ClockIcon size="md" className="mb-3" />
                <h3 className="mb-3 font-heading text-lg font-semibold text-church-charcoal">
                  {block.label}
                </h3>
                <p className="space-y-1 text-muted-foreground">
                  {block.lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContactHours;
