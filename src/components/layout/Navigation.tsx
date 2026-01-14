import { useState } from "react";
import { href, Link, useLocation } from "react-router-dom";
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
    {
      name: "Home", href: "/"
    },
    {
      name: "Parish Life",
      href: "#",
      children: [
        // { name: "Ministries", href: "/ministries" },
        { name: "Groups & Societies", href: "/groups" },
        { name: "Past Priests", href: "/past-priests" },
        { name: "Events", href: "/events" },
        { name: "Calendar", href: "/calendar" },
        { name: "Gallery", href: "/gallery" },
      ],
    },
    {
      name: "Services",
      href: "#",
      children: [
        { name: "Bookshop", href: "/bookshop" },
        { name: "Clinic", href: "/clinic" },
        { name: "Mass Booking", href: "/mass-booking" },
        { name: "Hall & Rentals", href: "/rentals" },
      ],
    },
    {
      name: "Our Parish", href: "/about",
      children: [
        { name: "Our Story", href: "/about#our-story" },
        { name: "Leadership", href: "/about#leadership" },
        { name: "Masses", href: "/visit" },
        { name: "Events", href: "/events" },
        { name: "News", href: "/news" },
        { name: "Bookshop", href: "/bookshop" },
        { name: "Clinic", href: "/clinic" },
        { name: "Gallery", href: "/gallery" },
        { name: "FAQs", href: "/faq" },
      ],
    },
    // {
    //   name: "Organizations",
    //   href: "/ministries",
    //   children: [
    //     { name: "Societies & Pious Organizations", href: "/ministries/societies-pious-organizations" },
    //     { name: "Basic Christian Communities", href: "/ministries/small-christians-communities" },
    //   ],
    // },
    {
      name: "Sermons", href: "/sermons",
      children: [
        { name: "Latest Sermons", href: "/sermons" },
        { name: "Bulletin", href: "/bulletin" },
      ],
    },
    // {
    //   name: "Sacraments", href: "/sacraments",
    //   children: [
    //     { name: "Marriage Classes", href: "/marriage-classes" },
    //     { name: "Baptism", href: "/marriage-bans" },
    //     { name: "Confessions", href: "/marriage-bans" },
    //   ]
    // },


    // { name: "Blog", href: "/blog" },
    // { name: "Gallery", href: "/gallery" },
    // { name: "Register", href: "/register" },
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
    // {
    //   name: "Contact", href: "/contact",
    //   children: [
    //     { name: "Contact us", href: "/contact" },
    //     { name: "Visit", href: "/visit" }
    //   ]
    // },
    { name: "Contact", href: "/contact" },
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
              <h1 className="text-xl font-heading font-bold text-foreground" style={{ fontSize: '22px' }}>St. Anthony</h1>
              <p className="text-xs text-muted-foreground">Catholic Church, Gbaja</p>
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

                        <ul
                          className="grid w-[500px] gap-3 p-4 bg-gradient-to-r from-primary/10 via-primary/10 to-accent/10">
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
              {/* <Link to="/dashboard">
                <Button variant="outline" size="lg">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link> */}
              <Button variant="outline" size="sm" asChild>
                <Link to="/registration">Register</Link>
              </Button>
              <Button variant="church" size="sm" asChild>
                <Link to="/donations">Give</Link>
              </Button>
              {/* <Link to={'/live'}>
                <Button variant="church" size="lg">
                  Watch Live
                </Button>
              </Link> */}
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
                      "block px-4 py-2 text-md font-medium transition-colors hover:bg-accent bg-muted rounded-md",
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
                            isActive(child.href) && "bg-accent text-white"
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
              <div className="flex gap-2 pt-4 px-4">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/registration" onClick={() => setMobileMenuOpen(false)}>Register</Link>
                </Button>
                <Button variant="church" className="flex-1" asChild>
                  <Link to="/donations" onClick={() => setMobileMenuOpen(false)}>Give</Link>
                </Button>
              </div>
              {/* <div className="mt-4 space-y-2">
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
              </div> */}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;