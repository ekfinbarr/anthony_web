import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  FileText,
  Calendar,
  CreditCard,
  Church,
  MessageSquare,
  Image,
  Radio,
  AlertCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import adminDashboardService from "@/services/adminDashboard.service";
import { Button } from "@/components/ui/button";

const formatNaira = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatActivityTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const AdminDashboard = () => {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminDashboardService.getDashboard(),
    refetchInterval: 60_000,
  });

  const kpis = data?.kpis;
  const donationSeries = (data?.series.donations || []).map((p) => ({
    ...p,
    label: p.date.slice(5),
  }));
  const bookingSeries = (data?.series.mass_bookings || []).map((p) => ({
    ...p,
    label: p.date.slice(5),
  }));

  const stats = [
    {
      title: "Total Users",
      value: kpis ? String(kpis.users) : "—",
      change: "Registered accounts",
      icon: Users,
      color: "text-blue-500",
      href: "/admin/users",
    },
    {
      title: "Posts",
      value: kpis ? String(kpis.posts) : "—",
      change: "Content pieces",
      icon: FileText,
      color: "text-green-500",
      href: "/admin/posts",
    },
    {
      title: "Events",
      value: kpis ? String(kpis.events) : "—",
      change: "All events",
      icon: Calendar,
      color: "text-purple-500",
      href: "/admin/events",
    },
    {
      title: "Donations",
      value: kpis ? formatNaira(kpis.donations_total) : "—",
      change: kpis ? `${kpis.donations_count} gifts` : "",
      icon: CreditCard,
      color: "text-primary",
      href: "/admin/donations",
    },
    {
      title: "Mass Bookings",
      value: kpis ? String(kpis.mass_booking_orders) : "—",
      change: "Orders",
      icon: Church,
      color: "text-orange-500",
      href: "/admin/mass-bookings",
    },
    {
      title: "Contact Messages",
      value: kpis ? String(kpis.contact_messages) : "—",
      change: kpis ? `${kpis.contact_unread} new` : "",
      icon: MessageSquare,
      color: "text-red-500",
      href: "/admin/contact",
    },
    {
      title: "Gallery Items",
      value: kpis ? String(kpis.gallery_items) : "—",
      change: "Media",
      icon: Image,
      color: "text-pink-500",
      href: "/admin/gallery",
    },
    {
      title: "Livestreams",
      value: kpis ? String(kpis.livestreams) : "—",
      change: "Streams",
      icon: Radio,
      color: "text-indigo-500",
      href: "/admin/livestream",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Live overview of parish activity.</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {error ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-3">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="font-medium">Could not load dashboard</p>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Unexpected error"}
            </p>
            <Button onClick={() => refetch()}>Try again</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Link key={stat.title} to={stat.href}>
                <Card className="hover:shadow-lg transition-shadow h-full">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      <div className="text-2xl font-bold">{stat.value}</div>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Donations (30 days)</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={donationSeries}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value: number, name: string) =>
                          name === "total" ? formatNaira(value) : value
                        }
                      />
                      <Area
                        type="monotone"
                        dataKey="total"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.2}
                        name="total"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mass booking orders (30 days)</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                {isLoading ? (
                  <Skeleton className="h-full w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={bookingSeries}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (data?.recent_activity?.length || 0) === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">No recent activity.</p>
              ) : (
                <div className="space-y-4">
                  {data!.recent_activity.map((activity, index) => (
                    <div
                      key={`${activity.action}-${activity.time}-${index}`}
                      className="flex items-center justify-between py-2 border-b last:border-0 gap-4"
                    >
                      <div className="min-w-0">
                        {activity.link ? (
                          <Link to={activity.link} className="font-medium text-sm hover:underline">
                            {activity.action}
                          </Link>
                        ) : (
                          <p className="font-medium text-sm">{activity.action}</p>
                        )}
                        <p className="text-xs text-muted-foreground truncate">by {activity.user}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatActivityTime(activity.time)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
