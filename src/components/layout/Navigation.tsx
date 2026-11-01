import { forwardRef, useEffect, useMemo, useRef, useState, type ComponentType, type FocusEvent, type FormEvent, type KeyboardEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import logo from "@/assets/images/logo-128.webp";
import { Facebook, Instagram, Youtube } from "@/components/icons/BrandIcons";
import type { ParishIconProps } from "@/components/icons/ParishIcon";
import {
  BannerIcon,
  BellIcon,
  CommunityIcon,
  DiaryIcon,
  DoorIcon,
  DoveIcon,
  EnvelopeIcon,
  FontIcon,
  FrameIcon,
  HallIcon,
  NewsIcon,
  OpenBookIcon,
  PeopleIcon,
  PriestIcon,
  PulpitIcon,
  QuoteIcon,
  ScrollIcon,
  ShelfIcon,
} from "@/components/icons/ParishIcons";
import { site } from "@/config/site";
import ministryService from "@/services/ministry.service";
import ministryCategoryService from "@/services/ministryCategory.service";
import useFeatures from "@/hooks/useFeatures";

type IconComponent = ComponentType<ParishIconProps>;

type NavChild = {
  name: string;
  href: string;
  description: string;
  icon: IconComponent;
  external?: boolean;
};

type NavItem = {
  name: string;
  href: string;
  children?: NavChild[];
};

const navItems: NavItem[] = [
  { name: "Home", href: "/" },
  {
    name: "About",
    href: "/about",
    children: [
      { name: "Parish Priest", href: "/parish-priest", description: "The parish priest of St. Anthony", icon: PriestIcon },
      { name: "Our Story", href: "/about#our-story", description: "How the parish began", icon: ScrollIcon },
      { name: "Leadership & Staff", href: "/about#leadership", description: "Priests and parish leaders", icon: PeopleIcon },
      { name: "Mass Times", href: "/visit", description: "Sunday and weekday Mass", icon: BellIcon },
    ],
  },
  {
    name: "Serve Others",
    href: "/serve-others",
    children: [
      { name: "All Ministries", href: "/serve-others", description: "Browse ways to serve", icon: CommunityIcon },
      { name: "Groups & Societies", href: "/groups", description: "Organisations and communities", icon: PeopleIcon },
    ],
  },
  {
    name: "Parish Life",
    href: "/sacraments",
    children: [
      { name: "Sacraments", href: "/sacraments", description: "Baptism, marriage, and more", icon: FontIcon },
      { name: "Daily Readings", href: "/daily-readings", description: "Today's Mass readings and saint", icon: OpenBookIcon },
      { name: "Order of Mass & Rites", href: "/order-of-mass", description: "Mass, baptism, wake keep — in your language", icon: ScrollIcon },
      { name: "Bookshop", href: "/bookshop", description: "Visit hours and categories", icon: ShelfIcon },
      { name: "Clinic", href: "/clinic", description: "Parish health care", icon: DoveIcon },
      { name: "Hall & Rentals", href: "/rentals", description: "Spaces for parish gatherings", icon: HallIcon },
    ],
  },
  {
    name: "News",
    href: "/news",
    children: [
      { name: "Parish News", href: "/news", description: "Announcements and updates", icon: NewsIcon },
      { name: "Bulletin", href: "/bulletin", description: "The weekly parish bulletin", icon: OpenBookIcon },
      { name: "Sermons", href: "/sermons", description: "Homilies and teachings", icon: PulpitIcon },
      { name: "Events", href: "/events", description: "What is happening next", icon: BannerIcon },
      { name: "Calendar", href: "/calendar", description: "The parish diary", icon: DiaryIcon },
      { name: "Gallery", href: "/gallery", description: "Photographs of parish life", icon: FrameIcon },
    ],
  },
  {
    name: "Visit",
    href: "/contact",
    children: [
      { name: "Contact & Map", href: "/contact", description: "Write to the parish office", icon: EnvelopeIcon },
      { name: "Plan Your Visit", href: "/visit", description: "Mass times and directions", icon: DoorIcon },
      { name: "Parish Voices", href: "/#voices", description: "A word from the parish priest", icon: QuoteIcon },
    ],
  },
];

const socialLinks = [
  { name: "Facebook", href: site.social.facebook, icon: Facebook },
  { name: "Instagram", href: site.social.instagram, icon: Instagram },
  { name: "YouTube", href: site.social.youtube, icon: Youtube },
].filter((link) => Boolean(link.href));

const EventSearch = ({
  id,
  onNavigate,
  overlay = false,
  collapsible = false,
}: {
  id: string;
  onNavigate?: () => void;
  overlay?: boolean;
  collapsible?: boolean;
}) => {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(!collapsible);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);

  useEffect(() => {
    if (open || !restoreFocus.current) return;
    restoreFocus.current = false;
    toggleRef.current?.focus();
  }, [open]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = value.trim();
    if (!q) return;
    navigate(`/events?q=${encodeURIComponent(q)}`);
    onNavigate?.();
  };

  const closeIfEmpty = (event: FocusEvent<HTMLFormElement>) => {
    if (!collapsible || value.trim()) return;
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!collapsible || event.key !== "Escape") return;
    event.preventDefault();
    restoreFocus.current = true;
    setOpen(false);
  };

  if (collapsible && !open) {
    return (
      <button
        ref={toggleRef}
        type="button"
        aria-label="Search events"
        aria-expanded={false}
        aria-controls={id}
        onClick={() => setOpen(true)}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          overlay
            ? "text-church-pearl hover:bg-white/10 focus-visible:ring-church-pearl"
            : "text-foreground hover:bg-accent focus-visible:ring-ring",
        )}
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>
    );
  }

  return (
    <form role="search" onSubmit={submit} onBlur={closeIfEmpty} className="relative">
      <label htmlFor={id} className="sr-only">Search events and activities</label>
      <Input
        id={id}
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Search events"
        autoComplete="off"
        autoFocus={collapsible}
        className={cn(
          "h-9 w-full pl-9 lg:w-44",
          overlay && "border-church-pearl/40 bg-church-charcoal/30 text-church-pearl placeholder:text-church-pearl/70",
        )}
      />
      <button
        type="submit"
        aria-label="Search events"
        aria-expanded={collapsible ? true : undefined}
        aria-controls={collapsible ? id : undefined}
        className={cn(
          "absolute left-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-sm focus-visible:outline-none focus-visible:ring-2",
          overlay ? "text-church-pearl/80 focus-visible:ring-church-pearl" : "text-muted-foreground focus-visible:ring-ring",
        )}
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>
    </form>
  );
};

