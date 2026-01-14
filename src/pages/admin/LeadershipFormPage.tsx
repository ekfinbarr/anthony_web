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
  Upload
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import leadershipService, { 
  Leadership, CreateLeadershipPayload, 
  UpdateLeadershipPayload 
} from "@/services/leadership.service";

const LeadershipFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    role: "",
    title: "",
    bio: "",
    email: "",
    phone: "",
    avatar: "",
    department: "",
    start_date: "",
    end_date: "",
    is_active: true,
    is_featured: false,
    welcome_message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch leadership member if editing
  const { data: leader, isLoading: isLoadingLeader } = useQuery({
    queryKey: ["leadership", id],
    queryFn: () => leadershipService.getById(id!),
    enabled: isEditMode && !!id,
  });

  // Initialize form data
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isEditMode && leader) {
        setFormData({
          name: leader.name || "",
          role: leader.role || "",
          title: leader.title || "",
          bio: leader.bio || "",
          email: leader.email || "",
          phone: leader.phone || "",
          avatar: leader.avatar || "",
          department: leader.department || "",
          start_date: leader.start_date ? new Date(leader.start_date).toISOString().split('T')[0] : "",
          end_date: leader.end_date ? new Date(leader.end_date).toISOString().split('T')[0] : "",
          is_active: leader.is_active ?? true,
          is_featured: leader.is_featured ?? false,
          welcome_message: leader.welcome_message || "",
        });
      } else if (!isEditMode) {
        setFormData({
          name: "",
          role: "",
          title: "",
          bio: "",
          email: "",
          phone: "",
          avatar: "",
          department: "",
          start_date: "",
          end_date: "",
          is_active: true,
          is_featured: false,
          welcome_message: "",
        });
      }
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [leader, isEditMode]);

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

  const handleInputChange = (
    field: keyof typeof formData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    if (!formData.role.trim()) {
      toast({
        title: "Validation Error",
        description: "Role is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const payload: CreateLeadershipPayload | UpdateLeadershipPayload = {
      name: formData.name.trim(),
      role: formData.role.trim(),
      title: formData.title.trim() || undefined,
      bio: formData.bio.trim() || undefined,
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      avatar: formData.avatar.trim() || undefined,
      department: formData.department.trim() || undefined,
      start_date: formData.start_date || undefined,
      end_date: formData.end_date || undefined,
      is_active: formData.is_active,
      is_featured: formData.is_featured,
      welcome_message: formData.welcome_message.trim() || undefined,
    };

    if (isEditMode && id) {
      updateMutation.mutate({ id, data: payload });
    } else {
      createMutation.mutate(payload as CreateLeadershipPayload);
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
                  className="text-base"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">
                    Role <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="role"
                    placeholder="e.g., Priest, Deacon, Admin"
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Parish Priest, Assistant"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  placeholder="e.g., Administration, Pastoral Care"
                  value={formData.department}
                  onChange={(e) => handleInputChange("department", e.target.value)}
                  disabled={isSubmitting}
                />
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
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange("start_date", e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date (Optional)</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange("end_date", e.target.value)}
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
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <div className="relative">
                  <Upload className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="avatar"
                    type="url"
                    placeholder="https://..."
                    value={formData.avatar}
                    onChange={(e) => handleInputChange("avatar", e.target.value)}
                    className="pl-9"
                    disabled={isSubmitting}
                  />
                </div>
                {formData.avatar && (
                  <div className="mt-2">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={formData.avatar} alt={formData.name} />
                      <AvatarFallback>{getInitials(formData.name)}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcome_message">Welcome Message</Label>
                <Textarea
                  id="welcome_message"
                  placeholder="Optional welcome message..."
                  value={formData.welcome_message}
                  onChange={(e) => handleInputChange("welcome_message", e.target.value)}
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Active
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {formData.is_active
                      ? "Leader is currently active"
                      : "Leader is inactive"}
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
                  <Label htmlFor="is_featured" className="cursor-pointer">
                    Featured
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {formData.is_featured
                      ? "Leader is featured"
                      : "Leader is not featured"}
                  </p>
                </div>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleInputChange("is_featured", checked)}
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
    </div>
  );
};

export default LeadershipFormPage;

