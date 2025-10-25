import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Church, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import logo from "@/assets/images/logo.png";

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Home", href: "/" },
    {
      name: "About", href: "/about",
      children: [
        { name: "Our Story", href: "/about#our-story" },
        { name: "Leadership", href: "/about#leadership" },
        { name: "Masses", href: "/about#services" },
        { name: "Facilities", href: "/facilities" },
        { name: "Gallery", href: "/gallery" },
        { name: "FAQs", href: "/about#faqs" },
      ],
     },
    {
      name: "Organizations",
      href: "/ministries",
      children: [
        { name: "Societies & Pious Organizations", href: "/ministries/societies-pious-organizations" },
        { name: "Small Christians Communities", href: "/ministries/small-christians-communities" },
      ],
    },
    {
      name: "Sermons", href: "/sermons",
      children: [
        { name: "Latest Sermons", href: "/sermons" },
        { name: "Bulletin", href: "/bulletin" },
      ],
     },
    { name: "Events", href: "/events" },
    { name: "Visit", href: "/visit" },
    // { name: "Blog", href: "/blog" },
    { name: "News", href: "/news" },
    // {
    //   name: "Member Portal",
    //   href: "/dashboard",
    //   children: [
    //     { name: "Dashboard", href: "/dashboard" },
    //     { name: "Spiritual Growth", href: "/dashboard?tab=growth" },
    //     { name: "My Calendar", href: "/dashboard?tab=calendar" },
    //     { name: "Community", href: "/dashboard?tab=community" },
    //   ],
    // },
    { name: "Contact", href: "/contact" },
    { name: "Give", href: "/charity" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            {/* <div className="bg-gradient-church p-2 rounded-lg"> */}
            <div className="bg-transparent p-0 m-0 rounded-lg">
              {/* <Church className="h-8 w-8 text-church-charcoal" /> */}
              <img src={logo} alt="St. Anthony" className="h-15 w-16 object-contain" />
            </div>
            <div className="pl-0 ml-0">
              <h1 className="text-xl font-heading font-bold text-foreground">St. Anthony</h1>
              <p className="text-xs text-muted-foreground">Catholic Church</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item) =>
                  item.children ? (
                    <NavigationMenuItem key={item.name}>
                      <NavigationMenuTrigger
                        className={cn(
                          "font-medium transition-colors",
                          isActive(item.href) && "text-primary"
                        )}
                      >
                        {item.name}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[200px] gap-3 p-4">
                          {item.children.map((child) => (
                            <li key={child.name}>
                              <NavigationMenuLink asChild>
                                <Link
                                  to={child.href}
                                  className={cn(
                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                    isActive(child.href) && "bg-accent"
                                  )}
                                >
                                  <div className="text-sm font-medium leading-none">
                                    {child.name}
                                  </div>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  ) : (
                    <NavigationMenuItem key={item.name}>
                      <Link
                        to={item.href}
                        className={cn(
                          "px-4 py-2 text-sm font-medium transition-colors hover:text-primary",
                          isActive(item.href) && "text-primary"
                        )}
                      >
                        {item.name}
                      </Link>
                    </NavigationMenuItem>
                  )
                )}
              </NavigationMenuList>
            </NavigationMenu>
            <div className="flex items-center gap-2">
              <Link to="/dashboard">
                <Button variant="outline" size="lg">
                  <User className="h-4 w-4 mr-2" />
                  {/* Member Portal */}
                  Sign In
                </Button>
              </Link>
              <Link to={'/live'}>
                <Button variant="church" size="lg">
                  Watch Live
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 animate-fade-in">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <div key={item.name}>
                  <Link
                    to={item.href}
                    className={cn(
                      "block px-4 py-2 text-sm font-medium transition-colors hover:bg-accent rounded-md",
                      isActive(item.href) && "bg-accent text-primary"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                  {item.children && (
                    <div className="ml-4 mt-2 space-y-2">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.href}
                          className={cn(
                            "block px-4 py-2 text-sm transition-colors hover:bg-accent rounded-md",
                            isActive(child.href) && "bg-accent text-primary"
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="mt-4 space-y-2">
                <Link to="/dashboard">
                  <Button variant="outline" size="lg" className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    Member Portal
                  </Button>
                </Link>
                <Link to={'/live'}>
                  <Button variant="church" size="lg" className="w-full">
                    Watch Live
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;