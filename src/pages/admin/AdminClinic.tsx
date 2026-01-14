/**
 * Admin Clinic Management Page
 *
 * API-backed admin dashboard for clinic services + appointment requests.
 * NOTE: This page stays on the existing `/admin/clinic` route; create/edit are dialogs.
 */

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, MoreVertical, Edit, Trash2, Stethoscope, DollarSign, Calendar, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DeleteConfirmModal from "@/components/admin/shared/DeleteConfirmModal";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { GenericEmptyState } from "@/components/admin/shared/GenericEmptyState";
import { AdminPagination } from "@/components/admin/shared/AdminPagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import clinicService, { ClinicService, UpsertClinicServicePayload, ClinicAppointment } from "@/services/clinic.service";
import { ClinicOperatingHours } from "@/components/admin/clinic/ClinicOperatingHours";

const PREDEFINED_CATEGORIES = [
  "General Consultation",
  "Specialist Consultation",
  "Dental Services",
  "Laboratory",
  "Pharmacy",
  "Emergency",
  "Pediatrics",
  "Maternity",
  "Optical",
  "Cardiology",
  "Dermatology",
  "Radiology"
];

function parseOperating(description?: string | null) {
  const raw = (description || "").trim();
  if (!raw.toLowerCase().startsWith("operating:")) return { operating: "", body: raw };
  const [firstLine, ...rest] = raw.split("\n");
  return { operating: firstLine.replace(/^operating:\s*/i, "").trim(), body: rest.join("\n").trim() };
}

function formatOperating(operating: string, body: string) {
  const op = operating.trim();
  const b = body.trim();
  if (!op) return b || null;
  return `Operating: ${op}${b ? `\n\n${b}` : ""}`;
}

