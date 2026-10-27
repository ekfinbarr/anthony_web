import type { ParishIconProps } from "@/components/icons/ParishIcon";
import type { SacramentIconKey } from "@/data/sacraments";
import { sacramentIconMap } from "./sacramentIcons";

/**
 * Renders a sacrament's parish icon. Looking the component up from the static
 * map here (rather than via a helper call inside each parent's render) lets
 * React see that the icon component is stable between renders.
 */
export function SacramentIcon({ iconKey, ...props }: ParishIconProps & { iconKey: SacramentIconKey }) {
  const Icon = sacramentIconMap[iconKey];
  return <Icon {...props} />;
}
