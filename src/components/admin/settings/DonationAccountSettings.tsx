import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
    Plus,
    Pencil,
    Trash2,
    AlertCircle,
    Loader2,
    Church,
    Hammer,
    Heart,
    Calendar,
    Building2,
    Coins
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import donationAccountService, { DonationAccount } from "@/services/donationAccount.service";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";

/**
 * Purpose Configuration
 * 
 * Defines the visual identity and metadata for each donation account purpose.
 * Each purpose has a unique color scheme, icon, and description to help users
 * quickly identify and understand the account's intended use.
 */
const PURPOSE_CONFIG = {
    tithe: {
        label: "Tithe Offering",
        icon: Church,
        color: "bg-amber-500/10 text-amber-700 border-amber-200",
        badgeColor: "bg-amber-100 text-amber-800 hover:bg-amber-100",
        description: "10% of income offerings for ministry support"
    },
    building: {
        label: "Building & Renovation",
        icon: Hammer,
        color: "bg-blue-500/10 text-blue-700 border-blue-200",
        badgeColor: "bg-blue-100 text-blue-800 hover:bg-blue-100",
        description: "Church construction and renovation projects"
    },
    charity: {
        label: "Charity & Welfare",
        icon: Heart,
        color: "bg-rose-500/10 text-rose-700 border-rose-200",
        badgeColor: "bg-rose-100 text-rose-800 hover:bg-rose-100",
        description: "Helping the needy and community outreach"
    },
    daily: {
        label: "Daily Operations",
        icon: Calendar,
        color: "bg-green-500/10 text-green-700 border-green-200",
        badgeColor: "bg-green-100 text-green-800 hover:bg-green-100",
        description: "Regular church operations and expenses"
    },
    caritas: {
        label: "Caritas Lagos",
        icon: Building2,
        color: "bg-purple-500/10 text-purple-700 border-purple-200",
        badgeColor: "bg-purple-100 text-purple-800 hover:bg-purple-100",
        description: "Catholic charity organization programs"
    },
    general: {
        label: "General Donations",
        icon: Coins,
        color: "bg-gray-500/10 text-gray-700 border-gray-200",
        badgeColor: "bg-gray-100 text-gray-800 hover:bg-gray-100",
        description: "General offerings and miscellaneous"
    }
} as const;

type PurposeType = keyof typeof PURPOSE_CONFIG;

/**
 * DonationAccountSettings Component
 * 
 * Provides a comprehensive interface for managing church donation accounts.
 * Features include:
 * - Purpose-based categorization with color-coded UI
 * - Accordion view grouped by purpose for better organization
 * - Full CRUD operations (Create, Read, Update, Delete)
 * - Active/inactive status management
 * - Display order customization
 * 
 * @component
 */
