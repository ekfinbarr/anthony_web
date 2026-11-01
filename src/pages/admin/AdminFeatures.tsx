import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FEATURE_ROLE_OPTIONS, type FeatureAudience } from "@/config/features";
import featureService, { type AdminFeature } from "@/services/feature.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const AUDIENCES: { value: FeatureAudience; label: string }[] = [
  { value: "everyone", label: "Everyone" },
  { value: "guests", label: "Guests only" },
  { value: "authenticated", label: "Signed-in users" },
  { value: "roles", label: "Selected roles" },
];

const AdminFeatures = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["admin-features"],
    queryFn: () => featureService.listAdmin(),
  });
  const [draft, setDraft] = useState<AdminFeature[] | null>(null);

  useEffect(() => {
    if (query.data) setDraft(query.data);
  }, [query.data]);

  const groups = useMemo(() => {
    const map = new Map<string, AdminFeature[]>();
    for (const feature of draft ?? []) {
      const list = map.get(feature.group) ?? [];
      list.push(feature);
      map.set(feature.group, list);
    }
    return Array.from(map.entries());
  }, [draft]);

  const save = useMutation({
    mutationFn: () =>
      featureService.updateAdmin(
        (draft ?? []).map((feature) => ({
          key: feature.key,
          enabled: feature.enabled,
          audience: feature.audience,
          roles: feature.audience === "roles" ? feature.roles : [],
          hide_when_empty: feature.hide_when_empty,
        })),
      ),
    onSuccess: (data) => {
      setDraft(data);
      queryClient.setQueryData(["admin-features"], data);
      void queryClient.invalidateQueries({ queryKey: ["features", "public"] });
      toast({ title: "Features saved", description: "Public menus will follow these choices within a few minutes." });
    },
    onError: () => {
      toast({ title: "Could not save features", variant: "destructive" });
    },
  });

  const patch = (key: string, change: Partial<AdminFeature>) => {
    setDraft((current) => current?.map((feature) => (feature.key === key ? { ...feature, ...change } : feature)) ?? current);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Features</h1>
          <p className="text-muted-foreground">
            Turn parish site modules on or off. Admin pages stay available so content can be prepared first.
          </p>
        </div>
        <Button onClick={() => save.mutate()} disabled={!draft || save.isPending}>
          {save.isPending ? "Saving..." : "Save features"}
        </Button>
      </div>

      {query.isLoading && <p className="text-sm text-muted-foreground">Loading features...</p>}
      {query.isError && <p className="text-sm text-destructive">Features could not be loaded.</p>}

      {groups.map(([group, features]) => (
        <Card key={group}>
          <CardHeader>
            <CardTitle>{group}</CardTitle>
            <CardDescription>These choices apply to the public site. They do not hide the matching admin screens.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {features.map((feature) => (
              <div key={feature.key} className={feature.parent ? "border-l pl-4" : ""}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Label htmlFor={`feature-${feature.key}`} className="text-base">{feature.label}</Label>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                  <Switch
                    id={`feature-${feature.key}`}
                    checked={feature.enabled}
                    disabled={feature.locked || save.isPending}
                    onCheckedChange={(enabled) => patch(feature.key, { enabled })}
                  />
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor={`audience-${feature.key}`}>Who can see it</Label>
                    <Select
                      value={feature.audience}
                      disabled={feature.locked || save.isPending}
                      onValueChange={(audience: FeatureAudience) => patch(feature.key, { audience })}
                    >
                      <SelectTrigger id={`audience-${feature.key}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {AUDIENCES.map((audience) => (
                          <SelectItem key={audience.value} value={audience.value}>{audience.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {feature.supports_hide_when_empty && (
                    <div className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
                      <Label htmlFor={`empty-${feature.key}`} className="font-normal">
                        Hide from menus when nothing is published
                      </Label>
                      <Switch
                        id={`empty-${feature.key}`}
                        checked={feature.hide_when_empty}
                        disabled={feature.locked || save.isPending}
                        onCheckedChange={(hide_when_empty) => patch(feature.key, { hide_when_empty })}
                      />
                    </div>
                  )}
                </div>
                {feature.audience === "roles" && (
                  <fieldset className="mt-3" disabled={feature.locked || save.isPending}>
                    <legend className="mb-2 text-sm font-medium">Roles</legend>
                    <div className="flex flex-wrap gap-3">
                      {FEATURE_ROLE_OPTIONS.map((role) => (
                        <label key={role} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={feature.roles.includes(role)}
                            onChange={(event) => {
                              const roles = event.target.checked
                                ? [...feature.roles, role]
                                : feature.roles.filter((item) => item !== role);
                              patch(feature.key, { roles });
                            }}
                          />
                          {role.replace(/_/g, " ")}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}
                {feature.locked && (
                  <p className="mt-2 text-sm text-muted-foreground">Turn the parent feature on to change this.</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminFeatures;
