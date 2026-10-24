import { Link } from "react-router-dom";
import churchBanner from "@/assets/images/congregation.jpg";
import charity from "@/assets/images/giving/charity_for_needy.jpg";
import altarFlowers from "@/assets/images/giving/altar-flowers.jpg";
import { Button } from "@/components/ui/button";
import Reveal from "@/components/parish-home/Reveal";

const AboutWelcome = () => {
  return (
    <section
      aria-labelledby="welcome-heading"
      className="scroll-mt-24 bg-church-pearl py-16 md:py-20"
    >
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal from="left">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-church-gold">
                Parish life
              </p>
              <h2
                id="welcome-heading"
                className="mb-4 font-heading text-3xl font-bold text-church-charcoal md:text-4xl"
              >
                All are Welcome!
              </h2>
              <p className="mb-4 text-muted-foreground leading-relaxed md:text-lg">
                Whether you are visiting for the first time, returning to the Church, or looking for a
                spiritual home in Surulere, you belong here. Come as you are — we will walk with you.
              </p>
              <p className="mb-8 text-muted-foreground leading-relaxed md:text-lg">
                Join us for Mass, explore our societies and ministries, and discover a community ready to
                celebrate faith, family, and service together.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button variant="church" size="lg" asChild>
                  <Link to="/visit">Plan Your Visit</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/groups">Explore Groups</Link>
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal from="right" delay={60}>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="group col-span-2 overflow-hidden rounded-lg shadow-lg">
                <img
                  src={churchBanner}
                  alt="St. Anthony Catholic Church, Gbaja exterior and parish grounds"
                  width={800}
                  height={400}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[2/1] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
              <div className="group overflow-hidden rounded-lg shadow-md">
                <img
                  src={charity}
                  alt="Parishioners serving the needy through charity outreach"
                  width={400}
                  height={300}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
              <div className="group overflow-hidden rounded-lg shadow-md">
                <img
                  src={altarFlowers}
                  alt="Altar flowers prepared for liturgy at St. Anthony, Gbaja"
                  width={400}
                  height={300}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default AboutWelcome;
