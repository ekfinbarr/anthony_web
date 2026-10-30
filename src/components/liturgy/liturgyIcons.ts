import type { ComponentType } from "react";
import type { ParishIconProps } from "@/components/icons/ParishIcon";
import {
  BibleIcon,
  CandleIcon,
  ChaliceIcon,
  CradleIcon,
  CrossIcon,
  DoveIcon,
  FontIcon,
  MonstranceIcon,
  ReadingsIcon,
  RosaryIcon,
} from "@/components/icons/ParishIcons";

/** Icon keys an admin can pick for a liturgy resource. */
export const LITURGY_ICONS: Record<string, { label: string; icon: ComponentType<ParishIconProps> }> = {
  chalice: { label: "Chalice", icon: ChaliceIcon },
  font: { label: "Baptismal font", icon: FontIcon },
  candle: { label: "Candle", icon: CandleIcon },
  cross: { label: "Cross", icon: CrossIcon },
  dove: { label: "Dove", icon: DoveIcon },
  rosary: { label: "Rosary", icon: RosaryIcon },
  monstrance: { label: "Monstrance", icon: MonstranceIcon },
  bible: { label: "Bible", icon: BibleIcon },
  cradle: { label: "Cradle", icon: CradleIcon },
  book: { label: "Book", icon: ReadingsIcon },
};

export function liturgyIcon(key: string | null | undefined): ComponentType<ParishIconProps> {
  return (key && LITURGY_ICONS[key]?.icon) || ReadingsIcon;
}
