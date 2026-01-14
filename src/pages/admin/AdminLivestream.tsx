/**
 * Admin Live Streaming Management Page
 * 
 * Comprehensive admin dashboard for managing live streams with:
 * - List view with search, filters, and pagination
 * - Create/Edit functionality
 * - Stream details view (with video preview)
 * - Activate/Deactivate streams
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Radio,
  Play,
  Pause,
  Calendar,
  MonitorPlay,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import livestreamService, { Livestream, LivestreamQueryParams } from "@/services/livestream.service";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";

const AdminLivestream = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedStream, setSelectedStream] = useState<Livestream | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewStream, setViewStream] = useState<Livestream | null>(null);

  // Build query parameters
  const queryParams: LivestreamQueryParams = useMemo(() => {
    const params: LivestreamQueryParams = {
      page: currentPage,
      per_page: pageSize,
    };

    if (searchQuery) {
      params.search = searchQuery;
    }

    if (statusFilter !== "all") {
      params.is_live = statusFilter === "active";
    }

    return params;
  }, [currentPage, pageSize, searchQuery, statusFilter]);

  // Fetch livestreams
  const {
    data: streamsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ["livestreams", queryParams],
    queryFn: () => livestreamService.list(queryParams),
    placeholderData: (previousData) => previousData,
  });

  // Transform streams
  const streams: Livestream[] = useMemo(() => {
    if (!streamsData || !('data' in streamsData) || !streamsData.data) return [];
    return streamsData.data;
  }, [streamsData]);

  // Activate mutation
  const activateMutation = useMutation({
    mutationFn: (id: string) => livestreamService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["livestreams"] });
      toast({
        title: "Success",
        description: "Stream activated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to activate stream",
        variant: "destructive",
      });
    },
  });

  // Deactivate mutation
  const deactivateMutation = useMutation({
    mutationFn: (id: string) => livestreamService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["livestreams"] });
      toast({
        title: "Success",
        description: "Stream deactivated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to deactivate stream",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => livestreamService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["livestreams"] });
      toast({
        title: "Success",
        description: "Stream deleted successfully",
      });
      setIsDeleteOpen(false);
      setSelectedStream(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete stream",
        variant: "destructive",
      });
    },
  });

  const handleView = (stream: Livestream) => {
    setViewStream(stream);
    setIsViewOpen(true);
  };

  const handleEdit = (stream: Livestream) => {
    navigate(`/admin/livestream/${stream.id}/edit`);
  };

  const handleDelete = (stream: Livestream) => {
    setSelectedStream(stream);
    setIsDeleteOpen(true);
  };

  const handleCreate = () => {
    navigate("/admin/livestream/new");
  };

  const handleToggleActive = (stream: Livestream) => {
    if (stream.is_live) {
      deactivateMutation.mutate(stream.id);
    } else {
      activateMutation.mutate(stream.id);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedStream) {
      deleteMutation.mutate(selectedStream.id);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper to render preview content (reused logic from form but readonly)
  const renderPreviewContent = (stream: Livestream) => {
    if (stream.embed_html) {
      return <div dangerouslySetInnerHTML={{ __html: stream.embed_html }} className="aspect-video w-full rounded-md overflow-hidden bg-black" />;
    }

    if (stream.platform === 'youtube' && stream.platform_video_id) {
      return (
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${stream.platform_video_id}`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="aspect-video w-full rounded-md bg-black"
        ></iframe>
      );
    }

    if (stream.platform === 'vimeo' && stream.platform_video_id) {
      return (
        <iframe
          src={`https://player.vimeo.com/video/${stream.platform_video_id}`}
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="aspect-video w-full rounded-md bg-black"
        ></iframe>
      );
    }

    // Add other platforms if they have simple embed formats, otherwise default:
    return (
      <div className="aspect-video w-full rounded-md bg-muted flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
        <MonitorPlay className="h-12 w-12 mb-2 opacity-50" />
        <p>No preview available for this platform or configuration.</p>
        {(stream.platform !== 'others' && stream.platform_video_id) && (
          <p className="text-xs mt-2">ID: {stream.platform_video_id}</p>
        )}
      </div>
    );
  };

  // Pagination helpers
  const totalPages = (streamsData && 'last_page' in streamsData) ? streamsData.last_page : 1;
  const totalItems = (streamsData && 'total' in streamsData) ? streamsData.total : 0;
  const from = (streamsData && 'from' in streamsData) ? streamsData.from : 0;
  const to = (streamsData && 'to' in streamsData) ? streamsData.to : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Live Streaming</h1>
          <p className="text-muted-foreground mt-1">
            Manage live streams for Masses and events.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Stream
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search streams..."
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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

      {/* Streams Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Streams</CardTitle>
            {totalItems > 0 && (
              <span className="text-sm text-muted-foreground">
                Showing {from}-{to} of {totalItems} streams
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
              <h3 className="text-lg font-semibold mb-2">Error loading streams</h3>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "An unexpected error occurred"}
              </p>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["livestreams"] })}>
                Try Again
              </Button>
            </div>
          ) : streams.length === 0 ? (
            <GenericEmptyState
              title="No streams found"
              description={
                searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first live stream"
              }
              actionLabel="Create Stream"
              onAction={handleCreate}
              icon="video"
            />
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Video ID</TableHead>
                      <TableHead>Scheduled At</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[80px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {streams.map((stream) => (
                      <TableRow key={stream.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Radio className="h-4 w-4 text-muted-foreground" />
                            {stream.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize badge bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs font-medium">
                            {stream.platform}
                          </span>
                        </TableCell>
                        <TableCell>
                          {stream.platform_video_id ? (
                            <span className="font-mono text-xs text-muted-foreground">{stream.platform_video_id}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">Embed Code</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(stream.scheduled_start_time)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={stream.is_live ? "active" : "inactive"} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleView(stream)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Stream
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(stream)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleToggleActive(stream)}
                                disabled={activateMutation.isPending || deactivateMutation.isPending}
                              >
                                {stream.is_live ? (
                                  <>
                                    <Pause className="mr-2 h-4 w-4" />
                                    End Stream
                                  </>
                                ) : (
                                  <>
                                    <Play className="mr-2 h-4 w-4" />
                                    Start Stream
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(stream)}
                                className="text-destructive"
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
        title="Delete Stream"
        description="This action cannot be undone. This will permanently delete the stream."
        itemName={selectedStream?.title}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />

      {/* View Stream Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl w-[95vw] p-0 overflow-hidden bg-black border-none">
          <DialogHeader className="p-4 absolute z-10 w-full bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <DialogTitle className="text-white text-shadow">{viewStream?.title}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video w-full">
            {viewStream && renderPreviewContent(viewStream)}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLivestream;
