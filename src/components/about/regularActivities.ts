import type { ComponentType } from "react";
import {
  BellIcon,
  CommunityIcon,
  ConfessionalIcon,
  LampIcon,
  MonstranceIcon,
  MusicIcon,
  YouthIcon,
} from "@/components/icons/ParishIcons";
import type { ParishIconProps } from "@/components/icons/ParishIcon";
import {
  formatMassTimes,
  formatService,
  formatTime,
  holyHour,
  otherServices,
  parishForum,
} from "@/config/parish";

export type RegularActivity = {
  title: string;
  details: string;
  icon: ComponentType<ParishIconProps>;
};

const confessions = otherServices.find((service) => service.name === "Confessions");
const doctrinal = otherServices.find((service) => service.name === "Faith & Doctrinal Class");

/** Shared weekly activities for About (and reusable by Events later). */
export const regularActivities: RegularActivity[] = [
  {
    title: "Sunday Masses",
    details: `${formatMassTimes("Sunday")} — Main Sanctuary`,
    icon: BellIcon,
  },
  {
    title: "Confession",
    details: confessions
      ? `${formatService(confessions)} — Reconciliation Room`
      : "Saturdays — Reconciliation Room",
    icon: ConfessionalIcon,
  },
  {
    title: holyHour.name,
    details: holyHour.details,
    icon: MonstranceIcon,
  },
  {
    title: parishForum.name,
    details: parishForum.details,
    icon: CommunityIcon,
  },
  {
    title: doctrinal?.name ?? "Faith & Doctrinal Class",
    details: doctrinal
      ? `${formatService(doctrinal)} — Online`
      : `Thursdays ${formatTime("19:00")} — Online`,
    icon: LampIcon,
  },
  // {
  //   title: "Youth Group",
  //   details: "Fridays 6:30 PM — Youth Hall",
  //   icon: YouthIcon,
  // },
  {
    title: "Choir Practice",
    details: "Tuesdays, Thursdays, & Saturdays 7:00 PM — Music Room",
    icon: MusicIcon,
  },
];
