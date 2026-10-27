import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUnreadCount } from "@/services/account.service";
import { useAuth } from "@/contexts/AuthContext";
import type { User as AuthUser } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  User,
  Calendar,
  CreditCard,
  IdCard,
  Church,
  Bell,
  Heart,
  Users,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Parish Card", href: "/dashboard/parish-card", icon: IdCard },
  { name: "Mass Bookings", href: "/dashboard/mass-bookings", icon: Calendar },
  { name: "Donations", href: "/dashboard/donations", icon: CreditCard },
  { name: "Sacraments", href: "/dashboard/sacraments", icon: Church },
  { name: "Prayer Requests", href: "/dashboard/prayer-requests", icon: Heart },
  { name: "Groups", href: "/dashboard/groups", icon: Users },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Announcements", href: "/dashboard/announcements", icon: Megaphone },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const isActivePath = (pathname: string, href: string) =>
  href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(href + "/");

const pageLabel = (pathname: string) =>
  sidebarItems.find((item) => item.href !== "/dashboard" && isActivePath(pathname, item.href))?.name ??
  (pathname.split("/").pop() ?? "").replace(/-/g, " ");

const UnreadBadge = ({ count, className }: { count: number; className?: string }) =>
  count > 0 ? (
    <Badge className={cn("bg-destructive text-destructive-foreground text-xs", className)} aria-label={`${count} unread`}>
      {count > 99 ? "99+" : count}
    </Badge>
  ) : null;

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const SidebarContent = ({
  onItemClick,
  locationPathname,
  user,
  unreadCount,
}: {
  onItemClick?: () => void;
  locationPathname: string;
  user: AuthUser | null;
  unreadCount: number;
}) => (
  <div className="flex flex-col h-full">
    {/* Logo */}
    <div className="p-6 border-b border-sidebar-border">
      <Link to="/" className="flex items-center gap-3" onClick={onItemClick}>
        <div className="w-10 h-10 rounded-lg bg-gradient-church flex items-center justify-center">
          <Church className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-sm text-sidebar-foreground">St. Anthony</h1>
          <p className="text-xs text-sidebar-foreground/70">Gbaja Parish</p>
        </div>
      </Link>
    </div>

    {/* Navigation */}
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      {sidebarItems.map((item) => {
        const isActive = isActivePath(locationPathname, item.href);
        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={onItemClick}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
            {item.name === "Notifications" && <UnreadBadge count={unreadCount} className="ml-auto" />}
          </Link>
        );
      })}
    </nav>

    {/* User Section */}
    <div className="p-4 border-t border-sidebar-border">
      <div className="flex items-center gap-3 px-4 py-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.avatar} />
          <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
            {user?.name ? getInitials(user.name) : "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-sidebar-foreground truncate">{user?.name}</p>
          <p className="text-xs text-sidebar-foreground/70 truncate">{user?.email}</p>
        </div>
      </div>
    </div>
  </div>
);

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["me", "notifications", "unread-count"],
    queryFn: getUnreadCount,
    refetchInterval: 60_000,
    enabled: !!user,
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="parish-dashboard min-h-screen flex bg-muted">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar text-sidebar-foreground">
        <SidebarContent user={user} locationPathname={location.pathname} unreadCount={unreadCount} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-sidebar border-sidebar-border">
          <SidebarContent
            user={user}
            locationPathname={location.pathname}
            unreadCount={unreadCount}
            onItemClick={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-background border-b">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Mobile Menu Button */}
            <div className="flex min-w-0 items-center gap-2 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <span className="truncate font-heading font-semibold capitalize">
                {location.pathname === "/dashboard" ? "Dashboard" : pageLabel(location.pathname)}
              </span>
            </div>

            {/* Breadcrumb */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
              <span>Dashboard</span>
              {location.pathname !== "/dashboard" && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-foreground capitalize">{pageLabel(location.pathname)}</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Button variant="ghost" size="icon" asChild className="relative">
                <Link to="/dashboard/notifications" aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : "Notifications"}>
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] text-destructive-foreground" aria-hidden>
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {user?.name ? getInitials(user.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline-block font-medium">{user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-sm text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-5 lg:p-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t bg-background p-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} St. Anthony Catholic Church, Gbaja. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;
