import type { ComponentType, ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import { ArrowRight, BadgeCheck, Bell, CalendarClock, ChevronRight, Mail, Megaphone, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { ParishIconProps } from "@/components/icons/ParishIcon";
import {
  ChurchFrontIcon,
  CoinsIcon,
  CommunityIcon,
  EnvelopeIcon,
  HandsIcon,
  MedalIcon,
  PeopleIcon,
  PlayIcon,
} from "@/components/icons/ParishIcons";
import { StatusPill } from "@/components/dashboard/list/StatusPill";
import { rowAnimation } from "@/components/dashboard/list/listParams";
import { mediaUrl } from "@/components/parish-home/media";
import { getOverview, markNotificationRead, type AccountOverview, type ActivityItem } from "@/services/account.service";
import { formatMoney } from "@/services/payment.service";
import { cn } from "@/lib/utils";

type IconComponent = ComponentType<ParishIconProps>;

const QUICK_ACTIONS: Array<{ label: string; hint: string; href: string; icon: IconComponent }> = [
  { label: "Book a Mass", hint: "Offer an intention", href: "/book-mass", icon: ChurchFrontIcon },
  { label: "Give", hint: "Tithes & offerings", href: "/donations", icon: CoinsIcon },
  { label: "Join a group", hint: "Serve with others", href: "/serve-others", icon: CommunityIcon },
  { label: "Watch live", hint: "Mass & devotions", href: "/live", icon: PlayIcon },
  { label: "Prayer request", hint: "We'll pray with you", href: "/dashboard/prayer-requests", icon: HandsIcon },
  { label: "Parish card", hint: "Your membership", href: "/dashboard/parish-card", icon: MedalIcon },
];

const PROFILE_TASKS: Record<string, { label: string; href: string }> = {
  phone: { label: "Add your phone number", href: "/dashboard/profile" },
  address: { label: "Add your address", href: "/dashboard/profile" },
  photo: { label: "Upload a profile photo", href: "/dashboard/profile" },
  parish_registration: { label: "Register with the parish", href: "/registration" },
  date_of_birth: { label: "Add your date of birth", href: "/registration" },
  emergency_contact: { label: "Add an emergency contact", href: "/registration" },
};

const ACTIVITY_ICON: Record<ActivityItem["type"], IconComponent> = {
  mass_booking: ChurchFrontIcon,
  donation: CoinsIcon,
  group: PeopleIcon,
  message: EnvelopeIcon,
};

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

const initials = (name?: string) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "P";

const ago = (iso?: string | null) => {
  const d = iso ? parseISO(iso) : null;
  return d && isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : "";
};

const fmtTime = (value?: string | null) => {
  if (!value) return null;
  const d = parseISO(`1970-01-01T${value.slice(0, 5)}`);
  return isValid(d) ? format(d, "h:mm a") : value;
};

function Section({ title, icon, action, children, className }: { title: string; icon: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <Card className={cn("overflow-hidden border-church-gold/15", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 border-b bg-muted/30 px-4 py-3 sm:px-5">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <span className="text-church-gold">{icon}</span>
          {title}
        </CardTitle>
        {action}
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

function ViewAll({ to, label = "View all" }: { to: string; label?: string }) {
  return (
    <Button asChild variant="ghost" size="sm" className="h-8 gap-1 px-2 text-xs">
      <Link to={to}>
        {label} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </Button>
  );
}

function EmptyLine({ children }: { children: ReactNode }) {
  return <p className="px-5 py-8 text-center text-sm text-muted-foreground">{children}</p>;
}

function HomeSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading your dashboard">
      <Skeleton className="h-48 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}

function ProfileHero({ data }: { data: AccountOverview }) {
  const { user } = useAuth();
  const p = data.profile;
  const firstName = (p.name || user?.name || "").split(" ")[0];
  const memberSince = p.member_since ? format(parseISO(p.member_since), "MMMM yyyy") : null;
  const nextTask = p.missing.map((k) => PROFILE_TASKS[k]).find(Boolean);

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-church-charcoal via-church-charcoal to-church-brown text-church-pearl shadow-lg animate-fade-in">
      {/* Decorative gold glow */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-church-gold/20 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-church-gold/10 blur-3xl" aria-hidden />

      <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_minmax(16rem,20rem)] lg:items-center">
        <div className="flex items-start gap-4 min-w-0">
          <Avatar className="h-16 w-16 shrink-0 ring-2 ring-church-gold/70 sm:h-20 sm:w-20">
            <AvatarImage src={mediaUrl(p.avatar ?? user?.avatar)} alt="" />
            <AvatarFallback className="bg-church-gold text-lg font-bold text-church-charcoal">{initials(p.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1">
            <p className="text-sm text-church-pearl/70">{greeting()},</p>
            <h1 className="truncate font-heading text-2xl font-bold sm:text-3xl">{firstName}</h1>
            <p className="truncate text-sm text-church-pearl/80">{p.email}</p>
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              {p.parishioner ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-church-gold/20 px-2.5 py-1 font-medium text-church-gold">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                  Parishioner{p.parishioner.membership_number ? ` · ${p.parishioner.membership_number}` : ""}
                </span>
              ) : (
                <Link to="/registration" className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 font-medium transition-colors hover:bg-white/20">
                  <Sparkles className="h-3.5 w-3.5 text-church-gold" aria-hidden /> Become a registered parishioner
                </Link>
              )}
              {memberSince && <span className="rounded-full bg-white/10 px-2.5 py-1">Member since {memberSince}</span>}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-sm">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">Profile {p.completeness}% complete</span>
            <Link to="/dashboard/profile" className="text-xs text-church-gold hover:underline">Edit</Link>
          </div>
          <Progress value={p.completeness} className="h-2 bg-white/10 [&>div]:bg-church-gold" aria-label="Profile completeness" />
          {nextTask ? (
            <Link to={nextTask.href} className="mt-3 flex items-center justify-between gap-2 text-sm text-church-pearl/90 hover:text-church-gold">
              <span>Next: {nextTask.label}</span>
              <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : (
            <p className="mt-3 text-sm text-church-pearl/80">Your profile is complete. Thank you!</p>
          )}
        </div>
      </div>
    </section>
  );
}

function QuickActions() {
  return (
    <section aria-label="Quick actions">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {QUICK_ACTIONS.map((a, i) => {
          const Icon = a.icon;
          const anim = rowAnimation(i);
          return (
            <li key={a.href} className={anim.className} style={anim.style}>
              <Link
                to={a.href}
                className="group flex h-full flex-col items-center gap-2 rounded-xl border border-church-gold/15 bg-card p-4 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-church-gold/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Icon size="md" />
                <span className="text-sm font-semibold leading-tight">{a.label}</span>
                <span className="text-xs text-muted-foreground leading-tight">{a.hint}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function StatTiles({ data }: { data: AccountOverview }) {
  const s = data.stats;
  const tiles = [
    { label: "Upcoming Masses", value: String(s.upcoming_masses), hint: `${s.mass_bookings} booking${s.mass_bookings === 1 ? "" : "s"} in total`, href: "/dashboard/mass-bookings?period=upcoming" },
    { label: `Given in ${new Date().getFullYear()}`, value: formatMoney(s.donations.given_this_year, s.donations.currency), hint: `${formatMoney(s.donations.total_given, s.donations.currency)} all time`, href: "/dashboard/donations" },
    { label: "My groups", value: String(s.groups_active), hint: s.groups_pending ? `${s.groups_pending} awaiting approval` : "Active memberships", href: "/dashboard/groups" },
    { label: "Unread notifications", value: String(s.unread_notifications), hint: s.unread_notifications ? "Tap to catch up" : "You're all caught up", href: "/dashboard/notifications" },
  ];

  return (
    <section aria-label="Your summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {tiles.map((t, i) => {
        const anim = rowAnimation(i + 2);
        return (
          <Link
            key={t.label}
            to={t.href}
            className={cn(
              "group rounded-xl border bg-card p-4 transition-all hover:border-church-gold/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              anim.className
            )}
            style={anim.style}
          >
            <p className="text-xs text-muted-foreground">{t.label}</p>
            <p className="mt-1 truncate text-xl font-bold sm:text-2xl">{t.value}</p>
            <p className="mt-1 flex items-center justify-between gap-1 text-xs text-muted-foreground">
              <span className="truncate">{t.hint}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
            </p>
          </Link>
        );
      })}
    </section>
  );
}

function UpcomingMasses({ data }: { data: AccountOverview }) {
  return (
    <Section title="Upcoming Mass intentions" icon={<CalendarClock className="h-4 w-4" />} action={<ViewAll to="/dashboard/mass-bookings?period=upcoming" />}>
      {data.upcoming_masses.length === 0 ? (
        <div className="px-5 py-8 text-center">
          <p className="text-sm text-muted-foreground">No upcoming Mass intentions.</p>
          <Button asChild size="sm" className="mt-3"><Link to="/book-mass">Book a Mass</Link></Button>
        </div>
      ) : (
        <ul className="divide-y">
          {data.upcoming_masses.map((m) => {
            const d = parseISO(m.date);
            return (
              <li key={m.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-church-gold/15 text-church-brown dark:text-church-gold">
                  <span className="text-[10px] font-semibold uppercase leading-none">{isValid(d) ? format(d, "MMM") : ""}</span>
                  <span className="text-lg font-bold leading-tight">{isValid(d) ? format(d, "d") : "?"}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {m.mass ?? "Mass"}
                    {m.time && <span className="text-muted-foreground"> · {isValid(d) ? format(d, "EEE") : ""} {fmtTime(m.time)}</span>}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">{m.beneficiary ? `For ${m.beneficiary} — ` : ""}{m.intention}</p>
                </div>
                <StatusPill status={m.status} className="hidden sm:inline-flex" />
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}

function RecentActivity({ data }: { data: AccountOverview }) {
  return (
    <Section title="Recent activity" icon={<Sparkles className="h-4 w-4" />}>
      {data.recent_activity.length === 0 ? (
        <EmptyLine>Your bookings, gifts and group requests will appear here.</EmptyLine>
      ) : (
        <ol className="relative space-y-1 p-3 sm:p-4">
          {data.recent_activity.map((a, i) => {
            const Icon = ACTIVITY_ICON[a.type] ?? PeopleIcon;
            const content = (
              <div className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
                <Icon size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {a.description}
                    {a.amount != null && a.currency ? ` · ${formatMoney(a.amount, a.currency)}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <StatusPill status={a.status} className="hidden sm:inline-flex" />
                  <span className="text-[11px] text-muted-foreground">{ago(a.at)}</span>
                </div>
              </div>
            );
            const anim = rowAnimation(i);
            return (
              <li key={`${a.type}-${a.at}-${i}`} className={anim.className} style={anim.style}>
                {a.link ? <Link to={a.link} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">{content}</Link> : content}
              </li>
            );
          })}
        </ol>
      )}
    </Section>
  );
}

function NotificationsCard({ data }: { data: AccountOverview }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const read = useMutation({
    mutationFn: markNotificationRead,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  return (
    <Section
      title="Notifications"
      icon={<Bell className="h-4 w-4" />}
      action={<ViewAll to="/dashboard/notifications" />}
    >
      {data.notifications.length === 0 ? (
        <EmptyLine>No notifications yet.</EmptyLine>
      ) : (
        <ul className="divide-y">
          {data.notifications.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5"
                onClick={() => {
                  if (!n.read_at) read.mutate(n.id);
                  if (n.link) navigate(n.link);
                }}
              >
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.read_at ? "bg-transparent" : "bg-church-gold")} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-sm", !n.read_at && "font-semibold")}>{n.title}</span>
                  {n.body && <span className="line-clamp-2 block text-xs text-muted-foreground">{n.body}</span>}
                  <span className="block text-[11px] text-muted-foreground">{ago(n.created_at)}</span>
                </span>
                {!n.read_at && <span className="sr-only">Unread</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function MessagesCard({ data }: { data: AccountOverview }) {
  return (
    <Section title="Messages to the parish" icon={<Mail className="h-4 w-4" />} action={<ViewAll to="/contact" label="New message" />}>
      {data.messages.length === 0 ? (
        <EmptyLine>Questions for the parish office? Send a message and track it here.</EmptyLine>
      ) : (
        <ul className="divide-y">
          {data.messages.map((m) => (
            <li key={m.id} className="space-y-1 px-4 py-3 sm:px-5">
              <div className="flex items-start justify-between gap-2">
                <p className="truncate text-sm font-medium">{m.subject || "Message"}</p>
                <StatusPill status={m.status} />
              </div>
              <p className="line-clamp-2 text-xs text-muted-foreground">{m.excerpt}</p>
              <p className="text-[11px] text-muted-foreground">
                Sent {ago(m.sent_at)}
                {m.replied_at && ` · replied ${ago(m.replied_at)} — check your email`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function AnnouncementsCard({ data }: { data: AccountOverview }) {
  return (
    <Section title="Parish announcements" icon={<Megaphone className="h-4 w-4" />} action={<ViewAll to="/dashboard/announcements" />}>
      {data.announcements.length === 0 ? (
        <EmptyLine>No announcements right now.</EmptyLine>
      ) : (
        <ul className="divide-y">
          {data.announcements.map((a) => (
            <li key={a.id} className="space-y-1 px-4 py-3 sm:px-5">
              <p className="text-sm font-medium">{a.title}</p>
              <p className="line-clamp-2 text-xs text-muted-foreground">{a.excerpt}</p>
              {a.published_at && <p className="text-[11px] text-muted-foreground">{ago(a.published_at)}</p>}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

const DashboardHome = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["me", "overview"],
    queryFn: getOverview,
    refetchInterval: 60_000,
  });

  if (isLoading) return <HomeSkeleton />;

  if (isError || !data) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <ChurchFrontIcon size="lg" />
          <h1 className="font-heading text-lg font-semibold">We couldn't load your dashboard</h1>
          <p className="text-sm text-muted-foreground">Please check your connection and try again.</p>
          <Button variant="outline" onClick={() => refetch()}>Try again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <ProfileHero data={data} />
      <QuickActions />
      <StatTiles data={data} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <UpcomingMasses data={data} />
          <RecentActivity data={data} />
        </div>
        <div className="space-y-6">
          <NotificationsCard data={data} />
          <MessagesCard data={data} />
          <AnnouncementsCard data={data} />
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
