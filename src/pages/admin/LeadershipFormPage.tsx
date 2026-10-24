/**
 * Leadership Form Page
 * 
 * Full-page form for creating and editing leadership members.
 * Accessible via /admin/leadership/new and /admin/leadership/:id/edit routes.
 * 
 * @package Lovable/src/pages/admin
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IsoDatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  FileText,
  Upload,
  Link as LinkIcon,
  X,
  Plus,
  Type
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import leadershipService, {
  Leadership, CreateLeadershipPayload,
  UpdateLeadershipPayload
} from "@/services/leadership.service";
import AttachmentUploadModal from "@/components/attachments/AttachmentUploadModal";

const LeadershipFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    title: "",
    position: "",
    bio: "",
    email: "",
    phone: "",
    image_url: "",
    qualifications: [] as string[],
    ministries: [] as string[],
    start_date: "",
    end_date: "",
    sort_order: 0,
    is_active: true,
    show_on_website: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [newQualification, setNewQualification] = useState("");
  const [newMinistry, setNewMinistry] = useState("");

  // Fetch leadership member if editing
  const { data: leaderData, isLoading: isLoadingLeader } = useQuery({
    queryKey: ["leadership", id],
    queryFn: () => leadershipService.getById(id!),
    enabled: isEditMode && !!id,
  });

  // Initialize form data
  useEffect(() => {
    if (isEditMode && leaderData) {
      const leader = {...leaderData?.data }
      setFormData({
        name: leader.name || "",
        slug: leader.slug || "",
        title: leader.title || "",
        position: leader.position || "",
        bio: leader.bio || "",
        email: leader.email || "",
        phone: leader.phone || "",
        image_url: leader.image_url || "",
        qualifications: leader.qualifications || [],
        ministries: leader.ministries || [],
        start_date: leader.start_date ? new Date(leader.start_date).toISOString().split('T')[0] : "",
        end_date: leader.end_date ? new Date(leader.end_date).toISOString().split('T')[0] : "",
        sort_order: leader.sort_order || 0,
        is_active: leader.is_active ?? true,
        show_on_website: leader.show_on_website ?? true,
      });
    } else if (!isEditMode) {
      setFormData({
        name: "",
        slug: "",
        title: "",
        position: "",
        bio: "",
        email: "",
        phone: "",
        image_url: "",
        qualifications: [],
        ministries: [],
        start_date: "",
        end_date: "",
        sort_order: 0,
        is_active: true,
        show_on_website: true,
      });
    }
  }, [leaderData, isEditMode]);

  // Automatic slug generation
  useEffect(() => {
    if (!isEditMode && formData.name) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, isEditMode]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateLeadershipPayload) => leadershipService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leadership"] });
      toast({
        title: "Success",
        description: "Leadership member created successfully",
      });
      navigate("/admin/leadership");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create leadership member",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadershipPayload }) =>
      leadershipService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leadership"] });
      queryClient.invalidateQueries({ queryKey: ["leadership", id] });
      toast({
        title: "Success",
        description: "Leadership member updated successfully",
      });
      navigate("/admin/leadership");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update leadership member",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const handleInputChange = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddQualification = () => {
    if (newQualification.trim()) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, newQualification.trim()]
      }));
      setNewQualification("");
    }
  };

  const handleRemoveQualification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter((_, i) => i !== index)
    }));
  };

  const handleAddMinistry = () => {
    if (newMinistry.trim()) {
      setFormData(prev => ({
        ...prev,
        ministries: [...prev.ministries, newMinistry.trim()]
      }));
      setNewMinistry("");
    }
  };

  const handleRemoveMinistry = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ministries: prev.ministries.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.position.trim()) {
      toast({
        title: "Validation Error",
        description: "Position is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const payload: CreateLeadershipPayload = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      title: formData.title.trim(),
      position: formData.position.trim(),
      bio: formData.bio.trim() || undefined,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      image_url: formData.image_url.trim() || undefined,
      qualifications: formData.qualifications,
      ministries: formData.ministries,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
      sort_order: Number(formData.sort_order),
      is_active: formData.is_active,
      show_on_website: formData.show_on_website,
    };

    if (isEditMode && id) {
      updateMutation.mutate({ id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isEditMode && isLoadingLeader) {
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
              <Link to="/admin/leadership">Leadership</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {isEditMode ? "Edit Leader" : "Add Leader"}
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
            onClick={() => navigate("/admin/leadership")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              {isEditMode ? "Edit Leader" : "Add New Leader"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode
                ? "Update leadership member details"
                : "Fill in the details to add a new leadership member"}
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
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter full name..."
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">
                    Slug <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="slug"
                      placeholder="john-doe"
                      value={formData.slug}
                      onChange={(e) => handleInputChange("slug", e.target.value)}
                      disabled={isSubmitting}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Honorific Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Very Rev. Fr., Rev. Fr., Deacon"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">
                    Position <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="position"
                    placeholder="e.g., Parish Priest, Assistant Parish Priest"
                    value={formData.position}
                    onChange={(e) => handleInputChange("position", e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  placeholder="Brief biography or background..."
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  rows={6}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-9"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="pl-9"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Tenure Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <IsoDatePicker
                    id="start_date"
                    value={formData.start_date}
                    onChange={(value) => handleInputChange("start_date", value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date (Optional)</Label>
                  <IsoDatePicker
                    id="end_date"
                    value={formData.end_date}
                    onChange={(value) => handleInputChange("end_date", value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Expertise & Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Qualifications</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add qualification (e.g., B.Th)"
                    value={newQualification}
                    onChange={(e) => setNewQualification(e.target.value)}
                  />
                  <Button type="button" variant="secondary" onClick={handleAddQualification}>
                    <Plus className="h-4 w-4 mr-2" /> Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.qualifications.map((q, i) => (
                    <div key={i} className="bg-muted px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {q}
                      <X
                        className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground"
                        onClick={() => handleRemoveQualification(i)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Ministries Oversight</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add ministry name"
                    value={newMinistry}
                    onChange={(e) => setNewMinistry(e.target.value)}
                  />
                  <Button type="button" variant="secondary" onClick={handleAddMinistry}>
                    <Plus className="h-4 w-4 mr-2" /> Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.ministries.map((m, i) => (
                    <div key={i} className="bg-muted px-3 py-1 rounded-full text-sm flex items-center gap-2">
                      {m}
                      <X
                        className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-foreground"
                        onClick={() => handleRemoveMinistry(i)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Profile Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="image_url"
                      type="url"
                      placeholder="https://..."
                      value={formData.image_url}
                      onChange={(e) => handleInputChange("image_url", e.target.value)}
                      className="pl-9"
                      disabled={isSubmitting}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsImageUploadOpen(true)}
                    disabled={isSubmitting}
                  >
                    Upload
                  </Button>
                </div>
                {formData.image_url && (
                  <div className="mt-2 flex items-center gap-4 border p-2 rounded-md">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={formData.image_url} alt={formData.name} />
                      <AvatarFallback>{getInitials(formData.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs text-muted-foreground truncate">{formData.image_url}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive h-auto p-0 mt-1"
                        onClick={() => handleInputChange("image_url", "")}
                      >
                        Remove image
                      </Button>
                    </div>
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
              <CardTitle className="text-base">Display & Visibility</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Active
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Currently active member
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                  disabled={isSubmitting}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show_on_website" className="cursor-pointer">
                    Show on Website
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Publicly visible in about section
                  </p>
                </div>
                <Switch
                  id="show_on_website"
                  checked={formData.show_on_website}
                  onCheckedChange={(checked) => handleInputChange("show_on_website", checked)}
                  disabled={isSubmitting}
                />
              </div>
              <Separator />
              <div className="space-y-2 pt-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="sort_order"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.sort_order}
                    onChange={(e) => handleInputChange("sort_order", parseInt(e.target.value) || 0)}
                    disabled={isSubmitting}
                    className="pl-9"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Lower numbers appear first.
                </p>
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
                    ? "Update Leader"
                    : "Create Leader"}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/admin/leadership")}
                disabled={isSubmitting}
                className="w-full"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AttachmentUploadModal
        open={isImageUploadOpen}
        onOpenChange={setIsImageUploadOpen}
        onUploaded={(url) => {
          handleInputChange("image_url", url);
          setIsImageUploadOpen(false);
          toast({
            title: "Success",
            description: "Profile image uploaded successfully",
          });
        }}
        kinds={["image"]}
        title="Upload Profile Image"
        relatedType="leadership"
        relatedId={id || "new-leader"}
      />
    </div>
  );
};

export default LeadershipFormPage;
