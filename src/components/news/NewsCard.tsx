import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight, Clock } from "lucide-react";
import type { Post } from "@/services/post.service";
import { newsCoverAlt, newsCoverSrc, postDate, postExcerpt, primaryCategory, readingMinutes } from "@/lib/news";
import { cn } from "@/lib/utils";

type NewsCardProps = {
  post: Post;
  className?: string;
};

const NewsCard = ({ post, className }: NewsCardProps) => {
  const category = primaryCategory(post);
  const href = `/news/${post.slug}`;
  const minutes = readingMinutes(post);

  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-lg border border-church-gold-warm/15 bg-white shadow-sm transition-[box-shadow,transform] duration-300",
        "hover:shadow-md focus-within:ring-2 focus-within:ring-church-gold focus-within:ring-offset-2",
        "motion-safe:hover:-translate-y-0.5",
        className,
      )}
    >
      <Link to={href} className="relative block aspect-[16/10] overflow-hidden bg-church-pearl">
        <img
          src={newsCoverSrc(post)}
          alt={newsCoverAlt(post)}
          width={640}
          height={400}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
        />
        {category && (
          <span className="absolute left-3 top-3 rounded bg-church-charcoal/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-church-gold">
            {category.label}
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <time dateTime={postDate(post)}>{format(new Date(postDate(post)), "MMM d, yyyy")}</time>
          <span className="inline-flex items-center gap-1" aria-label={`${minutes} minute read`}>
            <Clock className="h-3 w-3" aria-hidden="true" />
            {minutes} min read
          </span>
        </p>

        <h3 className="font-serif text-xl font-semibold leading-snug text-church-charcoal">
          <Link
            to={href}
            className="outline-none transition-colors hover:text-church-gold-warm focus-visible:text-church-gold-warm"
          >
            {post.title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {postExcerpt(post, 140)}
        </p>

        <Link
          to={href}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-church-gold-warm outline-none transition-colors hover:text-church-charcoal focus-visible:ring-2 focus-visible:ring-church-gold focus-visible:ring-offset-2"
          aria-label={`Read more: ${post.title}`}
        >
          Read More
          <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
};

export default NewsCard;
