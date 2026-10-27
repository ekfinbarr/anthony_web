import { apiClient } from "@/lib/apiClient";

export interface WorkflowAssignee {
  id?: string;
  tier: "primary" | "backup";
  assignee_kind: "role" | "user";
  role_name?: string | null;
  user_id?: string | null;
  sort_order?: number;
}

export interface WorkflowStep {
  id?: string;
  name: string;
  description?: string;
  step_order: number;
  mode: "sequential" | "parallel";
  quorum: number;
  sla_hours?: number | null;
  backup_activation_policy?: string;
  backups_count_toward_quorum?: boolean;
  assignees?: WorkflowAssignee[];
}

export interface WorkflowRule {
  id?: string;
  content_type: string;
  operation: string;
  priority?: number;
  specificity?: number;
  conditions?: Record<string, unknown> | null;
  is_mandatory?: boolean;
  is_active?: boolean;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string | null;
  status: string;
  effective_from?: string | null;
  effective_until?: string | null;
  allow_self_approval: boolean;
  publish_behavior: string;
  rejection_behavior: string;
  rules?: WorkflowRule[];
  active_version?: {
    id: string;
    version_number: number;
    status: string;
    steps?: WorkflowStep[];
  } | null;
  versions?: Array<{
    id: string;
    version_number: number;
    status: string;
    steps?: WorkflowStep[];
  }>;
  created_at?: string;
  updated_at?: string;
}

type Paginated<T> = { data: T[]; meta?: Record<string, number> };

export const listWorkflows = async (params?: { status?: string; search?: string; per_page?: number }) => {
  const res = await apiClient.get<Paginated<WorkflowDefinition>>("admin/workflows", params);
  return res.data;
};

export const getWorkflow = async (id: string): Promise<WorkflowDefinition> => {
  const res = await apiClient.get<{ data: WorkflowDefinition }>(`admin/workflows/${id}`);
  return res.data.data;
};

export const createWorkflow = async (payload: Record<string, unknown>) => {
  const res = await apiClient.post<{ message: string; data: WorkflowDefinition }>("admin/workflows", payload);
  return res.data;
};

export const updateWorkflow = async (id: string, payload: Record<string, unknown>) => {
  const res = await apiClient.put<{ message: string; data: WorkflowDefinition }>(`admin/workflows/${id}`, payload);
  return res.data;
};

export const activateWorkflow = async (id: string) => {
  const res = await apiClient.post<{ message: string; data: WorkflowDefinition }>(`admin/workflows/${id}/activate`);
  return res.data;
};

export const deactivateWorkflow = async (id: string) => {
  const res = await apiClient.post<{ message: string; data: WorkflowDefinition }>(`admin/workflows/${id}/deactivate`);
  return res.data;
};

export const duplicateWorkflow = async (id: string) => {
  const res = await apiClient.post<{ message: string; data: WorkflowDefinition }>(`admin/workflows/${id}/duplicate`);
  return res.data;
};

export const validateWorkflow = async (id: string) => {
  const res = await apiClient.post<{ valid: boolean; errors: string[] }>(`admin/workflows/${id}/validate`);
  return res.data;
};

export const archiveWorkflow = async (id: string) => {
  const res = await apiClient.post<{ message: string; data: WorkflowDefinition }>(`admin/workflows/${id}/archive`);
  return res.data;
};

export const getWorkflowVersions = async (id: string) => {
  const res = await apiClient.get<{ data: NonNullable<WorkflowDefinition["versions"]> }>(`admin/workflows/${id}/versions`);
  return res.data.data;
};

export interface WorkflowBuilderMeta {
  roles: string[];
  users: Array<{ id: string; name: string; email: string; roles: string[] }>;
  content_types: Array<{ key: string; label: string; approval_mode: string; sensitive: boolean; wave?: number | null }>;
  workflow_enabled: boolean;
}

export const getWorkflowMeta = async (): Promise<WorkflowBuilderMeta> => {
  const res = await apiClient.get<{ data: WorkflowBuilderMeta }>("admin/workflows/meta");
  return res.data.data;
};
