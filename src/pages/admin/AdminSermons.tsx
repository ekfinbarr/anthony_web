/**
 * Admin Sermons Management Page
 * 
 * Comprehensive admin dashboard for managing sermons with:
 * - List view with search, filters, and pagination
 * - Create/Edit functionality
 * - Sermon details view
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
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  BookOpen,
  Play,
  Calendar,
  User,
  AlertCircle,
  Clock,
  Mic2,
  Layers
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import sermonService, { Sermon, SermonQueryParams } from "@/services/sermon.service";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";
import { format } from "date-fns";

const AdminSermons = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Build query parameters
  const queryParams: SermonQueryParams = useMemo(() => {
    const params: SermonQueryParams = {
      page: currentPage,
      per_page: pageSize,
    };

    if (searchQuery) {
      params.search = searchQuery;
    }

    if (statusFilter === "published") {
      params.is_published = true;
    } else if (statusFilter === "draft") {
      params.is_published = false;
    } else if (statusFilter === "featured") {
      params.is_featured = true;
    }

    return params;
  }, [currentPage, pageSize, searchQuery, statusFilter]);

  // Fetch sermons
  const {
    data: sermonsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ["sermons", "admin-list", queryParams],
    queryFn: () => sermonService.list(queryParams),
    placeholderData: (previousData) => previousData,
  });

  // Transform sermons
  const sermons: Sermon[] = useMemo(() => {
    if (!sermonsData || !sermonsData.data) return [];
    return sermonsData.data;
  }, [sermonsData]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => sermonService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sermons"] });
      toast({
        title: "Success",
        description: "Sermon deleted successfully",
      });
      setIsDeleteOpen(false);
      setSelectedSermon(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete sermon",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (sermon: Sermon) => {
    navigate(`/admin/sermons/${sermon.id}/edit`);
  };

  const handleView = (sermon: Sermon) => {
    navigate(`/sermons/${sermon.slug}`);
  };

  const handleDelete = (sermon: Sermon) => {
    setSelectedSermon(sermon);
    setIsDeleteOpen(true);
  };

  const handleCreate = () => {
    navigate("/admin/sermons/new");
  };

  const handleDeleteConfirm = () => {
    if (selectedSermon) {
      deleteMutation.mutate(selectedSermon.id);
    }
  };

  // Pagination helpers
  const totalPages = sermonsData?.last_page || 1;
  const totalItems = sermonsData?.total || 0;
  const from = sermonsData?.from || 0;
  const to = sermonsData?.to || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Sermons Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage church sermons, series, and speakers.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Sermon
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, speaker, series..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
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

      {/* Sermons Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Sermons</CardTitle>
            {totalItems > 0 && (
              <span className="text-sm text-muted-foreground">
                Showing {from}-{to} of {totalItems} sermons
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
              <h3 className="text-lg font-semibold mb-2">Error loading sermons</h3>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "An unexpected error occurred"}
              </p>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["sermons"] })}>
                Try Again
              </Button>
            </div>
          ) : sermons.length === 0 ? (
            <GenericEmptyState
              title="No sermons found"
              description={
                searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first sermon"
              }
              actionLabel="New Sermon"
              onAction={handleCreate}
              icon="book"
            />
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sermon</TableHead>
                      <TableHead>Speaker & Series</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Stats</TableHead>
                      <TableHead className="w-[80px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sermons.map((sermon) => (
                      <TableRow key={sermon.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {sermon.thumbnail_url ? (
                              <img
                                src={sermon.thumbnail_url}
                                alt={sermon.title}
                                className="h-10 w-10 rounded object-cover border"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                <BookOpen className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                            <div className="max-w-[200px] truncate">
                              <div className="font-medium truncate" title={sermon.title}>{sermon.title}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" />
                                {sermon.duration || "N/A"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm flex items-center gap-1">
                              <Mic2 className="h-3 w-3 text-muted-foreground" />
                              {sermon.speaker}
                            </div>
                            {sermon.series && (
                              <div className="text-xs flex items-center gap-1 text-muted-foreground">
                                <Layers className="h-3 w-3" />
                                {sermon.series}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {sermon.preached_date ? format(new Date(sermon.preached_date), "MMM d, yyyy") : "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <StatusBadge
                              status={sermon.is_published ? "active" : "upcoming"}
                              customLabel={sermon.is_published ? "Published" : "Draft"}
                            />
                            {sermon.is_featured && (
                              <StatusBadge status="active" customLabel="Featured" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>{sermon.view_count || 0} views</div>
                            <div>{sermon.download_count || 0} downloads</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleView(sermon)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Publicly
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(sermon)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Sermon
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(sermon)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
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
        title="Delete Sermon"
        description="This action cannot be undone. This will permanently delete the sermon record and all its data."
        itemName={selectedSermon?.title}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminSermons;
