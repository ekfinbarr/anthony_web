import { Calendar, CheckCircle, Clock, Mail, MapPin, Phone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Sacrament } from "@/data/sacraments";
import { getSacramentIcon } from "./sacramentIcons";

type SacramentDetailsModalProps = {
  sacrament: Sacrament | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegister: (sacrament: Sacrament) => void;
};

const SacramentDetailsModal = ({
  sacrament,
  open,
  onOpenChange,
  onRegister,
}: SacramentDetailsModalProps) => {
  if (!sacrament) return null;

  const Icon = getSacramentIcon(sacrament.iconKey);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader className="space-y-4 text-left sm:text-left">
          <div className="flex items-start gap-4">
            <Icon size="lg" className="shrink-0 [&_.parish-icon]:[--pi-disc:38_45%_72%]" />
            <div className="min-w-0 space-y-2">
              <DialogTitle className="font-heading text-2xl text-church-charcoal">
                {sacrament.name}
              </DialogTitle>
              <span className="inline-flex items-center rounded-md border border-church-gold-warm/20 bg-church-pearl/60 px-2.5 py-1 text-xs font-medium text-church-charcoal">
                {sacrament.category}
              </span>
              <DialogDescription className="text-base leading-relaxed text-muted-foreground">
                {sacrament.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {sacrament.schedule && (
            <section aria-labelledby="sacrament-schedule-heading">
              <h4
                id="sacrament-schedule-heading"
                className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-church-charcoal"
              >
                Schedule
              </h4>
              <div className="space-y-2.5 rounded-lg border border-church-gold-warm/15 bg-church-pearl/50 p-4">
                <div className="flex items-start gap-2.5 text-sm">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-church-gold-warm" aria-hidden="true" />
                  <span className="text-muted-foreground">{sacrament.schedule.date}</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-church-gold-warm" aria-hidden="true" />
                  <span className="text-muted-foreground">{sacrament.schedule.time}</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-church-gold-warm" aria-hidden="true" />
                  <span className="text-muted-foreground">{sacrament.schedule.location}</span>
                </div>
              </div>
            </section>
          )}

          {sacrament.requirements.length > 0 && (
            <section aria-labelledby="sacrament-requirements-heading">
              <h4
                id="sacrament-requirements-heading"
                className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-church-charcoal"
              >
                Requirements
              </h4>
              <ul className="space-y-2.5">
                {sacrament.requirements.map((req) => (
                  <li key={req} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <CheckCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-church-gold-warm"
                      aria-hidden="true"
                    />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section aria-labelledby="sacrament-contact-heading">
            <h4
              id="sacrament-contact-heading"
              className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-church-charcoal"
            >
              Contact
            </h4>
            <div className="space-y-2.5 rounded-lg border border-church-gold-warm/15 bg-church-pearl/50 p-4">
              <div className="flex items-start gap-2.5 text-sm">
                <Users className="mt-0.5 h-4 w-4 shrink-0 text-church-gold-warm" aria-hidden="true" />
                <span className="font-medium text-church-charcoal">{sacrament.contact.name}</span>
              </div>
              <div className="flex items-start gap-2.5 text-sm">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-church-gold-warm" aria-hidden="true" />
                <a
                  href={`mailto:${sacrament.contact.email}`}
                  className="text-primary hover:underline"
                >
                  {sacrament.contact.email}
                </a>
              </div>
              {sacrament.contact.phone && (
                <div className="flex items-start gap-2.5 text-sm">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-church-gold-warm" aria-hidden="true" />
                  <a href={`tel:${sacrament.contact.phone.replace(/[^+\d]/g, "")}`} className="text-primary hover:underline">
                    {sacrament.contact.phone}
                  </a>
                </div>
              )}
            </div>
          </section>

          {sacrament.registrationDeadline && (
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-church-charcoal">Registration deadline: </span>
              {sacrament.registrationDeadline}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {sacrament.registrationRequired ? (
            <Button type="button" variant="church" onClick={() => onRegister(sacrament)}>
              Register Now
            </Button>
          ) : (
            <Button type="button" variant="church" asChild>
              <a href={`mailto:${sacrament.contact.email}`}>Contact Parish</a>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SacramentDetailsModal;
