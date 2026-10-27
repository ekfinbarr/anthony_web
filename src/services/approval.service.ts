import { apiClient } from "@/lib/apiClient";
import { downloadAuthenticatedFile } from "@/lib/downloadCsv";

export interface ApprovalRequestSummary {
  id: string;
  content_type: string;
  operation: string;
  status: string;
  priority: string;
  is_sensitive: boolean;
  preview?: { title?: string; type_label?: string; edit_url?: string | null } | null;
  requester?: { id: string; name: string; email?: string };
  workflow?: { id: string; name: string };
  current_step?: {
    id: string;
    name: string;
    step_order: number;
    status: string;
    due_at?: string | null;
    quorum: number;
    backups_activated: boolean;
  } | null;
  my_assignment?: { id: string; tier: "primary" | "backup"; status: "pending" | "standby" } | null;
  submitted_at?: string | null;
  completed_at?: string | null;
  created_at?: string;
}

export interface ApprovalViewerCapabilities {
  can_decide: boolean;
  can_override: boolean;
  can_withdraw: boolean;
  can_resubmit: boolean;
  can_publish: boolean;
  can_reassign: boolean;
  can_cancel: boolean;
}

export interface ApprovalRequestDetail extends ApprovalRequestSummary {
  step_instances?: Array<{
    id: string;
    name: string;
    step_order: number;
    mode: string;
    quorum: number;
    status: string;
    due_at?: string | null;
    backups_activated: boolean;
    assignments: Array<{
      id: string;
      user_id: string;
      user?: { id: string; name: string } | null;
      tier: string;
      status: string;
      source_role?: string | null;
      activated_at?: string | null;
    }>;
  }>;
  decisions?: Array<{
    id: string;
    decision: string;
    reason?: string | null;
    is_override: boolean;
    decision_source: string;
    actor?: { id: string; name: string } | null;
    created_at?: string;
  }>;
  comments?: Array<{
    id: string;
    body: string;
    visibility: string;
    author_id: string;
    author?: { id: string; name: string } | null;
    created_at?: string;
  }>;
  audit_events?: Array<{
    id: string;
    action: string;
    payload?: Record<string, unknown> | null;
    actor?: { id: string; name: string } | null;
    created_at?: string;
  }>;
  viewer?: ApprovalViewerCapabilities;
  current_revision?: {
    id: string;
    revision_number: number;
    material_hash: string;
    payload: Record<string, unknown>;
  } | null;
}

export interface ApprovalOverview {
  total_pending: number;
  awaiting_my_approval: number;
  changes_requested: number;
  overdue: number;
  approved: number;
  rejected: number;
  average_approval_hours: number | null;
}

type Paginated<T> = {
  data: T[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

export const getOverview = async (): Promise<ApprovalOverview> => {
  const res = await apiClient.get<{ data: ApprovalOverview }>("admin/approvals/overview");
  return res.data.data;
};

export const getQueue = async (params?: {
  per_page?: number;
  content_type?: string;
  include_standby?: boolean | string;
}): Promise<Paginated<ApprovalRequestSummary>> => {
  const res = await apiClient.get<Paginated<ApprovalRequestSummary>>("admin/approvals/queue", params);
  return res.data;
};

export const listRequests = async (params?: Record<string, string | number | undefined>) => {
  const res = await apiClient.get<Paginated<ApprovalRequestSummary>>("admin/approvals", params);
  return res.data;
};

export const getRequest = async (id: string): Promise<ApprovalRequestDetail> => {
  const res = await apiClient.get<{ data: ApprovalRequestDetail }>(`admin/approvals/${id}`);
  return res.data.data;
};

export const decide = async (
  id: string,
  payload: { decision: "approve" | "reject" | "request_info"; reason?: string; idempotency_key?: string }
) => {
  const res = await apiClient.post<{ message: string; data: ApprovalRequestDetail }>(
    `admin/approvals/${id}/decide`,
    payload
  );
  return res.data;
};

export const override = async (
  id: string,
  payload: { action: "force_approve_step" | "force_complete" | "bypass_publish"; reason: string }
) => {
  const res = await apiClient.post<{ message: string; data: ApprovalRequestDetail }>(
    `admin/approvals/${id}/override`,
    payload
  );
  return res.data;
};

export const activateBackups = async (id: string) => {
  const res = await apiClient.post<{ message: string; activated: number; data: ApprovalRequestDetail }>(
    `admin/approvals/${id}/activate-backups`
  );
  return res.data;
};

export const getReports = async (params?: { content_type?: string; from?: string; to?: string }) => {
  const res = await apiClient.get<{ data: Record<string, unknown> }>("admin/approvals/reports", params);
  return res.data.data;
};

export const getContentTypes = async () => {
  const res = await apiClient.get<{
    data: Array<{
      key: string;
      label: string;
      approval_mode: string;
      sensitive: boolean;
      has_adapter: boolean;
      wave?: number;
    }>;
  }>("admin/approvals/content-types");
  return res.data.data;
};

export interface ApprovalAlerts {
  routing_conflicts: Array<{
    content_type: string | null;
    operation: string | null;
    rule_ids: string[];
    detected_at?: string | null;
  }>;
  stranded_steps: Array<{
    approval_request_id: string;
    step_instance_id: string;
    step_name: string;
    content_type?: string | null;
    has_standby_backups: boolean;
  }>;
}

type ActionResult = { message: string; data: ApprovalRequestDetail };

export const getAlerts = async (): Promise<ApprovalAlerts> => {
  const res = await apiClient.get<{ data: ApprovalAlerts }>("admin/approvals/alerts");
  return res.data.data;
};

/** Submit any registered content item into its approval workflow. */
export const submitForReview = async (contentType: string, contentId: string) => {
  const res = await apiClient.post<ActionResult>("admin/approvals/submit", {
    content_type: contentType,
    content_id: contentId,
  });
  return res.data;
};

export const resubmit = async (id: string, response?: string) => {
  const res = await apiClient.post<ActionResult>(`admin/approvals/${id}/resubmit`, { response });
  return res.data;
};

export const withdraw = async (id: string) => {
  const res = await apiClient.post<ActionResult>(`admin/approvals/${id}/withdraw`);
  return res.data;
};

/** Super-admin only: void an in-flight request. */
export const cancelRequest = async (id: string, reason: string) => {
  const res = await apiClient.post<ActionResult>(`admin/approvals/${id}/cancel`, { reason });
  return res.data;
};

export const reassign = async (id: string, payload: { assignment_id: string; user_id: string; reason?: string }) => {
  const res = await apiClient.post<ActionResult>(`admin/approvals/${id}/reassign`, payload);
  return res.data;
};

/** Take approved content live (manual / scheduled publish behaviour). */
export const publishApproved = async (id: string) => {
  const res = await apiClient.post<ActionResult>(`admin/approvals/${id}/publish`);
  return res.data;
};

export const addComment = async (id: string, body: string, visibility: "internal" | "requester" = "internal") => {
  const res = await apiClient.post<{ message: string }>(`admin/approvals/${id}/comments`, { body, visibility });
  return res.data;
};

export const exportRequestsCsv = (params?: { content_type?: string; status?: string; from?: string; to?: string }) =>
  downloadAuthenticatedFile(
    "admin/approvals/reports/export",
    `approval-requests-${new Date().toISOString().slice(0, 10)}.csv`,
    params
  );

/** Human-readable label for an approval status or audit action. */
export const humanize = (value: string) =>
  value.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
