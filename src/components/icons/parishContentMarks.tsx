/** Additional filled artwork. Same 64×64 viewBox and monochrome classes as parishMarks. */

export function ScrollMark() {
  return (
    <g className="pi-subject">
      <rect x="18" y="16" width="28" height="32" rx="1.5" className="pi-pearl" />
      <rect x="32" y="16" width="14" height="32" className="pi-pearl-shade" />
      <rect x="14" y="14" width="7" height="36" rx="3.5" className="pi-ink" />
      <rect x="43" y="14" width="7" height="36" rx="3.5" className="pi-ink-deep" />
      <path d="M24 24h14M24 29h12M24 34h10M24 39h12" className="pi-line" />
    </g>
  );
}

export function PeopleMark() {
  return (
    <g className="pi-subject">
      <circle cx="22" cy="20" r="5" className="pi-pearl-shade" />
      <path d="M14 42c1-8 4-11 8-11s7 3 8 11Z" className="pi-ink" />
      <circle cx="42" cy="20" r="5" className="pi-pearl" />
      <path d="M34 42c1-8 4-11 8-11s7 3 8 11Z" className="pi-ink-deep" />
      <circle cx="32" cy="24" r="6" className="pi-pearl" />
      <path d="M32 18a6 6 0 0 0 6 6 6 6 0 0 0-6 6Z" className="pi-pearl-shade" />
      <path d="M20 50c1.4-9 5.2-13 12-13s10.6 4 12 13Z" className="pi-pearl" />
      <path d="M32 37c6.2 0 10 3.6 12 13H32Z" className="pi-pearl-shade" />
    </g>
  );
}

export function CrosierMark() {
  return (
    <g className="pi-subject">
      <path d="M30 52V28c0-9 14-11 14-2 0 5-5 6-5 11h-5c0-3 2-3.5 2-6 0-3-4-2.5-4 1v20Z" className="pi-ink" />
      <path d="M36 52V30c0-5 6-6 6-1 0 3-3 3.5-3 6h-3Z" className="pi-ink-deep" />
      <rect x="24" y="50" width="16" height="4" rx="1" className="pi-pearl" />
    </g>
  );
}

export function BellMark() {
  return (
    <g className="pi-subject">
      <path d="M30 12h4v4h-4Z" className="pi-ink" />
      <path d="M18 40c1-12 5-20 14-20s13 8 14 20Z" className="pi-pearl" />
      <path d="M32 20c8 0 12 8 14 20H32Z" className="pi-pearl-shade" />
      <rect x="16" y="38" width="32" height="5" rx="2" className="pi-ink" />
      <circle cx="32" cy="48" r="3.2" className="pi-ink-deep" />
    </g>
  );
}

export function CommunityMark() {
  return (
    <g className="pi-subject">
      <circle cx="18" cy="24" r="5" className="pi-pearl-shade" />
      <path d="M10 46c1.2-8 4-11 8-11s6.8 3 8 11Z" className="pi-ink" />
      <circle cx="46" cy="24" r="5" className="pi-pearl" />
      <path d="M38 46c1.2-8 4-11 8-11s6.8 3 8 11Z" className="pi-ink-deep" />
      <circle cx="32" cy="20" r="6" className="pi-pearl" />
      <path d="M32 14a6 6 0 0 0 6 6 6 6 0 0 0-6 6Z" className="pi-pearl-shade" />
      <path d="M22 48c1.2-9 4.6-13 10-13s8.8 4 10 13Z" className="pi-pearl" />
      <path d="M32 35c5.2 0 8.2 3.4 10 13H32Z" className="pi-pearl-shade" />
    </g>
  );
}

export function FontMark() {
  return (
    <g className="pi-subject">
      <path d="M31 10h2v6h-2Z" className="pi-ink" />
      <path d="M28 12h8v2h-8Z" className="pi-ink" />
      <path d="M14 30c2-8 8-12 18-12s16 4 18 12c-4 2-10 3-18 3s-14-1-18-3Z" className="pi-pearl" />
      <path d="M32 18c8 0 14 3 18 12-6 1.4-12 2-18 2V18Z" className="pi-pearl-shade" />
      <ellipse cx="32" cy="30" rx="10" ry="3.2" className="pi-ink" />
      <rect x="29" y="32" width="6" height="10" className="pi-pearl-shade" />
      <path d="M16 44h32l-4 8H20Z" className="pi-ink" />
      <path d="M32 44h16l-4 8H32Z" className="pi-ink-deep" />
    </g>
  );
}

