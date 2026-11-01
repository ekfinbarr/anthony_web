import type { ComponentType } from "react";
import { Link } from "react-router-dom";
import type { ParishIconProps } from "@/components/icons/ParishIcon";
import { ChaliceIcon, ChurchFrontIcon, OpenBookIcon, PlayIcon } from "@/components/icons/ParishIcons";
import { cn } from "@/lib/utils";
import useFeatures from "@/hooks/useFeatures";

type IconComponent = ComponentType<ParishIconProps>;

const links: { label: string; href: string; icon: IconComponent }[] = [
  { label: "Become A Parishioner", href: "/registration", icon: ChaliceIcon },
  { label: "Live Stream", href: "/live", icon: PlayIcon },
  { label: "Bulletin", href: "/bulletin", icon: OpenBookIcon },
  { label: "Mass Intentions & Memorials", href: "/book-mass", icon: ChurchFrontIcon },
];

const HeroQuickLinks = () => {
  const { showNav } = useFeatures();
  const items = links.filter((item) => showNav(item.href));
  if (items.length === 0) return null;

  return (
    <nav aria-label="Parish shortcuts" className="relative z-10 bg-church-charcoal">
      <ul className="grid grid-cols-2 lg:grid-cols-4 bg-primary text-primary-foreground"
        style={{
          // backgroundColor: "hsl(35.56deg 55.1% 38.43%)"
          backgroundColor: "#6a3b1f"
        }}
      >

        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <li
              key={item.href}
              className={cn(
                "border-church-pearl/10",
                index % 2 === 0 && "border-r",
                index < 2 && "border-b",
                "lg:border-b-5",
                index < items.length - 1 && "lg:border-r",
              )}
            >
              <Link
                to={item.href}
                className="group flex h-full min-h-16 flex-col items-center justify-center gap-3 px-3 py-6 text-center transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <Icon size="lg" />
                <span className="max-w-[12rem] text-sm font-medium leading-snug text-church-pearl transition-colors group-hover:text-church-gold">
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default HeroQuickLinks;
