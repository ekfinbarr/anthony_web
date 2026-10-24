/**
 * Group / Ministry Form Page
 *
 * Create and edit Serve Others ministries and parish groups/societies.
 */

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ExternalLink, Folder, Save, Trash2, Upload, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import AttachmentUploadModal from "@/components/attachments/AttachmentUploadModal";
import { useToast } from "@/hooks/use-toast";
import ministryService, {
  CreateMinistryPayload,
  JoiningMethod,
  MinistryKind,
  MinistryResource,
  UpdateMinistryPayload,
} from "@/services/ministry.service";
import ministryCategoryService from "@/services/ministryCategory.service";
import userService from "@/services/user.service";

const JOINING_OPTIONS: { value: JoiningMethod; label: string }[] = [
  { value: "online_eoi", label: "Online expression of interest" },
  { value: "download", label: "Downloadable form / resource" },
  { value: "coordinator", label: "Contact ministry coordinator" },
  { value: "parish_office", label: "Contact parish office" },
];

const emptyForm = {
  name: "",
  slug: "",
  kind: "service" as MinistryKind,
  short_description: "",
  description: "",
  full_description: "",
  mission: "",
  vision: "",
  category_ids: [] as string[],
  leader_id: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  contact_instructions: "",
  meeting_location: "",
  meeting_schedule: "",
  requirements: "",
  eligibility: "",
  activities: "",
  joining_instructions: "",
  joining_methods: [] as JoiningMethod[],
  image: "",
  seo_title: "",
  seo_description: "",
  is_active: false,
  accepting_members: true,
  is_featured: false,
  sort_order: 0,
  status: "inactive" as "active" | "inactive" | "suspended",
  published_at: "",
};

const GroupFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [resources, setResources] = useState<MinistryResource[]>([]);

  const { data: ministry, isLoading: isLoadingMinistry } = useQuery({
    queryKey: ["ministry", id],
    queryFn: () => ministryService.getById(id!, true),
    enabled: isEditMode && !!id,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["ministry-categories-all"],
    queryFn: () => ministryCategoryService.list({ per_page: 100, is_active: true }),
  });

  const { data: usersData } = useQuery({
    queryKey: ["users"],
    queryFn: () => userService.list({ per_page: 100 }),
  });

  const categories = categoriesData?.data || [];
  const users = usersData?.data || [];

  useEffect(() => {
    if (!isEditMode || !ministry?.data) return;
    const m = ministry.data;
    const categoryIds =
      m.category_ids?.length
        ? m.category_ids
        : m.categories?.map((c) => c.id).filter(Boolean) ||
          (m.category_id ? [m.category_id] : []);

    const timeoutId = window.setTimeout(() => {
      setFormData({
        name: m.name || "",
        slug: m.slug || "",
        kind: m.kind || "society",
        short_description: m.short_description || "",
        description: m.description || "",
        full_description: m.full_description || "",
        mission: m.mission || "",
        vision: m.vision || "",
        category_ids: categoryIds,
        leader_id: m.leader_id || "",
        contact_name: m.contact_name || "",
        contact_email: m.contact_email || "",
        contact_phone: m.contact_phone || "",
        contact_instructions: m.contact_instructions || "",
        meeting_location: m.meeting_location || "",
        meeting_schedule: m.meeting_schedule
          ? typeof m.meeting_schedule === "string"
            ? m.meeting_schedule
            : JSON.stringify(m.meeting_schedule, null, 2)
          : "",
        requirements: m.requirements || "",
        eligibility: m.eligibility || "",
        activities:
          typeof m.activities === "string"
            ? m.activities
            : m.activities
              ? JSON.stringify(m.activities, null, 2)
              : "",
        joining_instructions: m.joining_instructions || "",
        joining_methods: m.joining_methods || [],
        image: m.image || "",
        seo_title: m.seo_title || "",
        seo_description: m.seo_description || "",
        is_active: m.is_active ?? false,
        accepting_members: m.accepting_members ?? true,
        is_featured: m.is_featured ?? false,
        sort_order: m.sort_order ?? 0,
        status: m.status || "inactive",
        published_at: m.published_at ? m.published_at.slice(0, 16) : "",
      });
      setResources(m.resources || []);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [ministry, isEditMode]);

  const createMutation = useMutation({
    mutationFn: (data: CreateMinistryPayload) => ministryService.create(data),
    onSuccess: async (res) => {
      queryClient.invalidateQueries({ queryKey: ["ministries"] });
      toast({ title: "Success", description: "Saved successfully" });
      const newId = res.data?.id;
      if (newId && resourceFile) {
        await uploadResource(newId);
      }
      navigate(newId ? `/admin/groups/${newId}/edit` : "/admin/groups");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to create", variant: "destructive" });
      setIsSubmitting(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id: mid, data }: { id: string; data: UpdateMinistryPayload }) =>
      ministryService.update(mid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ministries"] });
      queryClient.invalidateQueries({ queryKey: ["ministry", id] });
      toast({ title: "Success", description: "Updated successfully" });
      setIsSubmitting(false);
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message || "Failed to update", variant: "destructive" });
      setIsSubmitting(false);
    },
  });

  const uploadResource = async (ministryId: string) => {
    if (!resourceFile || !resourceTitle.trim()) return;
    const fd = new FormData();
    fd.append("file", resourceFile);
    fd.append("title", resourceTitle.trim());
    fd.append("is_public", "1");
    const created = await ministryService.addResource(ministryId, fd);
    setResources((prev) => [...prev, created]);
    setResourceFile(null);
    setResourceTitle("");
  };

  const handleRemoveResource = async (resourceId: string) => {
    if (!id) return;
    try {
      await ministryService.removeResource(id, resourceId);
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
      toast({ title: "Removed", description: "Resource deleted" });
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Failed to delete resource",
        variant: "destructive",
      });
    }
  };

  const toggleCategory = (categoryId: string) => {
    setFormData((prev) => {
      const exists = prev.category_ids.includes(categoryId);
      return {
        ...prev,
        category_ids: exists
          ? prev.category_ids.filter((c) => c !== categoryId)
          : [...prev.category_ids, categoryId],
      };
    });
  };

  const toggleJoiningMethod = (method: JoiningMethod) => {
    setFormData((prev) => {
      const exists = prev.joining_methods.includes(method);
      return {
        ...prev,
        joining_methods: exists
          ? prev.joining_methods.filter((m) => m !== method)
          : [...prev.joining_methods, method],
      };
    });
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

    setIsSubmitting(true);

    const payload: CreateMinistryPayload = {
      name: formData.name.trim(),
      slug: formData.slug.trim() || undefined,
      kind: formData.kind,
      short_description: formData.short_description.trim() || undefined,
      description: formData.description.trim() || undefined,
      full_description: formData.full_description || undefined,
      mission: formData.mission.trim() || undefined,
      vision: formData.vision.trim() || undefined,
      category_ids: formData.category_ids,
      category_id: formData.category_ids[0],
      leader_id: formData.leader_id || undefined,
      contact_name: formData.contact_name.trim() || undefined,
      contact_email: formData.contact_email.trim() || undefined,
      contact_phone: formData.contact_phone.trim() || undefined,
      contact_instructions: formData.contact_instructions.trim() || undefined,
      meeting_location: formData.meeting_location.trim() || undefined,
      meeting_schedule: formData.meeting_schedule.trim() || undefined,
      requirements: formData.requirements.trim() || undefined,
      eligibility: formData.eligibility || undefined,
      activities: formData.activities || undefined,
      joining_instructions: formData.joining_instructions || undefined,
      joining_methods: formData.joining_methods,
      image: formData.image || undefined,
      seo_title: formData.seo_title.trim() || undefined,
      seo_description: formData.seo_description.trim() || undefined,
      is_active: formData.is_active,
      accepting_members: formData.accepting_members,
      is_featured: formData.is_featured,
      sort_order: Number(formData.sort_order) || 0,
      status: formData.status,
      published_at: formData.published_at
        ? new Date(formData.published_at).toISOString()
        : formData.is_active && formData.status === "active"
          ? new Date().toISOString()
          : null,
    };

    if (isEditMode && id) {
      updateMutation.mutate({ id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const previewPath =
    formData.kind === "service" && formData.slug
      ? `/serve-others/${formData.slug}`
      : formData.slug
        ? `/groups#${formData.slug}`
        : null;

  if (isEditMode && isLoadingMinistry) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
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
              <Link to="/admin/groups">Ministries & Groups</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{isEditMode ? "Edit" : "Create"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/groups")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-heading font-bold">
              {isEditMode ? "Edit ministry / group" : "Create ministry / group"}
            </h1>
            <p className="mt-1 text-muted-foreground">
              Service ministries appear under Serve Others; societies under Groups.
            </p>
          </div>
        </div>
        {previewPath && formData.is_active && (
          <Button variant="outline" asChild>
            <a href={previewPath} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Preview
            </a>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Basic information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="slug">URL slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                    placeholder="auto-generated from name"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.kind}
                    onValueChange={(val: MinistryKind) => setFormData((p) => ({ ...p, kind: val }))}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">Serve Others (service ministry)</SelectItem>
                      <SelectItem value="society">Groups & Societies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Categories</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex cursor-pointer items-start gap-2 rounded-md border border-border p-3"
                    >
                      <Checkbox
                        checked={formData.category_ids.includes(cat.id)}
                        onCheckedChange={() => toggleCategory(cat.id)}
                        disabled={isSubmitting}
                      />
                      <span className="text-sm">
                        <span className="font-medium">{cat.name}</span>
                      </span>
                    </label>
                  ))}
                  {categories.length === 0 && (
                    <p className="text-sm text-muted-foreground">No categories yet.</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Short summary</Label>
                <Textarea
                  id="short_description"
                  rows={2}
                  maxLength={500}
                  value={formData.short_description}
                  onChange={(e) => setFormData((p) => ({ ...p, short_description: e.target.value }))}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label>Full description</Label>
                <RichTextEditor
                  value={formData.full_description}
                  onChange={(value) => setFormData((p) => ({ ...p, full_description: value }))}
                  minHeight="220px"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label>Activities & responsibilities</Label>
                <RichTextEditor
                  value={formData.activities}
                  onChange={(value) => setFormData((p) => ({ ...p, activities: value }))}
                  minHeight="180px"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label>Who can join</Label>
                <RichTextEditor
                  value={formData.eligibility}
                  onChange={(value) => setFormData((p) => ({ ...p, eligibility: value }))}
                  minHeight="160px"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label>How to join (instructions)</Label>
                <RichTextEditor
                  value={formData.joining_instructions}
                  onChange={(value) => setFormData((p) => ({ ...p, joining_instructions: value }))}
                  minHeight="160px"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label>Joining methods</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {JOINING_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-border p-3 text-sm"
                    >
                      <Checkbox
                        checked={formData.joining_methods.includes(opt.value)}
                        onCheckedChange={() => toggleJoiningMethod(opt.value)}
                        disabled={isSubmitting}
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact & meetings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Coordinator name</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData((p) => ({ ...p, contact_name: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Leader (user account)</Label>
                  <Select
                    value={formData.leader_id || "none"}
                    onValueChange={(val) =>
                      setFormData((p) => ({ ...p, leader_id: val === "none" ? "" : val }))
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Optional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Public email</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData((p) => ({ ...p, contact_email: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Public phone</Label>
                  <Input
                    id="contact_phone"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData((p) => ({ ...p, contact_phone: e.target.value }))}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_instructions">Contact instructions</Label>
                <Textarea
                  id="contact_instructions"
                  rows={2}
                  value={formData.contact_instructions}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, contact_instructions: e.target.value }))
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="meeting_location">Meeting location</Label>
                  <Input
                    id="meeting_location"
                    value={formData.meeting_location}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, meeting_location: e.target.value }))
                    }
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meeting_schedule">Meeting schedule</Label>
                  <Input
                    id="meeting_schedule"
                    value={formData.meeting_schedule}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, meeting_schedule: e.target.value }))
                    }
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Downloads & resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resources.length > 0 && (
                <ul className="space-y-2">
                  {resources.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2 text-sm"
                    >
                      <div>
                        <p className="font-medium">{r.title}</p>
                        <p className="text-muted-foreground">
                          {r.original_filename || r.mime_type || "Document"}
                        </p>
                      </div>
                      {isEditMode && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveResource(r.id)}
                          aria-label={`Remove ${r.title}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <Input
                  placeholder="Resource title"
                  value={resourceTitle}
                  onChange={(e) => setResourceTitle(e.target.value)}
                  disabled={isSubmitting}
                />
                <Input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => setResourceFile(e.target.files?.[0] || null)}
                  disabled={isSubmitting}
                />
              </div>
              {isEditMode && id ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={!resourceFile || !resourceTitle.trim() || isSubmitting}
                  onClick={() => uploadResource(id)}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload resource
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Save the ministry first, then attach resources — or choose a file now to upload after create.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo_title">Page title</Label>
                <Input
                  id="seo_title"
                  value={formData.seo_title}
                  onChange={(e) => setFormData((p) => ({ ...p, seo_title: e.target.value }))}
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seo_description">Meta description</Label>
                <Textarea
                  id="seo_description"
                  rows={2}
                  value={formData.seo_description}
                  onChange={(e) => setFormData((p) => ({ ...p, seo_description: e.target.value }))}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_active">Published</Label>
                  <p className="text-xs text-muted-foreground">Visible on the public site</p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData((p) => ({
                      ...p,
                      is_active: checked,
                      status: checked ? "active" : "inactive",
                    }))
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="published_at">Publish date</Label>
                <Input
                  id="published_at"
                  type="datetime-local"
                  value={formData.published_at}
                  onChange={(e) => setFormData((p) => ({ ...p, published_at: e.target.value }))}
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_featured">Featured</Label>
                  <p className="text-xs text-muted-foreground">Highlight on landing page</p>
                </div>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData((p) => ({ ...p, is_featured: checked }))}
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="accepting_members">Accepting members</Label>
                </div>
                <Switch
                  id="accepting_members"
                  checked={formData.accepting_members}
                  onCheckedChange={(checked) =>
                    setFormData((p) => ({ ...p, accepting_members: checked }))
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort_order">Display order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, sort_order: Number(e.target.value) || 0 }))
                  }
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Featured image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formData.image ? (
                <img
                  src={formData.image}
                  alt=""
                  className="aspect-video w-full rounded-md object-cover"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-md bg-muted">
                  <Folder className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <Button type="button" variant="outline" className="w-full" onClick={() => setImageModalOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload image
              </Button>
              <Input
                placeholder="Or paste image URL"
                value={formData.image}
                onChange={(e) => setFormData((p) => ({ ...p, image: e.target.value }))}
                disabled={isSubmitting}
              />
            </CardContent>
          </Card>

          <Card className="lg:sticky lg:top-6">
            <CardContent className="space-y-2 p-4">
              <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full" size="lg">
                <Save className="mr-2 h-5 w-5" />
                {isSubmitting ? "Saving…" : isEditMode ? "Update" : "Create"}
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
        </div>
      </div>

      <AttachmentUploadModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        relatedType="ministry"
        relatedId={id || "temp"}
        onUploaded={(url) => {
          setFormData((p) => ({ ...p, image: url }));
          setImageModalOpen(false);
        }}
      />
    </div>
  );
};

export default GroupFormPage;
