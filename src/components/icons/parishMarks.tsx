/** Filled artwork for parish icons. Coordinates sit in a 64×64 viewBox. */

export function ChurchMark() {
  return (
    <g className="pi-subject">
      <rect x="19" y="31" width="26" height="18" className="pi-pearl" />
      <rect x="32" y="31" width="13" height="18" className="pi-pearl-shade" />
      <path d="M15.5 33.2 32 20.5 48.5 33.2 45.6 35.6 32 25.2 18.4 35.6Z" className="pi-roof" />
      <path d="M32 20.5 48.5 33.2 45.6 35.6 32 25.2Z" className="pi-roof-dark" />
      <rect x="28.2" y="16.5" width="7.6" height="13" className="pi-pearl" />
      <rect x="32" y="16.5" width="3.8" height="13" className="pi-pearl-shade" />
      <path d="M26.4 17.6 32 10.2 37.6 17.6Z" className="pi-roof" />
      <path d="M32 10.2 37.6 17.6H32Z" className="pi-roof-dark" />
      <path d="M31.1 4.4h1.8V11h-1.8Z" className="pi-pearl" />
      <path d="M28.4 6.2h7.2v1.8h-7.2Z" className="pi-pearl" />
      <rect x="15" y="47.2" width="34" height="5.2" rx="2.6" className="pi-pearl" />
      <rect x="32" y="47.2" width="17" height="5.2" rx="2" className="pi-pearl-shade" />
      <path d="M22.2 47.2v-6.4a2.8 3.5 0 0 1 5.6 0v6.4Z" className="pi-glass" />
      <path d="M29 47.6V37.6a3 4.6 0 0 1 6 0v10Z" className="pi-glass" />
      <path d="M36.2 47.2v-6.4a2.8 3.5 0 0 1 5.6 0v6.4Z" className="pi-glass-dark" />
    </g>
  );
}

export function ChaliceMark() {
  return (
    <g className="pi-subject">
      <circle cx="32" cy="16.5" r="8.2" className="pi-host" />
      <path d="M32 8.3a8.2 8.2 0 0 0 8.2 8.2 8.2 8.2 0 0 0-8.2 8.2Z" className="pi-host-shade" />
      <path d="M31.15 12.2h1.7v8.2h-1.7Z" className="pi-ink" />
      <path d="M28.4 15.2h7.2v1.7H28.4Z" className="pi-ink" />
      <path d="M15 29h34c-.6 9.2-6.8 15.4-17 16.2C21.8 44.4 15.6 38.2 15 29Z" className="pi-gold" />
      <path d="M32 29h17c-.6 9.2-6.8 15.4-17 16.2V29Z" className="pi-gold-deep" />
      <path d="M14.2 27.2h35.6v3.4H14.2Z" className="pi-gold" />
      <path d="M32 27.2h17.8v3.4H32Z" className="pi-gold-deep" />
      <path d="M29.2 45h5.6v5.2h-5.6Z" className="pi-gold" />
      <path d="M32 45h2.8v5.2H32Z" className="pi-gold-deep" />
      <ellipse cx="32" cy="45.2" rx="4.4" ry="2" className="pi-gold" />
      <path d="M21 51.2h22l-2.2 4.6H23.2Z" className="pi-gold" />
      <path d="M32 51.2h11l-2.2 4.6H32Z" className="pi-gold-deep" />
    </g>
  );
}

export function BookMark() {
  return (
    <g className="pi-subject">
      <path d="M8 25c7-4 16-4.2 24-1.2v28C24 48.6 15 48.8 8 53Z" className="pi-gold-deep" />
      <path d="M32 23.8c8-3 17-2.8 24 1.2v28c-7-4.2-16-4.4-24-1.2Z" className="pi-gold" />
      <path d="M12 22.5c6.2-3.2 13-3 20 .2V48c-7-3.2-13.8-3.2-20 .2Z" className="pi-page" />
      <path d="M32 22.7c7-3.2 13.8-3.4 20-.2v25.7c-6.2-3.2-13-3.4-20-.2Z" className="pi-page-shade" />
      <path d="M31 22h2v27h-2Z" className="pi-gold-deep" />
      <path d="M30.15 29.2h3.7v8.6h-3.7Z" className="pi-gold" />
      <path d="M27.2 32.4h9.6v2.2H27.2Z" className="pi-gold" />
      <path d="M17 30.5h9M17 34.5h9M17 38.5h7" className="pi-line" />
      <path d="M38 30.5h9M38 34.5h9M38 38.5h7" className="pi-line" />
    </g>
  );
}

export function PlayMark() {
  return (
    <g className="pi-subject">
      <circle cx="32" cy="32" r="18" className="pi-pearl" />
      <path d="M32 14a18 18 0 0 0 18 18 18 18 0 0 0-18 18Z" className="pi-pearl-shade" />
      <path d="M27.5 21.2v21.6L47 32Z" className="pi-rose" />
      <path d="M37 26.6 47 32l-10 5.4Z" className="pi-rose-dark" />
    </g>
  );
}

const crossRays = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

