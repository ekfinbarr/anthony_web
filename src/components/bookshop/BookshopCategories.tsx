import { useState } from "react";
import Reveal from "@/components/parish-home/Reveal";
import { bookshopCategories, bookshopCopy } from "@/data/bookshopContent";
import { cn } from "@/lib/utils";

const BookshopCategories = () => {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <section
      id="bookshop-categories"
      aria-labelledby="bookshop-categories-heading"
      className="scroll-mt-24 bg-church-pearl/40 py-16 md:py-20"
    >
      <div className="container mx-auto px-4">
        <Reveal>
          <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-church-gold">
              {bookshopCopy.categoriesEyebrow}
            </p>
            <h2
              id="bookshop-categories-heading"
              className="mb-4 font-heading text-3xl font-bold text-church-charcoal accent-line inline-block md:text-4xl"
            >
              {bookshopCopy.categoriesHeadline}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">
              {bookshopCopy.categoriesIntro}
            </p>
          </div>
        </Reveal>

        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {bookshopCategories.map((category, index) => {
            const Icon = category.icon;
            const isActive = activeId === category.id;

            return (
              <li
                key={category.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <button
                  type="button"
                  aria-expanded={isActive}
                  aria-controls={`bookshop-cat-${category.id}`}
                  onClick={() => setActiveId(isActive ? null : category.id)}
                  className={cn(
                    "group flex h-full w-full flex-col items-center rounded-xl border bg-background px-3 py-5 text-center transition-all duration-300 sm:px-4 sm:py-6",
                    "hover:-translate-y-0.5 hover:border-church-gold/50 hover:shadow-md",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-church-gold focus-visible:ring-offset-2",
                    isActive
                      ? "border-church-gold shadow-md ring-1 ring-church-gold/30"
                      : "border-border/70",
                  )}
                >
                  <Icon size="md" className="mb-3 transition-transform duration-300 group-hover:scale-105" />
                  <span className="font-heading text-sm font-semibold text-church-charcoal sm:text-base">
                    {category.name}
                  </span>
                  <span
                    id={`bookshop-cat-${category.id}`}
                    className={cn(
                      "mt-2 text-xs leading-relaxed text-muted-foreground transition-colors duration-300 sm:text-sm",
                      isActive ? "text-church-charcoal/80" : "line-clamp-2",
                    )}
                  >
                    {category.description}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default BookshopCategories;
