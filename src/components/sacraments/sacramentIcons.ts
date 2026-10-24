import type { ComponentType } from "react";
import type { ParishIconProps } from "@/components/icons/ParishIcon";
import {
  ChaliceIcon,
  ConfessionalIcon,
  DoveIcon,
  FlaskIcon,
  FontIcon,
  HeartIcon,
  PriestIcon,
} from "@/components/icons/ParishIcons";
import type { SacramentIconKey } from "@/data/sacraments";

export const sacramentIconMap: Record<SacramentIconKey, ComponentType<ParishIconProps>> = {
  font: FontIcon,
  dove: DoveIcon,
  chalice: ChaliceIcon,
  confessional: ConfessionalIcon,
  flask: FlaskIcon,
  heart: HeartIcon,
  priest: PriestIcon,
};

export function getSacramentIcon(iconKey: SacramentIconKey): ComponentType<ParishIconProps> {
  return sacramentIconMap[iconKey];
}
