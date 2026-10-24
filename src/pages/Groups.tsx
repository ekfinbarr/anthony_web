import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, Calendar, MapPin } from "lucide-react";
import { CommunityIcon } from "@/components/icons/ParishIcons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/layout/PageHeader";
import SEOHead from "@/components/seo/SEOHead";
import ministryService from "@/services/ministry.service";
import ministryCategoryService from "@/services/ministryCategory.service";

const Groups = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categoriesQuery = useQuery({
    queryKey: ["society-categories"],
    queryFn: () => ministryCategoryService.getActive("society"),
  });

  const groupsQuery = useQuery({
    queryKey: ["groups-societies", selectedCategory, searchQuery],
    queryFn: () =>
      ministryService.listPublished({
        kind: "society",
        per_page: 50,
        sort: "name",
        category: selectedCategory === "all" ? undefined : selectedCategory,
        search: searchQuery.trim() || undefined,
      }),
  });

  const categories = useMemo(() => {
    const fromApi = categoriesQuery.data?.data || [];
    return [{ id: "all", name: "All Groups", slug: "all" }, ...fromApi];
  }, [categoriesQuery.data]);

  const groups = groupsQuery.data?.data || [];

  const formatSchedule = (schedule: unknown) => {
    if (!schedule) return null;
    if (typeof schedule === "string") return schedule;
    if (typeof schedule === "object" && schedule !== null) {
      const s = schedule as Record<string, unknown>;
      return String(s.description || s.day || JSON.stringify(s));
    }
    return null;
  };

  return (
    <>
      <SEOHead
        title="Groups & Organizations"
        description="Find your place in parish life at St. Anthony Catholic Church, Gbaja — lay organizations, pious societies, and community groups."
        path="/groups"
      />
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Groups & Organizations"
          description="Connect with parish societies and organizations that nurture faith, fellowship, and service."
        >
          <div className="mt-2">
            <Button asChild variant="outline" className="border-church-pearl/40 bg-transparent text-church-pearl hover:bg-church-pearl/10">
              <Link to="/serve-others">Looking to serve? Explore ministries</Link>
            </Button>
          </div>
        </PageHeader>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-8 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search groups…"
                  className="h-12 pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Search groups"
                />
              </div>
            </div>

            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === (category.slug || category.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setSelectedCategory(category.slug === "all" || category.id === "all" ? "all" : category.slug)
                  }
                  className="rounded-full"
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {groupsQuery.isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-64 w-full rounded-lg" />
                ))}
              </div>
            ) : groupsQuery.isError ? (
              <div className="rounded-lg border border-destructive/30 p-8 text-center">
                <p className="text-destructive">Unable to load groups right now.</p>
                <Button className="mt-4" variant="outline" onClick={() => groupsQuery.refetch()}>
                  Try again
                </Button>
              </div>
            ) : groups.length === 0 ? (
              <div className="py-16 text-center">
                <CommunityIcon className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                <h3 className="mb-2 text-xl font-semibold">No groups found</h3>
                <p className="mb-4 text-muted-foreground">Try adjusting your search or category filter.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {groups.map((group) => {
                  const schedule = formatSchedule(group.meeting_schedule);
                  const cats = group.categories?.length
                    ? group.categories
                    : group.category
                      ? [group.category]
                      : [];
                  return (
                    <Card key={group.id} id={group.slug} className="scroll-mt-28 transition-shadow hover:shadow-lg">
                      <CardHeader>
                        <div className="mb-4 flex items-start justify-between">
                          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                            {group.image ? (
                              <img src={group.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                            ) : (
                              <CommunityIcon className="h-8 w-8 text-primary" />
                            )}
                          </div>
                          {cats[0] && <Badge variant="secondary">{cats[0].name}</Badge>}
                        </div>
                        <CardTitle className="text-xl">{group.name}</CardTitle>
                        <CardDescription className="line-clamp-3">
                          {group.short_description || group.description || "Parish group"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {schedule && (
                          <div className="flex items-start gap-2 text-sm">
                            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span className="text-muted-foreground">{schedule}</span>
                          </div>
                        )}
                        {group.meeting_location && (
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                            <span className="text-muted-foreground">{group.meeting_location}</span>
                          </div>
                        )}
                        {(group.contact_email || group.contact_phone) && (
                          <div className="border-t pt-3 text-sm text-muted-foreground">
                            {group.contact_email && (
                              <a className="text-primary hover:underline" href={`mailto:${group.contact_email}`}>
                                {group.contact_email}
                              </a>
                            )}
                            {group.contact_phone && <p>{group.contact_phone}</p>}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="bg-muted/40 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-4 font-heading text-3xl font-bold">Want to get involved?</h2>
            <p className="mx-auto mb-8 max-w-2xl text-muted-foreground">
              Register with the parish or speak with the office about joining a group.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link to="/registration">Parish registration</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/contact">Contact the parish</Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link to="/serve-others">Serve Others</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Groups;
