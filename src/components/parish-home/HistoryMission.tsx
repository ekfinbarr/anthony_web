import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollIcon } from "@/components/icons/ParishIcons";
import Reveal from "./Reveal";

const HistoryMission = () => {
  return (
    <section id="history" aria-labelledby="history-heading" className="scroll-mt-24 bg-background py-14 md:py-16">
      <Reveal>
        <div className="container mx-auto px-4">
          <h2 id="history-heading" className="mb-8 text-center font-heading text-3xl font-bold text-church-charcoal md:text-4xl">
            Our story
          </h2>
          <div className="mx-auto max-w-3xl">
            <Card className="p-6 transition-shadow duration-300 hover:shadow-lg md:p-8">
              <ScrollIcon size="md" className="mb-4" />
              <p className="text-muted-foreground">
                St. Anthony, Gbaja began in 1985 with a small group of families gathering in a living room,
                united by a vision to share God&apos;s love in this community. That same faithfulness still
                gathers the parish for worship, fellowship, and service.
              </p>
            </Card>
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" className="group" asChild>
              <Link to="/about">
                Read our story
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default HistoryMission;
