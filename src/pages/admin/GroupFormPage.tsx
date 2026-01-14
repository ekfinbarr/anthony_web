/**
 * Group (Ministry) Form Page
 * 
 * Full-page form for creating and editing groups/ministries.
 * Accessible via /admin/groups/new and /admin/groups/:id/edit routes.
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
  Users,
  Target,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ministryService, { Ministry, CreateMinistryPayload, UpdateMinistryPayload } from "@/services/ministry.service";
import ministryCategoryService from "@/services/ministryCategory.service";
import userService from "@/services/user.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Folder } from "lucide-react";

const GroupFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    mission: "",
    vision: "",
    category_id: "",
    leader_id: "",
    contact_email: "",
    contact_phone: "",
    meeting_location: "",
    meeting_schedule: "",
    requirements: "",
    activities: "",
    image: "",
    is_active: true,
    accepting_members: true,
    is_featured: false,
    sort_order: 0,
    status: "active",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch ministry if editing
  const { data: ministry, isLoading: isLoadingMinistry } = useQuery({
    queryKey: ["ministry", id],
    queryFn: () => ministryService.getById(id!),
    enabled: isEditMode && !!id,
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["ministry-categories-active"],
    queryFn: () => ministryCategoryService.getActive(),
  });

  // Fetch users for leader selection
  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.list({ per_page: 100 }), // Fetch first 100 for now
  });

  const categories = categoriesData?.data || [];
  const users = usersData?.data || [];

  // Initialize form data
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isEditMode && ministry?.data) {
        const ministryData = ministry?.data;
        setFormData({
          name: ministryData.name || "",
          description: ministryData.description || "",
          mission: ministryData.mission || "",
          vision: ministryData.vision || "",
          category_id: ministryData.category_id || "",
          leader_id: ministryData.leader_id || "",
          contact_email: ministryData.contact_email || "",
          contact_phone: ministryData.contact_phone || "",
          meeting_location: ministryData.meeting_location || "",
          meeting_schedule: ministryData.meeting_schedule ? (typeof ministryData.meeting_schedule === 'string' ? ministryData.meeting_schedule : JSON.stringify(ministryData.meeting_schedule, null, 2)) : "",
          requirements: ministryData.requirements || "",
          activities: ministryData.activities ? (typeof ministryData.activities === 'string' ? ministryData.activities : JSON.stringify(ministryData.activities, null, 2)) : "",
          image: ministryData.image || "",
          is_active: ministryData.is_active ?? true,
          accepting_members: ministryData.accepting_members ?? true,
          is_featured: ministryData.is_featured ?? false,
          sort_order: ministryData.sort_order ?? 0,
          status: ministryData.status || "active",
        });
      } else if (!isEditMode) {
        setFormData({
          name: "",
          description: "",
          mission: "",
          vision: "",
          category_id: "",
          leader_id: "",
          contact_email: "",
          contact_phone: "",
          meeting_location: "",
          meeting_schedule: "",
          requirements: "",
          activities: "",
          image: "",
          is_active: true,
          accepting_members: true,
          is_featured: false,
          sort_order: 0,
          status: "active",
        });
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [ministry, isEditMode]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateMinistryPayload) => ministryService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ministries"] });
      toast({
        title: "Success",
        description: "Group created successfully",
      });
      navigate("/admin/groups");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create group",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMinistryPayload }) =>
      ministryService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ministries"] });
      queryClient.invalidateQueries({ queryKey: ["ministry", id] });
      toast({
        title: "Success",
        description: "Group updated successfully",
      });
      navigate("/admin/groups");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update group",
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
        description: "Group name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const payload: CreateMinistryPayload | UpdateMinistryPayload = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      mission: formData.mission.trim() || undefined,
      vision: formData.vision.trim() || undefined,
      category_id: formData.category_id || undefined,
      leader_id: formData.leader_id || undefined,
      contact_email: formData.contact_email || undefined,
      contact_phone: formData.contact_phone || undefined,
      meeting_location: formData.meeting_location || undefined,
      meeting_schedule: formData.meeting_schedule || undefined,
      requirements: formData.requirements || undefined,
      activities: formData.activities || undefined,
      image: formData.image || undefined,
      is_active: formData.is_active,
      accepting_members: formData.accepting_members,
      is_featured: formData.is_featured,
      sort_order: Number(formData.sort_order),
      status: formData.status as any,
    };

    if (isEditMode && id) {
      updateMutation.mutate({ id, data: payload });
    } else {
      createMutation.mutate(payload as CreateMinistryPayload);
    }
  };

  if (isEditMode && isLoadingMinistry) {
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
              <Link to="/admin/groups">Groups</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {isEditMode ? "Edit Group" : "Create Group"}
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
            onClick={() => navigate("/admin/groups")}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              {isEditMode ? "Edit Group" : "Create New Group"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isEditMode
                ? "Update group details and information"
                : "Fill in the details to create a new group or ministry"}
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
                <Users className="h-5 w-5" />
                Group Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Group Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter group name..."
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={isSubmitting}
                  className="text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <div className="relative">
                  <Folder className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                  <Select
                    value={formData.category_id}
                    onValueChange={(val) => handleInputChange("category_id", val)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="pl-9">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the group..."
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={4}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mission">Mission</Label>
                <div className="relative">
                  <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="mission"
                    placeholder="Group mission statement..."
                    value={formData.mission}
                    onChange={(e) => handleInputChange("mission", e.target.value)}
                    rows={3}
                    className="pl-9"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vision">Vision</Label>
                <div className="relative">
                  <Eye className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="vision"
                    placeholder="Group vision statement..."
                    value={formData.vision}
                    onChange={(e) => handleInputChange("vision", e.target.value)}
                    rows={3}
                    className="pl-9"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            {/* </div> */}

            <div className="space-y-2">
              <Label htmlFor="leader">Leader</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                <Select
                  value={formData.leader_id}
                  onValueChange={(val) => handleInputChange("leader_id", val)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="pl-9">
                    <SelectValue placeholder="Select a leader" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange("contact_email", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  placeholder="+1234567890"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange("contact_phone", e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting_location">Meeting Location</Label>
              <Input
                id="meeting_location"
                placeholder="e.g. Parish Hall, Room 3"
                value={formData.meeting_location}
                onChange={(e) => handleInputChange("meeting_location", e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting_schedule">Meeting Schedule</Label>
              <Textarea
                id="meeting_schedule"
                placeholder="e.g. Every Sunday at 4pm"
                value={formData.meeting_schedule}
                onChange={(e) => handleInputChange("meeting_schedule", e.target.value)}
                rows={2}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                placeholder="Membership requirements..."
                value={formData.requirements}
                onChange={(e) => handleInputChange("requirements", e.target.value)}
                rows={2}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="activities">Activities</Label>
              <Textarea
                id="activities"
                placeholder="List of activities..."
                value={formData.activities}
                onChange={(e) => handleInputChange("activities", e.target.value)}
                rows={2}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                placeholder="https://example.com/image.jpg"
                value={formData.image}
                onChange={(e) => handleInputChange("image", e.target.value)}
                disabled={isSubmitting}
              />
            </div>
        {/* </div> */}
      </CardContent>
    </Card>
        </div >

  {/* Sidebar */ }
  < div className = "space-y-6" >
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
                ? "Group is visible"
                : "Group is hidden"}
            </p>
          </div>
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => handleInputChange("is_active", checked)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(val) => handleInputChange("status", val)}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="is_featured" className="cursor-pointer">
              Featured
            </Label>
            <p className="text-xs text-muted-foreground">
              Highlight this group
            </p>
          </div>
          <Switch
            id="is_featured"
            checked={formData.is_featured}
            onCheckedChange={(checked) => handleInputChange("is_featured", checked)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sort_order">Sort Order</Label>
          <Input
            id="sort_order"
            type="number"
            value={formData.sort_order}
            onChange={(e) => handleInputChange("sort_order", e.target.value)}
            disabled={isSubmitting}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="accepting_members" className="cursor-pointer">
              Accepting Members
            </Label>
            <p className="text-xs text-muted-foreground">
              {formData.accepting_members
                ? "New members can join"
                : "Membership is closed"}
            </p>
          </div>
          <Switch
            id="accepting_members"
            checked={formData.accepting_members}
            onCheckedChange={(checked) => handleInputChange("accepting_members", checked)}
            disabled={isSubmitting}
          />
        </div>
      </CardContent>
    </Card>

{/* Action Buttons */ }
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
          ? "Update Group"
          : "Create Group"}
    </Button>
    <Button
      variant="outline"
      onClick={() => navigate("/admin/groups")}
      disabled={isSubmitting}
      className="w-full"
    >
      Cancel
    </Button>
  </CardContent>
</Card>
      </div >
    </div >
    </div >
  );
};

export default GroupFormPage;

