import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, ChevronDown, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getInsights, type InsightBreakdown, type InsightFormat, type InsightsModule } from "@/services/insights.service";
import { ExportMenu } from "./ExportMenu";

const STORAGE_KEY = "admin-insights-open";

const readOpen = (module: string) => {
  try {
    return localStorage.getItem(`${STORAGE_KEY}:${module}`) !== "0";
  } catch {
    return true;
  }
};

const writeOpen = (module: string, open: boolean) => {
  try {
    localStorage.setItem(`${STORAGE_KEY}:${module}`, open ? "1" : "0");
  } catch {
    /* storage unavailable (private mode) — default stays open */
  }
};

function formatValue(value: number, fmt: InsightFormat, currency = "NGN", compact = false) {
  if (fmt === "money") {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      notation: compact ? "compact" : "standard",
      maximumFractionDigits: compact ? 1 : 0,
    }).format(value);
  }
  return new Intl.NumberFormat("en-NG", { notation: compact ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

/** Tooltip: the value leads, the period follows (values first, labels second). */
function TrendTooltip({ active, payload, fmt, currency }: { active?: boolean; payload?: Array<{ payload: { label: string; value: number } }>; fmt: InsightFormat; currency?: string }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-church-gold/30 bg-church-charcoal px-3 py-2 text-church-pearl shadow-xl">
      <p className="text-sm font-bold">{formatValue(point.value, fmt, currency)}</p>
      <p className="text-xs text-church-pearl/70">{point.label}</p>
    </div>
  );
}

/** Ranked horizontal bars: magnitude, one hue, value at the bar tip. */
function BreakdownBars({ breakdown, currency }: { breakdown: InsightBreakdown; currency?: string }) {
  const max = Math.max(1, ...breakdown.items.map((i) => i.value));
  const total = breakdown.items.reduce((n, i) => n + i.value, 0);

  return (
    <figure className="space-y-3">
      <figcaption className="text-sm font-semibold">{breakdown.label}</figcaption>
      {breakdown.items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No data yet.</p>
      ) : (
        <ul className="space-y-2.5">
          {breakdown.items.slice(0, 8).map((item) => {
            const pct = total ? Math.round((item.value / total) * 100) : 0;
            return (
              <li
                key={item.label}
                tabIndex={0}
                className="group rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`${item.label}: ${formatValue(item.value, breakdown.format, currency)} (${pct}%)`}
              >
                <div className="mb-1 flex items-baseline justify-between gap-3 text-xs">
                  <span className="truncate text-muted-foreground">{item.label}</span>
                  <span className="shrink-0 font-semibold tabular-nums text-foreground">
                    {formatValue(item.value, breakdown.format, currency)}
                    <span className="ml-1 font-normal text-muted-foreground">{pct}%</span>
                  </span>
                </div>
                <div className="h-2.5 rounded-sm bg-muted">
                  <div
                    className="h-full rounded-r-[4px] bg-[hsl(var(--chart-accent))] transition-[filter,width] duration-500 group-hover:brightness-110 group-focus-visible:brightness-110"
                    style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </figure>
  );
}

export function InsightsPanel({ module, title = "Insights" }: { module: InsightsModule; title?: string }) {
  const [open, setOpen] = useState(() => readOpen(module));
  const [months, setMonths] = useState("12");
  const [asTable, setAsTable] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["insights", module, months],
    queryFn: () => getInsights(module, Number(months)),
    enabled: open,
    staleTime: 60_000,
  });

  if (isError) return null; // No permission or unavailable: the table page still works.

  const currency = data?.currency;
  const trend = data?.trend;
  const points = trend?.points ?? [];
  const peak = points.reduce((best, p) => (p.value > (best?.value ?? -1) ? p : best), points[0]);

  return (
    <Collapsible
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        writeOpen(module, v);
      }}
    >
      <Card className="overflow-hidden border-church-gold/20 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-gradient-to-r from-church-gold/[0.07] to-transparent px-4 py-3">
          <CollapsibleTrigger asChild>
            <button type="button" className="group flex items-center gap-2 rounded-md text-left font-heading font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <BarChart3 className="h-4 w-4 text-church-gold-warm" aria-hidden />
              {title}
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-300", open && "rotate-180")} aria-hidden />
            </button>
          </CollapsibleTrigger>
          {open && trend && (
            <div className="flex items-center gap-2">
              <Select value={months} onValueChange={setMonths}>
                <SelectTrigger className="h-8 w-[8.5rem] text-xs" aria-label="Time range">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">Last 6 months</SelectItem>
                  <SelectItem value="12">Last 12 months</SelectItem>
                  <SelectItem value="24">Last 24 months</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1.5 px-2 text-xs"
                onClick={() => setAsTable((v) => !v)}
                aria-pressed={asTable}
              >
                {asTable ? <BarChart3 className="h-3.5 w-3.5" /> : <Table2 className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{asTable ? "Chart" : "Table"}</span>
              </Button>
              <ExportMenu
                title={`${title}: ${trend.label}`}
                filename={`${module}-trend`}
                columns={[
                  { header: "Month", value: (p: (typeof points)[number]) => p.label },
                  { header: trend.label, value: (p) => p.value, type: trend.format === "money" ? "money" : "number", total: true },
                ]}
                fetchAll={async () => ({ rows: points, truncated: false })}
                subtitle={`Last ${months} months`}
                currency={currency}
                size="sm"
                className="h-8 text-xs"
              />
            </div>
          )}
        </div>

        <CollapsibleContent className="data-[state=open]:animate-fade-in">
          <CardContent className="space-y-6 p-4 sm:p-5">
            {isLoading || !data ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                </div>
                <Skeleton className="h-56 rounded-xl" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {data.kpis.map((k, i) => (
                    <div
                      key={k.label}
                      className="surface-glow p-3 sm:p-4 animate-fade-in [animation-fill-mode:both]"
                      style={{ animationDelay: `${i * 60}ms` }}
                    >
                      <p className="text-xs text-muted-foreground">{k.label}</p>
                      <p className="mt-1 truncate text-lg font-bold tabular-nums sm:text-2xl" title={formatValue(k.value, k.format, currency)}>
                        {formatValue(k.value, k.format, currency, k.value >= 1_000_000)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                  <figure className="lg:col-span-2">
                    <figcaption className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm font-semibold">{trend!.label}</span>
                      {peak && peak.value > 0 && (
                        <span className="text-xs text-muted-foreground">
                          Peak: {peak.label} · {formatValue(peak.value, trend!.format, currency)}
                        </span>
                      )}
                    </figcaption>
                    {asTable ? (
                      <div className="max-h-64 overflow-auto rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Month</TableHead>
                              <TableHead className="text-right">{trend!.format === "money" ? "Amount" : "Count"}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {points.map((p) => (
                              <TableRow key={p.period}>
                                <TableCell>{p.label}</TableCell>
                                <TableCell className="text-right tabular-nums">{formatValue(p.value, trend!.format, currency)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="h-60 w-full" role="img" aria-label={`${trend!.label}, ${points.length} months. Use the Table button for exact values.`}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={points} margin={{ top: 8, right: 4, bottom: 0, left: -12 }}>
                            <CartesianGrid vertical={false} stroke="hsl(var(--chart-grid))" strokeWidth={1} />
                            <XAxis
                              dataKey="label"
                              tickLine={false}
                              axisLine={{ stroke: "hsl(var(--chart-grid))" }}
                              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                              tickFormatter={(v: string) => v.slice(0, 3)}
                              interval="preserveStartEnd"
                              minTickGap={8}
                            />
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              width={56}
                              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                              tickFormatter={(v: number) => formatValue(v, trend!.format, currency, true)}
                              allowDecimals={false}
                            />
                            <Tooltip
                              cursor={{ fill: "hsl(var(--church-gold) / 0.08)" }}
                              content={<TrendTooltip fmt={trend!.format} currency={currency} />}
                            />
                            <Bar
                              dataKey="value"
                              fill="hsl(var(--chart-accent))"
                              radius={[4, 4, 0, 0]}
                              maxBarSize={24}
                              animationDuration={700}
                              activeBar={{ fill: "hsl(var(--chart-accent))", fillOpacity: 0.85 }}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </figure>

                  <div className="space-y-6">
                    {data.breakdowns.map((b) => (
                      <BreakdownBars key={b.label} breakdown={b} currency={currency} />
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
