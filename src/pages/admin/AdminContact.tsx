import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MoreVertical, Eye, Trash2, MailOpen, Reply, Phone, Calendar, AlertCircle, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import contactMessageService, {
  ContactMessage,
  ContactMessageStatus,
  ContactMessageType,
} from "@/services/contactMessage.service";

const AdminContact = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const [statusFilter, setStatusFilter] = useState<ContactMessageStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<ContactMessageType | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const queryParams = useMemo(() => {
    return {
      page: currentPage,
      per_page: pageSize,
      search: debouncedSearch || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      type: typeFilter === "all" ? undefined : typeFilter,
    };
  }, [currentPage, pageSize, debouncedSearch, statusFilter, typeFilter]);

  const listQuery = useQuery({
    queryKey: ["admin-contact-messages", queryParams],
    queryFn: () => contactMessageService.list(queryParams),
    placeholderData: (prev) => prev,
  });

  const statsQuery = useQuery({
    queryKey: ["admin-contact-messages-stats"],
    queryFn: () => contactMessageService.stats(),
  });

  const detailsQuery = useQuery({
    queryKey: ["admin-contact-message", selectedId],
    queryFn: () => contactMessageService.getById(selectedId!),
    enabled: Boolean(selectedId) && isDetailsOpen,
  });

  const selectedMessage: ContactMessage | null = detailsQuery.data?.data ?? null;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contactMessageService.remove(id),
    onSuccess: () => {
      toast({ title: "Deleted", description: "Message deleted successfully." });
      qc.invalidateQueries({ queryKey: ["admin-contact-messages"] });
      qc.invalidateQueries({ queryKey: ["admin-contact-messages-stats"] });
      setIsDeleteOpen(false);
      setIsDetailsOpen(false);
      setSelectedId(null);
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to delete message";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => contactMessageService.markRead(id),
    onSuccess: () => {
      toast({ title: "Updated", description: "Message marked as read." });
      qc.invalidateQueries({ queryKey: ["admin-contact-messages"] });
      qc.invalidateQueries({ queryKey: ["admin-contact-messages-stats"] });
      qc.invalidateQueries({ queryKey: ["admin-contact-message", selectedId] });
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to update message";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const replyMutation = useMutation({
    mutationFn: (args: { id: string; reply_message: string; reply_subject?: string }) =>
      contactMessageService.reply(args.id, { reply_message: args.reply_message, reply_subject: args.reply_subject }),
    onSuccess: () => {
      toast({ title: "Sent", description: "Reply sent successfully." });
      qc.invalidateQueries({ queryKey: ["admin-contact-messages"] });
      qc.invalidateQueries({ queryKey: ["admin-contact-messages-stats"] });
      qc.invalidateQueries({ queryKey: ["admin-contact-message", selectedId] });
      setIsReplyOpen(false);
      setReplyMessage("");
      setReplySubject("");
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to send reply";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const totalPages = listQuery.data?.last_page ?? 1;
  const totalItems = listQuery.data?.total ?? 0;
  const from = listQuery.data?.from ?? 0;
  const to = listQuery.data?.to ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Contact Messages</h1>
          <p className="text-muted-foreground mt-1">View and respond to messages from website visitors.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? <Skeleton className="h-8 w-16" /> : statsQuery.data?.data.total_messages ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {statsQuery.isLoading ? <Skeleton className="h-3 w-24" /> : `+${statsQuery.data?.data.recent.week ?? 0} this week`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? <Skeleton className="h-8 w-16" /> : statsQuery.data?.data.unread_count ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Replied</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? <Skeleton className="h-8 w-16" /> : statsQuery.data?.data.by_status?.replied ?? 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Response status</p>
          </CardContent>
        </Card>

        <Card>
            <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response (hrs)</CardTitle>
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">
              {statsQuery.isLoading ? <Skeleton className="h-8 w-16" /> : Math.round(statsQuery.data?.data.response_time?.avg_hours ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Based on replied messages</p>
            </CardContent>
          </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by sender, subject, or message..."
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
              onValueChange={(v) => {
                setStatusFilter(v as ContactMessageStatus | "all");
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={typeFilter}
              onValueChange={(v) => {
                setTypeFilter(v as ContactMessageType | "all");
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="prayer_request">Prayer Request</SelectItem>
                <SelectItem value="complaint">Complaint</SelectItem>
                <SelectItem value="suggestion">Suggestion</SelectItem>
                <SelectItem value="inquiry">Inquiry</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={pageSize.toString()}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setCurrentPage(1);
              }}
            >
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

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Messages</CardTitle>
            {totalItems > 0 ? (
              <span className="text-sm text-muted-foreground">
                Showing {from}-{to} of {totalItems}
              </span>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {listQuery.isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : listQuery.error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error loading messages</h3>
              <p className="text-muted-foreground mb-4">
                {listQuery.error instanceof Error ? listQuery.error.message : "An unexpected error occurred"}
              </p>
              <Button onClick={() => qc.invalidateQueries({ queryKey: ["admin-contact-messages"] })}>Try Again</Button>
            </div>
          ) : (listQuery.data?.data?.length ?? 0) === 0 ? (
            <GenericEmptyState
              title="No messages found"
              description={debouncedSearch || statusFilter !== "all" || typeFilter !== "all" ? "Try adjusting your filters" : "Messages will appear here"}
              icon="search"
            />
          ) : (
            <>
              <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sender</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
                      <TableHead>Received</TableHead>
                      <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
                    {(listQuery.data?.data ?? []).map((m) => (
                      <TableRow key={m.id} className={m.status === "new" ? "bg-muted/50" : "hover:bg-muted/50"}>
                <TableCell>
                  <div>
                            <div className="font-medium">{m.name}</div>
                            <div className="text-sm text-muted-foreground">{m.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                          <div className={m.status === "new" ? "font-semibold" : "font-medium"}>{m.subject || "—"}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[420px]">{m.message}</div>
                </TableCell>
                <TableCell>
                          <StatusBadge
                            status={
                              m.status === "replied"
                                ? "approved"
                                : m.status === "read"
                                ? "active"
                                : m.status === "archived"
                                ? "inactive"
                                : "pending"
                            }
                            customLabel={m.status}
                          />
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDateTime(m.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                  <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="Message actions">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedId(m.id);
                                  setIsDetailsOpen(true);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => markReadMutation.mutate(m.id)}>
                                <MailOpen className="mr-2 h-4 w-4" />
                                Mark as Read
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedId(m.id);
                                  setIsDetailsOpen(true);
                                  setIsReplyOpen(true);
                                  setReplySubject(m.subject || "");
                                }}
                              >
                                <Reply className="mr-2 h-4 w-4" />
                                Reply
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedId(m.id);
                                  setIsDeleteOpen(true);
                                }}
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

              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <AdminPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Details */}
      <Dialog
        open={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open);
          if (!open) setSelectedId(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject || "Message Details"}</DialogTitle>
            <DialogDescription>
              {selectedMessage ? `From ${selectedMessage.name} • ${selectedMessage.email}` : "Loading message..."}
            </DialogDescription>
          </DialogHeader>

          {detailsQuery.isLoading ? (
            <div className="space-y-3 py-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : selectedMessage ? (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold shrink-0">
                    {selectedMessage.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{selectedMessage.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{selectedMessage.email}</p>
                  </div>
                </div>
                <StatusBadge
                  status={
                    selectedMessage.status === "replied"
                      ? "approved"
                      : selectedMessage.status === "read"
                      ? "active"
                      : selectedMessage.status === "archived"
                      ? "inactive"
                      : "pending"
                  }
                  customLabel={selectedMessage.status}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                {selectedMessage.phone ? (
                  <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {selectedMessage.phone}
                </div>
                ) : null}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {formatDateTime(selectedMessage.created_at)}
                </div>
              </div>

              <div className="rounded-lg border bg-muted/40 p-4">
                <p className="whitespace-pre-wrap text-sm">{selectedMessage.message}</p>
              </div>

              {selectedMessage.admin_notes ? (
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium mb-2">Admin Notes</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{selectedMessage.admin_notes}</p>
                </div>
              ) : null}

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Button
                  className="flex-1 gap-2"
                  onClick={() => {
                    setIsReplyOpen(true);
                    setReplySubject(selectedMessage.subject || "");
                  }}
                >
                  <Reply className="h-4 w-4" /> Reply
                </Button>
                <Button
                  variant="outline"
                  onClick={() => markReadMutation.mutate(selectedMessage.id)}
                  disabled={markReadMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-2" /> Mark as Read
                </Button>
                <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">Message not found.</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply */}
      <Dialog open={isReplyOpen} onOpenChange={setIsReplyOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply</DialogTitle>
            <DialogDescription>{selectedMessage ? `Replying to ${selectedMessage.email}` : "Compose your reply"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <div className="text-sm font-medium">Subject</div>
              <Input value={replySubject} onChange={(e) => setReplySubject(e.target.value)} placeholder="(optional)" />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">
                Message <span className="text-destructive">*</span>
              </div>
              <Textarea value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} rows={8} placeholder="Write your reply..." />
              <div className="text-xs text-muted-foreground">{replyMessage.length} characters</div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsReplyOpen(false)} disabled={replyMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!selectedId) return;
                if (!replyMessage.trim()) {
                  toast({ title: "Validation", description: "Reply message is required.", variant: "destructive" });
                  return;
                }
                replyMutation.mutate({
                  id: selectedId,
                  reply_message: replyMessage.trim(),
                  reply_subject: replySubject.trim() || undefined,
                });
              }}
              disabled={replyMutation.isPending}
            >
              {replyMutation.isPending ? "Sending..." : "Send Reply"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Message"
        description="This action cannot be undone. This will permanently delete the message."
        itemName={selectedMessage?.subject || "Contact message"}
        itemDetails={selectedMessage ? `${selectedMessage.name} • ${selectedMessage.email}` : undefined}
        onConfirm={() => {
          if (selectedId) deleteMutation.mutate(selectedId);
        }}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminContact;
