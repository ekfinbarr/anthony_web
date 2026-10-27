import { apiClient } from "@/lib/apiClient";

export interface BulkActionDef {
  key: string;
  label: string;
  tone: "default" | "success" | "warning" | "danger";
  confirm: boolean;
  reason: boolean;
}

export interface BulkResult {
  action: string;
  requested: number;
  succeeded: Array<{ id: string; note: string | null }>;
  failed: Array<{ id: string; reason: string }>;
}

/** Bulk actions the current user may run, keyed by table resource. */
export const getBulkActions = async (): Promise<Record<string, BulkActionDef[]>> => {
  const res = await apiClient.get<{ data: Record<string, BulkActionDef[]> | [] }>("admin/bulk-actions");
  // PHP encodes an empty map as [].
  return Array.isArray(res.data.data) ? {} : res.data.data;
};

/**
 * Runs an action over many records. Resolves with per-item results even when
 * every item failed (HTTP 422), so the UI can always explain what happened.
 */
export const runBulkAction = async (
  resource: string,
  payload: { action: string; ids: string[]; reason?: string }
): Promise<{ message: string; data: BulkResult }> => {
  try {
    const res = await apiClient.post<{ message: string; data: BulkResult }>(`admin/bulk/${resource}`, payload);
    return res.data;
  } catch (error) {
    // ApiError keeps the response body on `raw`.
    const body = (error as { raw?: { message?: string; data?: BulkResult } })?.raw;
    if (body?.data?.failed) return { message: body.message ?? "Nothing was updated.", data: body.data };
    throw error;
  }
};
