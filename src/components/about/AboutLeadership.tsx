import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PeopleIcon } from "@/components/icons/ParishIcons";
import PersonSchema from "@/components/seo/schemas/PersonSchema";
import Reveal from "@/components/parish-home/Reveal";
import { unwrapList } from "@/components/parish-home/media";
import leadershipService, { type Leadership } from "@/services/leadership.service";

function displayName(leader: Leadership): string {
  if (!leader.title) return leader.name;
  if (leader.name.toLowerCase().includes(leader.title.toLowerCase())) return leader.name;
  if (/^(very\s+)?rev\.?/i.test(leader.name)) return leader.name;
  return `${leader.title} ${leader.name}`;
}

const AboutLeadership = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["leadership", "current"],
    queryFn: () => leadershipService.getCurrent(),
    staleTime: 5 * 60 * 1000,
  });

  const leaders = unwrapList<Leadership>(data).filter((leader) => leader.show_on_website !== false);

  if (!isLoading && !isError && leaders.length === 0) {
    return null;
  }

  return (
    <section
      id="leadership"
      aria-labelledby="leadership-heading"
      className="scroll-mt-24 bg-church-pearl py-16 md:py-20"
    >
      <div className="container mx-auto px-4">
        <Reveal>
          <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
            <h2
              id="leadership-heading"
              className="mb-3 font-heading text-3xl font-bold text-church-charcoal md:text-4xl"
            >
              Leadership Team
            </h2>
            <p className="text-muted-foreground md:text-lg">
              The priests and leaders who serve St. Anthony, Gbaja with faith and dedication.
            </p>
          </div>
        </Reveal>

        {isLoading ? (
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <Card key={item} className="overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <div className="space-y-3 p-6">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <p className="text-center text-muted-foreground">
            We couldn&apos;t load the leadership list just now. Please try again later.
          </p>
        ) : (
          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 md:grid-cols-3">
            {leaders.map((leader, index) => (
              <Reveal key={leader.id} delay={index * 70}>
                <Card className="group h-full overflow-hidden border-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-within:-translate-y-1 focus-within:shadow-lg motion-reduce:transform-none motion-reduce:transition-none">
                  <PersonSchema
                    person={{
                      name: leader.name,
                      honorificPrefix: leader.title || undefined,
                      jobTitle: leader.position,
                      description: leader.bio || undefined,
                      image: leader.image_url || undefined,
                    }}
                  />
                  <div className="relative h-64 overflow-hidden bg-primary/10">
                    {leader.image_url ? (
                      <img
                        src={leader.image_url}
                        alt={`${displayName(leader)}, ${leader.position}`}
                        width={400}
                        height={256}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <PeopleIcon size="lg" />
                      </div>
                    )}
                    <div
                      className="pointer-events-none absolute inset-0 bg-gradient-to-t from-church-charcoal/50 via-transparent to-transparent"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-heading text-lg font-bold text-church-charcoal">
                      {displayName(leader)}
                    </h3>
                    <p className="mt-1 text-sm font-semibold uppercase tracking-wider text-church-gold">
                      {leader.position}
                    </p>
                    <p className="mt-3 line-clamp-4 text-sm italic leading-relaxed text-muted-foreground">
                      &ldquo;
                      {leader.bio || "Dedicated to serving the community through faith, hope, and love."}
                      &rdquo;
                    </p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        )}

        <Reveal delay={120}>
          <div className="mt-10 text-center">
            <Button variant="outline" asChild>
              <Link to="/parish-priest">Meet the Parish Priest</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default AboutLeadership;