export function ShelfMark() {
  return (
    <g className="pi-subject">
      <rect x="14" y="40" width="36" height="4" rx="1" className="pi-ink" />
      <rect x="16" y="18" width="8" height="22" className="pi-pearl" />
      <rect x="25" y="24" width="8" height="16" className="pi-ink" />
      <rect x="34" y="14" width="8" height="26" className="pi-pearl-shade" />
      <rect x="43" y="22" width="6" height="18" className="pi-ink-deep" />
    </g>
  );
}

export function HallMark() {
  return (
    <g className="pi-subject">
      <path d="M10 28h44v4H10Z" className="pi-ink" />
      <rect x="14" y="32" width="36" height="16" className="pi-pearl" />
      <rect x="32" y="32" width="18" height="16" className="pi-pearl-shade" />
      <rect x="18" y="36" width="7" height="6" className="pi-ink" />
      <rect x="39" y="36" width="7" height="6" className="pi-ink-deep" />
      <path d="M28 48V38h8v10Z" className="pi-ink" />
    </g>
  );
}

export function NewsMark() {
  return (
    <g className="pi-subject">
      <path d="M14 16h30c4 0 6 2 6 6v26H20c-4 0-6-2-6-6Z" className="pi-pearl" />
      <path d="M32 16h12c4 0 6 2 6 6v26H32Z" className="pi-pearl-shade" />
      <rect x="18" y="20" width="22" height="5" className="pi-ink" />
      <path d="M18 30h14M18 34h12M18 38h14" className="pi-line" />
      <rect x="36" y="28" width="8" height="12" className="pi-ink" />
    </g>
  );
}

export function PulpitMark() {
  return (
    <g className="pi-subject">
      <path d="M16 28h32l-4 8H20Z" className="pi-pearl" />
      <path d="M32 28h16l-4 8H32Z" className="pi-pearl-shade" />
      <rect x="22" y="36" width="20" height="6" className="pi-ink" />
      <rect x="29" y="42" width="6" height="10" className="pi-ink-deep" />
      <path d="M20 22h10v6H20Z" className="pi-pearl" />
      <path d="M31 18h2v8h-2Z" className="pi-ink" />
      <path d="M28 21h8v2h-8Z" className="pi-ink" />
    </g>
  );
}

export function BannerMark() {
  return (
    <g className="pi-subject">
      <path d="M16 14h4v36h-4Z" className="pi-ink" />
      <path d="M20 16h26l-6 10 6 10H20Z" className="pi-pearl" />
      <path d="M34 16h12l-6 10 6 10H34Z" className="pi-pearl-shade" />
    </g>
  );
}

export function DiaryMark() {
  return (
    <g className="pi-subject">
      <rect x="16" y="14" width="32" height="36" rx="2" className="pi-pearl" />
      <rect x="32" y="14" width="16" height="36" className="pi-pearl-shade" />
      <rect x="16" y="14" width="32" height="8" className="pi-ink" />
      <circle cx="26" cy="12" r="2" className="pi-ink-deep" />
      <circle cx="38" cy="12" r="2" className="pi-ink-deep" />
      <rect x="22" y="28" width="6" height="5" className="pi-ink" />
      <rect x="30" y="28" width="6" height="5" className="pi-ink" />
      <rect x="38" y="28" width="6" height="5" className="pi-ink-deep" />
      <rect x="22" y="36" width="6" height="5" className="pi-ink" />
      <rect x="30" y="36" width="6" height="5" className="pi-pearl" />
    </g>
  );
}

export function FrameMark() {
  return (
    <g className="pi-subject">
      <rect x="14" y="16" width="36" height="30" rx="2" className="pi-ink" />
      <rect x="18" y="20" width="28" height="22" className="pi-pearl" />
      <path d="M18 36 28 26l8 8 6-5 4 7H18Z" className="pi-ink" />
      <circle cx="38" cy="26" r="3" className="pi-ink-deep" />
    </g>
  );
}

