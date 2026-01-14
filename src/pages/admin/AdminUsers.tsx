import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MoreVertical, Eye, Edit, Trash2, Plus, Phone, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";
import userService, { User } from "@/services/user.service";

const AdminUsers = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 350);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    is_active: true,
  });

  const queryParams = useMemo(() => {
    return {
      page: currentPage,
      per_page: pageSize,
      search: debouncedSearch || undefined,
      role: roleFilter === "all" ? undefined : roleFilter,
    };
  }, [currentPage, pageSize, debouncedSearch, roleFilter]);

  const listQuery = useQuery({
    queryKey: ["admin-users", queryParams],
    queryFn: () => userService.list(queryParams),
    placeholderData: (prev) => prev,
  });

  const users: User[] = useMemo(() => {
    const list = listQuery.data?.data ?? [];
    if (statusFilter === "all") return list;
    return list.filter((u) => {
      if (typeof u.is_active !== "boolean") return statusFilter === "active";
      return statusFilter === "active" ? u.is_active : !u.is_active;
    });
  }, [listQuery.data, statusFilter]);

  const derivedRoles = useMemo(() => {
    const names = new Set<string>();
    for (const u of listQuery.data?.data ?? []) {
      (u.roles ?? []).forEach((r) => names.add(r.name));
    }
    return Array.from(names).sort();
  }, [listQuery.data]);

  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: "", email: "", phone: "", password: "", is_active: true });
    setIsFormOpen(true);
  };

  const openEdit = (u: User) => {
    setEditingUser(u);
    setForm({
      name: u.name || "",
      email: u.email || "",
      phone: u.phone || "",
      password: "",
      is_active: typeof u.is_active === "boolean" ? u.is_active : true,
    });
    setIsFormOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: () =>
      userService.create({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || null,
        is_active: form.is_active,
      }),
    onSuccess: () => {
      toast({ title: "Created", description: "User created successfully." });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setIsFormOpen(false);
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to create user";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!editingUser) throw new Error("No user selected");
      return userService.update(editingUser.id, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        is_active: form.is_active,
      });
    },
    onSuccess: () => {
      toast({ title: "Updated", description: "User updated successfully." });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setIsFormOpen(false);
      setEditingUser(null);
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to update user";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.remove(id),
    onSuccess: () => {
      toast({ title: "Deleted", description: "User deleted successfully." });
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setIsDeleteOpen(false);
      setSelectedUser(null);
      setIsDetailsOpen(false);
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to delete user";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const totalPages = listQuery.data?.last_page ?? 1;
  const totalItems = listQuery.data?.total ?? 0;
  const from = listQuery.data?.from ?? 0;
  const to = listQuery.data?.to ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage parishioner accounts and access.</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" /> Add User
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-9"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {derivedRoles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                if (v === "all" || v === "active" || v === "suspended") {
                  setStatusFilter(v);
                  setCurrentPage(1);
                }
              }}
            >
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Page size" /></SelectTrigger>
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
            <CardTitle>Users</CardTitle>
            {totalItems > 0 ? (
              <span className="text-sm text-muted-foreground">
                Showing {from}-{to} of {totalItems}
              </span>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {listQuery.isLoading ? (
            <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : listQuery.error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error loading users</h3>
              <p className="text-muted-foreground mb-4">
                {listQuery.error instanceof Error ? listQuery.error.message : "An unexpected error occurred"}
              </p>
              <Button onClick={() => qc.invalidateQueries({ queryKey: ["admin-users"] })}>Try Again</Button>
            </div>
          ) : users.length === 0 ? (
            <GenericEmptyState
              title="No users found"
              description={debouncedSearch || roleFilter !== "all" || statusFilter !== "all" ? "Try adjusting your filters" : "Users will appear here"}
              icon="users"
              actionLabel="Add User"
              onAction={openCreate}
            />
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role(s)</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="w-[80px] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((u) => (
                      <TableRow key={u.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(u.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{u.name}</p>
                              <p className="text-sm text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {u.phone || "—"}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {(u.roles ?? []).length ? (u.roles ?? []).map((r) => r.name).join(", ") : "—"}
                        </TableCell>
                        <TableCell>
                          {typeof u.is_active === "boolean" ? (
                            <span className={u.is_active ? "text-green-600" : "text-muted-foreground"}>
                              {u.is_active ? "Active" : "Suspended"}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Active</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(u.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" aria-label="User actions">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(u);
                                  setIsDetailsOpen(true);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEdit(u)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedUser(u);
                                  setIsDeleteOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
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

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>{selectedUser ? selectedUser.email : "Select a user"}</DialogDescription>
          </DialogHeader>
          {selectedUser ? (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xl">{getInitials(selectedUser.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-xl font-semibold">{selectedUser.name}</div>
                  <div className="text-muted-foreground">{selectedUser.email}</div>
                  <div className="text-sm text-muted-foreground">{(selectedUser.roles ?? []).map((r) => r.name).join(", ") || "—"}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium">{selectedUser.phone || "—"}</div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="text-sm text-muted-foreground">Created</div>
                  <div className="font-medium">{new Date(selectedUser.created_at).toLocaleString()}</div>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setIsDetailsOpen(false); }}>
                  Close
                </Button>
                <Button onClick={() => openEdit(selectedUser)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button variant="destructive" onClick={() => setIsDeleteOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">No user selected.</div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Edit User" : "Create User"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Update user details." : "Create a new user account. Password is required for new users."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-1 md:col-span-2">
              <div className="text-sm font-medium">
                Name <span className="text-destructive">*</span>
              </div>
              <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <div className="text-sm font-medium">
                Email <span className="text-destructive">*</span>
              </div>
              <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-1 md:col-span-2">
              <div className="text-sm font-medium">Phone</div>
              <Input value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} />
            </div>
            {!editingUser ? (
              <div className="space-y-1 md:col-span-2">
                <div className="text-sm font-medium">
                  Password <span className="text-destructive">*</span>
                </div>
                <Input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
              </div>
            ) : null}
            <div className="flex items-center gap-3 md:col-span-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm((p) => ({ ...p, is_active: v }))} />
              <div>
                <div className="font-medium">Active</div>
                <div className="text-sm text-muted-foreground">Disable to suspend user access (if supported by backend).</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsFormOpen(false)} disabled={createMutation.isPending || updateMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!form.name.trim() || !form.email.trim()) {
                  toast({ title: "Validation", description: "Name and email are required.", variant: "destructive" });
                  return;
                }
                if (!editingUser && !form.password) {
                  toast({ title: "Validation", description: "Password is required for new users.", variant: "destructive" });
                  return;
                }
                if (editingUser) updateMutation.mutate();
                else createMutation.mutate();
              }}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete User"
        description="This action cannot be undone. This will permanently delete the user account."
        itemName={selectedUser?.name}
        itemDetails={selectedUser?.email}
        onConfirm={() => selectedUser && deleteMutation.mutate(selectedUser.id)}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminUsers;
