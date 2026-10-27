import { Link } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { format, isValid, parseISO } from "date-fns";
import { HandHeart, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IsoDatePicker } from "@/components/ui/date-picker";
import { CoinsIcon, GiftIcon, BasketIcon } from "@/components/icons/ParishIcons";
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
import { listMyDonations, type MyDonation } from "@/services/account.service";
import { ExportMenu } from "@/components/admin/data/ExportMenu";
import { fetchAllPages } from "@/components/admin/data/fetchAllPages";
import type { ExportColumn } from "@/lib/export/tableExport";
import { formatMoney } from "@/services/payment.service";

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "amount_desc", label: "Amount: high to low" },
  { value: "amount_asc", label: "Amount: low to high" },
];

const STATUSES = [
  { value: "successful", label: "Successful" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

const TYPES = ["tithe", "offering", "building", "missions", "thanksgiving", "welfare", "other"].map((t) => ({
  value: t,
  label: t.charAt(0).toUpperCase() + t.slice(1),
}));

const GATEWAYS: Record<string, string> = {
  flutterwave: "Online",
  paystack: "Online",
  stripe: "Online",
  bank_transfer: "Bank transfer",
  cash: "Cash",
};

const when = (d: MyDonation) => {
  const raw = d.donation_date ?? d.created_at;
  const parsed = raw ? parseISO(raw) : null;
  return parsed && isValid(parsed) ? format(parsed, "d MMM yyyy") : "—";
};

const typeLabel = (d: MyDonation) => d.type_formatted ?? d.type.charAt(0).toUpperCase() + d.type.slice(1);

function Dedication({ donation }: { donation: MyDonation }) {
  const text = donation.memorial_for ? `In memory of ${donation.memorial_for}` : donation.dedication;
  return text ? <p className="line-clamp-1 text-xs text-muted-foreground">{text}</p> : null;
}

function StatCard({ label, value, hint, icon, index }: { label: string; value: string; hint?: string; icon: React.ReactNode; index: number }) {
  const anim = rowAnimation(index);
  return (
    <Card className={`border-church-gold/15 ${anim.className}`} style={anim.style}>
      <CardContent className="flex items-center gap-3 p-4">
        {icon}
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-lg font-bold sm:text-xl">{value}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function MyDonations() {
  const { params, update, clear, activeFilterCount } = useListParams({ sort: "newest" });

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["me", "donations", params],
    queryFn: () => listMyDonations({ ...params, per_page: 10 }),
    placeholderData: keepPreviousData,
  });

  const rows = data?.data ?? [];
  const summary = data?.summary;

  const statementColumns: ExportColumn<MyDonation>[] = [
    { header: "Date", value: (d) => d.donation_date ?? d.created_at ?? null, type: "date" },
    { header: "Reference", value: (d) => d.reference },
    { header: "Fund", value: (d) => typeLabel(d) },
    { header: "Method", value: (d) => GATEWAYS[d.payment_gateway] ?? d.payment_gateway },
    { header: "Status", value: (d) => d.status_formatted ?? d.status },
    { header: "Dedication", value: (d) => (d.memorial_for ? `In memory of ${d.memorial_for}` : d.dedication ?? "") },
    { header: "Amount", value: (d) => Number(d.amount), type: "money", total: true },
  ];
  const fetchStatement = () =>
    fetchAllPages<MyDonation>((page, per_page) => listMyDonations({ ...params, page, per_page }), 50);
  const filtered = Boolean(params.search || activeFilterCount);

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <DashboardPageHeader
        icon={<CoinsIcon size="lg" className="hidden sm:inline-flex" />}
        title="My donations"
        description="Your gifts to the parish, with references for your records."
        actions={
          <>
            <ExportMenu
              title="Giving statement"
              filename="my-giving-statement"
              columns={statementColumns}
              fetchAll={fetchStatement}
              subtitle={params.from || params.to ? `${params.from ?? "Start"} to ${params.to ?? "today"}` : "All time"}
              currency={summary?.currency ?? "NGN"}
              className="w-full sm:w-auto"
            />
            <Button asChild className="w-full sm:w-auto">
              <Link to="/donations">
                <HandHeart className="mr-2 h-4 w-4" /> Give now
              </Link>
            </Button>
          </>
        }
      />

      {summary && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard index={0} icon={<CoinsIcon size="sm" />} label="Total given" value={formatMoney(summary.total_given, summary.currency)} hint={`${summary.successful_count} successful gift${summary.successful_count === 1 ? "" : "s"}`} />
          <StatCard index={1} icon={<GiftIcon size="sm" />} label={`Given in ${new Date().getFullYear()}`} value={formatMoney(summary.given_this_year, summary.currency)} />
          <StatCard index={2} icon={<BasketIcon size="sm" />} label="Pending" value={String(summary.pending_count)} hint="Awaiting confirmation" />
        </div>
      )}

      <ListToolbar
        search={params.search}
        onSearch={(v) => update({ search: v })}
        searchPlaceholder="Search reference, fund or dedication…"
        sort={params.sort}
        sortOptions={SORTS}
        onSort={(v) => update({ sort: v })}
        activeFilterCount={activeFilterCount}
        onClear={clear}
      >
        <FilterSelect label="Status" value={params.status} options={STATUSES} onChange={(v) => update({ status: v })} />
        <FilterSelect label="Fund" value={params.type} options={TYPES} onChange={(v) => update({ type: v })} />
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">From</Label>
          <IsoDatePicker value={params.from} max={params.to} onChange={(v) => update({ from: v })} placeholder="Any date" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">To</Label>
          <IsoDatePicker value={params.to} min={params.from} onChange={(v) => update({ to: v })} placeholder="Any date" />
        </div>
      </ListToolbar>

      {isLoading ? (
        <ListSkeleton />
      ) : isError ? (
        <ListEmpty
          icon={<CoinsIcon size="lg" />}
          title="We couldn't load your donations"
          description="Please check your connection and try again."
          action={<Button variant="outline" onClick={() => refetch()}>Try again</Button>}
        />
      ) : rows.length === 0 ? (
        <ListEmpty
          icon={<CoinsIcon size="lg" />}
          title={filtered ? "No donations match" : "No donations yet"}
          description={filtered ? "Try a different search or clear the filters." : "Support the parish with a tithe, offering or gift to a special fund."}
          action={
            filtered ? <Button variant="outline" onClick={clear}>Clear filters</Button> : <Button asChild><Link to="/donations">Make a donation</Link></Button>
          }
        />
      ) : (
        <div className={`transition-opacity ${isFetching ? "opacity-60" : ""}`}>
          {/* Phones: stacked cards */}
          <ul className="space-y-3 md:hidden">
            {rows.map((d, index) => {
              const anim = rowAnimation(index);
              return (
                <li key={d.id} className={anim.className} style={anim.style}>
                  <Card>
                    <CardContent className="space-y-2 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold">{typeLabel(d)}</p>
                          <p className="truncate font-mono text-xs text-muted-foreground">{d.reference}</p>
                        </div>
                        <p className="shrink-0 text-lg font-bold">{formatMoney(Number(d.amount), d.currency)}</p>
                      </div>
                      <Dedication donation={d} />
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>
                          {when(d)} · {GATEWAYS[d.payment_gateway] ?? d.payment_gateway}
                          {d.is_recurring && " · Recurring"}
                        </span>
                        <StatusPill status={d.status} />
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>

          {/* Tablet and up: table */}
          <Card className="hidden overflow-hidden md:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Date</TableHead>
                  <TableHead>Fund</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((d, index) => {
                  const anim = rowAnimation(index);
                  return (
                    <TableRow key={d.id} className={anim.className} style={anim.style}>
                      <TableCell className="whitespace-nowrap">{when(d)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-medium">
                          {typeLabel(d)}
                          {d.is_recurring && <Repeat className="h-3.5 w-3.5 text-muted-foreground" aria-label="Recurring" />}
                        </div>
                        <Dedication donation={d} />
                      </TableCell>
                      <TableCell className="font-mono text-xs">{d.reference}</TableCell>
                      <TableCell>{GATEWAYS[d.payment_gateway] ?? d.payment_gateway}</TableCell>
                      <TableCell><StatusPill status={d.status} /></TableCell>
                      <TableCell className="text-right font-semibold whitespace-nowrap">{formatMoney(Number(d.amount), d.currency)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      <ListPagination meta={data?.meta} onPage={(p) => update({ page: String(p) }, false)} noun="donations" />
    </div>
  );
}
