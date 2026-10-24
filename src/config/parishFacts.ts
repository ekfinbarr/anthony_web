/**
 * Ready-made sentences about the parish, derived from the central config, for
 * text-only surfaces such as the chatbot. Keeps NAP and Mass times consistent.
 */
import { formatAddress, site } from "./site";
import { formatMassTimes, formatService, otherServices, weekdayMassSummary } from "./parish";

export const scheduleLines: string[] = [
  `Sunday Mass: ${formatMassTimes("Sunday")}`,
  ...weekdayMassSummary().map((group) => `Weekday Mass (${group.days}): ${group.times}`),
  ...otherServices.map((service) => `${service.name}: ${formatService(service)}`),
];

export const addressLine = formatAddress(site.address);

/** "the parish office at +234… or info@…" — never a placeholder number. */
export const officeContact = site.telephone
  ? `the parish office on ${site.telephone} or by email at ${site.email}`
  : `the parish office by email at ${site.email}`;

export const contactLines: string[] = [
  ...(site.telephone ? [`Phone: ${site.telephone}`] : []),
  `Email: ${site.email}`,
  `Address: ${addressLine}`,
];
