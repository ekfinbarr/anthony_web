import { Link } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { format, isValid, parseISO } from "date-fns";
import { ArrowUpRight, Clock, MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityIcon, PeopleIcon } from "@/components/icons/ParishIcons";
import { mediaUrl } from "@/components/parish-home/media";
import {
  DashboardPageHeader,
  FilterSelect,
  ListEmpty,
  ListPagination,
  ListSkeleton,
  ListToolbar,
} from "@/components/dashboard/list/DashboardList";
import { rowAnimation, useListParams } from "@/components/dashboard/list/listParams";
import { StatusPill } from "@/components/dashboard/list/StatusPill";
import { listMyGroups, type MyGroup } from "@/services/account.service";

const SORTS = [
  { value: "recent", label: "Recently joined" },
  { value: "oldest", label: "Longest member" },
  { value: "name", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
];

const KINDS = [
  { value: "ministry", label: "Ministries & societies" },
  { value: "organization", label: "Organisations" },
];

const joined = (g: MyGroup) => {
  const d = g.joined_at ? parseISO(g.joined_at) : null;
  return d && isValid(d) ? format(d, "MMM yyyy") : null;
};

function GroupCard({ group, index }: { group: MyGroup; index: number }) {
  const anim = rowAnimation(index);
  const image = mediaUrl(group.image ?? undefined);
  const since = joined(group);

  const body = (
    <Card className="group flex h-full flex-col overflow-hidden transition-all hover:-translate-y-0.5 hover:border-church-gold/40 hover:shadow-md">
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-church-charcoal to-church-brown">
        {image ? (
          <img src={image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <PeopleIcon size="lg" />
          </div>
        )}
        <div className="absolute left-3 top-3">
          <StatusPill status={group.status} className="bg-background/95 backdrop-blur" />
        </div>
      </div>
      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-heading font-semibold leading-snug">{group.name}</h3>
          {group.url && <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />}
        </div>
        <p className="text-xs capitalize text-muted-foreground">
          {[group.role, group.category?.replace(/_/g, " ")].filter(Boolean).join(" · ")}
        </p>
        {group.description && <p className="line-clamp-2 text-sm text-muted-foreground">{group.description}</p>}
        <div className="mt-auto space-y-1 pt-2 text-xs text-muted-foreground">
          {group.meeting_schedule && (
            <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 shrink-0" aria-hidden /> <span className="line-clamp-1">{group.meeting_schedule}</span></p>
          )}
          {group.meeting_location && (
            <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden /> <span className="line-clamp-1">{group.meeting_location}</span></p>
          )}
          {since && <p>{group.status === "pending" ? "Requested" : "Member since"} {since}</p>}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <li className={anim.className} style={anim.style}>
      {group.url ? (
        <Link to={group.url} className="block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Open ${group.name}`}>
          {body}
        </Link>
      ) : (
        body
      )}
    </li>
  );
}

export default function MyGroups() {
  const { params, update, clear, activeFilterCount } = useListParams({ sort: "recent" });

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["me", "groups", params],
    queryFn: () => listMyGroups({ ...params, per_page: 9 }),
    placeholderData: keepPreviousData,
  });

  const rows = data?.data ?? [];
  const status = params.status ?? "all";
  const filtered = Boolean(params.search || activeFilterCount);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <DashboardPageHeader
        icon={<CommunityIcon size="lg" className="hidden sm:inline-flex" />}
        title="My groups"
        description="Ministries, societies and organisations you belong to."
        actions={
          <Button asChild className="w-full sm:w-auto">
            <Link to="/serve-others">
              <Search className="mr-2 h-4 w-4" /> Find a group
            </Link>
          </Button>
        }
      />

      <Tabs value={status} onValueChange={(v) => update({ status: v === "all" ? undefined : v })}>
        <TabsList className="grid w-full grid-cols-3 sm:inline-grid sm:w-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>
      </Tabs>

      <ListToolbar
        search={params.search}
        onSearch={(v) => update({ search: v })}
        searchPlaceholder="Search your groups…"
        sort={params.sort}
        sortOptions={SORTS}
        onSort={(v) => update({ sort: v })}
        activeFilterCount={activeFilterCount - (params.status ? 1 : 0)}
        onClear={clear}
      >
        <FilterSelect label="Type" value={params.kind} options={KINDS} onChange={(v) => update({ kind: v })} />
      </ListToolbar>

      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : isError ? (
        <ListEmpty
          icon={<CommunityIcon size="lg" />}
          title="We couldn't load your groups"
          description="Please check your connection and try again."
          action={<Button variant="outline" onClick={() => refetch()}>Try again</Button>}
        />
      ) : rows.length === 0 ? (
        <ListEmpty
          icon={<CommunityIcon size="lg" />}
          title={filtered ? "No groups match" : "You haven't joined a group yet"}
          description={filtered ? "Try a different search or clear the filters." : "Choirs, societies and ministries are a great way to serve and grow in faith together."}
          action={
            filtered ? <Button variant="outline" onClick={clear}>Clear filters</Button> : <Button asChild><Link to="/serve-others">Explore groups</Link></Button>
          }
        />
      ) : (
        <ul className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
          {rows.map((g, i) => (
            <GroupCard key={`${g.kind}-${g.id}`} group={g} index={i} />
          ))}
        </ul>
      )}

      <ListPagination meta={data?.meta} onPage={(p) => update({ page: String(p) }, false)} noun="groups" />
    </div>
  );
}
