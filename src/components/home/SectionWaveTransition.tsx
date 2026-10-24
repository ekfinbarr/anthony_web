/**
 * Layered cream + gold ribbon wave that joins Quick Access to the livestream hero.
 * Decorative only — keep out of the accessibility tree.
 */
const SectionWaveTransition = ({ className = "" }: { className?: string }) => {
  return (
    <div
      className={`pointer-events-none relative z-10 -mb-px w-full overflow-hidden leading-[0] ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 140"
        preserveAspectRatio="none"
        className="block h-16 w-full sm:h-[4.5rem] md:h-24 lg:h-[7rem]"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft gold band sitting under the cream edge */}
        <path
          d="M0,58 C200,22 360,88 520,64 C700,36 860,10 1040,34 C1200,52 1320,78 1440,48 L1440,140 L0,140 Z"
          fill="hsl(var(--church-gold-warm))"
        />
        {/* Lighter gold highlight for depth */}
        <path
          d="M0,52 C200,18 360,82 520,58 C700,32 860,8 1040,30 C1200,48 1320,72 1440,44 L1440,140 L0,140 Z"
          fill="hsl(var(--church-gold-soft))"
          opacity="0.55"
        />
        {/* Cream fill matching Quick Access */}
        <path
          d="M0,46 C180,14 340,78 500,54 C680,28 840,4 1020,26 C1180,44 1320,70 1440,40 L1440,0 L0,0 Z"
          fill="hsl(var(--church-ivory))"
        />
      </svg>
    </div>
  );
};

export default SectionWaveTransition;