export function EnvelopeMark() {
  return (
    <g className="pi-subject">
      <path d="M12 22h40v24H12Z" className="pi-pearl" />
      <path d="M32 22h20v24H32Z" className="pi-pearl-shade" />
      <path d="M12 22 32 38 52 22" className="pi-ink" />
      <path d="M12 46 26 34" className="pi-line" />
      <path d="M52 46 38 34" className="pi-line" />
    </g>
  );
}

export function DoorMark() {
  return (
    <g className="pi-subject">
      <path d="M18 14h22v36H18Z" className="pi-ink" />
      <path d="M22 18h14v28H22Z" className="pi-pearl" />
      <path d="M29 18h7v28h-7Z" className="pi-pearl-shade" />
      <circle cx="33" cy="33" r="1.4" className="pi-ink" />
      <path d="M40 50h8v-8" className="pi-line" />
    </g>
  );
}

export function LanternMark() {
  return (
    <g className="pi-subject">
      <path d="M28 12h8v4h-8Z" className="pi-ink" />
      <path d="M20 20h24l-4 22H24Z" className="pi-pearl" />
      <path d="M32 20h12l-4 22H32Z" className="pi-pearl-shade" />
      <path d="M22 28h20M23 34h18" className="pi-line" />
      <path d="M18 42h28v4H18Z" className="pi-ink" />
      <path d="M30 46h4v6h-4Z" className="pi-ink-deep" />
    </g>
  );
}

export function HeartMark() {
  return (
    <g className="pi-subject">
      <path d="M32 50 14 32c-4-5-1-14 7-14 4 0 7 2 11 7 4-5 7-7 11-7 8 0 11 9 7 14Z" className="pi-pearl" />
      <path d="M32 50V25c4-5 7-7 11-7 8 0 11 9 7 14Z" className="pi-pearl-shade" />
    </g>
  );
}

export function CompassMark() {
  return (
    <g className="pi-subject">
      <circle cx="32" cy="32" r="16" className="pi-pearl" />
      <path d="M32 16a16 16 0 0 0 16 16 16 16 0 0 0-16 16Z" className="pi-pearl-shade" />
      <path d="M32 20 38 38 26 32Z" className="pi-ink" />
      <path d="M32 20 38 38 32 34Z" className="pi-ink-deep" />
      <circle cx="32" cy="32" r="2" className="pi-pearl" />
    </g>
  );
}

export function PinMark() {
  return (
    <g className="pi-subject">
      <path d="M32 10c-8 0-14 6-14 14 0 10 14 26 14 26s14-16 14-26c0-8-6-14-14-14Z" className="pi-pearl" />
      <path d="M32 10c6 0 12 5 14 12 0 8-8 18-14 24V10Z" className="pi-pearl-shade" />
      <circle cx="32" cy="24" r="5" className="pi-ink" />
    </g>
  );
}

export function PhoneMark() {
  return (
    <g className="pi-subject">
      <path d="M18 16c8 2 12 8 14 16l-6 4c2 6 6 10 12 12l4-6c8 2 12 6 14 14-8 6-18 4-26-4S12 24 18 16Z" className="pi-pearl" />
      <path d="M36 32c6 1 10 4 12 10l-8 4c4 4 2 8-2 12 2-8-2-12-8-14Z" className="pi-ink" />
    </g>
  );
}

export function ClockMark() {
  return (
    <g className="pi-subject">
      <circle cx="32" cy="32" r="16" className="pi-pearl" />
      <path d="M32 16a16 16 0 0 0 16 16 16 16 0 0 0-16 16Z" className="pi-pearl-shade" />
      <path d="M32 22v12l8 4" className="pi-line" />
      <circle cx="32" cy="34" r="2" className="pi-ink" />
    </g>
  );
}

export function ChildMark() {
  return (
    <g className="pi-subject">
      <circle cx="32" cy="20" r="8" className="pi-pearl" />
      <path d="M32 12a8 8 0 0 0 8 8 8 8 0 0 0-8 8Z" className="pi-pearl-shade" />
      <path d="M18 50c2-12 6-16 14-16s12 4 14 16Z" className="pi-ink" />
      <path d="M32 34c7 0 11 3.4 14 16H32Z" className="pi-ink-deep" />
    </g>
  );
}