export function DonationAccountSettings() {
    const { toast } = useToast();
    const qc = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<DonationAccount | null>(null);

    // Fetch all donation accounts
    const { data: accountsData, isLoading, error } = useQuery({
        queryKey: ["admin-donation-accounts"],
        queryFn: () => donationAccountService.listAll(),
    });

    const accounts = accountsData?.data ?? [];
    console.log('Accounts: ', accounts);

    /**
     * Group accounts by purpose for organized display
     * Returns a map of purpose -> accounts array
     */
    const groupedAccounts = useMemo(() => {
        const grouped: Record<PurposeType, DonationAccount[]> = {
            tithe: [],
            building: [],
            charity: [],
            daily: [],
            caritas: [],
            general: []
        };

        accounts.forEach(account => {
            console.log('Account: ', account);
            if (account.purpose in grouped) {
                grouped[account.purpose].push(account);
            }
        });

        // Sort accounts within each group by display_order
        Object.keys(grouped).forEach(purpose => {
            grouped[purpose as PurposeType].sort((a, b) => a.display_order - b.display_order);
        });

        return grouped;
    }, [accounts]);

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (vars: { id: string; data: Partial<DonationAccount> }) =>
            donationAccountService.update(vars.id, vars.data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-donation-accounts"] });
            toast({ title: "Success", description: "Donation account updated successfully" });
            setIsDialogOpen(false);
            setEditingAccount(null);
        },
        onError: (err: Error) => {
            toast({ title: "Error", description: err.message || "Failed to update account", variant: "destructive" });
        },
    });

    // Create mutation
    const createMutation = useMutation({
        mutationFn: (data: Partial<DonationAccount>) => donationAccountService.create(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-donation-accounts"] });
            toast({ title: "Success", description: "Donation account created successfully" });
            setIsDialogOpen(false);
        },
        onError: (err: Error) => {
            toast({ title: "Error", description: err.message || "Failed to create account", variant: "destructive" });
        },
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => donationAccountService.remove(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["admin-donation-accounts"] });
            toast({ title: "Deleted", description: "Donation account removed successfully" });
        },
        onError: (err: Error) => {
            toast({ title: "Error", description: err.message || "Failed to delete account", variant: "destructive" });
        },
    });

    /**
     * Handle form submission for create/update
     */
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name") as string,
            purpose: formData.get("purpose") as PurposeType,
            description: formData.get("description") as string,
            bank_name: formData.get("bank_name") as string,
            account_name: formData.get("account_name") as string,
            account_number: formData.get("account_number") as string,
            currency: formData.get("currency") as string,
            instructions: formData.get("instructions") as string,
            is_active: formData.get("is_active") === "on",
            display_order: parseInt(formData.get("display_order") as string) || 0,
        };

        if (editingAccount) {
            updateMutation.mutate({ id: editingAccount.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (account: DonationAccount) => {
        setEditingAccount(account);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingAccount(null);
        setIsDialogOpen(true);
    };

    const handleDelete = (account: DonationAccount) => {
        if (confirm(`Are you sure you want to delete "${account.name}"? This action cannot be undone.`)) {
            deleteMutation.mutate(account.id);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="p-8 text-center text-destructive">
                <AlertCircle className="mx-auto h-12 w-12 mb-4" />
                <p className="font-medium">Failed to load donation accounts</p>
                <p className="text-sm text-muted-foreground mt-2">Please try refreshing the page</p>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Bank Accounts by Purpose</CardTitle>
                <CardDescription>
                    <div className="flex items-center justify-between">
                        <div>Manage church bank accounts organized by donation purpose.</div>
                        <Button onClick={handleAdd} className="gap-2">
                            <Plus className="h-4 w-4" /> Add Account
                        </Button>
                    </div>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-6">

                    {/* Accounts grouped by purpose in accordion */}
                    <Accordion type="multiple" defaultValue={["tithe", "building", "charity"]} className="space-y-4">
                        {(Object.keys(PURPOSE_CONFIG) as PurposeType[]).map((purpose) => {
                            const config = PURPOSE_CONFIG[purpose];
                            const purposeAccounts = groupedAccounts[purpose];
                            const Icon = config.icon;

                            return (
                                <AccordionItem key={purpose} value={purpose} className="border rounded-lg">
                                    <AccordionTrigger className="px-4 hover:no-underline">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className={`p-2 rounded-lg ${config.color}`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{config.label}</span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {purposeAccounts.length} {purposeAccounts.length === 1 ? 'account' : 'accounts'}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        {purposeAccounts.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <Icon className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                                <p className="text-sm">No accounts configured for {config.label.toLowerCase()}</p>
                                                <Button variant="outline" size="sm" onClick={handleAdd} className="mt-3">
                                                    <Plus className="h-3 w-3 mr-1" /> Add First Account
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {purposeAccounts.map((account) => (
                                                    <Card key={account.id} className="transition-all hover:shadow-md">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div className="flex-1 space-y-2">
                                                                    <div className="flex items-center gap-2">
                                                                        <h4 className="font-medium">{account.name}</h4>
                                                                        <StatusBadge status={account.is_active ? "active" : "inactive"} />
                                                                    </div>
                                                                    {account.description && (
                                                                        <p className="text-sm text-muted-foreground">{account.description}</p>
                                                                    )}
                                                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                                                        <div>
                                                                            <span className="text-muted-foreground">Bank:</span>{" "}
                                                                            <span className="font-medium">{account.bank_name}</span>
                                                                        </div>
                                                                        <div>
                                                                            <span className="text-muted-foreground">Account:</span>{" "}
                                                                            <span className="font-medium font-mono">{account.account_number}</span>
                                                                        </div>
                                                                        <div className="col-span-2">
                                                                            <span className="text-muted-foreground">Name:</span>{" "}
                                                                            <span className="font-medium">{account.account_name}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-1">
                                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(account)}>
                                                                        <Pencil className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="text-destructive hover:text-destructive"
                                                                        onClick={() => handleDelete(account)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>

                    {/* Create/Edit Dialog */}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <form onSubmit={handleSubmit}>
                                <DialogHeader>
                                    <DialogTitle>{editingAccount ? "Edit Bank Account" : "Add Bank Account"}</DialogTitle>
                                    <DialogDescription>
                                        Enter the details for the church bank account. All fields marked with * are required.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    {/* Purpose Selection */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="purpose">
                                            Purpose Category <span className="text-destructive">*</span>
                                        </Label>
                                        <Select name="purpose" defaultValue={editingAccount?.purpose || "general"} required>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select purpose" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(Object.keys(PURPOSE_CONFIG) as PurposeType[]).map((purpose) => {
                                                    const config = PURPOSE_CONFIG[purpose];
                                                    const Icon = config.icon;
                                                    return (
                                                        <SelectItem key={purpose} value={purpose}>
                                                            <div className="flex items-center gap-2">
                                                                <Icon className="h-4 w-4" />
                                                                <span>{config.label}</span>
                                                            </div>
                                                        </SelectItem>
                                                    );
                                                })}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Account Name */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">
                                            Account Name <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            defaultValue={editingAccount?.name}
                                            required
                                            placeholder="e.g. Tithe Offering Account"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            name="description"
                                            defaultValue={editingAccount?.description || ""}
                                            placeholder="Brief description of this account's purpose"
                                            rows={2}
                                        />
                                    </div>

                                    {/* Bank Details */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="bank_name">
                                                Bank Name <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="bank_name"
                                                name="bank_name"
                                                defaultValue={editingAccount?.bank_name}
                                                required
                                                placeholder="e.g. Zenith Bank"
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="account_number">
                                                Account Number <span className="text-destructive">*</span>
                                            </Label>
                                            <Input
                                                id="account_number"
                                                name="account_number"
                                                defaultValue={editingAccount?.account_number}
                                                required
                                                placeholder="0123456789"
                                            />
                                        </div>
                                    </div>

                                    {/* Account Holder Name */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="account_name">
                                            Account Holder Name <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="account_name"
                                            name="account_name"
                                            defaultValue={editingAccount?.account_name}
                                            required
                                            placeholder="e.g. St. Anthony Catholic Church - Tithe"
                                        />
                                    </div>

                                    {/* Currency & Display Order */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="currency">Currency</Label>
                                            <Input id="currency" name="currency" defaultValue={editingAccount?.currency || "NGN"} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="display_order">Display Order</Label>
                                            <Input
                                                id="display_order"
                                                name="display_order"
                                                type="number"
                                                defaultValue={editingAccount?.display_order || 0}
                                            />
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="instructions">Special Instructions</Label>
                                        <Textarea
                                            id="instructions"
                                            name="instructions"
                                            defaultValue={editingAccount?.instructions || ""}
                                            placeholder="e.g. Please include your name in the transaction narration"
                                            rows={3}
                                        />
                                    </div>

                                    {/* Active Status */}
                                    <div className="flex items-center gap-2">
                                        <Switch id="is_active" name="is_active" defaultChecked={editingAccount ? editingAccount.is_active : true} />
                                        <Label htmlFor="is_active" className="cursor-pointer">
                                            Active (Visible to users)
                                        </Label>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                        {createMutation.isPending || updateMutation.isPending ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            "Save Account"
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    );
}
