import Reveal from "@/components/parish-home/Reveal";
import { bookshopCopy } from "@/data/bookshopContent";
import BookshopGallery from "./BookshopGallery";

const BookshopIntro = () => {
  return (
    <section
      id="bookshop-intro"
      aria-labelledby="bookshop-intro-heading"
      className="scroll-mt-24 bg-background py-16 md:py-20"
    >
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal from="left">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-church-gold">
                {bookshopCopy.eyebrow}
              </p>
              <h2
                id="bookshop-intro-heading"
                className="mb-6 font-heading text-3xl font-bold text-church-charcoal accent-line md:text-4xl"
              >
                {bookshopCopy.headline}
              </h2>
              <div className="space-y-4 text-base leading-relaxed text-muted-foreground md:text-lg">
                {bookshopCopy.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal from="right" delay={80}>
            <div className="relative">
              <BookshopGallery />
              <div
                className="pointer-events-none absolute -bottom-5 -right-5 hidden h-28 w-28 bg-gradient-church opacity-25 shape-diamond sm:block"
                aria-hidden="true"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

export default BookshopIntro;
