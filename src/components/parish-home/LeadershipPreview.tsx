import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PeopleIcon } from "@/components/icons/ParishIcons";
import leadershipService, { type Leadership } from "@/services/leadership.service";
import { unwrapList } from "./media";
import Reveal from "./Reveal";

function displayName(leader: Leadership): string {
  if (!leader.title) return leader.name;
  if (leader.name.toLowerCase().includes(leader.title.toLowerCase())) return leader.name;
  if (/^(very\s+)?rev\.?/i.test(leader.name)) return leader.name;
  return `${leader.title} ${leader.name}`;
}

const LeadershipPreview = () => {
  const query = useQuery({
    queryKey: ["leadership", "current", "parish-home"],
    queryFn: () => leadershipService.getCurrent(),
    staleTime: 5 * 60 * 1000,
  });

  const leaders = unwrapList<Leadership>(query.data)
    .filter((leader) => leader.show_on_website !== false)
    .slice(0, 3);

  return (
    <section id="leadership" aria-labelledby="leadership-heading" className="scroll-mt-24 bg-church-pearl py-14 md:py-16">
      <Reveal>
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 id="leadership-heading" className="mb-3 font-heading text-3xl font-bold text-church-charcoal md:text-4xl">
              Leadership and staff
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              The priests and leaders who serve St. Anthony, Gbaja.
            </p>
          </div>

          {query.isLoading ? (
            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-56 w-full" />
              ))}
            </div>
          ) : query.isError ? (
            <p className="text-center text-muted-foreground">We couldn&apos;t load the leadership list just now.</p>
          ) : leaders.length === 0 ? (
            <p className="text-center text-muted-foreground">Leadership profiles will appear here when they are published.</p>
          ) : (
            <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
              {leaders.map((leader) => (
                <Card key={leader.id} className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
                  {leader.image_url ? (
                    <img
                      src={leader.image_url}
                      alt=""
                      width={400}
                      height={176}
                      loading="lazy"
                      decoding="async"
                      className="h-44 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-28 items-center justify-center bg-primary/10">
                      <PeopleIcon size="md" />
                    </div>
                  )}
                  <div className="p-5">
                    <h3 className="font-heading text-lg font-bold text-church-charcoal">
                      {displayName(leader)}
                    </h3>
                    <p className="text-sm text-muted-foreground">{leader.position}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Button variant="church" className="group" asChild>
              <Link to="/about#leadership">
                Meet the parish leadership
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default LeadershipPreview;
