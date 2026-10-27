import { useNavigate } from "react-router-dom";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow, isValid, parseISO } from "date-fns";
import { CheckCheck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BellIcon } from "@/components/icons/ParishIcons";
import {
  DashboardPageHeader,
  ListEmpty,
  ListPagination,
  ListSkeleton,
  ListToolbar,
} from "@/components/dashboard/list/DashboardList";
import { rowAnimation, useListParams } from "@/components/dashboard/list/listParams";
import { notify } from "@/lib/notify";
import { cn } from "@/lib/utils";
import { listMyNotifications, markAllNotificationsRead, markNotificationRead } from "@/services/account.service";

const ago = (iso?: string | null) => {
  const d = iso ? parseISO(iso) : null;
  return d && isValid(d) ? formatDistanceToNow(d, { addSuffix: true }) : "";
};

const Notifications = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { params, update, clear } = useListParams();
  const unreadOnly = params.unread_only === "1";

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["me", "notifications", params],
    queryFn: () => listMyNotifications({ search: params.search, page: params.page, unread_only: unreadOnly ? 1 : undefined, per_page: 15 }),
    placeholderData: keepPreviousData,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["me"] });

  const readOne = useMutation({ mutationFn: markNotificationRead, onSettled: refresh });
  const readAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => notify.success("All caught up"),
    onError: (e) => notify.error(e),
    onSettled: refresh,
  });

  const rows = data?.data ?? [];
  const unread = data?.meta.unread_count ?? 0;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <DashboardPageHeader
        icon={<BellIcon size="lg" className="hidden sm:inline-flex" />}
        title="Notifications"
        description={unread ? `You have ${unread} unread notification${unread === 1 ? "" : "s"}.` : "You're all caught up."}
        actions={
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => readAll.mutate()} disabled={!unread || readAll.isPending}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all as read
          </Button>
        }
      />

      <Tabs value={unreadOnly ? "unread" : "all"} onValueChange={(v) => update({ unread_only: v === "unread" ? "1" : undefined })}>
        <TabsList className="grid w-full grid-cols-2 sm:inline-grid sm:w-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread{unread ? ` (${unread})` : ""}</TabsTrigger>
        </TabsList>
      </Tabs>

      <ListToolbar
        search={params.search}
        onSearch={(v) => update({ search: v })}
        searchPlaceholder="Search notifications…"
      />

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <ListEmpty
          icon={<BellIcon size="lg" />}
          title="We couldn't load your notifications"
          description="Please check your connection and try again."
          action={<Button variant="outline" onClick={() => refetch()}>Try again</Button>}
        />
      ) : rows.length === 0 ? (
        <ListEmpty
          icon={<BellIcon size="lg" />}
          title={params.search || unreadOnly ? "Nothing here" : "No notifications yet"}
          description={
            params.search || unreadOnly
              ? "Try a different search or show all notifications."
              : "Updates about your bookings, gifts and groups will appear here."
          }
          action={params.search || unreadOnly ? <Button variant="outline" onClick={clear}>Show all</Button> : undefined}
        />
      ) : (
        <Card className={cn("divide-y overflow-hidden transition-opacity", isFetching && "opacity-60")}>
          {rows.map((n, index) => {
            const anim = rowAnimation(index);
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  if (!n.read_at) readOne.mutate(n.id);
                  if (n.link) navigate(n.link);
                }}
                className={cn(
                  "flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5",
                  !n.read_at && "bg-church-gold/5",
                  anim.className
                )}
                style={anim.style}
              >
                <span className={cn("mt-2 h-2 w-2 shrink-0 rounded-full", n.read_at ? "bg-muted-foreground/20" : "bg-church-gold")} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className={cn("block text-sm", !n.read_at && "font-semibold")}>{n.title}</span>
                  {n.body && <span className="mt-0.5 block text-sm text-muted-foreground">{n.body}</span>}
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {ago(n.created_at)}
                    {!n.read_at && <span className="sr-only"> · unread</span>}
                  </span>
                </span>
                {n.link && <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}
              </button>
            );
          })}
        </Card>
      )}

      <ListPagination meta={data?.meta} onPage={(p) => update({ page: String(p) }, false)} noun="notifications" />
    </div>
  );
};

export default Notifications;
