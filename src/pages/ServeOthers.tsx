import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import PageHeader from "@/components/layout/PageHeader";
import SEOHead from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MinistryCard from "@/components/serve-others/MinistryCard";
import MinistryEnquiryForm from "@/components/serve-others/MinistryEnquiryForm";
import ministryService, { Ministry } from "@/services/ministry.service";
import ministryCategoryService from "@/services/ministryCategory.service";
import bannerPhoto from "@/assets/images/st_anthony.webp";
import { Skeleton } from "@/components/ui/skeleton";

const PER_PAGE = 12;

const ServeOthers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("page") || "1") || 1);
  const qParam = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "sort_order";
  const [searchInput, setSearchInput] = useState(qParam);
  const [joinMinistry, setJoinMinistry] = useState<Ministry | null>(null);

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
    (patch: Record<string, string | null>) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        Object.entries(patch).forEach(([key, value]) => {
          if (value === null || value === "") params.delete(key);
          else params.set(key, value);
        });
        params.delete("page");
        return params;
      });
    },
    [setSearchParams],
  );

  const categoriesQuery = useQuery({
    queryKey: ["ministry-categories-service"],
    queryFn: () => ministryCategoryService.getActive("service"),
  });

  const ministriesQuery = useQuery({
    queryKey: ["serve-others", page, qParam, category, sort],
    queryFn: () =>
      ministryService.listPublished({
        kind: "service",
        page,
        per_page: PER_PAGE,
        search: qParam || undefined,
        category: category || undefined,
        sort: sort === "name" ? "name" : "sort_order",
        direction: "asc",
      }),
  });

  const featuredQuery = useQuery({
    queryKey: ["serve-others-featured"],
    queryFn: () =>
      ministryService.listPublished({
        kind: "service",
        is_featured: true,
        per_page: 6,
        sort: "sort_order",
      }),
    enabled: !qParam && !category && page === 1,
  });

  const ministries = ministriesQuery.data?.data ?? [];
  const featured = featuredQuery.data?.data ?? [];
  const categories = categoriesQuery.data?.data ?? [];
  const totalPages = ministriesQuery.data?.last_page ?? 1;
  const hasFilters = Boolean(qParam || category || sort !== "sort_order");

  const resetFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const heroCta = useMemo(
    () => (
      <div className="flex flex-wrap justify-center gap-3">
        <Button asChild size="lg">
          <a href="#ministries">Explore ministries</a>
        </Button>
        <Button asChild variant="outline" size="lg" className="border-church-pearl/40 bg-transparent text-church-pearl hover:bg-church-pearl/10">
          <Link to="/contact">Ask the parish office</Link>
        </Button>
      </div>
    ),
    [],
  );

  return (
    <>
      <SEOHead
        title="Serve Others | Parish Ministries"
        description="Discover ways to serve at St. Anthony Catholic Church, Gbaja — liturgical ministries, parish service, and outreach."
        path="/serve-others"
      />
      <PageHeader
        title="Serve Others"
        description="Every gift has a place in the life of the Church. Explore parish ministries and find a way to serve with fellowship and purpose."
        image={{ src: bannerPhoto, alt: "" }}
      >
        {heroCta}
      </PageHeader>

      <main className="bg-church-ivory/40">
        {!hasFilters && featured.length > 0 && (
          <section className="border-b border-border/60 bg-background py-12 md:py-16" aria-labelledby="featured-heading">
            <div className="container mx-auto px-4">
              <h2 id="featured-heading" className="font-heading text-2xl font-semibold md:text-3xl">
                Featured ministries
              </h2>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                A few ministries currently highlighted by the parish.
              </p>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((m) => (
                  <MinistryCard key={m.id} ministry={m} onJoin={setJoinMinistry} />
                ))}
              </div>
            </div>
          </section>
        )}

        <section id="ministries" className="scroll-mt-24 py-12 md:py-16" aria-labelledby="directory-heading">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 id="directory-heading" className="font-heading text-2xl font-semibold md:text-3xl">
                  Ministry directory
                </h2>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  Search and filter published ministries. Details and joining options vary by ministry.
                </p>
              </div>
              {hasFilters && (
                <Button type="button" variant="ghost" onClick={resetFilters} className="self-start md:self-auto">
                  <X className="mr-2 h-4 w-4" />
                  Reset filters
                </Button>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Input
                  className="pl-9"
                  placeholder="Search ministries…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  aria-label="Search ministries"
                />
              </div>
              <Select
                value={category || "all"}
                onValueChange={(v) => updateParams({ category: v === "all" ? null : v })}
              >
                <SelectTrigger className="w-full lg:w-[220px]" aria-label="Filter by category">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={sort}
                onValueChange={(v) => updateParams({ sort: v === "sort_order" ? null : v })}
              >
                <SelectTrigger className="w-full lg:w-[180px]" aria-label="Sort ministries">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sort_order">Display order</SelectItem>
                  <SelectItem value="name">Name A–Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-8">
              {ministriesQuery.isLoading ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[4/5] w-full rounded-lg" />
                  ))}
                </div>
              ) : ministriesQuery.isError ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center">
                  <p className="text-destructive">Unable to load ministries right now.</p>
                  <Button
                    className="mt-4"
                    variant="outline"
                    onClick={() => ministriesQuery.refetch()}
                  >
                    Try again
                  </Button>
                </div>
              ) : ministries.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-background p-10 text-center">
                  <p className="font-heading text-xl">No ministries match your search</p>
                  <p className="mt-2 text-muted-foreground">
                    Try a different keyword or reset your filters.
                  </p>
                  {hasFilters && (
                    <Button className="mt-4" variant="outline" onClick={resetFilters}>
                      Reset filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {ministries.map((m) => (
                    <MinistryCard key={m.id} ministry={m} onJoin={setJoinMinistry} />
                  ))}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex justify-center gap-2">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() =>
                    setSearchParams((prev) => {
                      const p = new URLSearchParams(prev);
                      p.set("page", String(page - 1));
                      return p;
                    })
                  }
                >
                  Previous
                </Button>
                <span className="flex items-center px-3 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setSearchParams((prev) => {
                      const p = new URLSearchParams(prev);
                      p.set("page", String(page + 1));
                      return p;
                    })
                  }
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </section>

        <section className="border-t border-border/60 bg-background py-12 md:py-16" aria-labelledby="unsure-heading">
          <div className="container mx-auto max-w-3xl px-4 text-center">
            <h2 id="unsure-heading" className="font-heading text-2xl font-semibold md:text-3xl">
              Not sure where to begin?
            </h2>
            <p className="mt-3 text-muted-foreground">
              The parish office can help you discern a ministry that fits your gifts and availability.
            </p>
            <Button asChild className="mt-6" size="lg">
              <Link to="/contact">Contact the parish office</Link>
            </Button>
          </div>
        </section>
      </main>

      <Dialog open={!!joinMinistry} onOpenChange={(open) => !open && setJoinMinistry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Express interest</DialogTitle>
            <DialogDescription>
              Share your details and the parish will follow up. This is not confirmation of membership.
            </DialogDescription>
          </DialogHeader>
          <MinistryEnquiryForm
            ministry={joinMinistry}
            onSuccess={() => {
              /* keep dialog open so success message shows */
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ServeOthers;
