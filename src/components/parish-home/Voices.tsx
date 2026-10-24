import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CrossMark } from "@/components/icons/parishMarks";
import { ParishIcon } from "@/components/icons/ParishIcon";
import { Button } from "@/components/ui/button";
import priestPortrait from "@/assets/images/parish_priest.jpg";
import Reveal from "./Reveal";

const Voices = () => {
  return (
    <section
      id="voices"
      aria-labelledby="voices-heading"
      className="voices-section scroll-mt-24 bg-background py-14 md:py-20"
    >
      <div className="voices-ornament" aria-hidden="true">
        <ParishIcon framed={false} className="voices-cross">
          <CrossMark />
        </ParishIcon>
      </div>

      <div className="container relative z-[1] mx-auto px-4">
        <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:gap-16 xl:gap-20">
          <Reveal from="left" className="mx-auto w-full max-w-[calc(100%-6.5rem)] sm:max-w-sm lg:mx-0 lg:max-w-[26.25rem]">
            <div className="voices-frame">
              <img
                src={priestPortrait}
                alt="Rev. Fr. Sylvester Oladunjoye, Parish Priest of St. Anthony, Gbaja"
                width={1080}
                height={1280}
                decoding="async"
                className="voices-portrait-image aspect-[4/5] w-full object-cover object-top"
              />
            </div>
          </Reveal>

          <Reveal from="right" delay={140} className="max-w-[calc(100%-3.25rem)] lg:max-w-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-church-gold">Welcome</p>
            <h2
              id="voices-heading"
              className="mb-6 font-heading text-3xl font-bold leading-tight text-church-charcoal md:text-4xl"
            >
              A word from the parish priest
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
              <p>It is with great joy that I welcome you to our parish community and to our online platform.</p>
              <p>
                As a Catholic community, we are called to know Christ, grow in faith, and serve one another with love.
                Through the celebration of the daily Eucharist, prayer, the Sacraments, and our parish groups and
                ministries, we seek to build a community where everyone can encounter Christ and find a place to belong.
              </p>
              <p>
                May this platform help you stay connected with the life of our parish and discover opportunities to
                worship, learn, serve, and grow in faith.
              </p>
              <p className="font-medium text-church-charcoal">You are most welcome. God bless you and your family.</p>
            </div>
            <div className="mt-6">
              <div className="mb-4 h-0.5 w-12 rounded-full bg-gradient-church" aria-hidden="true" />
              <p className="font-heading text-lg font-semibold text-church-charcoal">Rev. Fr. Sylvester Oladunjoye</p>
              <p className="text-sm text-muted-foreground">Parish Priest</p>
            </div>
            <Button variant="church" size="lg" className="group mt-8" asChild>
              <Link to="/parish-priest">
                Meet the parish priest
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default Voices;
