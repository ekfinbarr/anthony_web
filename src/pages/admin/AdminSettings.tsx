import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import siteSettingService, { SiteSetting, SiteSettingType } from "@/services/siteSetting.service";
import rbacService, { Permission, Role } from "@/services/rbac.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SectionKey = "general" | "account_payment" | "system" | "roles_permissions";

function sectionLabel(section: SectionKey) {
  if (section === "general") return "General Settings";
  if (section === "account_payment") return "Account & Payment Settings";
  if (section === "roles_permissions") return "Roles & Permissions";
  return "System Preferences";
}

function isSensitive(setting: SiteSetting) {
  const k = `${setting.key} ${setting.group} ${setting.label}`.toLowerCase();
  return (
    k.includes("paystack") ||
    k.includes("stripe") ||
    k.includes("secret") ||
    k.includes("api_key") ||
    k.includes("token") ||
    k.includes("smtp") ||
    k.includes("mail") ||
    k.includes("password")
  );
}

function coerceValue(type: SiteSettingType, value: string | null) {
  if (type === "boolean") return value === "1" || value === "true";
  return value ?? "";
}

function stringifyValue(type: SiteSettingType, value: unknown): string | null {
  if (type === "boolean") return (value ? "1" : "0");
  if (type === "number") {
    const n = typeof value === "number" ? value : Number(String(value));
    if (!Number.isFinite(n)) return null;
    return String(n);
  }
  if (type === "json") {
    if (typeof value === "string") return value;
    try {
      return JSON.stringify(value);
    } catch {
      return null;
    }
  }
  return typeof value === "string" ? value : value === null || value === undefined ? null : String(value);
}

function inferSection(setting: SiteSetting): SectionKey {
  const g = (setting.group || "").toLowerCase();
  const k = (setting.key || "").toLowerCase();

  if (g.includes("payment") || g.includes("donation") || g.includes("billing") || k.includes("paystack") || k.includes("stripe")) {
    return "account_payment";
  }
  if (g.includes("system") || g.includes("security") || g.includes("preferences") || g.includes("seo")) {
    return "system";
  }
  return "general";
}

function normalizeCollection<T>(res: { data: T[] } | T[] | undefined): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  return res.data || [];
}

type UnknownRecord = Record<string, unknown>;
const isRecord = (v: unknown): v is UnknownRecord => typeof v === "object" && v !== null;

const isNotFoundError = (e: unknown): boolean => isRecord(e) && typeof e.status === "number" && e.status === 404;

function rolePermissionNames(role: Role | null): string[] {
  if (!role) return [];
  // Backend may return: { permissions: string[] } OR { permission_names: string[] }
  const r = role as unknown;
  if (!isRecord(r)) return [];
  const perms = r.permissions;
  const names = r.permission_names;
  const arr = Array.isArray(perms) ? perms : Array.isArray(names) ? names : [];
  return arr.filter((x): x is string => typeof x === "string");
}

function groupPermissions(perms: Permission[]) {
  const map = new Map<string, Permission[]>();
  perms.forEach((p) => {
    const module =
      p.module ||
      (p.name.includes(".") ? p.name.split(".")[0] : p.name.includes(":") ? p.name.split(":")[0] : "general");
    const key = module || "general";
    const list = map.get(key) || [];
    list.push(p);
    map.set(key, list);
  });
  return Array.from(map.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([module, list]) => ({ module, permissions: list.sort((a, b) => a.name.localeCompare(b.name)) }));
}

