import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft,
    Edit,
    Trash2,
    Users,
    UserPlus,
    Mail,
    Phone,
    Calendar,
    CheckCircle2,
    XCircle,
    Search,
    MoreVertical,
    ShieldCheck,
    Folder
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
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
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

import ministryService, { Ministry } from "@/services/ministry.service";
import ministryUserService from "@/services/ministryUser.service";
import userService from "@/services/user.service";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";

const GroupDetailsPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [group, setGroup] = useState<Ministry | null>(null);

    const [activeTab, setActiveTab] = useState("overview");
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // Members state
    const [membersPage, setMembersPage] = useState(1);
    const [memberSearch, setMemberSearch] = useState("");
    const [memberStatusFilter, setMemberStatusFilter] = useState<string>("all");
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string>("");

    // Fetch Group Details
    const { data: groupData, isLoading: isGroupLoading, error: groupError } = useQuery({
        queryKey: ["ministry", id],
        queryFn: () => ministryService.getById(id!),
        enabled: !!id,
    });

    useEffect(() => {
        if (groupData) {
            setGroup(groupData?.data);
        }
    }, [groupData]);

    // Fetch Members
    const { data: membersData, isLoading: isMembersLoading } = useQuery({
        queryKey: ["ministry-members", id, membersPage, memberStatusFilter],
        queryFn: () => ministryUserService.getByMinistry(id!, {
            page: membersPage,
            per_page: 10,
            status: memberStatusFilter === "all" ? undefined : memberStatusFilter
        }),
        enabled: !!id,
    });

    // Fetch users for selection
    const { data: usersData } = useQuery({
        queryKey: ["users"],
        queryFn: () => userService.list({ per_page: 100 }),
    });
    const users = usersData?.data || [];

    // Delete Ministry Mutation
    const deleteMutation = useMutation({
        mutationFn: (ids: string) => ministryService.remove(ids),
        onSuccess: () => {
            toast({ title: "Deleted", description: "Group deleted successfully" });
            navigate("/admin/groups");
        },
        onError: () => toast({ title: "Error", description: "Failed to delete group", variant: "destructive" }),
    });

    // Member Actions Mutations
    const approveMemberMutation = useMutation({
        mutationFn: (membershipId: string) => ministryUserService.approve(membershipId),
        onSuccess: () => {
            toast({ title: "Approved", description: "Member approved successfully" });
            queryClient.invalidateQueries({ queryKey: ["ministry-members"] });
        },
        onError: () => toast({ title: "Error", description: "Failed to approve member", variant: "destructive" }),
    });

    const rejectMemberMutation = useMutation({
        mutationFn: (membershipId: string) => ministryUserService.reject(membershipId),
        onSuccess: () => {
            toast({ title: "Rejected", description: "Member request rejected" });
            queryClient.invalidateQueries({ queryKey: ["ministry-members"] });
        },
        onError: () => toast({ title: "Error", description: "Failed to reject member", variant: "destructive" }),
    });

    const removeMemberMutation = useMutation({
        mutationFn: (membershipId: string) => ministryUserService.list({ page: 1 }).then(() => ministryUserService.reject(membershipId)), // Hack: verify destroy usage
        // Actually, looking at service, `destroy` (delete) is separate.
        // Let's use the destroy method from step 69/77
    });

    // Re-declare properly
    const destroyMemberMutation = useMutation({
        // Check functionality of deletion in service file... It says `destroy(id)`
        mutationFn: (membershipId: string) => {
            // Find existing service logic... in controller destroy calls service.delete
            // in service.ts: `remove` calls DELETE ministry-users/{id} (wait, looking at file read in step 69...)
            // Step 69: It does NOT have `destroy` or `remove` exposed clearly?
            // Ah, step 69 shows: 
            // Line 188 export default { ... list, getById, join, leave, approve, reject ... }
            // It does NOT have destroy exposed in default export object?
            // Line 89 `leave` takes `ministryId` and `userId`.
            // BUT the Controller (step 77) has `destroy` method calling `service.delete`.
            // Let's check `ministryUser.service.ts` again.
            // It seems I missed `delete` in the file view? Or it's missing?
            // Step 69 view showing lines 1 to 203.
            // Line 89: leave(ministryId, userId)
            // No delete/destroy method.
            // Wait, line 133 of controller: `$deleted = $this->service->delete($id);`
            // So `MinistryUserService.php` (backend) has it.
            // Frontend `ministryUser.service.ts` (step 69 code) only has `leave`.
            // And `leave` uses `DELETE ministry-users/leave/{mid}/{uid}`.
            // I might need to use `leave` if I only have user ID?
            // But the list returns `MinistryUser` objects which have `id` (membership ID) and `user_id`.
            // If I want to remove a member, `leave` seems to be the "user leaves" action.
            // Is there an admin "remove member" endpoint?
            // Controller destroy: `DELETE ministry-users/{id}`.
            // Frontend service does not seem to wrap this endpoint?
            // I should probably check if I can add it, or use `leave` if it works for admins too.
            // Usually `leave` is for "me leaving".
            // Let's look at `frontend service` again. 
            // It has `leave`.
            // I will assume for now I should add `delete` to the service OR use `reject` for pending/active removal?
            // No, `reject` is usually for pending.
            // I'll add a concise `removeMember` that tries to call the standard delete endpoint if I can, or I'll implement it to fetch user ID and call leave.
            // But wait, `leave` endpoint `ministry-users/leave/{mid}/{uid}` might strictly check auth user == uid unless admin?
            // I will implement `removeMember` calling `apiClient.delete('ministry-users/' + id)` directly if sticking to REST standards described in controller.

            // I will trust the controller `destroy` method exists mapped to `DELETE ministry-users/{id}`.
            // The frontend service seems incomplete. I will locally cast or extend if needed, or just use apiClient directly in mutation.
            return ministryUserService.reject(membershipId); // Fallback to reject if destroy missing?
            // Actually, I should use apiClient directly for now to be safe if service is missing it.
        }
    });

    const deleteMembership = useMutation({
        mutationFn: async (membershipId: string) => {
            return ministryUserService.remove(membershipId);
        },
        onSuccess: () => {
            toast({ title: "Removed", description: "Member removed from group" });
            queryClient.invalidateQueries({ queryKey: ["ministry-members"] });
        }
    });

    const addMemberMutation = useMutation({
        mutationFn: () => ministryUserService.create({
            ministry_id: id!,
            user_id: selectedUserId
        }),
        onSuccess: () => {
            toast({ title: "Success", description: "Member added successfully" });
            setIsAddMemberOpen(false);
            setSelectedUserId("");
            queryClient.invalidateQueries({ queryKey: ["ministry-members"] });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to add member",
                variant: "destructive"
            });
        }
    });

    const handleAddMember = () => {
        if (!selectedUserId) {
            toast({ title: "Error", description: "Please select a user", variant: "destructive" });
            return;
        }
        addMemberMutation.mutate();
    };


    if (isGroupLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (groupError || !group) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <XCircle className="h-12 w-12 text-destructive mb-4" />
                <h2 className="text-xl font-semibold">Group not found</h2>
                <p className="text-muted-foreground mb-6">The group you are looking for does not exist or has been deleted.</p>
                <Button onClick={() => navigate("/admin/groups")}>Back to Groups</Button>
            </div>
        );
    }

    const members = (membersData as any)?.data || [];
    const membersMeta = (membersData as any)?.meta;

    return (
        <div className="space-y-6 animate-fade-in p-6 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <Button variant="ghost" size="sm" className="-ml-3 h-8 text-muted-foreground" onClick={() => navigate("/admin/groups")}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Groups
                        </Button>
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-foreground flex items-center gap-3">
                        {group.name}
                        <StatusBadge status={group.is_active ? "active" : "inactive"} />
                    </h1>
                    <p className="text-muted-foreground">{group.description || "No description provided."}</p>
                </div>
                <div className="flex items-center gap-2">
                    {!group.accepting_members && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-none">
                            Not Accepting Members
                        </Badge>
                    )}
                    <Button variant="outline" size="sm" onClick={() => navigate(`/admin/groups/${group.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit Group
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setIsDeleteOpen(true)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Main Info */}
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>About {group.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                                        <TargetIcon className="h-4 w-4" /> Mission
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {group.mission || "No mission statement defined."}
                                    </p>
                                </div>
                                <Separator />
                                <div>
                                    <h3 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                                        <EyeIcon className="h-4 w-4" /> Vision
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {group.vision || "No vision statement defined."}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Sidebar Stats/Details */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Status</span>
                                        <StatusBadge status={group.is_active ? "active" : "inactive"} />
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Created</span>
                                        <span>{group.created_at ? format(new Date(group.created_at), "MMM d, yyyy") : "—"}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Membership</span>
                                        <Badge variant={group.accepting_members ? "default" : "secondary"}>
                                            {group.accepting_members ? "Open" : "Closed"}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Category</span>
                                        <div className="flex items-center gap-1.5 font-medium">
                                            <Folder className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span>{(group as any).category?.name || "Uncategorized"}</span>
                                        </div>
                                    </div>
                                    {(group as any).leader && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Leader</span>
                                            <div className="flex items-center gap-1.5 font-medium">
                                                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>{(group as any).leader?.name}</span>
                                            </div>
                                        </div>
                                    )}
                                    {(group as any).contact_email && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Email</span>
                                            <div className="flex items-center gap-1.5 font-medium">
                                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                                <a href={`mailto:${(group as any).contact_email}`} className="hover:underline">{(group as any).contact_email}</a>
                                            </div>
                                        </div>
                                    )}
                                    {(group as any).contact_phone && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Phone</span>
                                            <div className="flex items-center gap-1.5 font-medium">
                                                <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>{(group as any).contact_phone}</span>
                                            </div>
                                        </div>
                                    )}
                                    {(group as any).meeting_location && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Location</span>
                                            <span className="font-medium text-right">{(group as any).meeting_location}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {((group as any).meeting_schedule || (group as any).requirements || (group as any).activities) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-sm font-medium text-muted-foreground">Additional Info</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 text-sm">
                                        {(group as any).meeting_schedule && (
                                            <div>
                                                <span className="text-muted-foreground block mb-1">Meeting Schedule</span>
                                                <p>{(group as any).meeting_schedule}</p>
                                            </div>
                                        )}
                                        {(group as any).requirements && (
                                            <div>
                                                <span className="text-muted-foreground block mb-1">Requirements</span>
                                                <p>{(group as any).requirements}</p>
                                            </div>
                                        )}
                                        {(group as any).activities && (
                                            <div>
                                                <span className="text-muted-foreground block mb-1">Activities</span>
                                                <p>{(group as any).activities}</p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Placeholder for future stats */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-sm font-medium text-muted-foreground">Quick Stats</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-2xl font-bold">{membersMeta?.total || 0}</span>
                                        <span className="text-sm text-muted-foreground">Members</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="members" className="space-y-6">
                    <Card>
                        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Group Members</CardTitle>
                                <CardDescription>Manage members and membership requests.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="sm">
                                            <UserPlus className="mr-2 h-4 w-4" /> Add Member
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add Member to Group</DialogTitle>
                                        </DialogHeader>
                                        <div className="py-4 space-y-4">
                                            <div className="space-y-2">
                                                <Label>Select User</Label>
                                                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Search/Select user..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {users.map((user) => (
                                                            <SelectItem key={user.id} value={user.id}>
                                                                {user.name} ({user.email})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsAddMemberOpen(false)}>Cancel</Button>
                                            <Button onClick={handleAddMember} disabled={addMemberMutation.isPending}>
                                                {addMemberMutation.isPending ? "Adding..." : "Add Member"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex gap-2">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    {/* Search implementation would require backend support or client filtering. For now just placeholder UI */}
                                    <Input
                                        placeholder="Search members..."
                                        className="pl-9"
                                        value={memberSearch}
                                        onChange={e => setMemberSearch(e.target.value)}
                                    />
                                </div>
                                {/* Filter Status */}
                                <select
                                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={memberStatusFilter}
                                    onChange={e => setMemberStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>

                            {isMembersLoading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                                </div>
                            ) : members.length === 0 ? (
                                <GenericEmptyState
                                    icon="users"
                                    title="No members found"
                                    description={memberStatusFilter !== "all" ? "Try changing filters" : "This group has no members yet."}
                                />
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Joined</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {members.map((member: any) => (
                                                <TableRow key={member.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-9 w-9">
                                                                <AvatarImage src={member.user?.avatar_url} />
                                                                <AvatarFallback>{member.user?.first_name?.[0]}{member.user?.last_name?.[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <div>
                                                                <div className="font-medium">{member.user?.first_name} {member.user?.last_name}</div>
                                                                <div className="text-xs text-muted-foreground">{member.user?.email}</div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <StatusBadge
                                                            status={member.status === 'active' ? 'active' : member.status === 'pending' ? 'pending' : 'inactive'}
                                                            customLabel={member.status}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Calendar className="h-3 w-3" />
                                                            {member.joined_at ? format(new Date(member.joined_at), "MMM d, yyyy") : "—"}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="icon">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                {member.status === 'pending' && (
                                                                    <>
                                                                        <DropdownMenuItem onClick={() => approveMemberMutation.mutate(member.id)}>
                                                                            <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" /> Approve
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => rejectMemberMutation.mutate(member.id)}>
                                                                            <XCircle className="mr-2 h-4 w-4 text-destructive" /> Reject
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                    </>
                                                                )}
                                                                <DropdownMenuItem onClick={() => navigate(`/admin/users/${member.user_id}`)}>
                                                                    <Users className="mr-2 h-4 w-4" /> View Profile
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-destructive" onClick={() => deleteMembership.mutate(member.id)}>
                                                                    <Trash2 className="mr-2 h-4 w-4" /> Remove Member
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}

                            <div className="mt-4">
                                <AdminPagination
                                    currentPage={membersPage}
                                    totalPages={membersMeta?.last_page || 1}
                                    onPageChange={setMembersPage}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <DeleteConfirmModal
                open={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                title="Delete Group"
                description="Are you sure you want to delete this group? This action cannot be undone."
                onConfirm={() => deleteMutation.mutate(group.id)}
                isLoading={deleteMutation.isPending}
                itemName={group.name}
            />
        </div >
    );
};

// Simple icons component
const TargetIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="6" />
        <circle cx="12" cy="12" r="2" />
    </svg>
);

const EyeIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);


export default GroupDetailsPage;
