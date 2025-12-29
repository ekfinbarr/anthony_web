/**
 * Admin Posts Management Page
 * 
 * Comprehensive admin dashboard for managing blog posts with:
 * - List view with search, filters, and pagination
 * - Create/Edit functionality
 * - Post details view
 * - Approval workflow
 * - Delete with confirmation
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  CheckCircle2,
  XCircle,
  Calendar,
  User,
  FileText,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import postService, { Post, PostQueryParams, CreatePostPayload, UpdatePostPayload } from "@/services/post.service";
import PostDetails from "@/components/admin/posts/PostDetails";
import DeletePostModal from "@/components/admin/posts/DeletePostModal";
import ApprovalModal from "@/components/admin/posts/ApprovalModal";
import { PostStatusBadge } from "@/components/admin/posts/PostStatusBadge";
import { EmptyState } from "@/components/admin/posts/EmptyState";

type PostStatus = "draft" | "pending" | "approved" | "rejected" | "published";

interface PostWithStatus extends Post {
  status: PostStatus;
  author_name?: string;
}

const AdminPosts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [authorFilter, setAuthorFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve");

  // Build query parameters
  const queryParams: PostQueryParams = useMemo(() => {
    const params: PostQueryParams = {
      page: currentPage,
      per_page: pageSize,
    };

    if (searchQuery) {
      params.search = searchQuery;
    }

    if (statusFilter !== "all") {
      // Map status filter to published boolean
      if (statusFilter === "published") {
        params.published = true;
      } else if (statusFilter === "draft") {
        params.published = false;
      }
    }

    if (authorFilter !== "all" && user) {
      params.author_id = authorFilter === "me" ? user.id : authorFilter;
    }

    return params;
  }, [currentPage, pageSize, searchQuery, statusFilter, authorFilter, user]);

  // Fetch posts
  const { 
    data: postsData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ["posts", queryParams],
    queryFn: () => postService.list(queryParams),
    placeholderData: (previousData) => previousData,
  });

  // Transform posts with status
  const posts: PostWithStatus[] = useMemo(() => {
    if (!postsData || !('data' in postsData) || !postsData.data) return [];
    
    return postsData.data.map((post): PostWithStatus => {
      // Determine status based on published and archived flags
      let status: PostStatus = "draft";
      if (post.archived) {
        status = "rejected";
      } else if (post.published) {
        status = "published";
      } else {
        status = "draft";
      }

      return {
        ...post,
        status,
        author_name: "Author", // This would come from the API in a real implementation
      };
    });
  }, [postsData]);

  // Update post mutation (for approval workflow)
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostPayload }) => 
      postService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Success",
        description: "Post updated successfully",
      });
      setSelectedPost(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update post",
        variant: "destructive",
      });
    },
  });

  // Delete post mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => postService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      setIsDeleteOpen(false);
      setSelectedPost(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  // Handle actions
  const handleView = (post: Post) => {
    setSelectedPost(post);
    setIsDetailsOpen(true);
  };

  const handleEdit = (post: Post) => {
    navigate(`/admin/posts/${post.id}/edit`);
  };

  const handleDelete = (post: Post) => {
    setSelectedPost(post);
    setIsDeleteOpen(true);
  };

  const handleApprove = (post: Post) => {
    setSelectedPost(post);
    setApprovalAction("approve");
    setIsApprovalOpen(true);
  };

  const handleReject = (post: Post) => {
    setSelectedPost(post);
    setApprovalAction("reject");
    setIsApprovalOpen(true);
  };

  const handleCreate = () => {
    navigate("/admin/posts/new");
  };

  const handleDeleteConfirm = () => {
    if (selectedPost) {
      deleteMutation.mutate(selectedPost.id);
    }
  };

  const handleApprovalSubmit = (comment?: string) => {
    if (!selectedPost) return;

    const updateData: UpdatePostPayload = {
      published: approvalAction === "approve",
    };

    // Note: archived field may need to be handled separately via API
    updateMutation.mutate({ id: selectedPost.id, data: updateData });
    setIsApprovalOpen(false);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Pagination helpers
  const totalPages = (postsData && 'last_page' in postsData) ? postsData.last_page : 1;
  const totalItems = (postsData && 'total' in postsData) ? postsData.total : 0;
  const from = (postsData && 'from' in postsData) ? postsData.from : 0;
  const to = (postsData && 'to' in postsData) ? postsData.to : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Posts Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage blog posts, announcements, and content for your church.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Post
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts by title or content..."
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
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Posts</CardTitle>
            {totalItems > 0 && (
              <span className="text-sm text-muted-foreground">
                Showing {from}-{to} of {totalItems} posts
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
              <h3 className="text-lg font-semibold mb-2">Error loading posts</h3>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "An unexpected error occurred"}
              </p>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["posts"] })}>
                Try Again
              </Button>
            </div>
          ) : posts.length === 0 ? (
            <EmptyState
              title="No posts found"
              description={
                searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first post"
              }
              actionLabel="Create Post"
              onAction={handleCreate}
            />
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                      <TableHead className="w-[80px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {posts.map((post) => (
                      <TableRow key={post.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{post.title}</div>
                              {post.summary && (
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {post.summary}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{post.author_name || "Unknown"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <PostStatusBadge status={post.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(post.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDate(post.updated_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-sm font-medium">{post.views || 0}</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleView(post)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(post)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {post.status === "pending" && (
                                <>
                                  <DropdownMenuItem 
                                    onClick={() => handleApprove(post)}
                                    className="text-green-600"
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleReject(post)}
                                    className="text-destructive"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleDelete(post)}
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

      {/* Modals */}
      <PostDetails
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        post={selectedPost}
        onEdit={(post) => {
          setIsDetailsOpen(false);
          navigate(`/admin/posts/${post.id}/edit`);
        }}
        onDelete={() => {
          setIsDetailsOpen(false);
          handleDelete(selectedPost!);
        }}
      />

      <DeletePostModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        post={selectedPost}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />

      <ApprovalModal
        open={isApprovalOpen}
        onOpenChange={setIsApprovalOpen}
        post={selectedPost}
        action={approvalAction}
        onSubmit={handleApprovalSubmit}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
};

export default AdminPosts;
