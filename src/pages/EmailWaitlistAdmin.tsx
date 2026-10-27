import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminEmailService, type EmailSubscription } from "@/services/emailService";
import { useToast } from "@/hooks/use-toast";
import { Users, Trash2, RefreshCw, Search, Filter } from "lucide-react";

import { BulkActionBar, SelectAllCheckbox, SelectRowCheckbox } from "@/components/admin/data/BulkActionBar";
import { ExportMenu } from "@/components/admin/data/ExportMenu";
import { fetchAllPages } from "@/components/admin/data/fetchAllPages";
import { rowId, useBulkSelection } from "@/components/admin/data/useBulkSelection";
import type { ExportColumn } from "@/lib/export/tableExport";
interface WaitlistStats {
  total_subscribers: number;
  active_subscribers: number;
  unsubscribed: number;
  bounced: number;
  verified_emails: number;
  recent_subscribers: {
    today: number;
    week: number;
    month: number;
  };
  by_source: Record<string, number>;
}

const EmailWaitlistAdmin = () => {
  const selection = useBulkSelection<EmailSubscription>(rowId);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Authenticate with the signed-in admin's token (the page previously read an
  // `auth_token` key that nothing ever stored, so every request was anonymous).
  const token = user?.token;
  const adminService = useMemo(() => {
    const service = new AdminEmailService();
    if (token) service.setAuthToken(token);
    return service;
  }, [token]);

  const subscribersQuery = useQuery({
    queryKey: ["waitlist-subscribers", currentPage, searchTerm, statusFilter, sourceFilter, token],
    queryFn: async () => {
      const response = await adminService.getSubscribers({
        page: currentPage,
        per_page: 15,
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        source: sourceFilter !== "all" ? sourceFilter : undefined,
      });
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to load subscribers");
      }
      return response.data;
    },
    placeholderData: (previous) => previous,
  });

  const statsQuery = useQuery({
    queryKey: ["waitlist-stats", token],
    queryFn: async () => {
      const response = await adminService.getStats<WaitlistStats>();
      return response.success && response.data ? response.data : null;
    },
  });

  const subscribers = subscribersQuery.data?.data ?? [];
  const totalPages = subscribersQuery.data?.last_page ?? 1;
  const loading = subscribersQuery.isFetching && !subscribersQuery.data;
  const stats = statsQuery.data ?? null;

  useEffect(() => {
    if (!subscribersQuery.isError) return;
    toast({
      title: "Error",
      description: "Failed to load subscribers. Please check your authentication.",
      variant: "destructive",
    });
  }, [subscribersQuery.isError, toast]);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["waitlist-subscribers"] });
    void queryClient.invalidateQueries({ queryKey: ["waitlist-stats"] });
  };

  // Filter changes start again from the first page.
  const changeFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleDeleteSubscriber = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subscriber?')) {
      return;
    }

    try {
      const response = await adminService.deleteSubscriber(id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Subscriber deleted successfully",
        });
        refresh();
      } else {
        throw new Error(response.message || 'Failed to delete subscriber');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subscriber",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'unsubscribed': return 'secondary';
      case 'bounced': return 'destructive';
      default: return 'outline';
    }
  };

  const getSourceBadgeVariant = (source: string) => {
    switch (source) {
      case 'coming_soon': return 'default';
      case 'newsletter': return 'secondary';
      case 'social_media': return 'outline';
      default: return 'outline';
    }
  };

  const exportColumns: ExportColumn<EmailSubscription>[] = [
    { header: "Email", value: (s) => s.email, width: 32 },
    { header: "Name", value: (s) => s.name ?? "" },
    { header: "Phone", value: (s) => s.phone ?? "" },
    { header: "Source", value: (s) => s.source?.replace(/_/g, " ") ?? "" },
    { header: "Status", value: (s) => s.status },
    { header: "Verified", value: (s) => !!s.email_verified },
    { header: "Subscribed", value: (s) => s.subscribed_at ?? null, type: "datetime" },
  ];
  const fetchAllRows = () =>
    fetchAllPages<EmailSubscription>(async (page, per_page) => {
      const res = await adminService.getSubscribers({
        page,
        per_page,
        search: searchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        source: sourceFilter !== "all" ? sourceFilter : undefined,
      });
      return (res.data ?? { data: [] }) as never;
    });

  return (
    <div className="animate-fade-in">
      <BulkActionBar resource="waiting_list" selection={selection} describe={(s) => s.email} noun={["subscriber", "subscribers"]} onComplete={refresh}>
        <ExportMenu variant="bar" title="Waiting list" filename="waiting-list" columns={exportColumns} fetchAll={fetchAllRows} selected={selection.rows} />
      </BulkActionBar>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">
            Waiting List Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your email subscribers and view analytics
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_subscribers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.active_subscribers} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">This Week</CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.recent_subscribers.week}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.recent_subscribers.today} today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified Emails</CardTitle>
                <Badge variant="secondary" className="h-4">✓</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.verified_emails}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.verified_emails / stats.total_subscribers) * 100)}% verified
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.unsubscribed}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.bounced} bounced
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Subscriber Management</CardTitle>
            <CardDescription>
              Filter, search, and manage your email subscribers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => changeFilter(setSearchTerm)(e.target.value)}
                  className="w-64"
                />
              </div>

              <Select value={statusFilter} onValueChange={changeFilter(setStatusFilter)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                  <SelectItem value="bounced">Bounced</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sourceFilter} onValueChange={changeFilter(setSourceFilter)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="coming_soon">Coming Soon</SelectItem>
                  <SelectItem value="newsletter">Newsletter</SelectItem>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2 ml-auto">
                <Button onClick={refresh} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <ExportMenu title="Waiting list" filename="waiting-list" columns={exportColumns} fetchAll={fetchAllRows} selected={selection.rows} size="sm" />
              </div>
            </div>

            {/* Subscribers Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10"><SelectAllCheckbox selection={selection} rows={subscribers} /></TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Subscribed</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        Loading subscribers...
                      </TableCell>
                    </TableRow>
                  ) : subscribers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No subscribers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscribers.map((subscriber) => (
                      <TableRow key={subscriber.id} data-state={selection.isSelected(subscriber) ? "selected" : undefined}>
                        <TableCell className="w-10"><SelectRowCheckbox selection={selection} row={subscriber} label={`Select ${subscriber.email}`} /></TableCell>
                        <TableCell className="font-medium">{subscriber.email}</TableCell>
                        <TableCell>{subscriber.name || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={getSourceBadgeVariant(subscriber.source)}>
                            {subscriber.source.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(subscriber.status)}>
                            {subscriber.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {subscriber.email_verified ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">✓</Badge>
                          ) : (
                            <Badge variant="outline">-</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {new Date(subscriber.subscribed_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            onClick={() => handleDeleteSubscriber(subscriber.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                    disabled={currentPage <= 1}
                    variant="outline"
                    size="sm"
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                    disabled={currentPage >= totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailWaitlistAdmin;
