/**
 * Admin Events Management Page
 * 
 * Comprehensive admin dashboard for managing parish events with:
 * - List view with search, filters, and pagination
 * - Create/Edit functionality
 * - Event details view
 * - Approval workflow
 * - Delete with confirmation
 * - Calendar/List view toggle
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
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  Clock,
  Users,
  AlertCircle,
  Grid,
  List
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import eventService, { Event, EventQueryParams, CreateEventPayload, UpdateEventPayload } from "@/services/event.service";
import EventDetails from "@/components/admin/events/EventDetails";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import ApprovalWorkflowModal from "@/components/admin/shared/ApprovalWorkflowModal";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";

type EventStatus = "upcoming" | "ongoing" | "recurring" | "past" | "draft" | "pending" | "approved" | "rejected";

interface EventWithStatus extends Event {
  status: EventStatus;
}

const AdminEvents = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve");

  // Build query parameters
  const queryParams: EventQueryParams = useMemo(() => {
    const params: EventQueryParams = {
      page: currentPage,
      per_page: pageSize,
    };

    if (searchQuery) {
      params.search = searchQuery;
    }

    if (statusFilter !== "all") {
      if (statusFilter === "public") {
        params.is_public = true;
      } else if (statusFilter === "private") {
        params.is_public = false;
      }
    }

    // Date range filtering would be handled here
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (dateFilter === "today") {
        params.start_date = today.toISOString().split('T')[0];
        params.end_date = today.toISOString().split('T')[0];
      } else if (dateFilter === "upcoming") {
        params.start_date = today.toISOString().split('T')[0];
      } else if (dateFilter === "past") {
        params.end_date = today.toISOString().split('T')[0];
      }
    }

    return params;
  }, [currentPage, pageSize, searchQuery, statusFilter, dateFilter]);

  // Fetch events
  const {
    data: eventsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ["events", queryParams],
    queryFn: () => eventService.list(queryParams),
    placeholderData: (previousData) => previousData,
  });

  // Transform events with status
  const events: EventWithStatus[] = useMemo(() => {
    if (!eventsData || !('data' in eventsData) || !eventsData.data) return [];

    const now = new Date();

    return eventsData.data.map((event): EventWithStatus => {
      const startDate = new Date(event.start_date);
      const endDate = event.end_date ? new Date(event.end_date) : startDate;

      let status: EventStatus = "upcoming";

      if (startDate > now) {
        status = "upcoming";
      } else if (startDate <= now && endDate >= now) {
        status = "ongoing";
      } else if (endDate < now) {
        status = "past";
      }

      return {
        ...event,
        status,
      };
    });
  }, [eventsData]);

  // Update event mutation (for approval workflow)
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventPayload }) =>
      eventService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
      setSelectedEvent(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update event",
        variant: "destructive",
      });
    },
  });

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => eventService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      setIsDeleteOpen(false);
      setSelectedEvent(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete event",
        variant: "destructive",
      });
    },
  });

  // Handle actions
  const handleView = (event: Event) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  const handleEdit = (event: Event) => {
    navigate(`/admin/events/${event.id}/edit`);
  };

  const handleDelete = (event: Event) => {
    setSelectedEvent(event);
    setIsDeleteOpen(true);
  };

  const handleApprove = (event: Event) => {
    setSelectedEvent(event);
    setApprovalAction("approve");
    setIsApprovalOpen(true);
  };

  const handleReject = (event: Event) => {
    setSelectedEvent(event);
    setApprovalAction("reject");
    setIsApprovalOpen(true);
  };

  const handleCreate = () => {
    navigate("/admin/events/new");
  };

  const handleDeleteConfirm = () => {
    if (selectedEvent) {
      deleteMutation.mutate(selectedEvent.id);
    }
  };

  const handleApprovalSubmit = (comment?: string) => {
    if (!selectedEvent) return;

    // Note: Approval workflow would depend on backend implementation
    // This is a placeholder for the approval logic
    const updateData: UpdateEventPayload = {
      is_public: approvalAction === "approve",
    };

    updateMutation.mutate({ id: selectedEvent.id, data: updateData });
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Pagination helpers
  const totalPages = (eventsData && 'last_page' in eventsData) ? eventsData.last_page : 1;
  const totalItems = (eventsData && 'total' in eventsData) ? eventsData.total : 0;
  const from = (eventsData && 'from' in eventsData) ? eventsData.from : 0;
  const to = (eventsData && 'to' in eventsData) ? eventsData.to : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Events Management</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage parish events, celebrations, and activities.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Event
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events by name or location..."
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
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="past">Past</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={(value) => {
              setDateFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past Events</SelectItem>
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
            <div className="flex gap-2">
              <Button
                variant={viewMode === "table" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("table")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Table/Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Events</CardTitle>
            {totalItems > 0 && (
              <span className="text-sm text-muted-foreground">
                Showing {from}-{to} of {totalItems} events
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
              <h3 className="text-lg font-semibold mb-2">Error loading events</h3>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "An unexpected error occurred"}
              </p>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["events"] })}>
                Try Again
              </Button>
            </div>
          ) : events.length === 0 ? (
            <GenericEmptyState
              title="No events found"
              description={
                searchQuery || statusFilter !== "all" || dateFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first event"
              }
              actionLabel="Create Event"
              onAction={handleCreate}
              icon="calendar"
            />
          ) : viewMode === "table" ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Image</TableHead>
                      <TableHead className="w-[300px]">Event Name</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead className="w-[80px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id} className="hover:bg-muted/50">
                        <TableCell>
                          {event.image && (
                            <img
                              src={event.image as string}
                              alt={event.name}
                              className="w-12 h-12 object-cover rounded-lg border"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{event.name}</div>
                              {event.description && (
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {event.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {formatDateTime(event.start_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDateTime(event.end_date)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {event.location ? (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              {event.location}
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={event.status} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge
                            status={event.is_public ? "active" : "inactive"}
                            customLabel={event.is_public ? "Public" : "Private"}
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
                              <DropdownMenuItem onClick={() => handleView(event)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(event)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {event.status === "pending" && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => handleApprove(event)}
                                    className="text-green-600"
                                  >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Approve
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleReject(event)}
                                    className="text-destructive"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleDelete(event)}
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    {event.image && (
                      <img
                        src={event.image as string}
                        alt={event.name}
                        className="w-full h-64 object-cover rounded-lg border mb-4"
                      />
                    )}
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{event.name}</CardTitle>
                      <StatusBadge status={event.status} />
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                        {event.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(event.start_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(event.start_date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleView(event)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(event)}
                      >
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <EventDetails
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        event={selectedEvent}
        onEdit={() => {
          setIsDetailsOpen(false);
          if (selectedEvent) handleEdit(selectedEvent);
        }}
        onDelete={() => {
          setIsDetailsOpen(false);
          if (selectedEvent) handleDelete(selectedEvent);
        }}
      />

      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Event"
        description="This action cannot be undone. This will permanently delete the event and all associated data."
        itemName={selectedEvent?.name}
        itemDetails={selectedEvent?.description}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />

      <ApprovalWorkflowModal
        open={isApprovalOpen}
        onOpenChange={setIsApprovalOpen}
        itemTitle={selectedEvent?.name || ""}
        itemDetails={selectedEvent?.description}
        action={approvalAction}
        onSubmit={handleApprovalSubmit}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
};

export default AdminEvents;
