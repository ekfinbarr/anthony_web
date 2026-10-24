import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";

const categories = [
  {
    name: "Children",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80",
  },
  {
    name: "Youth",
    image: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=800&q=80",
  },
  {
    name: "Women",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80",
  },
  {
    name: "Men",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80",
  },
] as const;

const GroupsPreview = () => {
  return (
    <section id="groups" aria-labelledby="groups-heading" className="scroll-mt-24 bg-church-charcoal py-14 md:py-16">
      <Reveal>
        <div className="container mx-auto px-4 max-lg:pr-16">
          <div className="mb-8 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-church-gold">Parish life</p>
            <h2 id="groups-heading" className="mb-3 font-heading text-3xl font-bold text-church-pearl md:text-4xl">
              Groups
            </h2>
            <p className="mx-auto max-w-2xl text-church-pearl/80">
              Find a place among the children, youth, women, and men of the parish.
            </p>
          </div>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map(({ name, image }) => (
              <li key={name}>
                <Link
                  to="/groups"
                  className="group block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-church-charcoal"
                >
                  <div className="overflow-hidden rounded-md motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:-translate-y-1">
                    <img
                      src={image}
                      alt=""
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </div>
                  <span className="mt-3 block text-center font-heading text-lg font-semibold text-church-pearl transition-colors group-hover:text-church-gold">
                    {name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 text-center">
            <Link
              to="/groups"
              className="group inline-flex items-center gap-2 font-medium text-church-gold transition-colors hover:text-church-gold-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              See all groups
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default GroupsPreview;
