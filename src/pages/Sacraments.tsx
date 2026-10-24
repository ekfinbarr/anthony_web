import { useState } from "react";
import { Cross } from "lucide-react";
import { FontIcon } from "@/components/icons/ParishIcons";
import PageHeader from "@/components/layout/PageHeader";
import Reveal from "@/components/parish-home/Reveal";
import SacramentCard from "@/components/sacraments/SacramentCard";
import SacramentDetailsModal from "@/components/sacraments/SacramentDetailsModal";
import SacramentRegistrationDialog from "@/components/sacraments/SacramentRegistrationDialog";
import { mockSacraments, type Sacrament } from "@/data/sacraments";

const Sacraments = () => {
  const [detailsSacrament, setDetailsSacrament] = useState<Sacrament | null>(null);
  const [registrationSacrament, setRegistrationSacrament] = useState<Sacrament | null>(null);

  const handleOpenDetails = (sacrament: Sacrament) => {
    setDetailsSacrament(sacrament);
  };

  const handleRegister = (sacrament: Sacrament) => {
    setDetailsSacrament(null);
    setRegistrationSacrament(sacrament);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        tone="light"
        title="The Seven Sacraments"
        description="Discover the sacraments of the Catholic Church and learn how to prepare for and receive them."
        icon={<FontIcon size="md" />}
      />

      <section className="bg-church-ivory py-12 sm:py-14 md:py-16" aria-labelledby="sacraments-list-heading">
        <div className="container mx-auto px-4">
          <Reveal className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
            <div className="mb-5 flex items-center justify-center gap-3" aria-hidden="true">
              <span className="h-px w-10 bg-church-gold-warm sm:w-14" />
              <Cross className="h-5 w-5 text-church-gold-warm" strokeWidth={2.25} />
              <span className="h-px w-10 bg-church-gold-warm sm:w-14" />
            </div>
            <h2
              id="sacraments-list-heading"
              className="font-heading text-2xl font-bold tracking-tight text-church-charcoal sm:text-3xl"
            >
              Sacraments of the Church
            </h2>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Tap a sacrament to see preparation requirements, schedules, and how to get in touch with
              the parish.
            </p>
          </Reveal>

          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6">
            {mockSacraments.map((sacrament, index) => (
              <SacramentCard
                key={sacrament.id}
                sacrament={sacrament}
                index={index}
                onOpen={handleOpenDetails}
              />
            ))}
          </div>
        </div>
      </section>

      <SacramentDetailsModal
        sacrament={detailsSacrament}
        open={detailsSacrament !== null}
        onOpenChange={(open) => {
          if (!open) setDetailsSacrament(null);
        }}
        onRegister={handleRegister}
      />

      <SacramentRegistrationDialog
        sacrament={registrationSacrament}
        open={registrationSacrament !== null}
        onOpenChange={(open) => {
          if (!open) setRegistrationSacrament(null);
        }}
      />
    </div>
  );
};

export default Sacraments;
