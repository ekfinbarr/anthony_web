/**
 * Admin Gallery Management Page
 * 
 * Comprehensive admin dashboard for managing gallery media with:
 * - Grid/List view with search, filters, and pagination
 * - Media upload functionality
 * - Category management
 * - Delete with confirmation
 * 
 * @package Lovable/src/pages/admin
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Trash2, 
  Image as ImageIcon,
  Video,
  Grid,
  List,
  Upload,
  AlertCircle,
  FileImage
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import attachmentService, { Attachment, AttachmentQueryParams } from "@/services/attachment.service";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";
import GalleryUploadModal from "@/components/admin/gallery/GalleryUploadModal";

const AdminGallery = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedMedia, setSelectedMedia] = useState<Attachment | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  // Build query parameters
  const queryParams: AttachmentQueryParams = useMemo(() => {
    const params: AttachmentQueryParams = {
      page: currentPage,
      per_page: pageSize,
      related_type: "gallery",
    };

    if (searchQuery) {
      params.search = searchQuery;
    }

    if (typeFilter !== "all") {
      params.filetype = typeFilter;
    }

    return params;
  }, [currentPage, pageSize, searchQuery, typeFilter]);

  // Fetch gallery items
  const { 
    data: mediaData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ["attachments", "gallery", queryParams],
    queryFn: () => attachmentService.list(queryParams),
    placeholderData: (previousData) => previousData,
  });

  // Transform media
  const media: Attachment[] = useMemo(() => {
    if (!mediaData || !('data' in mediaData) || !mediaData.data) return [];
    return mediaData.data;
  }, [mediaData]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => attachmentService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", "gallery"] });
      toast({
        title: "Success",
        description: "Media deleted successfully",
      });
      setIsDeleteOpen(false);
      setSelectedMedia(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete media",
        variant: "destructive",
      });
    },
  });

  const handleView = (item: Attachment) => {
    window.open(item.filepath, '_blank');
  };

  const handleDelete = (item: Attachment) => {
    setSelectedMedia(item);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedMedia) {
      deleteMutation.mutate(selectedMedia.id);
    }
  };

  const isImage = (filetype: string) => {
    return filetype?.startsWith('image/');
  };

  const isVideo = (filetype: string) => {
    return filetype?.startsWith('video/');
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Pagination helpers
  const totalPages = (mediaData && 'last_page' in mediaData) ? mediaData.last_page : 1;
  const totalItems = (mediaData && 'total' in mediaData) ? mediaData.total : 0;
  const from = (mediaData && 'from' in mediaData) ? mediaData.from : 0;
  const to = (mediaData && 'to' in mediaData) ? mediaData.to : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Gallery Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage photos, videos, and media for the parish gallery.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsUploadOpen(true)} className="gap-2">
            <Upload className="h-4 w-4" /> Upload Media
          </Button>
          <div className="flex gap-2">
            <Button 
              variant={viewMode === "grid" ? "default" : "outline"} 
              size="icon" 
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === "table" ? "default" : "outline"} 
              size="icon" 
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
              </div>
            </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search media..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select value={typeFilter} onValueChange={(value) => {
              setTypeFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
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
                <SelectItem value="12">12 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="32">32 per page</SelectItem>
                <SelectItem value="48">48 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Media Grid/Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Media</CardTitle>
            {totalItems > 0 && (
              <span className="text-sm text-muted-foreground">
                Showing {from}-{to} of {totalItems} items
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(12)].map((_, i) => (
                  <Skeleton key={i} className="h-48 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-12 flex-1" />
                    <Skeleton className="h-12 w-24" />
                    <Skeleton className="h-12 w-32" />
                  </div>
                ))}
              </div>
            )
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error loading media</h3>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "An unexpected error occurred"}
              </p>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["attachments", "gallery"] })}>
                Try Again
              </Button>
            </div>
          ) : media.length === 0 ? (
            <GenericEmptyState
              title="No media found"
              description={
                searchQuery || typeFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by uploading your first media item"
              }
              actionLabel="Upload Media"
              onAction={() => setIsUploadOpen(true)}
              icon="image"
            />
          ) : viewMode === "grid" ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {media.map((item) => (
                  <Card key={item.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                    <div className="relative aspect-square bg-muted">
                      {isImage(item.filetype) ? (
                        <img
                          src={item.filepath}
                          alt={item.filename}
                          className="w-full h-full object-cover"
                        />
                      ) : isVideo(item.filetype) ? (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <Video className="h-12 w-12 text-muted-foreground" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <FileImage className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleView(item)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(item)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <p className="text-sm font-medium truncate">{item.filename}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(item.filesize)}</p>
                    </CardContent>
                  </Card>
                ))}
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
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Media</TableHead>
                      <TableHead>Filename</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="w-[80px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {media.map((item) => (
                      <TableRow key={item.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {isImage(item.filetype) ? (
                              <ImageIcon className="h-8 w-8 text-muted-foreground" />
                            ) : isVideo(item.filetype) ? (
                              <Video className="h-8 w-8 text-muted-foreground" />
                            ) : (
                              <FileImage className="h-8 w-8 text-muted-foreground" />
                            )}
                            <div>
                              <div className="font-medium text-sm">{item.filename}</div>
            </div>
                </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{item.filename}</TableCell>
                        <TableCell>{item.filetype || "—"}</TableCell>
                        <TableCell>{formatFileSize(item.filesize)}</TableCell>
                        <TableCell>
                          {new Date(item.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleView(item)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(item)}
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

      {/* Upload Modal */}
      <GalleryUploadModal
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Media"
        description="This action cannot be undone. This will permanently delete the media file."
        itemName={selectedMedia?.filename}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminGallery;
