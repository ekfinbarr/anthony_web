/**
 * Admin Groups (Ministries) Management Page
 * 
 * Comprehensive admin dashboard for managing parish groups/ministries with:
 * - List view with search, filters, and pagination
 * - Create/Edit functionality
 * - Group details view
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
  Users,
  UserCheck,
  AlertCircle,
  Download,
  FileText,
  FileSpreadsheet
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useToast } from "@/hooks/use-toast";
import ministryService, { Ministry, MinistryQueryParams, CreateMinistryPayload, UpdateMinistryPayload } from "@/services/ministry.service";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";

const AdminGroups = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State management
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [acceptingFilter, setAcceptingFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [selectedGroup, setSelectedGroup] = useState<Ministry | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Build query parameters
  const queryParams: MinistryQueryParams = useMemo(() => {
    const params: MinistryQueryParams = {
      page: currentPage,
      per_page: pageSize,
    };

    if (searchQuery) {
      params.search = searchQuery;
    }

    if (statusFilter !== "all") {
      params.is_active = statusFilter === "active";
    }

    if (acceptingFilter !== "all") {
      params.accepting_members = acceptingFilter === "accepting";
    }

    return params;
  }, [currentPage, pageSize, searchQuery, statusFilter, acceptingFilter]);

  // Fetch ministries/groups
  const {
    data: groupsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ["ministries", queryParams],
    queryFn: () => ministryService.list(queryParams),
    placeholderData: (previousData) => previousData,
  });

  // Transform groups
  const groups: Ministry[] = useMemo(() => {
    if (!groupsData || !('data' in groupsData) || !groupsData.data) return [];
    return groupsData.data;
  }, [groupsData]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => ministryService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ministries"] });
      toast({
        title: "Success",
        description: "Group deleted successfully",
      });
      setIsDeleteOpen(false);
      setSelectedGroup(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete group",
        variant: "destructive",
      });
    },
  });

  // Export Functions
  const fetchAllForExport = async () => {
    // Fetch all records based on current filters but without pagination limit (use high limit)
    const exportParams = { ...queryParams, per_page: 10000, page: 1 };
    const response = await ministryService.list(exportParams);
    return response.data || [];
  };

  const handleExportCSV = async () => {
    try {
      toast({ title: "Exporting", description: "Preparing CSV export..." });
      const data = await fetchAllForExport();

      if (!data.length) {
        toast({ title: "Warning", description: "No data to export", variant: "destructive" });
        return;
      }

      const headers = ["Name", "Category", "Status", "Members Accepting", "Leader", "Email", "Phone", "Meeting Location"];
      const csvContent = [
        headers.join(","),
        ...data.map(group => [
          `"${group.name.replace(/"/g, '""')}"`,
          `"${(group as any).category?.name || "Uncategorized"}"`,
          group.is_active ? "Active" : "Inactive",
          group.accepting_members ? "Yes" : "No",
          `"${(group as any).leader?.name || ""}"`,
          group.contact_email || "",
          group.contact_phone || "",
          `"${(group.meeting_location || "").replace(/"/g, '""')}"`
        ].join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `ministries_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      toast({ title: "Error", description: "Failed to export CSV", variant: "destructive" });
    }
  };

  const handleExportPDF = async () => {
    try {
      toast({ title: "Exporting", description: "Preparing PDF export..." });
      const data = await fetchAllForExport();

      if (!data.length) {
        toast({ title: "Warning", description: "No data to export", variant: "destructive" });
        return;
      }

      const doc = new jsPDF();

      doc.setFontSize(18);
      doc.text("Parish Ministries & Groups", 14, 22);

      doc.setFontSize(10);
      doc.text(`Exported on ${new Date().toLocaleDateString()}`, 14, 30);

      const tableData = data.map(group => [
        group.name,
        (group as any).category?.name || "Uncategorized",
        group.is_active ? "Active" : "Inactive",
        group.accepting_members ? "Yes" : "No",
        (group as any).leader?.name || "-"
      ]);

      autoTable(doc, {
        head: [['Name', 'Category', 'Status', 'Accepting', 'Leader']],
        body: tableData,
        startY: 40,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [66, 66, 66] }
      });

      doc.save(`ministries_export_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to export PDF", variant: "destructive" });
    }
  };

  const handleView = (group: Ministry) => {
    setSelectedGroup(group);
    navigate(`/admin/groups/${group.id}`);
  };

  const handleEdit = (group: Ministry) => {
    navigate(`/admin/groups/${group.id}/edit`);
  };

  const handleDelete = (group: Ministry) => {
    setSelectedGroup(group);
    setIsDeleteOpen(true);
  };

  const handleCreate = () => {
    navigate("/admin/groups/new");
  };

  const handleDeleteConfirm = () => {
    if (selectedGroup) {
      deleteMutation.mutate(selectedGroup.id);
    }
  };

  // Pagination helpers
  const totalPages = (groupsData && 'last_page' in groupsData) ? groupsData.last_page : 1;
  const totalItems = (groupsData && 'total' in groupsData) ? groupsData.total : 0;
  const from = (groupsData && 'from' in groupsData) ? groupsData.from : 0;
  const to = (groupsData && 'to' in groupsData) ? groupsData.to : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Groups & Ministries</h1>
          <p className="text-muted-foreground mt-1">
            Manage parish groups, ministries, and societies.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportCSV}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Export CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPDF}>
              <FileText className="mr-2 h-4 w-4" /> Export PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" /> New Group
        </Button>
      </div>
      {/* </div> */}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search groups..."
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
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={acceptingFilter} onValueChange={(value) => {
              setAcceptingFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Membership" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                <SelectItem value="accepting">Accepting Members</SelectItem>
                <SelectItem value="closed">Not Accepting</SelectItem>
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

      {/* Groups Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Groups</CardTitle>
            {totalItems > 0 && (
              <span className="text-sm text-muted-foreground">
                Showing {from}-{to} of {totalItems} groups
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
              <h3 className="text-lg font-semibold mb-2">Error loading groups</h3>
              <p className="text-muted-foreground mb-4">
                {error instanceof Error ? error.message : "An unexpected error occurred"}
              </p>
              <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["ministries"] })}>
                Try Again
              </Button>
            </div>
          ) : groups.length === 0 ? (
            <GenericEmptyState
              title="No groups found"
              description={
                searchQuery || statusFilter !== "all" || acceptingFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first group"
              }
              actionLabel="Create Group"
              onAction={handleCreate}
              icon="users"
            />
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Mission</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Membership</TableHead>
                      <TableHead className="w-[80px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.map((group) => (
                      <TableRow key={group.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {group.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {group.description || "—"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {group.mission || "—"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={group.is_active ? "active" : "inactive"} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {group.accepting_members ? (
                              <>
                                <UserCheck className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-green-600">Accepting</span>
                              </>
                            ) : (
                              <span className="text-sm text-muted-foreground">Closed</span>
                            )}
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
                              <DropdownMenuItem onClick={() => handleView(group)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(group)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleDelete(group)}
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
        title="Delete Group"
        description="This action cannot be undone. This will permanently delete the group."
        itemName={selectedGroup?.name}
        itemDetails={selectedGroup?.description}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />
    </div >
  );
};

export default AdminGroups;