const ChildLink = forwardRef<
  HTMLAnchorElement,
  {
    child: NavChild;
    active: boolean;
    onNavigate?: () => void;
  } & React.ComponentPropsWithoutRef<"a">
>(({ child, active, onNavigate, className, onClick, ...props }, ref) => {
  const classes = cn(
    "flex items-start gap-3 rounded-md p-3 no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
    active && "bg-accent",
    className,
  );
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) onNavigate?.();
  };
  const body = (
    <>
      <child.icon size="sm" className="mt-0.5" />
      <span>
        <span className="block text-sm font-medium leading-none">{child.name}</span>
        <span className="mt-1 block text-xs text-muted-foreground">{child.description}</span>
      </span>
    </>
  );

  if (child.external) {
    return (
      <a ref={ref} href={child.href} target="_blank" rel="noopener noreferrer" className={classes} onClick={handleClick} {...props}>
        {body}
      </a>
    );
  }

  return (
    <Link ref={ref} to={child.href} className={classes} onClick={handleClick} {...props}>
      {body}
    </Link>
  );
});
ChildLink.displayName = "ChildLink";

const Navigation = () => {
  const { showNav } = useFeatures();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(() => typeof window !== "undefined" && window.scrollY > 16);
  const location = useLocation();
  const overlay = (location.pathname === "/" || location.pathname === "/home") && !scrolled && !mobileMenuOpen;

  const categoriesQuery = useQuery({
    queryKey: ["nav-ministry-categories"],
    queryFn: () => ministryCategoryService.getActive("service"),
    staleTime: 5 * 60 * 1000,
  });

  const featuredQuery = useQuery({
    queryKey: ["nav-featured-ministries"],
    queryFn: () =>
      ministryService.listPublished({
        kind: "service",
        is_featured: true,
        per_page: 4,
        sort: "sort_order",
      }),
    staleTime: 5 * 60 * 1000,
  });

  const resolvedNavItems = useMemo(() => {
    const categoryChildren: NavChild[] = (categoriesQuery.data?.data || []).slice(0, 3).map((cat) => ({
      name: cat.name,
      href: `/serve-others?category=${encodeURIComponent(cat.slug)}`,
      description: cat.description || "Ministry category",
      icon: CommunityIcon,
    }));
    const featuredChildren: NavChild[] = (featuredQuery.data?.data || []).slice(0, 3).map((m) => ({
      name: m.name,
      href: `/serve-others/${m.slug}`,
      description: m.short_description || "Featured ministry",
      icon: PeopleIcon,
    }));

    return navItems.flatMap((item) => {
      let children = item.children;
      if (item.name === "Serve Others") {
        const base = item.children || [];
        const extras = showNav("/serve-others") ? [...categoryChildren, ...featuredChildren] : [];
        children = [base[0], ...extras, base[1]].filter(Boolean) as NavChild[];
      }
      if (children) {
        const visible = children.filter((child) => showNav(child.href));
        return visible.length > 0 ? [{ ...item, children: visible }] : [];
      }
      return showNav(item.href) ? [item] : [];
    });
  }, [categoriesQuery.data, featuredQuery.data, showNav]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.pathname]);

  const isActive = (href: string) => {
    const [pathname, hash] = href.split("#");
    if (location.pathname !== pathname) return false;
    return hash ? location.hash === `#${hash}` : location.hash === "";
  };
  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full border-b transition-colors duration-300",
        overlay
          ? "border-transparent bg-transparent shadow-none"
          : "border-border bg-background/95 shadow-sm backdrop-blur-md",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between gap-3">
          <Link to="/" className="flex shrink-0 items-center space-x-3" aria-label="St. Anthony Catholic Church, Gbaja – home">
            <div className="m-0 rounded-lg bg-transparent p-0">
              <img src={logo} alt="" width={64} height={64} className="h-15 w-16 object-contain" />
            </div>
            <div className="ml-0 pl-0">
              <span className={cn("block font-heading text-xl font-bold", overlay ? "text-church-pearl" : "text-foreground")} style={{ fontSize: "22px" }}>St. Anthony</span>
              <span className={cn("hidden text-xs xl:block", overlay ? "text-church-pearl/80" : "text-muted-foreground")}>Catholic Church, Gbaja</span>
            </div>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            <NavigationMenu>
              <NavigationMenuList>
                {resolvedNavItems.map((item) =>
                  item.children ? (
                    <NavigationMenuItem key={item.name}>
                      <NavigationMenuTrigger
                        className={cn(
                          "px-2 font-medium transition-colors xl:px-3",
                          overlay && "text-church-pearl hover:bg-white/10 hover:text-church-pearl focus:bg-white/10 focus:text-church-pearl data-[active]:bg-white/10 data-[state=open]:bg-white/10 data-[state=open]:text-church-pearl",
                          isActive(item.href) && (overlay ? "text-church-gold" : "text-primary"),
                        )}
                      >
                        {item.name}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-80 gap-1 bg-popover p-3">
                          {item.children.map((child) => (
                            <li key={child.name}>
                              <NavigationMenuLink asChild>
                                <ChildLink child={child} active={isActive(child.href)} />
                              </NavigationMenuLink>
                            </li>
                          ))}
                          {item.name === "Visit" && (
                            <li className="mt-1 border-t border-border px-3 pt-3">
                              <p className="mb-2 text-xs font-medium text-muted-foreground">Follow the parish</p>
                              <div className="flex items-center gap-2">
                                {socialLinks.map(({ name, href, icon: Icon }) => (
                                  <a
                                    key={name}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={name}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-primary transition-colors hover:bg-accent"
                                  >
                                    <Icon className="h-4 w-4" />
                                  </a>
                                ))}
                              </div>
                            </li>
                          )}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
                    <NavigationMenuItem key={item.name}>
                      <Link
                        to={item.href}
                        className={cn(
                          "px-2 py-2 text-sm font-medium transition-colors xl:px-3",
                          overlay ? "text-church-pearl hover:bg-white/10 hover:text-church-pearl" : "hover:text-primary",
                          isActive(item.href) && (overlay ? "text-church-gold" : "text-primary"),
                        )}
                      >
                        {item.name}
                      </Link>
                    </NavigationMenuItem>
                  ),
                )}
              </NavigationMenuList>
            </NavigationMenu>
            <EventSearch id="event-search-desktop" overlay={overlay} collapsible />
            {showNav("/registration") && <Link
              to="/registration"
              className={cn(
                "px-2 py-2 text-sm font-medium transition-colors xl:px-3",
                overlay ? "text-church-pearl hover:bg-white/10 hover:text-church-pearl" : "hover:text-primary",
              )}
            >
              Register
            </Link>}
            {showNav("/donations") && (
              <Button variant="church" size="sm" asChild>
                <Link to="/donations">Giving</Link>
              </Button>
            )}
          </div>

          <button
            type="button"
            className={cn(
              "-mr-2 rounded-md p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden",
              overlay && "text-church-pearl",
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav id="mobile-menu" aria-label="Mobile" className="max-h-[calc(100vh-5rem)] animate-fade-in overflow-y-auto py-4 lg:hidden">
            <div className="mb-4 px-1">
              <EventSearch id="event-search-mobile" onNavigate={closeMobile} />
            </div>
            <div className="flex flex-col space-y-2">
              {resolvedNavItems.map((item) => (
                <div key={item.name}>
                  {item.children ? (
                    <>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-md bg-muted px-4 py-2 text-left text-md font-medium"
                        aria-expanded={openGroup === item.name}
                        onClick={() => setOpenGroup(openGroup === item.name ? null : item.name)}
                      >
                        {item.name}
                        <span aria-hidden="true">{openGroup === item.name ? "–" : "+"}</span>
                      </button>
                      {openGroup === item.name && (
                        <div className="ml-2 mt-2 space-y-1">
                          {item.children.map((child) => (
                            <ChildLink key={child.name} child={child} active={isActive(child.href)} onNavigate={closeMobile} />
                          ))}
                          {item.name === "Visit" && (
                            <div className="flex items-center gap-2 px-3 pt-2">
                              {socialLinks.map(({ name, href, icon: Icon }) => (
                                <a
                                  key={name}
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={name}
                                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-primary"
                                >
                                  <Icon className="h-4 w-4" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.href}
                      className={cn(
                        "block rounded-md bg-muted px-4 py-2 text-md font-medium transition-colors hover:bg-accent",
                        isActive(item.href) && "bg-accent text-church-charcoal",
                      )}
                      onClick={closeMobile}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              <div className="flex gap-2 px-1 pt-4">
                {showNav("/registration") && (
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to="/registration" onClick={closeMobile}>Register</Link>
                  </Button>
                )}
                {showNav("/donations") && (
                  <Button variant="church" className="flex-1" asChild>
                    <Link to="/donations" onClick={closeMobile}>Giving</Link>
                  </Button>
                )}
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Navigation;
