import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CommunityIcon, DoveIcon, FontIcon } from "@/components/icons/ParishIcons";
import Reveal from "./Reveal";

const ministries = [
  {
    name: "Serve Others",
    href: "/serve-others",
    text: "Liturgical ministries and parish service opportunities.",
    icon: CommunityIcon,
  },
  {
    name: "Groups & societies",
    href: "/groups",
    text: "Lay organisations, pious societies, and communities that serve the parish.",
    icon: CommunityIcon,
  },
  {
    name: "Sacraments",
    href: "/sacraments",
    text: "Baptism, marriage, confession, and the other sacraments of the Church.",
    icon: FontIcon,
  },
  {
    name: "Parish clinic",
    href: "/clinic",
    text: "Care for the body as part of the parish's service to the neighbourhood.",
    icon: DoveIcon,
  },
] as const;

const MinistriesPreview = () => {
  return (
    <section id="ministries" aria-labelledby="ministries-heading" className="scroll-mt-24 bg-background py-14 md:py-16">
      <Reveal>
        <div className="container mx-auto px-4">
          <div className="mb-8 text-center">
            <h2 id="ministries-heading" className="mb-3 font-heading text-3xl font-bold text-church-charcoal md:text-4xl">
              Ministries and programs
            </h2>
            <p className="mx-auto max-w-2xl text-muted-foreground">
              Find a place to pray, learn, and serve with the parish.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ministries.map(({ name, href, text, icon: Icon }) => (
              <Link key={href} to={href} className="group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Card className="h-full p-6 transition-shadow duration-300 group-hover:shadow-lg">
                  <Icon size="md" className="mb-4" />
                  <h3 className="mb-2 font-heading text-lg font-bold">{name}</h3>
                  <p className="text-sm text-muted-foreground">{text}</p>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" className="group" asChild>
              <Link to="/serve-others">
                Explore ministries
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </Reveal>
    </section>
  );
};

export default MinistriesPreview;
