import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminEmailService, type EmailSubscription, type ApiResponse } from "@/services/emailService";
import { useToast } from "@/hooks/use-toast";
import { Users, Download, Trash2, RefreshCw, Search, Filter } from "lucide-react";

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
  const [subscribers, setSubscribers] = useState<EmailSubscription[]>([]);
  const [stats, setStats] = useState<WaitlistStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  // Keep a stable service instance so hooks can safely depend on it.
  const adminService = useMemo(() => new AdminEmailService(), []);

  // Set auth token if available (you would get this from your auth system)
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      adminService.setAuthToken(token);
    }
  }, [adminService]);

  const loadSubscribers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        per_page: 15,
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        source: sourceFilter !== 'all' ? sourceFilter : undefined,
      };

      const response: ApiResponse = await adminService.getSubscribers(params);
      
      if (response.success && response.data) {
        setSubscribers(response.data.data || []);
        setCurrentPage(response.data.current_page || 1);
        setTotalPages(response.data.last_page || 1);
      } else {
        throw new Error(response.message || 'Failed to load subscribers');
      }
    } catch (error) {
      console.error('Load subscribers error:', error);
      toast({
        title: "Error",
        description: "Failed to load subscribers. Please check your authentication.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [adminService, searchTerm, sourceFilter, statusFilter, toast]);

  const loadStats = useCallback(async () => {
    try {
      const response: ApiResponse = await adminService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Load stats error:', error);
    }
  }, [adminService]);

  useEffect(() => {
    loadSubscribers();
    loadStats();
  }, [loadSubscribers, loadStats]);

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
        loadSubscribers(currentPage);
        loadStats();
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

  const handleExportCSV = async () => {
    try {
      const response = await adminService.exportSubscribers({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        source: sourceFilter !== 'all' ? sourceFilter : undefined,
      });

      if (response.success && response.data) {
        const csvContent = "data:text/csv;charset=utf-8," 
          + "Email,Name,Phone,Source,Status,Subscribed At,Email Verified\n"
          + response.data.map((sub: EmailSubscription) => 
              `${sub.email},"${sub.name || ''}","${sub.phone || ''}",${sub.source},${sub.status},${sub.subscribed_at},${sub.email_verified ? 'Yes' : 'No'}`
            ).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `waitlist_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: "Success",
          description: `Exported ${response.data.length} subscribers to CSV`,
        });
      } else {
        throw new Error('Failed to export data');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export subscribers",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Waiting List Management
          </h1>
          <p className="text-gray-600">
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
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
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

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
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
                <Button onClick={() => loadSubscribers(currentPage)} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button onClick={handleExportCSV} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </div>

            {/* Subscribers Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
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
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading subscribers...
                      </TableCell>
                    </TableRow>
                  ) : subscribers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No subscribers found
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscribers.map((subscriber) => (
                      <TableRow key={subscriber.id}>
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
                    onClick={() => loadSubscribers(currentPage - 1)}
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
                    onClick={() => loadSubscribers(currentPage + 1)}
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
