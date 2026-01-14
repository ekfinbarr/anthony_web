/**
 * Admin Mass Booking Creation Page
 * 
 * dedicated page for creating mass bookings (guest flow).
 * Features:
 * - Comprehensive form with Zod validation
 * - Date and Time selection
 * - Mass Schedule selection
 * - Receipt generation and printing
 * 
 * @package Lovable/src/pages/admin
 */

import { useState, useEffect } from "react";
import { useForm, useWatch, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { Loader2, Calendar as CalendarIcon, Printer, CheckCircle2, ArrowLeft, Church, Save, Users, CreditCard, Receipt, FileInput, ImageIcon, X, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import massBookingService from "@/services/massBooking.service";
import massScheduleService, { MassSchedule } from "@/services/massSchedule.service";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Label } from "@radix-ui/react-label";
import userService from "@/services/user.service";
import MoneyInput, { MoneyCurrency } from "@/components/forms/MoneyInput";
import { DatePicker } from "@/components/ui/date-picker";
import { Separator } from "@/components/ui/separator";
import { Avatar } from "@/components/ui/avatar";
import AttachmentUploadModal from "@/components/attachments/AttachmentUploadModal";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";

// Schema Validation
const formSchema = z.object({
    schedule_type: z.enum(["multiple", "single", "recurring"]).default("single"),
    user_id: z.string().optional(),
    mode: z.enum(["parishioner", "guest"]).default("parishioner"),
    mass_schedule_id: z.string().min(1, "Please select a mass schedule"),
    booking_date: z.date(),
    intention: z.string().min(5, "Intention must be at least 5 characters"),
    offered_by: z.string().optional(),
    guest_name: z.string().min(2, "Donor name is required").optional().or(z.literal('')),
    guest_email: z.string().email("Invalid email address").optional().or(z.literal('')),
    guest_phone: z.string().optional(),
    payment_status: z.enum(["pending", "paid", "cancelled"]).default("pending"),
    payment_evidence: z.string().optional(),
    payment_date: z.date().optional(),
    amount: z.number().nullable().optional(),
    currency: z.enum(["NGN", "USD", "EUR", "GBP"]).default("NGN"),
    multipleBookings: z.array(z.object({
        booking_date: z.date(),
        mass_schedule_id: z.string().min(1, "Please select a mass schedule"),
    })).optional(),
}).superRefine((data, ctx) => {
    if (data.mode === 'guest') {
        if (!data.guest_name || data.guest_name.length < 2) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Guest name is required",
                path: ["guest_name"],
            });
        }
    } else {
        if (!data.user_id) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please select a parishioner",
                path: ["user_id"],
            });
        }
    }
});

type FormValues = z.infer<typeof formSchema>;

