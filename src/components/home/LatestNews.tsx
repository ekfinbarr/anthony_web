import { ChevronRight, Calendar, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import postService from "@/services/post.service";
import { postExcerpt } from "@/lib/postExcerpt";
import { newsCoverAlt, newsCoverSrc, postDate } from "@/lib/news";

const LatestNews = () => {
    // Same source as the News page: published posts with post_type "news".
    const newsQuery = useQuery({
        queryKey: ["public-news", "home"],
        queryFn: () => postService.getPublished({ post_type: "news", per_page: 3 }),
        staleTime: 5 * 60 * 1000,
    });

    const news = newsQuery.data?.data ?? [];

    return (
        <section className="py-16 bg-church-pearl">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-heading font-bold text-church-charcoal mb-4 accent-line inline-block">
                        Recent News
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Stay updated with the latest news and events happening in and around our church community.
                    </p>
                </div>

                {/* News Grid */}
                {newsQuery.isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="overflow-hidden">
                                <Skeleton className="h-48 w-full" />
                                <div className="p-6 space-y-3">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-16 w-full" />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : news.length === 0 ? (
                    <p className="text-center text-muted-foreground mb-8">
                        {newsQuery.isError
                            ? "We couldn't load the latest news right now. Please try again later."
                            : "No news has been published yet. Please check back soon."}
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {news.map((item) => (
                            <Card key={item.id} className="overflow-hidden card-hover group">
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={newsCoverSrc(item)}
                                        alt={newsCoverAlt(item)}
                                        width={400}
                                        height={192}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                </div>
                                <CardContent className="p-6">
                                    <h3 className="text-2xl font-heading font-bold mb-2">
                                        <Link to={`/news/${item.slug}`} className="hover:text-primary">
                                            {item.title}
                                        </Link>
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                        <span className="flex items-center"><User className="h-3 w-3 mr-1" aria-hidden="true" />
                                            {item.author?.name ?? "Parish Office"}
                                        </span>
                                        <span className="flex items-center"><Calendar className="h-3 w-3 mr-1" aria-hidden="true" />
                                            <time dateTime={postDate(item)}>{format(new Date(postDate(item)), "MMM d, yyyy")}</time>
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground mb-4 line-clamp-3">
                                        {postExcerpt(item)}
                                    </p>
                                    <Button variant="link" className="p-0 group" asChild>
                                        <Link to={`/news/${item.slug}`} aria-label={`Read more: ${item.title}`}>
                                            Read More <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                                        </Link>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* View All Button */}
                <div className="text-center">
                    <Button variant="church" size="lg" asChild>
                        <Link to="/news">
                            View All News
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
    );
};

export default LatestNews;
