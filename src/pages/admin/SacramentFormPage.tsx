/**
 * Sacrament Form Page
 * 
 * Full-page form for creating and editing sacraments.
 * Accessible via /admin/sacraments/new and /admin/sacraments/:id/edit routes.
 * 
 * @package Lovable/src/pages/admin
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Save,
  ArrowLeft,
  Church,
  Phone,
  Calendar,
  FileText,
  Plus,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import sacramentService, { Sacrament, CreateSacramentPayload, UpdateSacramentPayload } from "@/services/sacrament.service";

const SacramentFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contact: "",
    schedule: "",
    requirements: [] as string[],
    is_active: true,
  });

  const [newRequirement, setNewRequirement] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch sacrament if editing
  const { data: sacrament, isLoading: isLoadingSacrament } = useQuery({
    queryKey: ["sacrament", id],
    queryFn: () => sacramentService.getById(id!),
    enabled: isEditMode && !!id,
  });

  // Initialize form data
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isEditMode && sacrament?.data) {

        const sacramentData = sacrament.data;
        setFormData({
          name: sacramentData.name || "",
          description: sacramentData.description || "",
          contact: sacramentData.contact || "",
          schedule: sacramentData.schedule || "",
          requirements: sacramentData.requirements || [],
          is_active: sacramentData.is_active ?? true,
        });
      } else if (!isEditMode) {
        setFormData({
          name: "",
          description: "",
          contact: "",
          schedule: "",
          requirements: [],
          is_active: true,
        });
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [sacrament, isEditMode]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateSacramentPayload) => sacramentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sacraments"] });
      toast({
        title: "Success",
        description: "Sacrament created successfully",
      });
      navigate("/admin/sacraments");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create sacrament",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSacramentPayload }) =>
      sacramentService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sacraments"] });
      queryClient.invalidateQueries({ queryKey: ["sacrament", id] });
      toast({
        title: "Success",
        description: "Sacrament updated successfully",
      });
      navigate("/admin/sacraments");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update sacrament",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      handleInputChange("requirements", [...formData.requirements, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const handleRemoveRequirement = (index: number) => {
    handleInputChange(
      "requirements",
      formData.requirements.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Sacrament name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const payload: CreateSacramentPayload | UpdateSacramentPayload = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      contact: formData.contact.trim() || undefined,
      schedule: formData.schedule.trim() || undefined,
      requirements: formData.requirements.length > 0 ? formData.requirements : undefined,
      is_active: formData.is_active,
    };

    if (isEditMode && id) {
      updateMutation.mutate({ id, data: payload });
    } else {
      createMutation.mutate(payload as CreateSacramentPayload);
    }
  };

  if (isEditMode && isLoadingSacrament) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <Link to="/admin/sacraments">Sacraments</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {isEditMode ? "Edit Sacrament" : "Create Sacrament"}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/sacraments")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              {isEditMode ? "Edit Sacrament" : "Create New Sacrament"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode
                ? "Update sacrament details and information"
                : "Fill in the details to create a new sacrament"}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Church className="h-5 w-5" />
                Sacrament Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Sacrament Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter sacrament name..."
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={isSubmitting}
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the sacrament..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={6}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description.length} characters
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Information</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contact"
                      placeholder="Contact person or phone..."
                      value={formData.contact}
                      onChange={(e) => handleInputChange("contact", e.target.value)}
                      className="pl-9"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="schedule"
                      placeholder="e.g., Every Saturday 4:00 PM"
                      value={formData.schedule}
                      onChange={(e) => handleInputChange("schedule", e.target.value)}
                      className="pl-9"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Requirements</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a requirement..."
                    value={newRequirement}
                    onChange={(e) => setNewRequirement(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddRequirement();
                      }
                    }}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    onClick={handleAddRequirement}
                    disabled={isSubmitting || !newRequirement.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.requirements.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.requirements.map((req, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-muted px-3 py-1 rounded-md"
                      >
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{req}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4"
                          onClick={() => handleRemoveRequirement(index)}
                          disabled={isSubmitting}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Active
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {formData.is_active
                      ? "Sacrament is visible to visitors"
                      : "Sacrament is hidden"}
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="lg:sticky lg:top-6">
            <CardContent className="p-4 space-y-2">
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                <Save className="mr-2 h-5 w-5" />
                {isSubmitting
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                    ? "Update Sacrament"
                    : "Create Sacrament"}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/admin/sacraments")}
                disabled={isSubmitting}
                className="w-full"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SacramentFormPage;

