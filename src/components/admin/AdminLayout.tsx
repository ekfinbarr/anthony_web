import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { notify } from "@/lib/notify";
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
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import adminNotificationService from "@/services/adminNotification.service";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type SidebarLink = {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  /** When set, users holding any of these permissions see the item even without CMS admin access. */
  permissions?: string[];
};
type SidebarItem = Partial<SidebarLink> & {
  name: string;
  icon: typeof LayoutDashboard;
  children?: SidebarLink[];
  superAdminOnly?: boolean;
};

const APPROVAL_PARTICIPANT = ["view approvals", "decide approvals", "manage workflows", "view workflows"];

const adminSidebarItems: SidebarItem[] = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  {
    name: "Approvals",
    icon: ClipboardCheck,
    permissions: APPROVAL_PARTICIPANT,
    children: [
      { name: "Overview", href: "/admin/approvals", icon: ClipboardCheck, permissions: APPROVAL_PARTICIPANT },
      { name: "My queue", href: "/admin/approvals/queue", icon: ClipboardCheck, permissions: ["view approvals", "decide approvals"] },
      { name: "History", href: "/admin/approvals/history", icon: ClipboardCheck, permissions: ["view approvals", "manage workflows"] },
      { name: "Workflows", href: "/admin/approvals/workflows", icon: ClipboardCheck, permissions: ["view workflows", "manage workflows"] },
      { name: "Reports", href: "/admin/approvals/reports", icon: ClipboardCheck, permissions: ["view approval-reports", "manage workflows"] },
    ],
  },
  // { name: "News", href: "/admin/news", icon: FileText },
  // Content Management
  {
    name: "Content Management",
    icon: FileText,
    children: [
      { name: "Posts", href: "/admin/posts", icon: FileText },
      { name: "Sunday Bulletins", href: "/admin/bulletins", icon: FileText },
      { name: "Sermons", href: "/admin/sermons", icon: BookOpen },
      { name: "Order of Mass & Rites", href: "/admin/liturgy", icon: BookOpen },
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

  {
    name: "Newsletter",
    icon: Mail,
    children: [
      { name: "Campaigns", href: "/admin/newsletter", icon: Mail },
      { name: "Waitlist", href: "/admin/newsletter/waitlist", icon: Users },
    ],
  },
  {
    name: "Ministries & Groups",
    icon: Users,
    children: [
      { name: "All ministries", href: "/admin/groups", icon: Users },
      { name: "Categories", href: "/admin/groups/categories", icon: FileText },
      { name: "Enquiries", href: "/admin/groups/enquiries", icon: MessageSquare },
    ],
  },
  { name: "Membership", href: "/admin/membership", icon: Users },
  { name: "Users", href: "/admin/users", icon: Users, superAdminOnly: true },
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
  isAdmin,
  hasPermission,
}: {
  onItemClick?: () => void;
  locationPathname: string;
  user: User | null;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
  hasPermission: (...permissions: string[]) => boolean;
}) => {
  // CMS admins see everything; approval participants see only permission-tagged items.
  const canSee = (item: { permissions?: string[] }) =>
    isAdmin() ? !item.permissions || hasPermission(...item.permissions) : !!item.permissions && hasPermission(...item.permissions);
  const homeHref = isAdmin() ? "/admin" : "/admin/approvals";

  return (
  <div className="flex flex-col h-full">
    {/* Logo */}
    <div className="p-6 border-b border-sidebar-border">
      <Link to={homeHref} className="flex items-center gap-3" onClick={onItemClick}>
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
        if (item.superAdminOnly && !isSuperAdmin()) return null;
        if (!canSee(item)) return null;

        if (item.children) {
          const visibleChildren = item.children.filter(canSee);
          if (visibleChildren.length === 0) return null;
          const isChildActive = visibleChildren.some(
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
                {visibleChildren.map((child) => {
                  const matchesSelf =
                    locationPathname === child.href || locationPathname.startsWith(child.href + "/");
                  const hasMoreSpecificSibling = visibleChildren.some(
                    (sibling) =>
                      sibling.href !== child.href &&
                      sibling.href.startsWith(child.href + "/") &&
                      (locationPathname === sibling.href || locationPathname.startsWith(sibling.href + "/"))
                  );
                  const isActive = matchesSelf && !hasMoreSpecificSibling;
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
            {isSuperAdmin() ? "Super Admin" : isAdmin() ? "Admin" : "Approver"}
          </Badge>
        </div>
      </div>
    </div>
  </div>
  );
};

const AdminLayout = () => {
  const { user, logout, isSuperAdmin, isAdmin, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const notificationsQuery = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => adminNotificationService.list({ per_page: 15 }),
    refetchInterval: 45_000,
  });

  const unreadCount = notificationsQuery.data?.meta?.unread_count ?? 0;
  const notifications = notificationsQuery.data?.data ?? [];

  const markReadMutation = useMutation({
    mutationFn: (id: string) => adminNotificationService.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-notifications"] }),
    onError: (error) => notify.error(error, { description: "Could not mark that notification as read." }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => adminNotificationService.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      notify.success("All caught up", "All notifications marked as read.");
    },
    onError: (error) => notify.error(error, { description: "Could not mark notifications as read." }),
  });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const formatNotificationTime = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  return (
    <div className="min-h-screen flex bg-muted">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-sidebar text-sidebar-foreground">
        <SidebarContent
          user={user}
          isSuperAdmin={isSuperAdmin}
          isAdmin={isAdmin}
          hasPermission={hasPermission}
          locationPathname={location.pathname}
        />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-sidebar border-sidebar-border">
          <SidebarContent
            user={user}
            isSuperAdmin={isSuperAdmin}
            isAdmin={isAdmin}
            hasPermission={hasPermission}
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

              {/* Notifications */}
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 ? (
                          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        ) : null}
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Notifications</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-80 p-0">
                  <div className="flex items-center justify-between px-3 py-2 border-b">
                    <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      disabled={unreadCount === 0 || markAllReadMutation.isPending}
                      onClick={() => markAllReadMutation.mutate()}
                    >
                      Mark all read
                    </Button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notificationsQuery.isLoading ? (
                      <p className="text-sm text-muted-foreground p-4 text-center">Loading…</p>
                    ) : notifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground p-4 text-center">No notifications yet</p>
                    ) : (
                      notifications.map((n) => (
                        <DropdownMenuItem
                          key={n.id}
                          className={cn(
                            "flex flex-col items-start gap-0.5 px-3 py-2.5 cursor-pointer rounded-none",
                            !n.read_at && "bg-muted/50"
                          )}
                          onClick={() => {
                            if (!n.read_at) markReadMutation.mutate(n.id);
                            if (n.link) navigate(n.link);
                          }}
                        >
                          <span className="text-sm font-medium leading-snug">{n.title}</span>
                          {n.body ? (
                            <span className="text-xs text-muted-foreground line-clamp-2">{n.body}</span>
                          ) : null}
                          <span className="text-[10px] text-muted-foreground mt-0.5">
                            {formatNotificationTime(n.created_at)}
                          </span>
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

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
