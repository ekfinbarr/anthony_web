/**
 * Admin Sermons Management Page
 *
 * List view with search, filters, pagination, inline publish/featured toggles,
 * stats cards, and delete confirmation.
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
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  BookOpen,
  AlertCircle,
  Clock,
  Mic2,
  Layers,
  Star,
  Eye as EyeIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import sermonService, { Sermon, SermonQueryParams } from "@/services/sermon.service";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";
import { IconTooltipButton } from "@/components/admin/shared/IconTooltipButton";
import { format } from "date-fns";

import { BulkActionBar, SelectAllCheckbox, SelectRowCheckbox } from "@/components/admin/data/BulkActionBar";
import { ExportMenu } from "@/components/admin/data/ExportMenu";
import { fetchAllPages } from "@/components/admin/data/fetchAllPages";
import { rowId, useBulkSelection } from "@/components/admin/data/useBulkSelection";
import type { ExportColumn } from "@/lib/export/tableExport";
const AdminSermons = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const selection = useBulkSelection<Sermon>(rowId);

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [seriesFilter, setSeriesFilter] = useState<string>("all");
  const [speakerFilter, setSpeakerFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedSermon, setSelectedSermon] = useState<Sermon | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const queryParams: SermonQueryParams = useMemo(() => {
    const params: SermonQueryParams = {
      page: currentPage,
      per_page: pageSize,
      sort: "preached_date",
      order: "desc",
    };

    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter === "published") params.is_published = true;
    else if (statusFilter === "draft") params.is_published = false;
    else if (statusFilter === "featured") params.is_featured = true;
    if (seriesFilter !== "all") params.series = seriesFilter;
    if (speakerFilter !== "all") params.speaker = speakerFilter;

    return params;
  }, [currentPage, pageSize, debouncedSearch, statusFilter, seriesFilter, speakerFilter]);

  const {
    data: sermonsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["sermons", "admin-list", queryParams],
    queryFn: () => sermonService.list(queryParams),
    placeholderData: (previousData) => previousData,
  });

  const { data: stats } = useQuery({
    queryKey: ["sermons", "stats"],
    queryFn: () => sermonService.getStats(),
  });

  const { data: seriesOptions = [] } = useQuery({
    queryKey: ["sermons", "series", "admin"],
    queryFn: () => sermonService.getSeries(),
  });

  const { data: speakerOptions = [] } = useQuery({
    queryKey: ["sermons", "speakers", "admin"],
    queryFn: () => sermonService.getSpeakers(),
  });

  const sermons: Sermon[] = useMemo(() => sermonsData?.data ?? [], [sermonsData]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sermonService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sermons"] });
      toast({ title: "Success", description: "Sermon deleted successfully" });
      setIsDeleteOpen(false);
      setSelectedSermon(null);
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message || "Failed to delete sermon",
        variant: "destructive",
      });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Pick<Sermon, "is_published" | "is_featured">>;
    }) => sermonService.update(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sermons"] });
    },
    onError: (err: Error) => {
      toast({
        title: "Error",
        description: err.message || "Failed to update sermon",
        variant: "destructive",
      });
      queryClient.invalidateQueries({ queryKey: ["sermons"] });
    },
  });

  const handleView = (sermon: Sermon) => {
    window.open(`/sermons?sermon=${encodeURIComponent(sermon.slug)}`, "_blank", "noopener,noreferrer");
  };

  const totalPages = sermonsData?.last_page || 1;
  const totalItems = sermonsData?.total || 0;
  const from = sermonsData?.from || 0;
  const to = sermonsData?.to || 0;

  const exportColumns: ExportColumn<Sermon>[] = [
    { header: "Title", value: (s) => s.title, width: 36 },
    { header: "Speaker", value: (s) => s.speaker },
    { header: "Series", value: (s) => s.series ?? "" },
    { header: "Scripture", value: (s) => s.scripture_reference ?? "" },
    { header: "Preached", value: (s) => s.preached_date ?? s.date ?? null, type: "date" },
    { header: "Published", value: (s) => !!s.is_published },
    { header: "Views", value: (s) => s.view_count ?? 0, type: "number", total: true },
    { header: "Downloads", value: (s) => s.download_count ?? 0, type: "number", total: true },
  ];
  const fetchAllRows = () => fetchAllPages<Sermon>((page, per_page) => sermonService.list({ ...queryParams, page, per_page }) as never);

  return (
    <div className="space-y-6 animate-fade-in">
      <BulkActionBar resource="sermons" selection={selection} describe={(sermon) => sermon.title} noun={["sermon", "sermons"]} onComplete={() => queryClient.invalidateQueries({ queryKey: ["sermons"] })}>
        <ExportMenu variant="bar" title="Sermons" filename="sermons" columns={exportColumns} fetchAll={fetchAllRows} selected={selection.rows} />
      </BulkActionBar>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Sermons Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage church sermons, series, and speakers.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ExportMenu title="Sermons" filename="sermons" columns={exportColumns} fetchAll={fetchAllRows} selected={selection.rows} />
          <Button onClick={() => navigate("/admin/sermons/new")} className="gap-2">
          <Plus className="h-4 w-4" /> New Sermon
        </Button>
        </div>
      </div>

      {stats ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-primary/10 p-2">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-semibold">{stats.total_sermons}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <EyeIcon className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Published</p>
                <p className="text-xl font-semibold">{stats.published_sermons ?? "—"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-amber-500/10 p-2">
                <Star className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Featured</p>
                <p className="text-xl font-semibold">{stats.featured_sermons ?? "—"}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-lg bg-sky-500/10 p-2">
                <Eye className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total views</p>
                <p className="text-xl font-semibold">{(stats.total_views ?? 0).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, speaker, series..."
                className="pl-9"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={seriesFilter}
              onValueChange={(value) => {
                setSeriesFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Series" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All series</SelectItem>
                {seriesOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={speakerFilter}
              onValueChange={(value) => {
                setSpeakerFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Speaker" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All speakers</SelectItem>
                {speakerOptions.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[140px]">
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
                debouncedSearch || statusFilter !== "all" || seriesFilter !== "all" || speakerFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first sermon"
              }
              actionLabel="New Sermon"
              onAction={() => navigate("/admin/sermons/new")}
              icon="book"
            />
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"><SelectAllCheckbox selection={selection} rows={sermons} /></TableHead>
                      <TableHead>Sermon</TableHead>
                      <TableHead>Speaker & Series</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Stats</TableHead>
                      <TableHead className="w-[80px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sermons.map((sermon) => (
                      <TableRow key={sermon.id} className="hover:bg-muted/50" data-state={selection.isSelected(sermon) ? "selected" : undefined}>
                        <TableCell className="w-10" onClick={(e) => e.stopPropagation()}><SelectRowCheckbox selection={selection} row={sermon} label={`Select ${sermon.title}`} /></TableCell>
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
                              <div className="font-medium truncate" title={sermon.title}>
                                {sermon.title}
                              </div>
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
                            {sermon.preached_date
                              ? format(new Date(sermon.preached_date), "MMM d, yyyy")
                              : "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={Boolean(sermon.is_published)}
                              disabled={toggleMutation.isPending}
                              onCheckedChange={(v) =>
                                toggleMutation.mutate({
                                  id: sermon.id,
                                  patch: { is_published: v },
                                })
                              }
                              aria-label={`Publish ${sermon.title}`}
                            />
                            <StatusBadge
                              status={sermon.is_published ? "active" : "upcoming"}
                              customLabel={sermon.is_published ? "Published" : "Draft"}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={Boolean(sermon.is_featured)}
                            disabled={toggleMutation.isPending}
                            onCheckedChange={(v) =>
                              toggleMutation.mutate({
                                id: sermon.id,
                                patch: { is_featured: v },
                              })
                            }
                            aria-label={`Feature ${sermon.title}`}
                          />
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
                              <IconTooltipButton label="Sermon actions">
                                <MoreVertical className="h-4 w-4" />
                              </IconTooltipButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleView(sermon)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Publicly
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => navigate(`/admin/sermons/${sermon.id}/edit`)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Sermon
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedSermon(sermon);
                                  setIsDeleteOpen(true);
                                }}
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
                          className={
                            currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;
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
                          onClick={() =>
                            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                          }
                          className={
                            currentPage === totalPages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
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

      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Sermon"
        description="This action cannot be undone. This will permanently delete the sermon record and all its data."
        itemName={selectedSermon?.title}
        onConfirm={() => {
          if (selectedSermon) deleteMutation.mutate(selectedSermon.id);
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminSermons;
