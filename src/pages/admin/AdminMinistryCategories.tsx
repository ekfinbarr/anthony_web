
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, MoreVertical, Edit, Trash2, FolderPlus } from "lucide-react";

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
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

import ministryCategoryService, { MinistryCategory } from "@/services/ministryCategory.service";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";

const AdminMinistryCategories = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<MinistryCategory | null>(null);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<MinistryCategory | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        is_active: true
    });

    const { data, isLoading } = useQuery({
        queryKey: ["ministry-categories", page, searchQuery],
        queryFn: () => ministryCategoryService.list({
            page,
            search: searchQuery || undefined
        }),
    });

    const createMutation = useMutation({
        mutationFn: ministryCategoryService.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ministry-categories"] });
            setIsFormOpen(false);
            resetForm();
            toast({ title: "Success", description: "Category created successfully" });
        },
        onError: () => toast({ title: "Error", description: "Failed to create category", variant: "destructive" })
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => ministryCategoryService.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ministry-categories"] });
            setIsFormOpen(false);
            resetForm();
            toast({ title: "Success", description: "Category updated successfully" });
        },
        onError: () => toast({ title: "Error", description: "Failed to update category", variant: "destructive" })
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => ministryCategoryService.remove(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ministry-categories"] });
            setDeleteOpen(false);
            setCategoryToDelete(null);
            toast({ title: "Success", description: "Category deleted successfully" });
        },
        onError: (error: any) => {
            // Handle "Cannot delete" specifically if possible
            const msg = error?.response?.data?.message || "Failed to delete category";
            toast({ title: "Error", description: msg, variant: "destructive" });
        }
    });

    const resetForm = () => {
        setFormData({ name: "", description: "", is_active: true });
        setEditingCategory(null);
    };

    const openCreateDialog = () => {
        resetForm();
        setIsFormOpen(true);
    };

    const openEditDialog = (category: MinistryCategory) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || "",
            is_active: category.is_active
        });
        setIsFormOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingCategory) {
            updateMutation.mutate({ id: editingCategory.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleDeleteClick = (category: MinistryCategory) => {
        setCategoryToDelete(category);
        setDeleteOpen(true);
    }

    const categories = data?.data || [];
    const meta = data?.meta;

    return (
        <div className="space-y-6 animate-fade-in p-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-foreground">Ministry Categories</h1>
                    <p className="text-muted-foreground">Manage categories for ministries and groups.</p>
                </div>
                <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" /> Add Category
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 space-y-0 pb-4">
                    <CardTitle>Categories</CardTitle>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search categories..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-2 py-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-muted/20 animate-pulse rounded" />)}
                        </div>
                    ) : categories.length === 0 ? (
                        <GenericEmptyState
                            icon="folder-plus"
                            title="No categories found"
                            description={searchQuery ? "Try adjusting your search" : "Create your first category to get started."}
                        />
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Slug</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.map((category) => (
                                        <TableRow key={category.id}>
                                            <TableCell className="font-medium">
                                                {category.name}
                                                {category.description && (
                                                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                        {category.description}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground font-mono text-xs">
                                                {category.slug}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={category.is_active ? "active" : "inactive"} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openEditDialog(category)}>
                                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(category)}>
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
                    )}

                    <div className="mt-4">
                        <AdminPagination
                            currentPage={page}
                            totalPages={meta?.last_page || 1}
                            onPageChange={setPage}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
                        <DialogDescription>
                            {editingCategory ? "Update category details." : "Create a new category for ministries."}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="e.g. Pious Societies"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Optional description"
                            />
                        </div>
                        <div className="flex items-center space-x-2 pt-2">
                            <Switch
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={c => setFormData({ ...formData, is_active: c })}
                            />
                            <Label htmlFor="is_active">Active Status</Label>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Category"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <DeleteConfirmModal
                open={deleteOpen}
                onOpenChange={setDeleteOpen}
                title="Delete Category"
                description="Are you sure you want to delete this category? This action cannot be undone."
                onConfirm={() => categoryToDelete && deleteMutation.mutate(categoryToDelete.id)}
                isLoading={deleteMutation.isPending}
                itemName={categoryToDelete?.name}
            />
        </div>
    );
};

export default AdminMinistryCategories;
