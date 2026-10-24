import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NewsIcon } from "@/components/icons/ParishIcons";
import postService, { type Post } from "@/services/post.service";
import { postExcerpt } from "@/lib/postExcerpt";
import { mediaUrl, unwrapList } from "./media";
import Reveal from "./Reveal";

const NewsPreview = () => {
  const query = useQuery({
    queryKey: ["public-news", "parish-home"],
    queryFn: () => postService.getPublished({ post_type: "news", per_page: 3 }),
    staleTime: 5 * 60 * 1000,
  });

  const posts = unwrapList<Post>(query.data).slice(0, 3);

  return (
    <section id="news" aria-labelledby="news-heading" className="scroll-mt-24 bg-background py-14 md:py-16">
      <Reveal>
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 id="news-heading" className="mb-3 font-heading text-3xl font-bold text-church-charcoal md:text-4xl">
              News and announcements
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Notices from the parish office and the life of the community.
            </p>
          </div>

          {query.isLoading ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-48 w-full" />
              ))}
            </div>
          ) : query.isError ? (
            <p className="text-center text-muted-foreground">We couldn&apos;t load the latest news just now.</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-muted-foreground">No news has been published yet.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-3">
              {posts.map((post) => {
                const image = mediaUrl(post.image);
                return (
                  <Card key={post.id} className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                    {image ? (
                      <img src={image} alt="" width={400} height={144} loading="lazy" decoding="async" className="h-36 w-full object-cover" />
                    ) : (
                      <div className="flex h-20 items-center justify-center bg-primary/10">
                        <NewsIcon size="md" />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <p className="mb-2 text-xs text-muted-foreground">
                        <time dateTime={post.created_at}>{format(new Date(post.created_at), "MMM d, yyyy")}</time>
                      </p>
                      <h3 className="mb-2 font-heading text-lg font-bold">
                        <Link to={`/news/${post.slug}`} className="hover:text-primary">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="line-clamp-3 text-sm text-muted-foreground">{postExcerpt(post, 120)}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="mt-8 text-center">
            <Button variant="outline" className="group" asChild>
              <Link to="/news">
                All news
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default NewsPreview;
