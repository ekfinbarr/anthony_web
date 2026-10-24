import { Link } from "react-router-dom";
import { ChildIcon, GlobeIcon, HandsIcon, LampIcon, MusicIcon, YouthIcon } from "@/components/icons/ParishIcons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MinistriesSection = () => {
  const ministries = [
    {
      name: "Children's Ministry",
      icon: ChildIcon,
      description: "Nurturing faith in our youngest members through fun and engaging activities.",
    },
    {
      name: "Youth Ministry",
      icon: YouthIcon,
      description: "Empowering teens to grow in faith and build lasting friendships.",
    },
    {
      name: "Adult Ministry",
      icon: LampIcon,
      description: "Deepening faith through Bible study, fellowship, and spiritual growth.",
    },
    {
      name: "Worship Ministry",
      icon: MusicIcon,
      description: "Leading our congregation in worship through music and arts.",
    },
    {
      name: "Care Ministry",
      icon: HandsIcon,
      description: "Providing support and care for those in need within our community.",
    },
    {
      name: "Outreach Ministry",
      icon: GlobeIcon,
      description: "Serving our local and global community through missions and service.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-background py-16">
      <div className="absolute inset-0 pattern-geometric" />

      <div className="container relative mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 inline-block font-heading text-4xl font-bold text-church-charcoal accent-line">
            Our Ministries
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Find your place to serve, grow, and make a difference in our community
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ministries.map((ministry) => {
            const Icon = ministry.icon;
            return (
              <Link key={ministry.name} to="/serve-others">
                <Card className="group h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                  <div className="flex items-start space-x-4">
                    <Icon size="sm" className="mt-1" />
                    <div className="flex-1">
                      <h3 className="mb-2 font-heading text-lg font-semibold transition-colors group-hover:text-primary">
                        {ministry.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{ministry.description}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Button asChild size="lg">
            <Link to="/serve-others">Explore Serve Others</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MinistriesSection;