export function CarMark() {
  return (
    <g className="pi-subject">
      <path d="M12 36h40v8H12Z" className="pi-ink" />
      <path d="M18 36 24 24h16l6 12Z" className="pi-pearl" />
      <path d="M32 24h8l6 12H32Z" className="pi-pearl-shade" />
      <circle cx="20" cy="46" r="4" className="pi-ink-deep" />
      <circle cx="44" cy="46" r="4" className="pi-ink-deep" />
      <circle cx="20" cy="46" r="1.6" className="pi-pearl" />
      <circle cx="44" cy="46" r="1.6" className="pi-pearl" />
    </g>
  );
}

export function BusMark() {
  return (
    <g className="pi-subject">
      <rect x="14" y="16" width="36" height="28" rx="3" className="pi-pearl" />
      <rect x="32" y="16" width="18" height="28" className="pi-pearl-shade" />
      <rect x="18" y="20" width="10" height="8" className="pi-ink" />
      <rect x="30" y="20" width="8" height="8" className="pi-ink" />
      <rect x="40" y="20" width="6" height="8" className="pi-ink-deep" />
      <circle cx="22" cy="46" r="3.5" className="pi-ink" />
      <circle cx="42" cy="46" r="3.5" className="pi-ink-deep" />
    </g>
  );
}

export function ClipboardMark() {
  return (
    <g className="pi-subject">
      <rect x="16" y="16" width="32" height="36" rx="2" className="pi-pearl" />
      <rect x="32" y="16" width="16" height="36" className="pi-pearl-shade" />
      <rect x="24" y="12" width="16" height="8" rx="2" className="pi-ink" />
      <path d="M22 30h12M22 36h16M22 42h10" className="pi-line" />
    </g>
  );
}

export function ReadingsMark() {
  return (
    <g className="pi-subject">
      <circle cx="32" cy="14" r="5" className="pi-pearl" />
      <path d="M32 9a5 5 0 0 0 5 5 5 5 0 0 0-5 5Z" className="pi-pearl-shade" />
      <path d="M12 28h18c2 8 2 16 0 22H12Z" className="pi-pearl" />
      <path d="M34 28h18v22c-2-6-2-14 0-22Z" className="pi-pearl-shade" />
      <path d="M30 26h4v26h-4Z" className="pi-ink" />
    </g>
  );
}

export function HandsMark() {
  return (
    <g className="pi-subject">
      <path d="M16 36c0-8 6-10 8-4v-8c0-3 4-3 4 0v8l2-10c0-3 4-3 4 0v12l2-6c0-3 4-2 4 1v10c0 8-8 14-16 14-6 0-8-4-8-7Z" className="pi-pearl" />
      <path d="M32 24c2 0 4 2 4 6v16c4 2 8 2 12-2V30c0-3 4-4 4-1v12c0 8-8 14-16 12V24Z" className="pi-pearl-shade" />
    </g>
  );
}

export function ConfessionalMark() {
  return (
    <g className="pi-subject">
      <rect x="12" y="16" width="40" height="32" rx="2" className="pi-ink" />
      <rect x="16" y="20" width="14" height="24" className="pi-pearl" />
      <rect x="34" y="20" width="14" height="24" className="pi-pearl-shade" />
      <path d="M18 24h10M18 28h10M18 32h10M18 36h10" className="pi-line" />
      <path d="M36 24h10M36 28h10M36 32h10M36 36h10" className="pi-line" />
    </g>
  );
}

export function MonstranceMark() {
  return (
    <g className="pi-subject">
      <circle cx="32" cy="26" r="10" className="pi-pearl" />
      <path d="M32 16a10 10 0 0 0 10 10 10 10 0 0 0-10 10Z" className="pi-pearl-shade" />
      <circle cx="32" cy="26" r="4" className="pi-ink" />
      <path d="M32 8v6M32 38v4M14 26h6M44 26h6M19 13l4 4M41 35l4 4M45 13l-4 4M23 35l-4 4" className="pi-line" />
      <rect x="29" y="42" width="6" height="6" className="pi-ink" />
      <path d="M22 50h20v4H22Z" className="pi-ink-deep" />
    </g>
  );
}