export function CrossMark() {
  return (
    <g className="pi-subject">
      {crossRays.map((angle, index) => (
        <rect
          key={angle}
          x={index % 2 === 0 ? 29.2 : 30.5}
          y={6.5}
          width={index % 2 === 0 ? 5.6 : 3}
          height={index % 2 === 0 ? 11 : 8.5}
          rx={1}
          transform={`rotate(${angle} 32 32)`}
          className={index % 2 === 0 ? "pi-ray" : "pi-ray-deep"}
        />
      ))}
      <circle cx="32" cy="32" r="14.5" className="pi-host" />
      <path d="M32 17.5a14.5 14.5 0 0 0 14.5 14.5 14.5 14.5 0 0 0-14.5 14.5Z" className="pi-host-shade" />
      <rect x="27.6" y="20.2" width="8.8" height="23.6" rx="1.3" className="pi-rose" />
      <rect x="20.2" y="27.6" width="23.6" height="8.8" rx="1.3" className="pi-rose" />
      <rect x="32" y="20.2" width="4.4" height="23.6" className="pi-rose-dark" />
      <rect x="32" y="27.6" width="11.8" height="8.8" className="pi-rose-dark" />
    </g>
  );
}

export function CandleMark() {
  return (
    <g className="pi-subject">
      <path d="M32 7.2c3.6 4.6 5.6 7.8 5.6 11.2a5.6 5.6 0 0 1-11.2 0c0-3.4 2-6.6 5.6-11.2Z" className="pi-flame" />
      <path d="M32 12.8c1.8 2.5 2.7 4.1 2.7 5.8a2.7 2.7 0 0 1-5.4 0c0-1.7.9-3.3 2.7-5.8Z" className="pi-flame-core" />
      <path d="M25.2 24.5h13.6L37 46.2H27Z" className="pi-wax" />
      <path d="M32 24.5h6.8L37 46.2H32Z" className="pi-wax-shade" />
      <path d="M25.2 31c2.4 1.4 2.8 3.4.6 4.4-1.4-1.8-1.4-3.2-.6-4.4Z" className="pi-pearl" />
      <ellipse cx="32" cy="24.6" rx="6.8" ry="1.7" className="pi-wax-shade" />
      <path d="M21.5 46.2h21l-1.4 3.2h-18.2Z" className="pi-gold-deep" />
      <path d="M18.5 49.4h27v5H18.5Z" className="pi-gold" />
      <path d="M32 49.4h13.5v5H32Z" className="pi-gold-deep" />
    </g>
  );
}

export function DoveMark() {
  return (
    <g className="pi-subject">
      <path d="M9 37c7-6 13-7 17-3-6 1-11 2-17 3Z" className="pi-glass" />
      <path d="M10 44c7-4 13-4 17 0-6 1-11 1-17 0Z" className="pi-glass-dark" />
      <path d="M22 35c7-3 16-2 22 5 2 7-3 13-13 13-8 0-15-5-16-12 0-3 3-5 7-6Z" className="pi-pearl" />
      <path d="M36 35c6 0 11 4 12 9-3 6-9 9-15 8 1-6 1-12 3-17Z" className="pi-pearl-shade" />
      <path d="M28 36c1-9 9-15 18-13-5 2-8 7-8 13-4 0-8 1-10 0Z" className="pi-glass" />
      <path d="M38 27c5-2 11 0 13 4-4 1-8 4-10 9-1-4-2-9-3-13Z" className="pi-glass-dark" />
      <circle cx="49" cy="28" r="6.2" className="pi-pearl" />
      <path d="M49 21.8a6.2 6.2 0 0 0 6.2 6.2 6.2 6.2 0 0 0-6.2 6.2Z" className="pi-pearl-shade" />
      <circle cx="51" cy="27" r="1" className="pi-ink" />
      <path d="M54.2 28.4 61 30.8 54.4 33.2Z" className="pi-gold-deep" />
    </g>
  );
}

export function PriestMark() {
  return (
    <g className="pi-subject">
      <path d="M14 56V40c0-9 7.2-14 18-14s18 5 18 14v16Z" className="pi-pearl" />
      <path d="M32 26c9.2 0 16.2 4.2 18 14v16H32Z" className="pi-pearl-shade" />
      <path d="M26.4 38.2h11.2L36.2 56h-8.4Z" className="pi-gold" />
      <path d="M32 38.2h5.6L36.2 56H32Z" className="pi-gold-deep" />
      <path d="M31.15 44.8h1.7v6.2h-1.7Z" className="pi-pearl" />
      <path d="M28.8 47.1h6.4v1.7h-6.4Z" className="pi-pearl" />
      <path d="M27.6 33.5h8.8v5.2h-8.8Z" className="pi-skin" />
      <path d="M24.8 37.2h14.4c-.8 2.6-3.6 4.2-7.2 4.2s-6.4-1.6-7.2-4.2Z" className="pi-ink" />
      <rect x="30.2" y="37.5" width="3.6" height="3.1" rx="0.5" className="pi-pearl" />
      <circle cx="32" cy="22.6" r="8.2" className="pi-skin" />
      <path d="M32 14.4a8.2 8.2 0 0 0 8.2 8.2 8.2 8.2 0 0 0-8.2 8.2Z" className="pi-skin-shade" />
      <path d="M24.2 21.8C24.6 15.6 28 12.2 32 12.2s7.4 3.4 7.8 9.6c-1.6-3-4.4-4.6-7.8-4.6s-6.2 1.6-7.8 4.6Z" className="pi-hair" />
    </g>
  );
}
