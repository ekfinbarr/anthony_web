import { Clock, HeartHandshake, UserRoundCheck } from "lucide-react";

const points = [
  { icon: Clock, title: "About 3 minutes", text: "Only name, phone and address are required." },
  { icon: UserRoundCheck, title: "No account needed", text: "Register your whole household at once." },
  { icon: HeartHandshake, title: "A personal welcome", text: "Someone from the parish office will reach out to you." },
];

/** Warm introduction shown before the first registration step. */
const RegistrationWelcome = () => (
  <section
    aria-labelledby="registration-welcome"
    className="relative overflow-hidden rounded-2xl border border-church-gold/30 bg-gradient-to-br from-church-pearl via-background to-church-gold/10 p-6 shadow-sm sm:p-8"
  >
    <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-church-gold/15 blur-3xl" />
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-church-gold-warm">You belong here</p>
    <h2 id="registration-welcome" className="mt-2 font-heading text-3xl font-bold text-church-charcoal">Welcome!</h2>
    <div className="mt-3 space-y-3 text-muted-foreground">
      <p>
        Whether you have just moved to Gbaja, are coming back to the Church after some time away, or are simply curious
        about the Catholic faith, we are glad you are here. There is a place for you and your family at St. Anthony's.
      </p>
      <p>
        Registering helps us know you by name, keep you informed and walk with you through the sacraments and parish
        life.
      </p>
    </div>
    <ul className="mt-6 grid gap-3 sm:grid-cols-3">
      {points.map(({ icon: Icon, title, text }) => (
        <li
          key={title}
          className="flex gap-3 rounded-xl border bg-background/80 p-3 transition-shadow duration-200 hover:shadow-md sm:flex-col sm:gap-2"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-church-gold/20 text-church-charcoal">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-church-charcoal">{title}</span>
            <span className="block text-sm text-muted-foreground">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  </section>
);

export default RegistrationWelcome;
