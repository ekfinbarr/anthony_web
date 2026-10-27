/**
 * Admin Leadership Management Page
 * 
 * Comprehensive admin dashboard for managing parish leadership with:
 * - List view with search, filters, and pagination
 * - Create/Edit functionality
 * - Leadership profile view
 * - Delete with confirmation
 * 
 * @package Lovable/src/pages/admin
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  User,
  Shield,
  AlertCircle,
  ExternalLink,
  MoveUp,
  MoveDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import leadershipService, { Leadership, LeadershipQueryParams } from "@/services/leadership.service";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";

import { BulkActionBar, SelectAllCheckbox, SelectRowCheckbox } from "@/components/admin/data/BulkActionBar";
import { ExportMenu } from "@/components/admin/data/ExportMenu";
import { fetchAllPages } from "@/components/admin/data/fetchAllPages";
import { rowId, useBulkSelection } from "@/components/admin/data/useBulkSelection";
import type { ExportColumn } from "@/lib/export/tableExport";
const AdminLeadership = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const selection = useBulkSelection<Leadership>(rowId);

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedLeader, setSelectedLeader] = useState<Leadership | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Build query parameters
  const queryParams: LeadershipQueryParams = useMemo(() => {
    const params: LeadershipQueryParams = {
      page: currentPage,
      per_page: pageSize,
    };

    if (searchQuery) {
      params.search = searchQuery;
    }

    return params;
  }, [currentPage, pageSize, searchQuery]);

  // Fetch leadership
  const {
    data: leadersData,
    isLoading,
    error
  } = useQuery({
    queryKey: ["leadership", queryParams],
    queryFn: () => leadershipService.list(queryParams),
    placeholderData: (previousData) => previousData,
  });

  // Transform leaders
  const leaders: Leadership[] = useMemo(() => {
    if (!leadersData || !('data' in leadersData) || !leadersData.data) return [];
    return leadersData.data;
  }, [leadersData]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => leadershipService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leadership"] });
      toast({
        title: "Success",
        description: "Leader removed successfully",
      });
      setIsDeleteOpen(false);
      setSelectedLeader(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove leader",
        variant: "destructive",
      });
    },
  });

  const handleView = (leader: Leadership) => {
    setSelectedLeader(leader);
  };

  const handleEdit = (leader: Leadership) => {
    navigate(`/admin/leadership/${leader.id}/edit`);
  };

  const handleDelete = (leader: Leadership) => {
    setSelectedLeader(leader);
    setIsDeleteOpen(true);
  };

  const handleCreate = () => {
    navigate("/admin/leadership/new");
  };

  const handleDeleteConfirm = () => {
    if (selectedLeader) {
      deleteMutation.mutate(selectedLeader.id);
    }
  };

  const updateOrderMutation = useMutation({
    mutationFn: (orders: { id: string, sort_order: number }[]) => leadershipService.updateOrder(orders),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leadership"] });
      toast({ title: "Success", description: "Sort order updated" });
    }
  });

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newLeaders = [...leaders];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newLeaders.length) return;

    [newLeaders[index], newLeaders[targetIndex]] = [newLeaders[targetIndex], newLeaders[index]];

    const orders = newLeaders.map((l, i) => ({ id: l.id, sort_order: i + 1 }));
    updateOrderMutation.mutate(orders);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Pagination helpers
  const paginated = leadersData && typeof leadersData === "object" ? leadersData as {
    last_page?: number;
    total?: number;
    from?: number;
    to?: number;
  } : null;
  const totalPages = paginated?.last_page ?? 1;
  const totalItems = paginated?.total ?? 0;
  const from = paginated?.from ?? 0;
  const to = paginated?.to ?? 0;

  const exportColumns: ExportColumn<Leadership>[] = [
    { header: "Name", value: (l) => l.name, width: 28 },
    { header: "Title", value: (l) => l.title ?? "" },
    { header: "Position", value: (l) => l.position ?? "" },
    { header: "Email", value: (l) => l.email ?? "" },
    { header: "Phone", value: (l) => l.phone ?? "" },
    { header: "Since", value: (l) => l.start_date ?? null, type: "date" },
    { header: "Active", value: (l) => !!l.is_active },
    { header: "On website", value: (l) => !!l.show_on_website },
  ];
  const fetchAllRows = () => fetchAllPages<Leadership>((page, per_page) => leadershipService.list({ ...queryParams, page, per_page }) as never);

  return (
    <div className="space-y-6 animate-fade-in">
      <BulkActionBar resource="leadership" selection={selection} describe={(leader) => leader.name} noun={["leader", "leaders"]} onComplete={() => queryClient.invalidateQueries({ queryKey: ["leadership"] })}>
        <ExportMenu variant="bar" title="Parish leadership" filename="leadership" columns={exportColumns} fetchAll={fetchAllRows} selected={selection.rows} />
      </BulkActionBar>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Leadership Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage parish priests, clergy, and leadership profiles.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportMenu title="Parish leadership" filename="leadership" columns={exportColumns} fetchAll={fetchAllRows} selected={selection.rows} />
          <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add Leader
        </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leaders by name, position or title..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select value={pageSize.toString()} onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
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

      {/* Leaders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Leaders</CardTitle>
            {totalItems > 0 && (
              <span className="text-sm text-muted-foreground">
                Showing {from}-{to} of {totalItems} leaders
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 flex-1" />
                  <Skeleton className="h-12 w-24" />
                  <Skeleton className="h-12 w-32" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error loading leaders</h3>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "An unexpected error occurred"}
              </p>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["leadership"] })}>
                Try Again
              </Button>
            </div>
          ) : leaders.length === 0 ? (
            <GenericEmptyState
              title="No leaders found"
              description={
                searchQuery
                  ? "Try adjusting your search"
                  : "Get started by adding your first leader"
              }
              actionLabel="Add Leader"
              onAction={handleCreate}
              icon="users"
            />
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"><SelectAllCheckbox selection={selection} rows={leaders} /></TableHead>
                      <TableHead className="w-[80px]">Order</TableHead>
                      <TableHead>Leader</TableHead>
                      <TableHead>Title & Position</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Website</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[80px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaders.map((leader, index) => (
                      <TableRow key={leader.id} className="hover:bg-muted/50" data-state={selection.isSelected(leader) ? "selected" : undefined}>
                        <TableCell className="w-10" onClick={(e) => e.stopPropagation()}><SelectRowCheckbox selection={selection} row={leader} label={`Select ${leader.name}`} /></TableCell>
                        <TableCell>
                          <div className="flex flex-col items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              disabled={index === 0}
                              onClick={() => handleMove(index, 'up')}
                            >
                              <MoveUp className="h-3 w-3" />
                            </Button>
                            <span className="text-xs font-mono">{leader.sort_order}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              disabled={index === leaders.length - 1}
                              onClick={() => handleMove(index, 'down')}
                            >
                              <MoveDown className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={leader.image_url} alt={leader.name} />
                              <AvatarFallback>{getInitials(leader.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{leader.name}</div>
                              <div className="text-xs text-muted-foreground">@{leader.slug}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <div className="text-sm font-medium">{leader.title}</div>
                            <div className="text-xs text-muted-foreground">{leader.position}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">{leader.email || "—"}</div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={leader.show_on_website ? "active" : "inactive"}
                            customLabel={leader.show_on_website ? "Visible" : "Hidden"}
                          />
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={leader.is_active ? "active" : "inactive"}
                            customLabel={leader.is_active ? "Active" : "Inactive"}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => window.open(`/about#leadership`, '_blank')}>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                View Publicly
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(leader)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(leader)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <PaginationItem key={pageNum}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNum)}
                              isActive={currentPage === pageNum}
                              className="cursor-pointer"
                            >
                              {pageNum}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Delete Modal */}
      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Remove Leader"
        description="This action cannot be undone. This will remove the leader from the leadership list."
        itemName={selectedLeader?.name}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminLeadership;