const AdminClinic = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [activeTab, setActiveTab] = useState<"services" | "appointments">("services");

  // Services list state
  const [serviceSearchInput, setServiceSearchInput] = useState("");
  const serviceSearch = useDebouncedValue(serviceSearchInput, 350);
  const [serviceStatus, setServiceStatus] = useState<"all" | "active" | "inactive">("all");
  const [servicesPage, setServicesPage] = useState(1);
  const [servicesPerPage, setServicesPerPage] = useState(15);

  // Appointments list state
  const [apptStatus, setApptStatus] = useState<"all" | "pending" | "confirmed" | "rejected" | "cancelled">("all");
  const [apptsPage, setApptsPage] = useState(1);
  const [apptsPerPage, setApptsPerPage] = useState(15);

  // Modals
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<ClinicService | null>(null);
  const [serviceForm, setServiceForm] = useState({
    name: "",
    category: "",
    operating: "",
    description: "",
    price: "",
    currency: "NGN",
    is_active: true,
    sort_order: "0",
  });

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<ClinicService | null>(null);
  const [isApptActionOpen, setIsApptActionOpen] = useState(false);
  const [apptAction, setApptAction] = useState<"confirm" | "reject" | "cancel">("confirm");
  const [apptNotes, setApptNotes] = useState("");
  const [apptReason, setApptReason] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<ClinicAppointment | null>(null);
  const [forceCustomMode, setForceCustomMode] = useState(false);

  const servicesQueryParams = useMemo(() => {
    return {
      page: servicesPage,
      per_page: servicesPerPage,
      is_active: serviceStatus === "all" ? undefined : serviceStatus === "active",
    };
  }, [servicesPage, servicesPerPage, serviceStatus]);

  const servicesQuery = useQuery({
    queryKey: ["admin-clinic-services", servicesQueryParams],
    queryFn: () => clinicService.adminListServices(servicesQueryParams),
    placeholderData: (prev) => prev,
  });

  const appointmentsQueryParams = useMemo(() => {
    return {
      page: apptsPage,
      per_page: apptsPerPage,
      status: apptStatus === "all" ? undefined : apptStatus,
    };
  }, [apptsPage, apptsPerPage, apptStatus]);

  const appointmentsQuery = useQuery({
    queryKey: ["admin-clinic-appointments", appointmentsQueryParams],
    queryFn: () => clinicService.adminListAppointments(appointmentsQueryParams),
    placeholderData: (prev) => prev,
  });

  const services = useMemo(() => {
    const list = (servicesQuery.data as unknown as { data?: ClinicService[] })?.data ?? [];
    if (!serviceSearch) return list;
    const q = serviceSearch.toLowerCase();
    return list.filter((s) => (s.name || "").toLowerCase().includes(q) || (s.category || "").toLowerCase().includes(q));
  }, [servicesQuery.data, serviceSearch]);

  const appointments = useMemo(() => {
    return ((appointmentsQuery.data as unknown as { data?: ClinicAppointment[] })?.data ?? []) as ClinicAppointment[];
  }, [appointmentsQuery.data]);

  const openCreateService = () => {
    setEditingService(null);
    setForceCustomMode(false);
    setServiceForm({
      name: "",
      category: "",
      operating: "",
      description: "",
      price: "",
      currency: "NGN",
      is_active: true,
      sort_order: "0",
    });
    setIsServiceFormOpen(true);
  };

  const openEditService = (service: ClinicService) => {
    const parsed = parseOperating(service.description);
    setEditingService(service);
    setForceCustomMode(!!service.category && !PREDEFINED_CATEGORIES.includes(service.category));
    setServiceForm({
      name: service.name || "",
      category: service.category || "",
      operating: parsed.operating,
      description: parsed.body,
      price: service.price === null || service.price === undefined ? "" : String(service.price),
      currency: service.currency || "NGN",
      is_active: Boolean(service.is_active),
      sort_order: String(service.sort_order ?? 0),
    });
    setIsServiceFormOpen(true);
  };

  const createServiceMutation = useMutation({
    mutationFn: async () => {
      const payload: UpsertClinicServicePayload = {
        name: serviceForm.name.trim(),
        category: serviceForm.category.trim() || null,
        description: formatOperating(serviceForm.operating, serviceForm.description),
        price: serviceForm.price ? Number(serviceForm.price) : null,
        currency: serviceForm.currency || "NGN",
        is_active: serviceForm.is_active,
        sort_order: Number(serviceForm.sort_order || 0),
      };
      return clinicService.adminCreateService(payload);
    },
    onSuccess: () => {
      toast({ title: "Created", description: "Clinic service created successfully." });
      qc.invalidateQueries({ queryKey: ["admin-clinic-services"] });
      setIsServiceFormOpen(false);
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to create clinic service";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async () => {
      if (!editingService) throw new Error("No service selected");
      return clinicService.adminUpdateService(editingService.id, {
        name: serviceForm.name.trim(),
        category: serviceForm.category.trim() || null,
        description: formatOperating(serviceForm.operating, serviceForm.description),
        price: serviceForm.price ? Number(serviceForm.price) : null,
        currency: serviceForm.currency || "NGN",
        is_active: serviceForm.is_active,
        sort_order: Number(serviceForm.sort_order || 0),
      });
    },
    onSuccess: () => {
      toast({ title: "Updated", description: "Clinic service updated successfully." });
      qc.invalidateQueries({ queryKey: ["admin-clinic-services"] });
      setIsServiceFormOpen(false);
      setEditingService(null);
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to update clinic service";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (id: string) => clinicService.adminDeleteService(id),
    onSuccess: () => {
      toast({ title: "Deleted", description: "Clinic service deleted successfully." });
      qc.invalidateQueries({ queryKey: ["admin-clinic-services"] });
      setIsDeleteOpen(false);
      setServiceToDelete(null);
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to delete clinic service";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const apptActionMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAppointment) throw new Error("No appointment selected");
      if (apptAction === "confirm") return clinicService.adminConfirmAppointment(selectedAppointment.id);
      if (apptAction === "reject") {
        if (!apptReason.trim()) throw new Error("Rejection reason is required");
        return clinicService.adminRejectAppointment(selectedAppointment.id, { reason: apptReason.trim(), admin_notes: apptNotes.trim() || null });
      }
      return clinicService.adminCancelAppointment(selectedAppointment.id, { reason: apptReason.trim() || null });
    },
    onSuccess: () => {
      toast({ title: "Updated", description: "Appointment updated successfully." });
      qc.invalidateQueries({ queryKey: ["admin-clinic-appointments"] });
      setIsApptActionOpen(false);
      setSelectedAppointment(null);
      setApptNotes("");
      setApptReason("");
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to update appointment";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  type UnknownRecord = Record<string, unknown>;
  const isRecord = (v: unknown): v is UnknownRecord => typeof v === "object" && v !== null;
  const getLastPage = (res: unknown): number => {
    if (!isRecord(res)) return 1;
    const meta = res.meta;
    if (!isRecord(meta)) return 1;
    const last = meta.last_page;
    return typeof last === "number" && Number.isFinite(last) && last > 0 ? last : 1;
  };

  const totalServicesPages = getLastPage(servicesQuery.data);
  const totalApptPages = getLastPage(appointmentsQuery.data);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Clinic Management</h1>
          <p className="text-muted-foreground mt-1">Manage parish clinic services and appointment requests.</p>
        </div>
        <Button onClick={openCreateService} className="gap-2">
          <Plus className="h-4 w-4" /> New Service
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v === "services" || v === "appointments" ? v : "services")}
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="appointments">Appointment Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search services..."
                    className="pl-9"
                    value={serviceSearchInput}
                    onChange={(e) => {
                      setServiceSearchInput(e.target.value);
                      setServicesPage(1);
                    }}
                  />
                </div>
                <Select
                  value={serviceStatus}
                  onValueChange={(v) => {
                    if (v === "all" || v === "active" || v === "inactive") {
                      setServiceStatus(v);
                      setServicesPage(1);
                    }
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={servicesPerPage.toString()} onValueChange={(v) => { setServicesPerPage(Number(v)); setServicesPage(1); }}>
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

          <Card>
            <CardHeader>
              <CardTitle>All Services</CardTitle>
            </CardHeader>
            <CardContent>
              {servicesQuery.isLoading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : servicesQuery.error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Error loading services</h3>
                  <p className="text-muted-foreground mb-4">
                    {servicesQuery.error instanceof Error ? servicesQuery.error.message : "An unexpected error occurred"}
                  </p>
                  <Button onClick={() => qc.invalidateQueries({ queryKey: ["admin-clinic-services"] })}>Try Again</Button>
                </div>
              ) : services.length === 0 ? (
                <GenericEmptyState
                  title="No services found"
                  description={serviceSearch ? "Try adjusting your search" : "Get started by adding your first service"}
                  actionLabel="Add Service"
                  onAction={openCreateService}
                  icon="activity"
                />
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Service</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[80px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {services.map((s) => (
                          <TableRow key={s.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">{s.name}</div>
                                  {s.description ? (
                                    <div className="text-sm text-muted-foreground line-clamp-1">
                                      {parseOperating(s.description).operating ? `Operating: ${parseOperating(s.description).operating}` : s.description}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{s.category || "—"}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                {s.price ? new Intl.NumberFormat("en-NG", { style: "currency", currency: s.currency || "NGN" }).format(Number(s.price)) : "Free"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusBadge status={s.is_active ? "active" : "inactive"} />
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" aria-label="Service actions">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => openEditService(s)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => { setServiceToDelete(s); setIsDeleteOpen(true); }}
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
                      Page {servicesPage} of {totalServicesPages}
                    </div>
                    <AdminPagination currentPage={servicesPage} totalPages={totalServicesPages} onPageChange={setServicesPage} />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Select
                  value={apptStatus}
                  onValueChange={(v) => {
                    if (v === "all" || v === "pending" || v === "confirmed" || v === "rejected" || v === "cancelled") {
                      setApptStatus(v);
                      setApptsPage(1);
                    }
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={apptsPerPage.toString()} onValueChange={(v) => { setApptsPerPage(Number(v)); setApptsPage(1); }}>
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

          <Card>
            <CardHeader>
              <CardTitle>Appointment Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {appointmentsQuery.isLoading ? (
                <div className="space-y-3">
                  {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
              ) : appointmentsQuery.error ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Error loading appointments</h3>
                  <p className="text-muted-foreground mb-4">
                    {appointmentsQuery.error instanceof Error ? appointmentsQuery.error.message : "An unexpected error occurred"}
                  </p>
                  <Button onClick={() => qc.invalidateQueries({ queryKey: ["admin-clinic-appointments"] })}>Try Again</Button>
                </div>
              ) : appointments.length === 0 ? (
                <GenericEmptyState
                  title="No appointment requests"
                  description="Appointment requests will appear here"
                  icon="calendar"
                />
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[80px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {appointments.map((a) => (
                          <TableRow key={a.id} className="hover:bg-muted/50">
                            <TableCell className="font-medium">
                              <div>
                                <div className="font-medium">{a.patient_name}</div>
                                <div className="text-sm text-muted-foreground">{a.patient_email}</div>
                              </div>
                            </TableCell>
                            <TableCell>{a.clinic_service?.name || "—"}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {a.preferred_date}
                                {a.preferred_time ? ` • ${a.preferred_time}` : ""}
                              </div>
                            </TableCell>
                            <TableCell>
                              <StatusBadge
                                status={
                                  a.status === "confirmed" ? "active" :
                                    a.status === "rejected" || a.status === "cancelled" ? "cancelled" :
                                      "pending"
                                }
                                customLabel={a.status}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" aria-label="Appointment actions">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                  {a.status === "pending" ? (
                                    <>
                                      <DropdownMenuItem
                                        onClick={() => {
                                          setSelectedAppointment(a);
                                          setApptAction("confirm");
                                          setApptReason("");
                                          setApptNotes("");
                                          setIsApptActionOpen(true);
                                        }}
                                      >
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Confirm
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() => {
                                          setSelectedAppointment(a);
                                          setApptAction("reject");
                                          setApptReason("");
                                          setApptNotes("");
                                          setIsApptActionOpen(true);
                                        }}
                                      >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Reject
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                    </>
                                  ) : null}
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedAppointment(a);
                                      setApptAction("cancel");
                                      setApptReason("");
                                      setApptNotes("");
                                      setIsApptActionOpen(true);
                                    }}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Cancel
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
                      Page {apptsPage} of {totalApptPages}
                    </div>
                    <AdminPagination currentPage={apptsPage} totalPages={totalApptPages} onPageChange={setApptsPage} />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Service Dialog */}
      <Dialog open={isServiceFormOpen} onOpenChange={setIsServiceFormOpen}>
        <DialogContent className="max-w-4xl h-full">
          <DialogHeader className="h-full">
            <DialogTitle>{editingService ? "Edit Service" : "Add Service"}</DialogTitle>
            <DialogDescription>Configure clinic services shown on the public clinic page.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 mx-4 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm font-medium">
                  Service name <span className="text-destructive">*</span>
                </div>
                <Input value={serviceForm.name} onChange={(e) => setServiceForm((p) => ({ ...p, name: e.target.value }))} placeholder="e.g., General Consultation" />
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium">Category</div>
                <div className="space-y-2">
                  <Select
                    value={forceCustomMode || (serviceForm.category && !PREDEFINED_CATEGORIES.includes(serviceForm.category)) ? "other" : serviceForm.category}
                    onValueChange={(v) => {
                      if (v === "other") {
                        setForceCustomMode(true);
setServiceForm(p => ({ ...p, category: "" }));
                      } else {
                        setForceCustomMode(false);
                        setServiceForm(p => ({ ...p, category: v }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {PREDEFINED_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                      <SelectItem value="other">Other (Custom)...</SelectItem>
                    </SelectContent>
                  </Select>
                  {(forceCustomMode || (serviceForm.category && !PREDEFINED_CATEGORIES.includes(serviceForm.category))) && (
                    <Input
                      value={serviceForm.category}
                      onChange={(e) => setServiceForm((p) => ({ ...p, category: e.target.value }))}
                      placeholder="Enter custom category"
                      className="animate-in fade-in slide-in-from-top-1"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <div className="text-sm font-medium">Operating days & time</div>
                <ClinicOperatingHours
                  value={serviceForm.operating}
                  onChange={(v) => setServiceForm((p) => ({ ...p, operating: v }))}
                />
                <div className="text-xs text-muted-foreground mt-1">Configure weekly schedule. Saved as description header.</div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium">Price (optional)</div>
                <div className="flex gap-2">
                  <Select
                    value={serviceForm.currency}
                    onValueChange={(v) => setServiceForm((p) => ({ ...p, currency: v }))}
                  >
                    <SelectTrigger className="w-[85px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">NGN</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm((p) => ({ ...p, price: e.target.value }))}
                    placeholder="0.00"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-medium">Sort order</div>
                <Input type="number" value={serviceForm.sort_order} onChange={(e) => setServiceForm((p) => ({ ...p, sort_order: e.target.value }))} />
              </div>

              <div className="space-y-1 md:col-span-2">
                <div className="text-sm font-medium">Description</div>
                <Textarea value={serviceForm.description} onChange={(e) => setServiceForm((p) => ({ ...p, description: e.target.value }))} rows={4} placeholder="Additional details about the service..." />
              </div>

              <div className="flex items-center gap-3 md:col-span-2 border p-3 rounded-md bg-muted/20">
                <Switch checked={serviceForm.is_active} onCheckedChange={(v) => setServiceForm((p) => ({ ...p, is_active: v }))} />
                <div>
                  <div className="font-medium">Active Status</div>
                  <div className="text-sm text-muted-foreground">Service is visible to public visitors</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsServiceFormOpen(false)} disabled={createServiceMutation.isPending || updateServiceMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!serviceForm.name.trim()) {
                  toast({ title: "Validation", description: "Service name is required.", variant: "destructive" });
                  return;
                }
                if (editingService) updateServiceMutation.mutate();
                else createServiceMutation.mutate();
              }}
              disabled={createServiceMutation.isPending || updateServiceMutation.isPending}
            >
              {createServiceMutation.isPending || updateServiceMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmModal
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete Service"
        description="This action cannot be undone. This will permanently delete the service."
        itemName={serviceToDelete?.name}
        onConfirm={() => serviceToDelete && deleteServiceMutation.mutate(serviceToDelete.id)}
        isLoading={deleteServiceMutation.isPending}
      />

      <Dialog open={isApptActionOpen} onOpenChange={setIsApptActionOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {apptAction === "confirm" ? "Confirm appointment" : apptAction === "reject" ? "Reject appointment" : "Cancel appointment"}
            </DialogTitle>
            <DialogDescription>
              {selectedAppointment ? `${selectedAppointment.patient_name} • ${selectedAppointment.preferred_date}` : "Update request status"}
            </DialogDescription>
          </DialogHeader>
          {apptAction !== "confirm" ? (
            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <div className="text-sm font-medium">{apptAction === "reject" ? "Rejection reason" : "Cancellation reason (optional)"}</div>
                <Input value={apptReason} onChange={(e) => setApptReason(e.target.value)} placeholder={apptAction === "reject" ? "Reason..." : "(optional)"} />
              </div>
              {apptAction === "reject" ? (
                <div className="space-y-1">
                  <div className="text-sm font-medium">Admin notes (optional)</div>
                  <Textarea value={apptNotes} onChange={(e) => setApptNotes(e.target.value)} rows={4} placeholder="Internal notes..." />
                </div>
              ) : null}
            </div>
          ) : null}
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsApptActionOpen(false)} disabled={apptActionMutation.isPending}>
              Cancel
            </Button>
            <Button
              variant={apptAction === "reject" || apptAction === "cancel" ? "destructive" : "default"}
              onClick={() => apptActionMutation.mutate()}
              disabled={apptActionMutation.isPending}
            >
              {apptActionMutation.isPending ? "Saving..." : "Confirm"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminClinic;
