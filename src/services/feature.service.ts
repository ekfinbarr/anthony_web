import { apiClient } from "@/lib/apiClient";
import type { FeatureAudience, FeatureSnapshot } from "@/config/features";

export interface AdminFeature {
  key: string;
  label: string;
  description: string;
  group: string;
  parent: string | null;
  supports_hide_when_empty: boolean;
  sort: number;
  enabled: boolean;
  audience: FeatureAudience;
  roles: string[];
  hide_when_empty: boolean;
  locked: boolean;
}

export type FeatureUpdate = Pick<AdminFeature, "key" | "enabled" | "audience" | "roles" | "hide_when_empty">;

const getPublic = async (): Promise<FeatureSnapshot> => {
  const res = await apiClient.get<{ data: FeatureSnapshot }>("features", undefined, { auth: false });
  return res.data.data;
};

const listAdmin = async (): Promise<AdminFeature[]> => {
  const res = await apiClient.get<{ data: AdminFeature[] }>("admin/features");
  return res.data.data;
};

const updateAdmin = async (features: FeatureUpdate[]): Promise<AdminFeature[]> => {
  const res = await apiClient.put<{ data: AdminFeature[] }>("admin/features", { features });
  return res.data.data;
};

const featureService = { getPublic, listAdmin, updateAdmin };

export default featureService;