// Internal component for the Receipt Preview
const ReceiptPreview = ({ control, schedules }: { control: Control<FormValues>, schedules: MassSchedule[] }) => {

    const queryClient = useQueryClient();
    // Fetch users for parishioner selection
    const { data: usersData } = useQuery({
        queryKey: ["users"],
        queryFn: () => userService.list({ per_page: 1000 }),
    });
    const parishioners = usersData?.data || [];
    const values = useWatch({ control });
    const selectedSchedule = schedules.find(s => s.id === values.mass_schedule_id);

    // Formatting helper
    const fmtMoney = (val: number | null | undefined, cur: string) => {
        if (val == null) return "0.00";
        return new Intl.NumberFormat("en-NG", { style: "currency", currency: cur }).format(val);
    };

    return (
        <div className="bg-white text-black font-mono text-sm p-6 shadow-md border rounded-sm relative overflow-hidden">
            {/* Jagged edge effect (top and bottom) - purely decorative CSS could go here */}
            <div className="text-center mb-6 border-b-2 border-dashed border-black/20 pb-4">
                <Church className="h-8 w-8 mx-auto mb-2 opacity-80" />
                <h3 className="font-bold text-lg uppercase tracking-wider">Mass Receipt</h3>
                <p className="text-xs text-muted-foreground">PREVIEW ONLY</p>
            </div>

            <div className="space-y-4">
                {/* Booking Date */}
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-semibold">{values.booking_date ? format(values.booking_date, "PP") : "---"}</span>
                </div>
                {/* Schedule Type */}
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Schedule Type:</span>
                    <span className="font-semibold">{values.schedule_type}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Schedules:</span>
                    {values.schedule_type === 'single' && (
                        <span className="font-semibold">{selectedSchedule ? `${selectedSchedule.title} — ${selectedSchedule.day_of_week} ${selectedSchedule.start_time}` : "---"}</span>
                    )}
                    {values.schedule_type === 'multiple' && (
                        <span className="font-semibold">{values?.multipleBookings?.map((booking: any) => booking?.booking_date ? format(booking?.booking_date, "dd/MM/yyyy") : "---").join(", ")}</span>
                    )}
                </div>

                <div className="border-t border-dashed border-black/20 my-4" />

                <div className="space-y-1">
                    <span className="text-muted-foreground text-xs uppercase">Intention</span>
                    <p className="font-medium break-words leading-tight">{values.intention || "(Intention...)"}</p>
                </div>

                <div className="space-y-1 mt-3">
                    <span className="text-muted-foreground text-xs uppercase">Requested By</span>
                    {values.mode === 'parishioner' ? (
                        <p className="font-medium truncate">{values.user_id ?
                            `${parishioners?.find(p => p.id === values.user_id)?.name}` : "(Select Parishioner)"}</p>
                    ) : (
                        <p className="font-medium truncate">{values.guest_name || "(Guest Name)"}</p>
                    )}
                </div>

                <div className="border-t-2 border-black my-4" />

                <div className="flex justify-between items-end">
                    <span className="font-bold text-lg">TOTAL</span>
                    <span className="font-bold text-xl">{fmtMoney(values.amount, values.currency)}</span>
                </div>
                <div className="text-center mt-6 pt-4 border-t border-dashed border-black/20">
                    <p className="text-xs text-muted-foreground">Thank you for your offering.</p>
                </div>
            </div>
        </div>
    );
};

const MassBookingFormPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [successData, setSuccessData] = useState<any | null>(null);
    const isEditMode = !!id;
    // Shared open states for the reusable upload modal.
    const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [draftAttachmentGroupId] = useState(() => `mass-booking-draft-${Date.now()}`);

    const [multipleBookings, setMultipleBookings] = useState<any[]>([
        {
            booking_date: new Date(),
            mass_schedule_id: "",
        }
    ]);

    const removeImage = () => {
        form.setValue("payment_evidence", "");
        setImagePreview(null);
    };

    // Fetch users for parishioner selection
    const { data: usersData } = useQuery({
        queryKey: ["users"],
        queryFn: () => userService.list({ per_page: 1000 }),
    });
    const parishioners = usersData?.data || [];

    // Fetch mass booking if editing
    const { data: massBooking } = useQuery({
        queryKey: ["mass-booking", id],
        queryFn: () => massBookingService.getAdminById(id!),
        enabled: isEditMode && !!id,
    });

    // Fetch Schedules
    const { data: schedulesData } = useQuery({
        queryKey: ["mass-schedules-for-booking"],
        queryFn: () => massScheduleService.list({ per_page: 100, booking_required: true }),
    });
    const schedules = schedulesData?.data || [];

    // Form initialization
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            mode: "parishioner",
            mass_schedule_id: "",
            booking_date: new Date(),
            intention: "",
            offered_by: "",
            guest_name: "",
            guest_email: "",
            guest_phone: "",
            payment_status: "pending",
            payment_evidence: "",
            payment_date: new Date(),
            amount: null,
            currency: "NGN",
            user_id: "",
            schedule_type: "single",
            multipleBookings: [
                {
                    booking_date: new Date(),
                    mass_schedule_id: "",
                }
            ],
        },
    });

    // Populate form on edit
    useEffect(() => {
        if (isEditMode && massBooking) {
            form.reset({
                mode: massBooking.mode as "parishioner" | "guest",
                mass_schedule_id: massBooking.mass_schedule_id,
                booking_date: new Date(massBooking.booking_date),
                intention: massBooking.intention,
                offered_by: massBooking.offered_by,
                guest_name: massBooking.guest_name,
                guest_email: massBooking.guest_email,
                guest_phone: massBooking.guest_phone,
                payment_status: massBooking.payment_status as "pending" | "paid" | "cancelled",
                payment_evidence: massBooking.payment_evidence,
                payment_date: new Date(massBooking.payment_date),
                amount: massBooking.amount ? Number(massBooking.amount) : null,
                currency: (massBooking.currency as "NGN" | "USD" | "EUR" | "GBP") || "NGN",
                user_id: massBooking.user_id,
                schedule_type: massBooking.schedule_type as "multiple" | "single" | "recurring",
            });
        }
    }, [massBooking, isEditMode, form]);

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: async (data: FormValues) => {
            const formattedDate = format(data.booking_date, "yyyy-MM-dd");
            return massBookingService.createGuest(data.mass_schedule_id, {
                booking_date: formattedDate,
                intention: data.intention,
                offered_by: data.offered_by || undefined,
                guest_name: data.mode === 'guest' ? data.guest_name : undefined,
                guest_email: data.mode === 'guest' ? data.guest_email : undefined,
                guest_phone: data.mode === 'guest' ? data.guest_phone : undefined,
                user_id: data.mode === 'parishioner' ? data.user_id : undefined,
                // Pass extra fields if backend accepts them, otherwise they'll be ignored or need backend update
                // payment_status: data.payment_status, 
                // amount: data.amount,
                // currency: data.currency
            });
        },
        onSuccess: (response, variables) => {
            toast({
                title: "Booking Created",
                description: "The mass booking has been successfully recorded.",
            });
            queryClient.invalidateQueries({ queryKey: ["admin-mass-bookings"] });

            // Set success data for receipt view
            setSuccessData({
                ...response.data,
                schedule_title: schedules.find(s => s.id === variables.mass_schedule_id)?.title,
                schedule_time: schedules.find(s => s.id === variables.mass_schedule_id)?.start_time,
                amount: variables.amount,
                currency: variables.currency,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "Error",
                description: error.message || "Failed to create booking",
                variant: "destructive",
            });
        },
    });

    const onSubmit = (data: FormValues) => {
        createMutation.mutate(data);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleReset = () => {
        setSuccessData(null);
        form.reset({
            schedule_type: "single",
            mode: "parishioner",
            mass_schedule_id: "",
            booking_date: new Date(),
            intention: "",
            offered_by: "",
            guest_name: "",
            guest_email: "",
            guest_phone: "",
            payment_status: "pending",
            payment_evidence: "",
            payment_date: new Date(),
            amount: null,
            currency: "NGN",
            user_id: "",
            multipleBookings: [
                {
                    booking_date: new Date(),
                    mass_schedule_id: "",
                }
            ],
        });
    };

    if (successData) {
        return (
            <div className="max-w-3xl mx-auto space-y-6 animate-fade-in p-6">
                {/* No-print controls */}
                <div className="flex items-center justify-between print:hidden">
                    <Button variant="outline" onClick={handleReset} className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Create Another
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate("/admin/mass-bookings")}>
                            Go to List
                        </Button>
                        <Button onClick={handlePrint} className="gap-2">
                            <Printer className="h-4 w-4" /> Print Receipt
                        </Button>
                    </div>
                </div>

                {/* Receipt Card */}
                <Card className="border-2 print:border-2 print:shadow-none print:w-full print:absolute print:inset-0 print:m-0">
                    <CardHeader className="text-center border-b pb-6">
                        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4 print:hidden">
                            <CheckCircle2 className="h-12 w-12 text-primary" />
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Church className="h-6 w-6" />
                            <CardTitle className="text-2xl font-bold">Mass Booking Receipt</CardTitle>
                        </div>
                        <CardDescription className="text-base">
                            Reference: <span className="font-mono font-bold text-foreground">{successData.reference}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Date Issued</span>
                                <p className="font-medium">{format(new Date(), "PPP")}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <span className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Status</span>
                                <p className="font-medium capitalize">{successData.status}</p>
                            </div>
                        </div>

                        <div className="border rounded-lg p-6 bg-muted/30 print:bg-transparent print:border">
                            <h3 className="font-semibold mb-4 text-lg border-b pb-2">Booking Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
                                <div>
                                    <span className="text-sm text-muted-foreground">Mass Schedule</span>
                                    <p className="font-medium">{successData.schedule_title || "Standard Mass"}</p>
                                    <p className="text-sm text-muted-foreground">{successData.schedule_time}</p>
                                </div>
                                <div>
                                    <span className="text-sm text-muted-foreground">Requested Date</span>
                                    <p className="font-medium run-in">{format(new Date(successData.booking_date), "PPP")}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <span className="text-sm text-muted-foreground">Intention</span>
                                    <p className="font-medium italic">"{successData.intention}"</p>
                                </div>
                                {successData.offered_by && (
                                    <div className="md:col-span-2">
                                        <span className="text-sm text-muted-foreground">Offered By</span>
                                        <p className="font-medium">{successData.offered_by}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Amount Paid Section */}
                        {(successData.amount !== null && successData.amount !== undefined) && (
                            <div className="flex justify-between items-center border-t border-b py-4">
                                <span className="font-bold text-lg">Amount Paid</span>
                                <span className="font-mono text-xl font-bold">
                                    {new Intl.NumberFormat("en-NG", { style: "currency", currency: successData.currency || "NGN" }).format(successData.amount)}
                                </span>
                            </div>
                        )}


                        <div className="flex flex-col gap-2">
                            <h3 className="font-semibold text-lg">Donor Information</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-muted-foreground">Name</span>
                                    <p className="font-medium">{successData.guest_name || "(Parishioner)"}</p>
                                </div>
                                {successData.guest_email && (
                                    <div>
                                        <span className="text-sm text-muted-foreground">Email</span>
                                        <p className="font-medium">{successData.guest_email}</p>
                                    </div>
                                )}
                                {successData.guest_phone && (
                                    <div>
                                        <span className="text-sm text-muted-foreground">Phone</span>
                                        <p className="font-medium">{successData.guest_phone}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground print:mt-auto print:pt-12">
                            <p>Thank you for your support.</p>
                            <p>Please retain this receipt for your records.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const mode = form.watch("mode");

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Breadcrumbs */}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/admin">Admin</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/admin/mass-bookings">Mass Bookings</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link to="/admin/mass-bookings/new">New Mass Booking</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/admin/mass-bookings")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold font-heading">New Mass Booking</h1>
                        <p className="text-muted-foreground">Create a booking request on behalf of a donor.</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    Booking Information
                                </CardTitle>
                                <CardDescription>Enter the details for the mass intention.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="schedule_type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Schedule type <span className="text-destructive">*</span></FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select schedule type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value={'multiple'}>Multiple</SelectItem>
                                                        <SelectItem value={'single'}>Single</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Mass Schedule */}
                                    {form.getValues("schedule_type") === 'single' &&
                                        (<FormField
                                            control={form.control}
                                            name="mass_schedule_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mass Schedule <span className="text-destructive">*</span></FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select schedule" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {schedules.map((schedule) => (
                                                                <SelectItem key={schedule.id} value={schedule.id}>
                                                                    {schedule.title} • {schedule.day_of_week} {schedule.start_time}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />)}

                                    <FormField
                                        control={form.control}
                                        name="mode"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Mode (Who is requesting the mass?) <span className="text-destructive">*</span></FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select mode" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="parishioner">Parishioner</SelectItem>
                                                        <SelectItem value="guest">Guest</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                {/* Dynamic Parishioner/Guest Section */}
                                {mode === "parishioner" ? (
                                    <FormField
                                        control={form.control}
                                        name="user_id"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Parishioner <span className="text-destructive">*</span></FormLabel>
                                                <div className="relative">
                                                    <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="pl-9">
                                                                <SelectValue placeholder="Select parishioner" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {parishioners.map((user) => (
                                                                <SelectItem key={user.id} value={user.id}>
                                                                    {user.name} ({user.email})
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="guest_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Guest Name <span className="text-destructive">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter guest name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="guest_email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Guest Email</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Enter guest email" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}

                                <FormField
                                    control={form.control}
                                    name="intention"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Intention <span className="text-destructive">*</span></FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Enter intention..."
                                                    className="resize-none min-h-[100px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* If schedule_type, set section to be visible */}
                                {form.getValues("schedule_type") === 'multiple' && (<div className="grid grid-cols-1 md:grid-cols-1 gap-4 rounded-md">
                                    {/* Create a dynamic input form. Users should be able to click and add a new item */}
                                    {/* For each added item, select date, amount, and automatically calculate total number of days */}
                                    {form.getValues("schedule_type") === 'multiple' && multipleBookings.map((booking: any, index: number) => (
                                        <div key={index + '-multiple-booking'} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 gap-4 bg-primary/10 p-4 rounded-md">
                                            <FormField
                                                control={form.control}
                                                name={`multipleBookings.${index}.booking_date`}
                                                render={({ field }) => (
                                                    <FormItem className="flex flex-col">
                                                        <FormLabel>Booking Date <span className="text-destructive">*</span></FormLabel>
                                                        <DatePicker
                                                            date={field.value}
                                                            onDateChange={(date) => {
                                                                setMultipleBookings(multipleBookings.map((booking, i) => i === index ? { ...booking, booking_date: date } : booking));
                                                                // Update form values
                                                                form.setValue("multipleBookings", multipleBookings.map((booking, i) => i === index ? { ...booking, booking_date: date } : booking));
                                                            }}
                                                            minDate={new Date()}
                                                            placeholder="Pick a date"
                                                            dateFormat="dd/MM/yyyy"
                                                            key={`booking-date-${index}`}
                                                        />
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {/* Mass Schedule */}
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Mass Schedule <span className="text-destructive">*</span></FormLabel>
                                                <Select
                                                    onValueChange={
                                                        (value) => {
                                                            setMultipleBookings(multipleBookings.map((booking, i) => i === index ? { ...booking, mass_schedule_id: value } : booking));
                                                            // Update form values
                                                            form.setValue("multipleBookings", multipleBookings.map((booking, i) => i === index ? { ...booking, mass_schedule_id: value } : booking));
                                                        }
                                                    }
                                                    value={multipleBookings[index].mass_schedule_id}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a mass schedule" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {schedules.map((schedule) => (
                                                            <SelectItem key={schedule.id} value={schedule.id}>
                                                                {schedule.title} — {schedule.day_of_week} {schedule.start_time}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>

                                            <div key={index} className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4">

                                                {/* Remove button */}
                                                {multipleBookings.length > 1 && (
                                                    <FormItem className="flex flex-col col-span-1">
                                                        <FormLabel style={{ color: 'transparent' }}>?</FormLabel>
                                                        <Button
                                                            type="button"
                                                            onClick={() => {
                                                                setMultipleBookings(multipleBookings.filter((_, i) => i !== index));
                                                                // Update form values
                                                                form.setValue("multipleBookings", multipleBookings.filter((_, i) => i !== index));
                                                            }}
                                                            className="inline-flex items-center w-auto bg-white text-red-500 hover:text-red-700 hover:bg-red-50 w-fit"
                                                            size="sm"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </FormItem>
                                                )}

                                                {/* Add button -- show only if last index */}
                                                {index === multipleBookings.length - 1 && (
                                                    <FormItem className="flex flex-col space-x-0 col-span-1">
                                                        <FormLabel style={{ color: 'transparent' }}>?</FormLabel>
                                                        <Button
                                                            type="button"
                                                            onClick={() => setMultipleBookings([...multipleBookings, { booking_date: new Date(), mass_schedule_id: "" }])}
                                                            className="inline-flex items-center w-auto w-fit"
                                                            size="sm"
                                                            disabled={multipleBookings.length >= 30}
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </Button>
                                                    </FormItem>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                )}

                                <Separator className="my-4" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="booking_date"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Requested Date <span className="text-destructive">*</span></FormLabel>
                                                <DatePicker
                                                    date={field.value}
                                                    onDateChange={(date) => field.onChange(date)}
                                                    minDate={new Date()}
                                                    placeholder="Pick a date"
                                                    key={`requested-date`}
                                                    dateFormat="dd/MM/yyyy"
                                                />
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="guest_phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Phone (Optional)<span className="text-destructive"></span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="+234..." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-md">
                                    <div className="space-y-1">
                                        <Label>Amount</Label>
                                        <div className="grid gap-2 sm:grid-cols-[100px_1fr]">
                                            <FormField
                                                control={form.control}
                                                name="currency"
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="NGN">NGN</SelectItem>
                                                            <SelectItem value="USD">USD</SelectItem>
                                                            <SelectItem value="EUR">EUR</SelectItem>
                                                            <SelectItem value="GBP">GBP</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="amount"
                                                render={({ field }) => (
                                                    <Input
                                                        type="number"
                                                        placeholder="0.00"
                                                        value={field.value ?? ""}
                                                        onChange={(e) => field.onChange(e.target.valueAsNumber || null)}
                                                    />
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="payment_status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Payment Status <span className="text-destructive">*</span></FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="paid">Paid</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Optional payment method: payment_method */}
                                    {/* cash,bank_transfer,mobile_money,card,other */}
                                    {form.getValues("payment_status") === "paid" && (
                                        <>
                                            <FormField
                                                control={form.control}
                                                name="payment_method"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Payment Method</FormLabel>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Payment Method" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="cash">Cash</SelectItem>
                                                                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                                                <SelectItem value="mobile_money">Mobile Money</SelectItem>
                                                                <SelectItem value="card">Card</SelectItem>
                                                                <SelectItem value="other">Other</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {/* Optional payment date */}
                                            <FormField
                                                control={form.control}
                                                name="payment_date"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Payment Date</FormLabel>
                                                        <DatePicker
                                                            date={field.value}
                                                            onDateChange={(date) => field.onChange(date)}
                                                            dateFormat="dd/MM/yyyy"
                                                            placeholder="Select Payment Date"
                                                            key={`payment-date`}
                                                        />
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </>
                                    )}
                                </div>

                                {form.getValues("payment_status") === "paid" && (
                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4 bg-muted/20 p-4 rounded-md">

                                        {/* Optional payment evidence upload: payment_evidence */}
                                        <FormField
                                            control={form.control}
                                            name="payment_evidence"
                                            render={({ field }) => (
                                                <FormItem>
                                                    {imagePreview ? (
                                                        <div className="relative">
                                                            <img
                                                                src={imagePreview}
                                                                alt="Preview"
                                                                className="w-full h-64 object-cover rounded-lg border"
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="icon"
                                                                className="absolute top-2 right-2"
                                                                onClick={removeImage}
                                                                disabled={createMutation.isPending}
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <div className="border-2 border-dashed rounded-lg p-6 text-center">
                                                            <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                                                            <p className="text-sm text-muted-foreground mb-3">
                                                                Upload an image for the payment evidence
                                                            </p>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setIsImageUploadOpen(true)}
                                                                disabled={createMutation.isPending}
                                                            >
                                                                Upload Payment Evidence
                                                            </Button>
                                                        </div>
                                                    )}
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                )}

                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Receipt className="h-4 w-4" /> Receipt Preview
                            </h3>
                            <ReceiptPreview control={form.control} schedules={schedules} />
                        </div>

                        {/* Action Buttons */}
                        <Card className="lg:sticky lg:top-6">
                            <CardContent className="p-4 space-y-2">
                                <Button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="w-full"
                                    size="lg"
                                >
                                    <Save className="mr-2 h-5 w-5" />
                                    {createMutation.isPending
                                        ? isEditMode
                                            ? "Updating..."
                                            : "Creating..."
                                        : isEditMode
                                            ? "Update Booking"
                                            : "Create Booking"}
                                </Button>
                                <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => navigate("/admin/mass-bookings")}
                                    disabled={createMutation.isPending}
                                    className="w-full"
                                >
                                    Cancel
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </form>
            </Form>
            {/* Reusable Attachment Upload Modals */}
            {/* These modals upload to the backend and return a final public URL. */}
            <AttachmentUploadModal
                open={isImageUploadOpen}
                onOpenChange={setIsImageUploadOpen}
                title="Upload Image"
                description="Upload a photo."
                relatedType="event"
                relatedId={isEditMode && id ? id : draftAttachmentGroupId}
                kinds={["image"]}
                onUploaded={(url) => {
                    form.setValue("payment_evidence", url);
                    setImagePreview(url);
                }}
            />
        </div>
    );
};

export default MassBookingFormPage;
