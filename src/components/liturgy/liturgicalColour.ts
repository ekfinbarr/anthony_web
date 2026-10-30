import type { LiturgicalColour } from "@/services/dailyReading.service";

type ColourInfo = {
  label: string;
  /** Swatch / accent colour (CSS colour value). */
  value: string;
};

const COLOURS: Record<LiturgicalColour, ColourInfo> = {
  green: { label: "Green", value: "hsl(145 45% 34%)" },
  white: { label: "White", value: "hsl(38 66% 61%)" }, // shown as parish gold — white on cream is invisible
  red: { label: "Red", value: "hsl(355 70% 44%)" },
  violet: { label: "Violet", value: "hsl(275 40% 42%)" },
  rose: { label: "Rose", value: "hsl(335 55% 62%)" },
  black: { label: "Black", value: "hsl(0 0% 15%)" },
};

const FALLBACK: ColourInfo = { label: "", value: "hsl(var(--church-gold))" };

export function liturgicalColour(colour: string | null | undefined): ColourInfo {
  return (colour && COLOURS[colour as LiturgicalColour]) || FALLBACK;
}

const SEASONS: Record<string, string> = {
  advent: "Advent",
  christmas: "Christmas Time",
  lent: "Lent",
  easter: "Easter Time",
  ordinary: "Ordinary Time",
};

export function seasonLabel(season: string | null | undefined, week?: number | null): string | null {
  if (!season) return null;
  const name = SEASONS[season] ?? season;
  return week ? `${name} · Week ${week}` : name;
}
