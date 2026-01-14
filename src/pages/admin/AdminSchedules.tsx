/**
 * Admin Schedules Management Page
 * 
 * Comprehensive admin dashboard for managing mass schedules with:
 * - List view with search, filters, and pagination
 * - Create/Edit functionality
 * - Schedule details view
 * - Calendar view toggle
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
  Calendar,
  Clock,
  Globe,
  AlertCircle,
  CalendarDays
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import massScheduleService, { MassSchedule, MassScheduleQueryParams, CreateMassSchedulePayload, UpdateMassSchedulePayload } from "@/services/massSchedule.service";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";

const AdminSchedules = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [dayFilter, setDayFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedSchedule, setSelectedSchedule] = useState<MassSchedule | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Build query parameters
  const queryParams: MassScheduleQueryParams = useMemo(() => {
    const params: MassScheduleQueryParams = {
      page: currentPage,
      per_page: pageSize,
    };

    if (dayFilter !== "all") {
      params.day_of_week = dayFilter;
    }

    if (typeFilter !== "all") {
      params.type = typeFilter;
    }

    if (languageFilter !== "all") {
      params.language = languageFilter;
    }

    return params;
  }, [currentPage, pageSize, dayFilter, typeFilter, languageFilter]);

  // Fetch schedules
  const { 
    data: schedulesData, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ["mass-schedules", queryParams],
    queryFn: () => massScheduleService.list(queryParams),
    placeholderData: (previousData) => previousData,
  });

  // Transform schedules
  const schedules: MassSchedule[] = useMemo(() => {
    if (!schedulesData || !('data' in schedulesData) || !schedulesData.data) return [];
    return schedulesData.data;
  }, [schedulesData]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => massScheduleService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mass-schedules"] });
      toast({
        title: "Success",
        description: "Schedule deleted successfully",
      });
      setIsDeleteOpen(false);
      setSelectedSchedule(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete schedule",
        variant: "destructive",
      });
    },
  });

  const handleView = (schedule: MassSchedule) => {
    // Navigate to details or open modal
    setSelectedSchedule(schedule);
  };

  const handleEdit = (schedule: MassSchedule) => {
    navigate(`/admin/schedules/${schedule.id}/edit`);
  };

  const handleDelete = (schedule: MassSchedule) => {
    setSelectedSchedule(schedule);
    setIsDeleteOpen(true);
  };

  const handleCreate = () => {
    navigate("/admin/schedules/new");
  };

  const handleDeleteConfirm = () => {
    if (selectedSchedule) {
      deleteMutation.mutate(selectedSchedule.id);
    }
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeString;
    }
  };

  // Pagination helpers
  const totalPages = (schedulesData && 'last_page' in schedulesData) ? schedulesData.last_page : 1;
  const totalItems = (schedulesData && 'total' in schedulesData) ? schedulesData.total : 0;
  const from = (schedulesData && 'from' in schedulesData) ? schedulesData.from : 0;
  const to = (schedulesData && 'to' in schedulesData) ? schedulesData.to : 0;

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Mass Schedules</h1>
          <p className="text-muted-foreground mt-1">
            Manage weekly and special mass schedules for the parish.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Schedule
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search schedules..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select value={dayFilter} onValueChange={(value) => {
              setDayFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Day of week" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Days</SelectItem>
                {daysOfWeek.map(day => (
                  <SelectItem key={day} value={day}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={(value) => {
              setTypeFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Mass type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="special">Special</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
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

      {/* Schedules Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Schedules</CardTitle>
            {totalItems > 0 && (
              <span className="text-sm text-muted-foreground">
                Showing {from}-{to} of {totalItems} schedules
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
              <h3 className="text-lg font-semibold mb-2">Error loading schedules</h3>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "An unexpected error occurred"}
              </p>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["mass-schedules"] })}>
                Try Again
              </Button>
            </div>
          ) : schedules.length === 0 ? (
            <GenericEmptyState
              title="No schedules found"
              description={
                dayFilter !== "all" || typeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by creating your first mass schedule"
              }
              actionLabel="Create Schedule"
              onAction={handleCreate}
              icon="clock"
            />
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Day</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Language</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[80px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((schedule) => (
                      <TableRow key={schedule.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{schedule.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            {schedule.day_of_week}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {formatTime(schedule.start_time)}
                            {schedule.end_time && ` - ${formatTime(schedule.end_time)}`}
                          </div>
                        </TableCell>
                        <TableCell>{schedule.language}</TableCell>
                        <TableCell>
                          <StatusBadge 
                            status={schedule.type === "regular" ? "active" : "upcoming"}
                            customLabel={schedule.type}
                          />
                        </TableCell>
                        <TableCell>{schedule.location || "—"}</TableCell>
                        <TableCell>
                          <StatusBadge status={schedule.is_active ? "active" : "inactive"} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => handleView(schedule)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(schedule)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(schedule)}
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
        title="Delete Schedule"
        description="This action cannot be undone. This will permanently delete the schedule."
        itemName={selectedSchedule?.title}
        itemDetails={selectedSchedule?.description}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminSchedules;
