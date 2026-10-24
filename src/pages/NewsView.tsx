import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import DOMPurify from "dompurify";
import { ArrowLeft, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/layout/PageHeader";
import SEOHead from "@/components/seo/SEOHead";
import ArticleSchema from "@/components/seo/schemas/ArticleSchema";
import NewsCard from "@/components/news/NewsCard";
import NewsShare from "@/components/news/NewsShare";
import postService from "@/services/post.service";
import { site } from "@/config/site";
import {
  newsCoverAlt,
  newsCoverSrc,
  postDate,
  postExcerpt,
  primaryCategory,
  readingMinutes,
} from "@/lib/news";
import { mediaUrl } from "@/components/parish-home/media";
import "@/Post.css";

const NewsView = () => {
  const { slug = "" } = useParams();

  const articleQuery = useQuery({
    queryKey: ["public-news-article", slug],
    queryFn: () => postService.getBySlug(slug),
    enabled: !!slug,
    retry: false,
  });

  const relatedQuery = useQuery({
    queryKey: ["public-news-related", slug],
    queryFn: () => postService.getRelated(slug, 3),
    enabled: !!slug && !!articleQuery.data,
  });

  const article = articleQuery.data;
  const notFound =
    articleQuery.isError || (article && (!article.published || article.post_type !== "news"));
  const path = `/news/${slug}`;
  const category = article ? primaryCategory(article) : null;

  const { html, minutes } = useMemo(() => {
    const clean = DOMPurify.sanitize(article?.content ?? "", {
      ADD_ATTR: ["target", "rel"],
    });
    return { html: clean, minutes: article ? readingMinutes(article) : 1 };
  }, [article]);

  const description = article
    ? article.meta_description?.trim() || postExcerpt(article, 155)
    : "";
  const seoTitle = article?.meta_title?.trim() || article?.title || "Parish News";
  const shareUrl = typeof window !== "undefined" ? window.location.href : `${site.url}${path}`;
  const ogImage = article ? mediaUrl(article.og_image || article.image) : undefined;
  const publishedIso = article ? postDate(article) : undefined;
  const showUpdated =
    article &&
    article.updated_at &&
    publishedIso &&
    new Date(article.updated_at).getTime() - new Date(publishedIso).getTime() > 60_000;

  const headerTitle = articleQuery.isLoading
    ? "Parish News"
    : notFound || !article
      ? "Article not found"
      : article.title;

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "News & Updates", path: "/news" },
    { name: headerTitle, path },
  ];

  return (
    <div className="bg-church-pearl/30">
      {articleQuery.isLoading ? (
        <SEOHead title="Parish News" description={site.defaultDescription} path={path} />
      ) : notFound || !article ? (
        <SEOHead
          title="Article Not Found"
          description="This news article may have been moved or is no longer available."
          path={path}
          noindex
        />
      ) : (
        <>
          <SEOHead
            title={seoTitle}
            description={description || site.defaultDescription}
            path={path}
            type="article"
            image={ogImage}
            imageAlt={newsCoverAlt(article)}
            publishedTime={publishedIso}
            modifiedTime={article.updated_at}
          />
          <ArticleSchema
            article={{
              path,
              headline: article.title,
              description: description || undefined,
              image: ogImage,
              authorName: article.author?.name || undefined,
              datePublished: publishedIso,
              dateModified: article.updated_at,
            }}
          />
        </>
      )}

      <PageHeader
        align="start"
        size="compact"
        eyebrow={category?.label || "Parish News"}
        title={headerTitle}
        description={
          article && !notFound
            ? article.summary || undefined
            : notFound
              ? "This news article may have been moved or is no longer available."
              : undefined
        }
        breadcrumbs={crumbs}
      />

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          {articleQuery.isLoading ? (
            <div className="mx-auto max-w-3xl space-y-4">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="aspect-[16/9] w-full rounded-xl" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : notFound || !article ? (
            <div className="mx-auto max-w-lg py-12 text-center">
              <p className="mb-6 text-muted-foreground">
                The story you are looking for is unavailable. It may have been unpublished or the link is incorrect.
              </p>
              <Button variant="church" asChild>
                <Link to="/news">
                  <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                  Back to News & Updates
                </Link>
              </Button>
            </div>
          ) : (
            <article className="mx-auto max-w-3xl">
              <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-4 w-4" aria-hidden="true" />
                  {article.author?.name ?? "Parish Office"}
                </span>
                <time dateTime={publishedIso}>{format(new Date(publishedIso!), "MMMM d, yyyy")}</time>
                {showUpdated && (
                  <span>
                    Updated {format(new Date(article.updated_at), "MMM d, yyyy")}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {minutes} min read
                </span>
              </div>

              <NewsShare title={article.title} url={shareUrl} className="mb-8" />

              <figure className="mb-8 overflow-hidden rounded-xl border border-church-gold-warm/15 bg-church-pearl">
                <div className="aspect-[16/9]">
                  <img
                    src={newsCoverSrc(article)}
                    alt={newsCoverAlt(article)}
                    width={1200}
                    height={675}
                    fetchPriority="high"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                </div>
              </figure>

              <div
                className="prose prose-lg max-w-none blog-post text-church-charcoal prose-headings:font-serif prose-a:text-church-gold-warm"
                dangerouslySetInnerHTML={{ __html: html }}
              />

              <div className="mt-12 border-t border-church-gold-warm/20 pt-8">
                <Button variant="outline" asChild>
                  <Link to="/news">
                    <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                    Back to News & Updates
                  </Link>
                </Button>
              </div>
            </article>
          )}

          {relatedQuery.data && relatedQuery.data.length > 0 && (
            <section className="mx-auto mt-16 max-w-6xl" aria-labelledby="related-news">
              <div className="mb-8 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-church-gold-warm">Continue Reading</p>
                <h2 id="related-news" className="mt-2 font-serif text-2xl font-semibold text-church-charcoal md:text-3xl">
                  You May Also Like
                </h2>
                <div className="mx-auto mt-3 h-0.5 w-12 rounded-full bg-gradient-church" aria-hidden="true" />
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {relatedQuery.data.map((item) => (
                  <NewsCard key={item.id} post={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      </section>

      <section className="py-16 bg-gradient-church">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-heading font-bold text-church-charcoal md:text-4xl">
            Want to See More?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-church-charcoal/80">
            Visit our church to experience the warmth and fellowship of our community in person.
          </p>
          <Button variant="church" size="lg" asChild>
            <Link to="/visit">Plan Your Visit</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default NewsView;
