import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Post } from "@/services/post.service";
import { newsCoverAlt, newsCoverSrc, postDate, postExcerpt, primaryCategory, readingMinutes } from "@/lib/news";

type NewsFeaturedProps = {
  post: Post;
};

const NewsFeatured = ({ post }: NewsFeaturedProps) => {
  const category = primaryCategory(post);
  const href = `/news/${post.slug}`;
  const minutes = readingMinutes(post);

  return (
    <section aria-labelledby="featured-story-heading" className="mb-14">
      <div className="mb-6 flex items-center gap-3">
        <span className="h-px flex-1 max-w-[3rem] bg-gradient-church" aria-hidden="true" />
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-church-gold-warm">Featured Story</p>
      </div>

      <article className="overflow-hidden rounded-xl border border-church-gold-warm/20 bg-white shadow-sm lg:grid lg:grid-cols-2">
        <Link to={href} className="relative block aspect-[16/11] overflow-hidden bg-church-pearl lg:aspect-auto lg:min-h-[22rem]">
          <img
            src={newsCoverSrc(post)}
            alt={newsCoverAlt(post)}
            width={900}
            height={620}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </Link>

        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          {category && (
            <span className="mb-3 inline-flex w-fit rounded bg-church-gold/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-church-gold-warm">
              {category.label}
            </span>
          )}

          <h2 id="featured-story-heading" className="font-serif text-2xl font-semibold leading-tight text-church-charcoal sm:text-3xl lg:text-[2rem]">
            <Link to={href} className="outline-none transition-colors hover:text-church-gold-warm focus-visible:text-church-gold-warm">
              {post.title}
            </Link>
          </h2>

          <p className="mt-4 text-base leading-relaxed text-muted-foreground line-clamp-4">
            {postExcerpt(post, 220)}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <time dateTime={postDate(post)}>{format(new Date(postDate(post)), "MMMM d, yyyy")}</time>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {minutes} min read
            </span>
            {post.author?.name && <span>{post.author.name}</span>}
          </div>

          <div className="mt-7">
            <Button variant="church" asChild className="group">
              <Link to={href}>
                Read Article
                <ArrowRight className="ml-2 h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </article>
    </section>
  );
};

export default NewsFeatured;
