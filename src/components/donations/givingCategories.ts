/**
 * Giving categories shared by the public donations page and the admin
 * "Record a gift" form, so both offer the same funds the same way.
 */

import { BasketIcon, BricksIcon, CoinsIcon, GiftIcon } from "@/components/icons/ParishIcons";
import type { DonationType } from "@/services/payment.service";
import type { StatusTone } from "@/lib/bookingStatus";

export const PRESET_AMOUNTS = [1000, 5000, 10000, 20000, 50000];

export const givingCategories = [
  {
    id: "projects",
    name: "Parish Projects",
    icon: BricksIcon,
    type: "building" as DonationType,
    description: "Support ongoing construction and renovation projects",
  },
  {
    id: "charity",
    name: "Charity & Welfare",
    icon: BasketIcon,
    type: "welfare" as DonationType,
    description: "Help the less privileged in our community",
  },
  {
    id: "freewill",
    name: "Freewill Offering",
    icon: GiftIcon,
    type: "offering" as DonationType,
    description: "General donations to support parish activities",
  },
  {
    id: "tithe",
    name: "Tithe & Offerings",
    icon: CoinsIcon,
    type: "tithe" as DonationType,
    description: "Regular tithes and thanksgiving offerings",
  },
];

export type GivingCategory = (typeof givingCategories)[number];

/** Funds without a card on the public page, still available to the office. */
export const OTHER_FUNDS: Array<{ type: DonationType; name: string }> = [
  { type: "thanksgiving", name: "Thanksgiving" },
  { type: "missions", name: "Missions" },
  { type: "other", name: "Other" },
];

/** Colour context for each fund, used on cards, pills and the breakdown. */
export const FUND_META: Record<string, { label: string; tone: StatusTone }> = {
  building: { label: "Parish Projects", tone: "amber" },
  welfare: { label: "Charity & Welfare", tone: "rose" },
  offering: { label: "Freewill Offering", tone: "sky" },
  tithe: { label: "Tithe & Offerings", tone: "emerald" },
  thanksgiving: { label: "Thanksgiving", tone: "violet" },
  missions: { label: "Missions", tone: "violet" },
  other: { label: "Other", tone: "slate" },
};

export const fundMeta = (type: string) =>
  FUND_META[type] ?? { label: type.replace(/^\w/, (c) => c.toUpperCase()), tone: "slate" as StatusTone };

/** Tinted surfaces for a fund. Class names are written out so Tailwind keeps them. */
export const FUND_TONE: Record<StatusTone, { ring: string; bg: string; text: string; bar: string; soft: string }> = {
  amber: { ring: "border-amber-400", bg: "bg-amber-50", text: "text-amber-800", bar: "bg-amber-400", soft: "bg-amber-200/60" },
  rose: { ring: "border-rose-400", bg: "bg-rose-50", text: "text-rose-800", bar: "bg-rose-400", soft: "bg-rose-200/60" },
  sky: { ring: "border-sky-400", bg: "bg-sky-50", text: "text-sky-800", bar: "bg-sky-400", soft: "bg-sky-200/60" },
  emerald: { ring: "border-emerald-500", bg: "bg-emerald-50", text: "text-emerald-800", bar: "bg-emerald-500", soft: "bg-emerald-200/60" },
  violet: { ring: "border-violet-400", bg: "bg-violet-50", text: "text-violet-800", bar: "bg-violet-400", soft: "bg-violet-200/60" },
  slate: { ring: "border-slate-400", bg: "bg-slate-50", text: "text-slate-700", bar: "bg-slate-400", soft: "bg-slate-200/60" },
};
