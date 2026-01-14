import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import type { User } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  Image,
  Radio,
  Users,
  Church,
  CreditCard,
  Clock,
  BookOpen,
  MessageSquare,
  Mail,
  Bell,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  Shield,
  Building2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const adminSidebarItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  // { name: "News", href: "/admin/news", icon: FileText },
  // Content Management
  {
    name: "Content Management",
    icon: FileText,
    children: [
      { name: "Posts", href: "/admin/posts", icon: FileText },
      { name: "Sermons", href: "/admin/sermons", icon: BookOpen },
      { name: "Gallery", href: "/admin/gallery", icon: Image },

    ]
  },
  { name: "Mass Bookings", href: "/admin/mass-bookings", icon: Church },
  { name: "Sacraments", href: "/admin/sacraments", icon: Church },
  { name: "Events", href: "/admin/events", icon: Calendar },
  { name: "Live Streaming", href: "/admin/livestream", icon: Radio },
  { name: "Calendar", href: "/admin/calendar", icon: Calendar },

  { name: "Leadership", href: "/admin/leadership", icon: Users },
  {
    name: "Facilities",
    icon: Building2,
    children: [
      { name: "Halls & Rentals", href: "/admin/halls", icon: Calendar },
      { name: "Bookshop", href: "/admin/shop", icon: CreditCard },
      { name: "Clinic", href: "/admin/clinic", icon: Clock },
    ],
  },

  { name: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { name: "Groups", href: "/admin/groups", icon: Users },
  { name: "Membership", href: "/admin/membership", icon: Users },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Donations", href: "/admin/donations", icon: CreditCard },
  { name: "Schedules", href: "/admin/schedules", icon: Clock },
  { name: "Contact Messages", href: "/admin/contact", icon: MessageSquare },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

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
  isSuperAdmin,
}: {
  onItemClick?: () => void;
  locationPathname: string;
  user: User | null;
  isSuperAdmin: () => boolean;
}) => (
  <div className="flex flex-col h-full">
    {/* Logo */}
    <div className="p-6 border-b border-sidebar-border">
      <Link to="/admin" className="flex items-center gap-3" onClick={onItemClick}>
        <div className="w-10 h-10 rounded-lg bg-gradient-church flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-sm text-sidebar-foreground">Admin Panel</h1>
          <p className="text-xs text-sidebar-foreground/70">St. Anthony Parish</p>
        </div>
      </Link>
    </div>

    {/* Navigation */}
    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
      {adminSidebarItems.map((item) => {
        if (item.children) {
          const isChildActive = item.children.some(
            (child) => locationPathname === child.href || locationPathname.startsWith(child.href + "/")
          );

          return (
            <Collapsible key={item.name} defaultOpen={isChildActive} className="w-full">
              <CollapsibleTrigger asChild>
                <div
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isChildActive && "bg-sidebar-accent/50 text-sidebar-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-9 space-y-1 mt-1">
                {item.children.map((child) => {
                  const isActive = locationPathname === child.href || locationPathname.startsWith(child.href + "/");
                  return (
                    <Link
                      key={child.name}
                      to={child.href}
                      onClick={onItemClick}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <span>{child.name}</span>
                    </Link>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          );
        }

        const isActive = locationPathname === item.href || (item.href !== "/admin" && locationPathname.startsWith(item.href + "/"));
        return (
          <Link
            key={item.name}
            to={item.href!}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
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
            {user?.name ? getInitials(user.name) : "A"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-sidebar-foreground truncate">{user?.name}</p>
          <Badge variant="secondary" className="text-xs mt-1">
            {isSuperAdmin() ? "Super Admin" : "Admin"}
          </Badge>
        </div>
      </div>
    </div>
  </div>
);

const AdminLayout = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex bg-muted">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar text-sidebar-foreground">
        <SidebarContent user={user} isSuperAdmin={isSuperAdmin} locationPathname={location.pathname} />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-sidebar border-sidebar-border">
          <SidebarContent
            user={user}
            isSuperAdmin={isSuperAdmin}
            locationPathname={location.pathname}
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
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Breadcrumb */}
            <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
              <span>Admin</span>
              {location.pathname !== "/admin" && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span className="text-foreground capitalize">
                    {location.pathname.split("/").pop()?.replace("-", " ")}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Back to Dashboard */}
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard">Back to Dashboard</Link>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {user?.name ? getInitials(user.name) : "A"}
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
                    <Link to="/admin/settings">
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
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t bg-background p-4 text-center text-sm text-muted-foreground"
          style={{
            bottom: '0px'
          }}
        >
          <p>© {new Date().getFullYear()} St. Anthony Catholic Church, Gbaja - Admin Panel</p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
