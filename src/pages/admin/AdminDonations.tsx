import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MoreVertical, Eye, Plus, CreditCard, Calendar, TrendingUp, Users, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import donationService, { Donation, DonationGateway, DonationType } from "@/services/donation.service";

const AdminDonations = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const [typeFilter, setTypeFilter] = useState<DonationType | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [createForm, setCreateForm] = useState({
    amount: "",
    type: "offering" as DonationType,
    payment_gateway: "bank_transfer" as DonationGateway,
    notes: "",
  });

  const reportParams = useMemo(() => {
    return {
      type: typeFilter === "all" ? undefined : typeFilter,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      page: currentPage,
      per_page: pageSize,
    };
  }, [typeFilter, startDate, endDate, currentPage, pageSize]);

  const reportQuery = useQuery({
    queryKey: ["admin-donations-report", reportParams],
    queryFn: () => donationService.report(reportParams),
    placeholderData: (prev) => prev,
  });

  const donations: Donation[] = useMemo(() => {
    const list = reportQuery.data?.donations?.data ?? [];
    if (!debouncedSearch) return list;
    const q = debouncedSearch.toLowerCase();
    return list.filter((d) => d.reference.toLowerCase().includes(q) || d.type.toLowerCase().includes(q) || String(d.amount).includes(q));
  }, [reportQuery.data, debouncedSearch]);

  const totalAmount = reportQuery.data?.total_amount ?? 0;
  type UnknownRecord = Record<string, unknown>;
  const isRecord = (v: unknown): v is UnknownRecord => typeof v === "object" && v !== null;
  const getLastPage = (collection: unknown): number => {
    if (!isRecord(collection)) return 1;
    const meta = collection.meta;
    if (!isRecord(meta)) return 1;
    const last = meta.last_page;
    return typeof last === "number" && Number.isFinite(last) && last > 0 ? last : 1;
  };

  const totalPages = getLastPage(reportQuery.data?.donations);

  const createMutation = useMutation({
    mutationFn: async () => {
      const amt = Number(createForm.amount);
      if (!Number.isFinite(amt) || amt <= 0) throw new Error("Amount must be greater than 0");
      return donationService.create({
        amount: amt,
        type: createForm.type,
        payment_gateway: createForm.payment_gateway,
        notes: createForm.notes.trim() || null,
      });
    },
    onSuccess: () => {
      toast({ title: "Created", description: "Donation created (pending). Follow the gateway instructions to complete." });
      setIsCreateOpen(false);
      setCreateForm({ amount: "", type: "offering", payment_gateway: "bank_transfer", notes: "" });
      qc.invalidateQueries({ queryKey: ["admin-donations-report"] });
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to create donation";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(amount);
  };

  const averageAmount = donations.length ? totalAmount / donations.length : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Donations Management</h1>
          <p className="text-muted-foreground mt-1">Review donation reports and create donations (admin account only).</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Donation
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total (Report)</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(totalAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">Successful only</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Range</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{startDate || "—"} → {endDate || "—"}</div>
            <p className="text-xs text-muted-foreground mt-1">Filter window</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Records</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{donations.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Current page</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatAmount(averageAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per record (page)</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by reference/type/amount..."
                className="pl-9"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select
              value={typeFilter}
              onValueChange={(v) => {
                if (v === "all" || v === "tithe" || v === "offering" || v === "building" || v === "other") {
                  setTypeFilter(v);
                  setCurrentPage(1);
                }
              }}
            >
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="tithe">Tithe</SelectItem>
                <SelectItem value="offering">Offering</SelectItem>
                <SelectItem value="building">Building</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }} />
            <Input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }} />
            <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Page size" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="15">15 per page</SelectItem>
                <SelectItem value="25">25 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Donation Report</CardTitle>
        </CardHeader>
        <CardContent>
          {reportQuery.isLoading ? (
            <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : reportQuery.error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error loading report</h3>
              <p className="text-muted-foreground mb-4">
                {reportQuery.error instanceof Error ? reportQuery.error.message : "An unexpected error occurred"}
              </p>
              <Button onClick={() => qc.invalidateQueries({ queryKey: ["admin-donations-report"] })}>Try Again</Button>
            </div>
          ) : donations.length === 0 ? (
            <GenericEmptyState title="No donations found" description="No successful donations match the selected filters." icon="credit-card" />
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Gateway</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[80px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donations.map((d) => (
                      <TableRow key={d.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{d.reference}</TableCell>
                        <TableCell>{d.type}</TableCell>
                        <TableCell className="font-medium">{formatAmount(d.amount)}</TableCell>
                        <TableCell>{d.payment_gateway}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(d.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={d.status === "successful" ? "active" : d.status === "failed" ? "cancelled" : "pending"} customLabel={d.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="View donation"
                            onClick={() => {
                              setSelectedDonation(d);
                              setIsDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <AdminPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Donation Details</DialogTitle>
            <DialogDescription>{selectedDonation?.reference}</DialogDescription>
          </DialogHeader>
          {selectedDonation ? (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">Amount</div>
                  <div className="text-xl font-semibold">{formatAmount(selectedDonation.amount)}</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="mt-1">
                    <StatusBadge status={selectedDonation.status === "successful" ? "active" : selectedDonation.status === "failed" ? "cancelled" : "pending"} customLabel={selectedDonation.status} />
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">Type</div>
                  <div className="font-medium">{selectedDonation.type}</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">Gateway</div>
                  <div className="font-medium">{selectedDonation.payment_gateway}</div>
                </div>
              </div>
              {selectedDonation.notes ? (
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground mb-1">Notes</div>
                  <div className="text-sm whitespace-pre-wrap">{selectedDonation.notes}</div>
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Donation</DialogTitle>
            <DialogDescription>
              Creates a donation record for the current authenticated user (backend limitation). Use the report for organization-wide totals.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
              <div className="text-sm font-medium">
                Amount <span className="text-destructive">*</span>
              </div>
              <Input value={createForm.amount} onChange={(e) => setCreateForm((p) => ({ ...p, amount: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">
                Type <span className="text-destructive">*</span>
              </div>
              <Select value={createForm.type} onValueChange={(v) => setCreateForm((p) => ({ ...p, type: v as DonationType }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tithe">Tithe</SelectItem>
                  <SelectItem value="offering">Offering</SelectItem>
                  <SelectItem value="building">Building</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <div className="text-sm font-medium">
                Payment method <span className="text-destructive">*</span>
              </div>
              <Select value={createForm.payment_gateway} onValueChange={(v) => setCreateForm((p) => ({ ...p, payment_gateway: v as DonationGateway }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="paystack">Paystack</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Stripe may not be enabled in the backend.</p>
            </div>
            <div className="space-y-1 md:col-span-2">
              <div className="text-sm font-medium">Notes</div>
              <Textarea value={createForm.notes} onChange={(e) => setCreateForm((p) => ({ ...p, notes: e.target.value }))} rows={4} />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={createMutation.isPending}>Cancel</Button>
            <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDonations;