export function LampMark() {
  return (
    <g className="pi-subject">
      <path d="M22 28h20l-4 8H26Z" className="pi-pearl" />
      <path d="M32 28h10l-4 8H32Z" className="pi-pearl-shade" />
      <rect x="30" y="36" width="4" height="10" className="pi-ink" />
      <path d="M20 48h24v4H20Z" className="pi-ink-deep" />
      <path d="M32 12v8" className="pi-line" />
      <circle cx="32" cy="12" r="2" className="pi-pearl" />
    </g>
  );
}

export function YouthMark() {
  return (
    <g className="pi-subject">
      <circle cx="32" cy="16" r="6" className="pi-pearl" />
      <path d="M32 10a6 6 0 0 0 6 6 6 6 0 0 0-6 6Z" className="pi-pearl-shade" />
      <path d="M22 48c1-10 4-14 10-14s9 4 10 14Z" className="pi-ink" />
      <path d="M32 34c5.4 0 8.4 3.2 10 14H32Z" className="pi-ink-deep" />
      <path d="M18 28c4-6 8-6 10 0" className="pi-line" />
      <path d="M46 22 40 30" className="pi-line" />
    </g>
  );
}

export function MusicMark() {
  return (
    <g className="pi-subject">
      <circle cx="22" cy="44" r="6" className="pi-ink" />
      <circle cx="42" cy="40" r="6" className="pi-ink-deep" />
      <path d="M28 44V18h4v22" className="pi-pearl" />
      <path d="M48 40V14h-16v6h12v20" className="pi-pearl-shade" />
    </g>
  );
}

export function BricksMark() {
  return (
    <g className="pi-subject">
      <rect x="12" y="20" width="18" height="10" className="pi-pearl" />
      <rect x="32" y="20" width="20" height="10" className="pi-pearl-shade" />
      <rect x="12" y="32" width="12" height="10" className="pi-ink" />
      <rect x="26" y="32" width="14" height="10" className="pi-pearl" />
      <rect x="42" y="32" width="10" height="10" className="pi-ink-deep" />
    </g>
  );
}

export function BasketMark() {
  return (
    <g className="pi-subject">
      <path d="M16 28h32l-4 20H20Z" className="pi-pearl" />
      <path d="M32 28h16l-4 20H32Z" className="pi-pearl-shade" />
      <path d="M22 28c0-8 4-12 10-12s10 4 10 12" className="pi-line" />
      <path d="M24 36h16M26 42h12" className="pi-line" />
      <circle cx="32" cy="22" r="3" className="pi-ink" />
    </g>
  );
}

export function GiftMark() {
  return (
    <g className="pi-subject">
      <rect x="14" y="28" width="36" height="20" className="pi-pearl" />
      <rect x="32" y="28" width="18" height="20" className="pi-pearl-shade" />
      <rect x="29" y="28" width="6" height="20" className="pi-ink" />
      <rect x="14" y="24" width="36" height="6" className="pi-ink" />
      <path d="M32 24c-6-8-14-4-8 2h8c6-6 2-10-8-2" className="pi-pearl" />
    </g>
  );
}

export function CoinsMark() {
  return (
    <g className="pi-subject">
      <ellipse cx="26" cy="40" rx="12" ry="6" className="pi-ink" />
      <ellipse cx="26" cy="36" rx="12" ry="6" className="pi-pearl-shade" />
      <ellipse cx="36" cy="30" rx="12" ry="6" className="pi-ink-deep" />
      <ellipse cx="36" cy="26" rx="12" ry="6" className="pi-pearl" />
      <path d="M36 20a6 6 0 0 0 0 12" className="pi-line" />
    </g>
  );
}

export function BagMark() {
  return (
    <g className="pi-subject">
      <path d="M18 26h28l-3 26H21Z" className="pi-pearl" />
      <path d="M32 26h14l-3 26H32Z" className="pi-pearl-shade" />
      <path d="M24 26c0-8 3-12 8-12s8 4 8 12" className="pi-line" />
    </g>
  );
}

