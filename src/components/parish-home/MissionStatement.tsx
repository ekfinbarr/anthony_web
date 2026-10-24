import dap from "@/assets/images/DAP.webp";
import Reveal from "./Reveal";

const SHIELD =
  "M150 8c52 0 112 18 134 64 7 15 10 46 8 86-7 82-64 154-142 204C80 312 23 240 16 158c-2-40 1-71 8-86C38 26 98 8 150 8z";

const MissionStatement = () => {
  return (
    <section aria-labelledby="mission-heading" className="relative scroll-mt-24 overflow-hidden bg-background">
      {/* <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="pattern-geometric absolute inset-0" />
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-church-gold/20 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-church-gold/15 blur-3xl" />
        <svg
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
          className="absolute inset-x-0 top-0 h-24 w-full sm:h-32 md:h-40"
        >
          <path
            fill="hsl(var(--church-gold))"
            d="M0 0h1440v52c-160 78-340-18-540 42S540 168 320 96C160 40 60 88 0 118V0z"
          />
          <path
            fill="hsl(32 42% 30%)"
            d="M1040 0h400v118c-90 52-210-28-300 18-52 26-78-8-100-36V0z"
          />
          <path
            fill="hsl(var(--church-gold-light))"
            opacity="0.55"
            d="M0 0h220c-40 48-120 28-220 72V0z"
          />
        </svg>
      </div> */}

      <Reveal>
        <div className="container relative mx-auto grid items-center gap-10 px-4 pb-16 pt-10 sm:pt-32 md:gap-12 md:pb-20 md:pt-40 lg:grid-cols-[minmax(220px,380px)_minmax(0,1fr)] lg:gap-16 lg:pb-24 lg:pt-28">
          <div className="mx-auto w-full max-w-[260px] sm:max-w-[300px] lg:max-w-[360px]">
            <svg
              viewBox="0 0 300 370"
              role="img"
              aria-label="Aerial view of St. Anthony Catholic Church, Gbaja, with parishioners gathered at the entrance"
              className="h-auto w-full drop-shadow-[0_18px_28px_hsl(0_0%_13%/0.18)]"
            >
              <defs>
                <clipPath id="mission-shield-clip">
                  <path d={SHIELD} />
                </clipPath>
              </defs>
              <image
                href={dap}
                x="-250"
                y="-175"
                width="800"
                height="546"
                preserveAspectRatio="none"
                clipPath="url(#mission-shield-clip)"
              />
              <path d={SHIELD} fill="none" className="stroke-church-gold" strokeWidth="6" />
            </svg>
          </div>

          <div className="max-w-2xl max-lg:pr-12">
            <h2
              id="mission-heading"
              className="scroll-mt-28 font-heading text-4xl font-bold tracking-tight text-church-charcoal md:text-5xl lg:text-6xl"
            >
              Our Mission
            </h2>
            <p className="mt-5 text-xl font-medium leading-snug text-church-charcoal md:text-2xl">
              To lead people into a growing relationship with Jesus Christ through worship, discipleship,
              fellowship, and service.
            </p>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
              We, the people of St. Anthony Catholic Church, Gbaja, gather in Surulere as one parish family.
              We welcome every person to worship with us, to grow as disciples of Jesus Christ, and to serve
              our neighbours with love. Guided by the Holy Spirit, we are called to be a praying, welcoming,
              and serving community.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default MissionStatement;
