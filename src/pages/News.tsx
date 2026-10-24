import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/layout/PageHeader";
import SEOHead from "@/components/seo/SEOHead";
import NewsCard from "@/components/news/NewsCard";
import NewsFeatured from "@/components/news/NewsFeatured";
import NewsFilters from "@/components/news/NewsFilters";
import NewsEmptyState from "@/components/news/NewsEmptyState";
import postService, { type Post } from "@/services/post.service";
import categoryService from "@/services/category.service";

const PER_PAGE = 9;

const News = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
  const category = searchParams.get("category") || "";
  const qParam = searchParams.get("q") || "";
  const [searchInput, setSearchInput] = useState(() => qParam);

  // Debounce search into the URL so typing does not hammer the API.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      const next = searchInput.trim();
      if (next === qParam) return;
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next) params.set("q", next);
          else params.delete("q");
          params.delete("page");
          return params;
        },
        { replace: true },
      );
    }, 350);
    return () => window.clearTimeout(handle);
  }, [searchInput, qParam, setSearchParams]);

  const updateParams = useCallback(
    (patch: Record<string, string | null>, resetPage = true) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        Object.entries(patch).forEach(([key, value]) => {
          if (value === null || value === "") params.delete(key);
          else params.set(key, value);
        });
        if (resetPage) params.delete("page");
        return params;
      });
    },
    [setSearchParams],
  );

  const listQuery = useQuery({
    queryKey: ["public-news", page, category, qParam],
    queryFn: () =>
      postService.getPublished({
        post_type: "news",
        page,
        per_page: PER_PAGE,
        category: category || undefined,
        search: qParam || undefined,
      }),
    placeholderData: (prev) => prev,
  });

  const featuredQuery = useQuery({
    queryKey: ["public-news-featured"],
    queryFn: async () => {
      const featured = await postService.getPublished({
        post_type: "news",
        featured: 1,
        per_page: 1,
      });
      if (featured.data?.[0]) return featured.data[0];
      const latest = await postService.getPublished({ post_type: "news", per_page: 1 });
      return latest.data?.[0] ?? null;
    },
    enabled: !category && !qParam && page === 1,
  });

  const categoriesQuery = useQuery({
    queryKey: ["news-categories"],
    queryFn: () => categoryService.list({ active: true }),
  });

  const news = listQuery.data?.data ?? [];
  const lastPage = listQuery.data?.meta?.last_page ?? 1;
  const total = listQuery.data?.meta?.total ?? 0;
  const featured = featuredQuery.data ?? null;

  // Prefer categories that appear on the current result set, then fall back to all active.
  const categoryOptions = useMemo(() => {
    const fromResults = new Map<string, string>();
    news.forEach((post: Post) => {
      post.categories?.forEach((c) => {
        if (c.slug) fromResults.set(c.slug, c.label);
      });
    });
    if (fromResults.size > 0 && (category || qParam)) {
      return Array.from(fromResults.entries()).map(([slug, label]) => ({ slug, label }));
    }
    const all = categoriesQuery.data?.data ?? [];
    return all.map((c) => ({ slug: c.slug, label: c.label }));
  }, [news, categoriesQuery.data, category, qParam]);

  const showFeatured = !category && !qParam && page === 1 && featured;
  const listWithoutFeatured = showFeatured
    ? news.filter((item) => item.id !== featured?.id)
    : news;

  const hasActiveFilters = Boolean(category || qParam);
  const isEmptyFeed = !listQuery.isLoading && !listQuery.isError && total === 0 && !hasActiveFilters;
  const isNoResults = !listQuery.isLoading && !listQuery.isError && total === 0 && hasActiveFilters;

  return (
    <div className="bg-church-pearl/40">
      <SEOHead
        title="News & Updates"
        description="Stay connected with the life of our parish, upcoming celebrations, community initiatives, and the latest announcements from St. Anthony Catholic Church, Gbaja."
        path="/news"
      />

      <PageHeader
        eyebrow="FROM OUR PARISH"
        title="News & Updates"
        description="Stay connected with the life of our parish, upcoming celebrations, community initiatives, and the latest announcements from St. Anthony Catholic Church, Gbaja."
      />

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <NewsFilters
            categories={categoryOptions}
            activeCategory={category}
            search={searchInput}
            onCategoryChange={(slug) => updateParams({ category: slug || null })}
            onSearchChange={setSearchInput}
            onClearSearch={() => {
              setSearchInput("");
              updateParams({ q: null });
            }}
          />

          {showFeatured && featured && !featuredQuery.isLoading && <NewsFeatured post={featured} />}

          {featuredQuery.isLoading && page === 1 && !category && !qParam && (
            <Skeleton className="mb-14 h-72 w-full rounded-xl" />
          )}

          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-church-charcoal md:text-3xl">Latest Stories</h2>
              <div className="mt-2 h-0.5 w-10 rounded-full bg-gradient-church" aria-hidden="true" />
            </div>
            {total > 0 && (
              <p className="text-sm text-muted-foreground">
                {total} {total === 1 ? "story" : "stories"}
              </p>
            )}
          </div>

          {listQuery.isLoading ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-96 w-full rounded-lg" />
              ))}
            </div>
          ) : listQuery.isError ? (
            <NewsEmptyState variant="error" onRetry={() => listQuery.refetch()} />
          ) : isEmptyFeed ? (
            <NewsEmptyState variant="empty" />
          ) : isNoResults ? (
            <NewsEmptyState
              variant="no-results"
              onClearFilters={() => {
                setSearchInput("");
                setSearchParams({});
              }}
            />
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {listWithoutFeatured.map((item) => (
                <NewsCard key={item.id} post={item} />
              ))}
            </div>
          )}

          {lastPage > 1 && !listQuery.isError && total > 0 && (
            <nav className="mt-12 flex items-center justify-center gap-4" aria-label="News pagination">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => updateParams({ page: String(page - 1) }, false)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {lastPage}
              </span>
              <Button
                variant="outline"
                disabled={page >= lastPage}
                onClick={() => updateParams({ page: String(page + 1) }, false)}
              >
                Next
              </Button>
            </nav>
          )}
        </div>
      </section>

      <section className="py-16 bg-gradient-church text-church-charcoal">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-heading font-bold mb-4 md:text-4xl">Stay Connected</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg">
            Reach out to the parish office to receive the latest news and updates from our community.
          </p>
          <Button variant="church" size="lg" className="group" asChild>
            <Link to="/contact">
              Contact Us <ArrowRight className="ml-2 h-5 w-5 transition-transform motion-safe:group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default News;