export function BibleMark() {
  return (
    <g className="pi-subject">
      <path d="M14 16h28c4 0 8 2 8 6v28H22c-5 0-8-2-8-6Z" className="pi-pearl" />
      <path d="M32 16h10c4 0 8 2 8 6v28H32Z" className="pi-pearl-shade" />
      <path d="M31 24h2v12h-2Z" className="pi-ink" />
      <path d="M26 29h12v2H26Z" className="pi-ink" />
    </g>
  );
}

export function QuillMark() {
  return (
    <g className="pi-subject">
      <path d="M44 12 22 40l-4 10 10-4L52 20c-2-6-4-8-8-8Z" className="pi-pearl" />
      <path d="M44 12c4 2 8 6 8 8L28 46l-6-6Z" className="pi-pearl-shade" />
      <path d="M22 40 18 50l10-4" className="pi-ink" />
      <path d="M28 34 40 18" className="pi-line" />
    </g>
  );
}

export function CruetMark() {
  return (
    <g className="pi-subject">
      <path d="M16 28h12l2 20H14Z" className="pi-pearl" />
      <rect x="18" y="18" width="8" height="10" className="pi-ink" />
      <path d="M36 28h12l-2 20H34Z" className="pi-pearl-shade" />
      <rect x="38" y="16" width="8" height="12" className="pi-ink-deep" />
    </g>
  );
}

export function ChasubleMark() {
  return (
    <g className="pi-subject">
      <path d="M32 12 18 22v28h28V22Z" className="pi-pearl" />
      <path d="M32 12 46 22v28H32Z" className="pi-pearl-shade" />
      <path d="M26 12h12v8c-2 3-4 4-6 4s-4-1-6-4Z" className="pi-ink" />
      <path d="M31 28h2v12h-2Z" className="pi-ink" />
      <path d="M27 33h10v2H27Z" className="pi-ink" />
    </g>
  );
}

export function RosaryMark() {
  return (
    <g className="pi-subject">
      <circle cx="32" cy="28" r="12" className="pi-line" />
      <circle cx="32" cy="16" r="2.2" className="pi-ink" />
      <circle cx="42" cy="22" r="2.2" className="pi-ink" />
      <circle cx="44" cy="32" r="2.2" className="pi-ink-deep" />
      <circle cx="38" cy="40" r="2.2" className="pi-ink" />
      <circle cx="26" cy="40" r="2.2" className="pi-ink" />
      <circle cx="20" cy="32" r="2.2" className="pi-ink" />
      <circle cx="22" cy="22" r="2.2" className="pi-ink-deep" />
      <path d="M32 40v8M28 48h8" className="pi-line" />
    </g>
  );
}

export function MedalMark() {
  return (
    <g className="pi-subject">
      <path d="M24 12h6l2 10h-10Z" className="pi-ink" />
      <path d="M34 12h6l2 10H32Z" className="pi-ink-deep" />
      <circle cx="32" cy="38" r="12" className="pi-pearl" />
      <path d="M32 26a12 12 0 0 0 12 12 12 12 0 0 0-12 12Z" className="pi-pearl-shade" />
      <path d="M31 32h2v12h-2Z" className="pi-ink" />
      <path d="M26 37h12v2H26Z" className="pi-ink" />
    </g>
  );
}

export function CradleMark() {
  return (
    <g className="pi-subject">
      <path d="M14 36c4 8 32 8 36 0" className="pi-pearl" />
      <path d="M16 36h32v4c-6 6-26 6-32 0Z" className="pi-pearl-shade" />
      <circle cx="32" cy="28" r="6" className="pi-ink" />
      <path d="M18 40 14 50M46 40l4 10" className="pi-line" />
    </g>
  );
}

export function MotherMark() {
  return (
    <g className="pi-subject">
      <circle cx="28" cy="16" r="6" className="pi-pearl" />
      <path d="M16 48c2-14 6-18 14-16 6 1 8 6 10 14" className="pi-pearl-shade" />
      <circle cx="40" cy="36" r="5" className="pi-ink" />
      <path d="M34 48c1-6 3-8 6-8s5 2 6 8Z" className="pi-ink-deep" />
    </g>
  );
}