const AdminSettings = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<SectionKey>("general");

  const settingsQuery = useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: () => siteSettingService.list(),
  });

  // Memoize to avoid changing dependencies caused by `settingsQuery.data?.data ?? []` expression.
  const settings: SiteSetting[] = useMemo(() => settingsQuery.data?.data ?? [], [settingsQuery.data]);

  // Roles & Permissions (optional / deployment-dependent)
  const rolesQuery = useQuery({
    queryKey: ["admin-rbac-roles"],
    queryFn: () => rbacService.listRoles(),
    enabled: activeTab === "roles_permissions",
    retry: false,
  });

  const permissionsQuery = useQuery({
    queryKey: ["admin-rbac-permissions"],
    queryFn: () => rbacService.listPermissions(),
    enabled: activeTab === "roles_permissions",
    retry: false,
  });

  const roles = useMemo(() => normalizeCollection<Role>(rolesQuery.data), [rolesQuery.data]);
  const permissions = useMemo(() => normalizeCollection<Permission>(permissionsQuery.data), [permissionsQuery.data]);
  const permissionGroups = useMemo(() => groupPermissions(permissions), [permissions]);

  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const selectedRole = useMemo(() => roles.find((r) => r.id === selectedRoleId) || null, [roles, selectedRoleId]);
  const [roleDraftName, setRoleDraftName] = useState("");
  const [roleDraftDescription, setRoleDraftDescription] = useState("");
  const [roleDraftPermissions, setRoleDraftPermissions] = useState<Record<string, boolean>>({});

  // When switching roles, seed drafts.
  useEffect(() => {
    if (!selectedRole) return;
    // Avoid synchronous setState inside an effect body (prevents cascading renders).
    const t = setTimeout(() => {
      setRoleDraftName(selectedRole.name || "");
      setRoleDraftDescription(selectedRole.description || "");
      const existing = new Set<string>(rolePermissionNames(selectedRole));
      const next: Record<string, boolean> = {};
      permissions.forEach((p) => {
        next[p.name] = existing.has(p.name);
      });
      setRoleDraftPermissions(next);
    }, 0);
    return () => clearTimeout(t);
  }, [selectedRoleId, selectedRole, permissions]);

  const saveRoleMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRole) throw new Error("No role selected");
      await rbacService.updateRole(selectedRole.id, { name: roleDraftName.trim(), description: roleDraftDescription.trim() || null });
      const enabled = Object.entries(roleDraftPermissions).filter(([, v]) => v).map(([k]) => k);
      await rbacService.setRolePermissions(selectedRole.id, enabled);
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Role updated successfully." });
      qc.invalidateQueries({ queryKey: ["admin-rbac-roles"] });
      qc.invalidateQueries({ queryKey: ["admin-rbac-permissions"] });
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to update role";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: async () => {
      if (!roleDraftName.trim()) throw new Error("Role name is required");
      return rbacService.createRole({ name: roleDraftName.trim(), description: roleDraftDescription.trim() || null });
    },
    onSuccess: () => {
      toast({ title: "Created", description: "Role created successfully." });
      qc.invalidateQueries({ queryKey: ["admin-rbac-roles"] });
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to create role";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRole) throw new Error("No role selected");
      if (selectedRole.is_system) throw new Error("System roles cannot be deleted");
      return rbacService.deleteRole(selectedRole.id);
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Role deleted successfully." });
      setSelectedRoleId("");
      qc.invalidateQueries({ queryKey: ["admin-rbac-roles"] });
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to delete role";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const grouped = useMemo(() => {
    const map: Record<SectionKey, SiteSetting[]> = {
      general: [],
      account_payment: [],
      system: [],
    };
    settings.forEach((s) => {
      map[inferSection(s)].push(s);
    });
    (Object.keys(map) as SectionKey[]).forEach((k) => {
      map[k].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    });
    return map;
  }, [settings]);

  const [draft, setDraft] = useState<Record<string, unknown>>({});

  const getDraft = (s: SiteSetting) => {
    if (Object.prototype.hasOwnProperty.call(draft, s.key)) return draft[s.key];
    return coerceValue(s.type, s.value);
  };

  const setDraftValue = (key: string, value: unknown) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const bulkSaveMutation = useMutation({
    mutationFn: async (keys: string[]) => {
      const payload = keys.map((key) => {
        const setting = settings.find((s) => s.key === key);
        const type = setting?.type ?? "string";
        return { key, value: stringifyValue(type, draft[key]) };
      });
      return siteSettingService.bulkUpdate(payload);
    },
    onSuccess: () => {
      toast({ title: "Saved", description: "Settings updated successfully." });
      setDraft({});
      qc.invalidateQueries({ queryKey: ["admin-site-settings"] });
    },
    onError: (e: unknown) => {
      const message = e instanceof Error ? e.message : "Failed to save settings";
      toast({ title: "Error", description: message, variant: "destructive" });
    },
  });

  const changedKeysBySection = useMemo(() => {
    const keys = Object.keys(draft);
    const by: Record<SectionKey, string[]> = { general: [], account_payment: [], system: [] };
    for (const k of keys) {
      const setting = settings.find((s) => s.key === k);
      if (!setting) continue;
      by[inferSection(setting)].push(k);
    }
    return by;
  }, [draft, settings]);

  const renderSettingInput = (s: SiteSetting) => {
    const value = getDraft(s);

    if (s.type === "boolean") {
      return (
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">{s.label}</p>
            {s.description ? <p className="text-sm text-muted-foreground">{s.description}</p> : null}
          </div>
          <Switch checked={Boolean(value)} onCheckedChange={(v) => setDraftValue(s.key, v)} />
        </div>
      );
    }

    if (s.type === "text") {
      return (
        <div className="space-y-2">
          <Label>{s.label}</Label>
          <Textarea value={String(value)} onChange={(e) => setDraftValue(s.key, e.target.value)} rows={4} />
          {s.description ? <p className="text-xs text-muted-foreground">{s.description}</p> : null}
        </div>
      );
    }

    if (s.type === "json") {
      return (
        <div className="space-y-2">
          <Label>{s.label}</Label>
          <Textarea value={String(value)} onChange={(e) => setDraftValue(s.key, e.target.value)} rows={6} className="font-mono text-sm" />
          <p className="text-xs text-muted-foreground">{s.description || "Must be valid JSON."}</p>
        </div>
      );
    }

    if (s.type === "number") {
      return (
        <div className="space-y-2">
          <Label>{s.label}</Label>
          <Input type="number" value={String(value)} onChange={(e) => setDraftValue(s.key, e.target.value)} />
          {s.description ? <p className="text-xs text-muted-foreground">{s.description}</p> : null}
        </div>
      );
    }

    // string/url/image fallback
    return (
      <div className="space-y-2">
        <Label>{s.label}</Label>
        <Input value={String(value)} onChange={(e) => setDraftValue(s.key, e.target.value)} />
        {s.type === "image" && String(value) ? (
          <div className="rounded-lg border overflow-hidden">
            <img src={String(value)} alt={s.label} className="w-full h-40 object-cover" />
          </div>
        ) : null}
        {s.description ? <p className="text-xs text-muted-foreground">{s.description}</p> : null}
      </div>
    );
  };

  const renderSection = (section: SectionKey) => {
    const sectionSettings = grouped[section];
    const changedKeys = changedKeysBySection[section] || [];

    return (
      <div className="space-y-4">
        {sectionSettings.some(isSensitive) ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Sensitive settings</AlertTitle>
            <AlertDescription>
              Changing payment / credentials may affect live services. Double-check values before saving.
            </AlertDescription>
          </Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>{sectionLabel(section)}</CardTitle>
            <CardDescription>These settings are loaded from the backend and saved in bulk.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {settingsQuery.isLoading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : sectionSettings.length === 0 ? (
              <div className="text-sm text-muted-foreground">No settings found for this section.</div>
            ) : (
              sectionSettings.map((s) => (
                <div key={s.key} className="rounded-lg border p-4">
                  <div className="mb-2">
                    <div className="text-xs text-muted-foreground">{s.group} • {s.key}</div>
                  </div>
                  {renderSettingInput(s)}
                </div>
              ))
            )}

            <div className="flex flex-col sm:flex-row gap-2 justify-end">
              <Button
                className="gap-2"
                disabled={bulkSaveMutation.isPending || changedKeys.length === 0}
                onClick={() => bulkSaveMutation.mutate(changedKeys)}
              >
                <Save className="h-4 w-4" />
                {bulkSaveMutation.isPending ? "Saving..." : changedKeys.length ? `Save (${changedKeys.length})` : "Saved"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderRolesPermissions = () => {
    const rbacUnavailable = isNotFoundError(rolesQuery.error) || isNotFoundError(permissionsQuery.error);

    if (rbacUnavailable) {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Roles & Permissions</CardTitle>
            <CardDescription>RBAC API endpoints are not available in this deployment.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Enable role/permission endpoints on the backend to manage RBAC from the admin UI.
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Roles</CardTitle>
            <CardDescription>Select a role to edit permissions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {rolesQuery.isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="space-y-2">
                <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-xs text-muted-foreground">
                  System roles are protected from deletion.
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Permissions Assignment</CardTitle>
            <CardDescription>Matrix grouped by module.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!selectedRole ? (
              <div className="text-sm text-muted-foreground">Select a role to edit.</div>
            ) : permissionsQuery.isLoading ? (
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role name</Label>
                    <Input value={roleDraftName} onChange={(e) => setRoleDraftName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={roleDraftDescription} onChange={(e) => setRoleDraftDescription(e.target.value)} placeholder="(optional)" />
                  </div>
                </div>

                {permissionGroups.map((g) => (
                  <div key={g.module} className="rounded-lg border p-4">
                    <div className="font-medium mb-3 capitalize">{g.module}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {g.permissions.map((p) => (
                        <label key={p.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={Boolean(roleDraftPermissions[p.name])}
                            onChange={(e) =>
                              setRoleDraftPermissions((prev) => ({ ...prev, [p.name]: e.target.checked }))
                            }
                          />
                          <span className="truncate">{p.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex flex-col sm:flex-row gap-2 justify-end">
                  <Button
                    variant="destructive"
                    disabled={!!selectedRole?.is_system || deleteRoleMutation.isPending}
                    onClick={() => deleteRoleMutation.mutate()}
                  >
                    Delete Role
                  </Button>
                  <Button variant="outline" disabled={createRoleMutation.isPending} onClick={() => createRoleMutation.mutate()}>
                    Create Role (from current name/description)
                  </Button>
                  <Button className="gap-2" disabled={saveRoleMutation.isPending} onClick={() => saveRoleMutation.mutate()}>
                    <Save className="h-4 w-4" />
                    {saveRoleMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Admin Settings</h1>
        <p className="text-muted-foreground mt-1">Manage system settings and configurations.</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SectionKey)} className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="account_payment">Account & Payment</TabsTrigger>
          <TabsTrigger value="system">System Preferences</TabsTrigger>
          <TabsTrigger value="roles_permissions">Roles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="general">{renderSection("general")}</TabsContent>
        <TabsContent value="account_payment">{renderSection("account_payment")}</TabsContent>
        <TabsContent value="system">{renderSection("system")}</TabsContent>
        <TabsContent value="roles_permissions">{renderRolesPermissions()}</TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
