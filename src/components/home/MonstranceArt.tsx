import { cn } from "@/lib/utils";

type Point = [number, number];

const CX = 260;
const CY = 268;

function at(r: number, deg: number, cx = CX, cy = CY): Point {
  const rad = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
}

function fmt(p: Point): string {
  return `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
}

/** Pointed sunburst ray. `spread` is the half-angle at the base, in degrees. */
function ray(inner: number, outer: number, deg: number, spread: number): string {
  const shoulder = inner + (outer - inner) * 0.22;
  return [
    `M${fmt(at(inner, deg - spread))}`,
    `L${fmt(at(shoulder, deg - spread * 0.62))}`,
    `L${fmt(at(outer, deg))}`,
    `L${fmt(at(shoulder, deg + spread * 0.62))}`,
    `L${fmt(at(inner, deg + spread))}Z`,
  ].join("");
}

function fromTop(deg: number): number {
  const shifted = ((deg + 90) % 360 + 360) % 360;
  return Math.min(shifted, 360 - shifted);
}

interface MonstranceArtProps {
  className?: string;
}

/**
 * Engraved monstrance. No background fill, so the section colour shows through.
 * Cream shapes and charcoal linework stay readable on the gold primary.
 */
const MonstranceArt = ({ className }: MonstranceArtProps) => {
  const longRays: string[] = [];
  const shortRays: string[] = [];
  const rayVeins: string[] = [];
  const petals: string[] = [];
  const beads: Point[] = [];

  const count = 36;
  for (let i = 0; i < count; i += 1) {
    const deg = -90 + (i * 360) / count;
    // Leave the crown clear for the cross and pediment.
    if (fromTop(deg) < 18) continue;

    const long = i % 2 === 0;
    if (long) {
      longRays.push(ray(128, 248, deg, 4.2));
      rayVeins.push(ray(146, 228, deg, 1.15));
    } else {
      shortRays.push(ray(128, 188, deg, 3.4));
    }
  }

  for (let i = 0; i < 16; i += 1) {
    const deg = -90 + (i * 360) / 16;
    const a = at(108, deg - 9);
    const tip = at(122, deg);
    const b = at(108, deg + 9);
    petals.push(`M${fmt(a)} Q${fmt(tip)} ${fmt(b)}`);
    beads.push(at(96, deg + 11.25));
  }

  return (
    <svg
      viewBox="0 0 520 700"
      className={cn("parish-icon h-auto w-full", className)}
      aria-hidden="true"
      focusable="false"
    >
      <g className="pi-ink">
        {longRays.map((d) => (
          <path key={d} d={d} className="pi-pearl" style={{ stroke: "hsl(var(--pi-ink))", strokeWidth: 1.6, strokeLinejoin: "round" }} />
        ))}
        {shortRays.map((d) => (
          <path key={d} d={d} className="pi-pearl-shade" style={{ stroke: "hsl(var(--pi-ink))", strokeWidth: 1.4, strokeLinejoin: "round" }} />
        ))}
        {rayVeins.map((d) => (
          <path key={`v-${d}`} d={d} className="pi-ink" opacity={0.28} />
        ))}
      </g>

      {/* Crown: pediment and cross sit over the top rays. */}
      <path
        d="M260 46 L332 168 L188 168 Z"
        className="pi-pearl"
        style={{ stroke: "hsl(var(--pi-ink))", strokeWidth: 2, strokeLinejoin: "round" }}
      />
      <path d="M260 78 L308 156 L212 156 Z" fill="none" className="pi-line" style={{ strokeWidth: 1.4 }} />
      <path
        d="M252 8 h16 v28 h26 v16 h-26 v30 h-16 v-30 h-26 v-16 h26 Z"
        className="pi-pearl"
        style={{ stroke: "hsl(var(--pi-ink))", strokeWidth: 1.8, strokeLinejoin: "round" }}
      />
      <circle cx="260" cy="44" r="5" className="pi-ink" />
      <circle cx="260" cy="44" r="2.2" className="pi-pearl" />

      {/* Lunette */}
      <circle cx={CX} cy={CY} r="124" className="pi-pearl" style={{ stroke: "hsl(var(--pi-ink))", strokeWidth: 3 }} />
      <circle cx={CX} cy={CY} r="112" fill="none" style={{ stroke: "hsl(var(--pi-ink))", strokeWidth: 1.2 }} />
      {petals.map((d) => (
        <path key={d} d={d} fill="none" style={{ stroke: "hsl(var(--pi-ink))", strokeWidth: 1.3, strokeLinecap: "round" }} />
      ))}
      {beads.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="2.4" className="pi-ink" />
      ))}
      <circle cx={CX} cy={CY} r="78" className="pi-pearl-shade" style={{ stroke: "hsl(var(--pi-ink))", strokeWidth: 1.6 }} />
      <circle cx={CX} cy={CY} r="62" fill="none" style={{ stroke: "hsl(var(--pi-ink) / 0.45)", strokeWidth: 1 }} />

      {/* Host and cross */}
      <circle cx={CX} cy={CY} r="40" className="pi-pearl" style={{ stroke: "hsl(var(--pi-ink))", strokeWidth: 2 }} />
      <path
        d="M254 236 h12 v22 h20 v12 h-20 v22 h-12 v-22 h-20 v-12 h20 Z"
        className="pi-ink"
      />
      <circle cx={CX} cy={CY} r="4" className="pi-pearl" />

      {/* Stem, knop, and foot */}
      <path
        d="M242 390 h36 v28 h-36 Z"
        className="pi-pearl"
        style={{ stroke: "hsl(var(--pi-ink))", strokeWidth: 1.6 }}
      />
      <path d="M260 394 v22" style={{ stroke: "hsl(var(--pi-ink) / 0.4)", strokeWidth: 1.2 }} />
      <ellipse cx={CX} cy="440" rx="36" ry="22" className="pi-pearl" style={{ stroke: "hsl(var(--pi-ink))", strokeWidth: 1.8 }} />
      <ellipse cx={CX} cy="440" rx="16" ry="9" fill="none" style={{ stroke: "hsl(var(--pi-ink) / 0.5)", strokeWidth: 1.2 }} />
      <path
        d="M246 460 h28 l8 78 h-44 Z"
        className="pi-pearl"
        style={{ stroke: "hsl(var(--pi-ink))", strokeWidth: 1.6, strokeLinejoin: "round" }}
      />
      <path d="M260 466 v68" style={{ stroke: "hsl(var(--pi-ink) / 0.35)", strokeWidth: 1.2 }} />
      <path
        d="M188 538 h144 l14 20 H174 Z"
        className="pi-pearl-shade"
        style={{ stroke: "hsl(var(--pi-ink))", strokeWidth: 1.6, strokeLinejoin: "round" }}
      />
      <path
        d="M158 558 h204 l18 26 H140 Z"
        className="pi-pearl"
        style={{ stroke: "hsl(var(--pi-ink))", strokeWidth: 1.8, strokeLinejoin: "round" }}
      />
      <path
        d="M140 584 h240 v8 H140 Z"
        className="pi-pearl-shade"
        style={{ stroke: "hsl(var(--pi-ink))", strokeWidth: 1.6 }}
      />
    </svg>
  );
};

export default MonstranceArt;