export function FlaskMark() {
  return (
    <g className="pi-subject">
      <path d="M26 12h12v8L50 48H14L26 20Z" className="pi-pearl" />
      <path d="M32 12h6v8l12 28H32Z" className="pi-pearl-shade" />
      <path d="M18 40h28" className="pi-line" />
      <rect x="28" y="10" width="8" height="4" className="pi-ink" />
    </g>
  );
}

export function TabletMark() {
  return (
    <g className="pi-subject">
      <ellipse cx="26" cy="36" rx="12" ry="8" className="pi-pearl" />
      <ellipse cx="38" cy="28" rx="12" ry="8" className="pi-pearl-shade" />
      <path d="M30 24h4l2 8h-8Z" className="pi-ink" />
    </g>
  );
}

export function ThermoMark() {
  return (
    <g className="pi-subject">
      <rect x="28" y="12" width="8" height="28" rx="4" className="pi-pearl" />
      <rect x="32" y="12" width="4" height="28" className="pi-pearl-shade" />
      <circle cx="32" cy="44" r="8" className="pi-ink" />
      <rect x="30" y="28" width="4" height="16" className="pi-ink-deep" />
    </g>
  );
}

export function BandageMark() {
  return (
    <g className="pi-subject">
      <rect x="12" y="26" width="40" height="12" rx="6" transform="rotate(-40 32 32)" className="pi-pearl" />
      <rect x="26" y="26" width="12" height="12" className="pi-ink" />
      <circle cx="29" cy="29" r="1.2" className="pi-pearl" />
      <circle cx="35" cy="35" r="1.2" className="pi-pearl" />
    </g>
  );
}

export function ShieldMark() {
  return (
    <g className="pi-subject">
      <path d="M32 10 50 18v14c0 12-8 18-18 22C22 50 14 44 14 32V18Z" className="pi-pearl" />
      <path d="M32 10 50 18v14c0 12-8 18-18 22V10Z" className="pi-pearl-shade" />
      <path d="M32 22v16M24 30h16" className="pi-line" />
    </g>
  );
}

export function CounselMark() {
  return (
    <g className="pi-subject">
      <path d="M10 16h22v16H18l-6 6v-6h-2Z" className="pi-pearl" />
      <path d="M32 28h22v16H42l-6 6v-6h-4Z" className="pi-pearl-shade" />
    </g>
  );
}

export function LungsMark() {
  return (
    <g className="pi-subject">
      <path d="M30 16h4v28h-4Z" className="pi-ink" />
      <path d="M14 28c0-8 6-12 12-8v20c-8 4-12-2-12-12Z" className="pi-pearl" />
      <path d="M50 28c0-8-6-12-12-8v20c8 4 12-2 12-12Z" className="pi-pearl-shade" />
    </g>
  );
}

export function ScopeMark() {
  return (
    <g className="pi-subject">
      <circle cx="24" cy="28" r="10" className="pi-pearl" />
      <circle cx="40" cy="28" r="10" className="pi-pearl-shade" />
      <path d="M24 38v8M40 38v8M18 46h12M34 46h12" className="pi-line" />
      <circle cx="24" cy="28" r="3" className="pi-ink" />
      <circle cx="40" cy="28" r="3" className="pi-ink-deep" />
    </g>
  );
}

export function GaugeMark() {
  return (
    <g className="pi-subject">
      <path d="M12 40a20 20 0 0 1 40 0" className="pi-pearl" />
      <path d="M32 20a20 20 0 0 1 20 20H32Z" className="pi-pearl-shade" />
      <path d="M32 40 44 28" className="pi-line" />
      <circle cx="32" cy="40" r="3" className="pi-ink" />
    </g>
  );
}

export function DropMark() {
  return (
    <g className="pi-subject">
      <path d="M32 10c8 12 14 18 14 26a14 14 0 0 1-28 0c0-8 6-14 14-26Z" className="pi-pearl" />
      <path d="M32 10c6 10 12 16 14 24a14 14 0 0 1-14 12Z" className="pi-pearl-shade" />
    </g>
  );
}

export function QuoteMark() {
  return (
    <g className="pi-subject">
      <path d="M12 20h16v12c0 8-6 12-12 14v-6c4-1 6-3 6-8H12Z" className="pi-pearl" />
      <path d="M36 20h16v12c0 8-6 12-12 14v-6c4-1 6-3 6-8H36Z" className="pi-pearl-shade" />
    </g>
  );
}

