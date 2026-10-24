import { formatTime, getMassDay, otherServices, weekdayMassSummary } from "@/config/parish";

const sundayMasses = getMassDay("Sunday")?.masses ?? [];
const weekdayGroups = weekdayMassSummary();
const reconciliation = otherServices.find((service) => service.name === "Confessions");
const doctrinalClass = otherServices.find((service) => service.name === "Faith & Doctrinal Class");

const ScheduleRow = ({ label, times }: { label: string; times: string[] }) => (
  <div className="flex items-start justify-between gap-4 py-2.5">
    <span className="font-bold uppercase tracking-wide text-church-pearl">{label}</span>
    <span className="text-right font-bold text-church-pearl">
      {times.map((time) => (
        <span key={`${label}-${time}`} className="block">
          {time}
        </span>
      ))}
    </span>
  </div>
);

const ColumnTitle = ({ children }: { children: string }) => (
  <h3 className="mb-4 font-heading text-sm font-bold uppercase tracking-[0.22em] text-church-pearl">
    <span className="inline-block border-b border-church-gold pb-2">{children}</span>
  </h3>
);

const MassScheduleBand = () => (
  <section aria-labelledby="mass-schedule-heading" className="bg-church-charcoal py-14 text-church-pearl md:py-16">
    <h2 id="mass-schedule-heading" className="sr-only">
      Parish schedule
    </h2>
    <div className="container mx-auto max-w-5xl grid gap-10 px-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-16">
      <div>
        <ColumnTitle>Mass Times</ColumnTitle>
        <ScheduleRow label="Sunday" times={sundayMasses.map((mass) => formatTime(mass.time))} />
        <div className="my-2 h-px bg-church-gold/80" />
        {weekdayGroups.map((group) => (
          <ScheduleRow key={group.days} label={group.days} times={[group.times]} />
        ))}
      </div>
      {reconciliation && (
        <div>
          <ColumnTitle>Reconciliation</ColumnTitle>
          <ScheduleRow label={reconciliation.day} times={[formatTime(reconciliation.time)]} />
        </div>
      )}
      {doctrinalClass && (
        <div>
          <ColumnTitle>Faith &amp; Doctrinal Class</ColumnTitle>
          <ScheduleRow label={doctrinalClass.day} times={[formatTime(doctrinalClass.time)]} />
        </div>
      )}
    </div>
  </section>
);

export default MassScheduleBand;