export function WifiMark() {
  return (
    <g className="pi-subject">
      <path d="M12 28c6-8 12-12 20-12s14 4 20 12" className="pi-line" />
      <path d="M18 34c4-6 8-8 14-8s10 2 14 8" className="pi-line" />
      <circle cx="32" cy="42" r="3.5" className="pi-ink" />
    </g>
  );
}

export function ProjectorMark() {
  return (
    <g className="pi-subject">
      <rect x="12" y="26" width="28" height="16" rx="2" className="pi-pearl" />
      <rect x="26" y="26" width="14" height="16" className="pi-pearl-shade" />
      <circle cx="46" cy="34" r="6" className="pi-ink" />
      <circle cx="46" cy="34" r="2.4" className="pi-pearl" />
    </g>
  );
}

export function SpeakerMark() {
  return (
    <g className="pi-subject">
      <path d="M14 26h10l12-10v32L24 38H14Z" className="pi-pearl" />
      <path d="M36 22c6 4 6 16 0 20" className="pi-line" />
      <path d="M40 16c10 6 10 26 0 32" className="pi-line" />
    </g>
  );
}

export function LockMark() {
  return (
    <g className="pi-subject">
      <rect x="18" y="28" width="28" height="20" rx="2" className="pi-pearl" />
      <rect x="32" y="28" width="14" height="20" className="pi-pearl-shade" />
      <path d="M24 28v-6a8 8 0 0 1 16 0v6" className="pi-line" />
      <circle cx="32" cy="38" r="2.4" className="pi-ink" />
    </g>
  );
}

export function RestroomMark() {
  return (
    <g className="pi-subject">
      <circle cx="22" cy="16" r="4" className="pi-pearl" />
      <path d="M16 42c1-8 3-12 6-12s5 4 6 12Z" className="pi-ink" />
      <circle cx="42" cy="16" r="4" className="pi-pearl-shade" />
      <path d="M36 28h12l-2 14h-8Z" className="pi-ink-deep" />
    </g>
  );
}

export function ClocheMark() {
  return (
    <g className="pi-subject">
      <path d="M16 40c2-14 8-20 16-20s14 6 16 20Z" className="pi-pearl" />
      <path d="M32 20c8 0 13 6 16 20H32Z" className="pi-pearl-shade" />
      <rect x="12" y="40" width="40" height="5" rx="1" className="pi-ink" />
      <rect x="30" y="14" width="4" height="6" className="pi-ink-deep" />
    </g>
  );
}

export function SnowflakeMark() {
  return (
    <g className="pi-subject">
      <path d="M32 12v40M18 20l28 24M46 20 18 44M20 32h24" className="pi-line" />
      <circle cx="32" cy="32" r="3" className="pi-ink" />
    </g>
  );
}

export function GarmentMark() {
  return (
    <g className="pi-subject">
      <path d="M24 16h16l6 8-6 4v24H24V28l-6-4Z" className="pi-pearl" />
      <path d="M32 16h8l6 8-6 4v24H32Z" className="pi-pearl-shade" />
      <path d="M28 16c1 4 3 6 4 6s3-2 4-6" className="pi-line" />
    </g>
  );
}

export function PewMark() {
  return (
    <g className="pi-subject">
      <path d="M14 22h36v6H14Z" className="pi-ink" />
      <rect x="16" y="28" width="32" height="8" className="pi-pearl" />
      <rect x="32" y="28" width="16" height="8" className="pi-pearl-shade" />
      <path d="M18 36v10M46 36v10M24 36v8M40 36v8" className="pi-line" />
    </g>
  );
}

export function GlobeMark() {
  return (
    <g className="pi-subject">
      <circle cx="32" cy="32" r="16" className="pi-pearl" />
      <path d="M32 16a16 16 0 0 0 16 16 16 16 0 0 0-16 16Z" className="pi-pearl-shade" />
      <ellipse cx="32" cy="32" rx="7" ry="16" className="pi-line" />
      <path d="M16 32h32M18 24h28M18 40h28" className="pi-line" />
    </g>
  );
}
