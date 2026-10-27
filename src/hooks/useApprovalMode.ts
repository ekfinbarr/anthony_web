import { useQuery } from "@tanstack/react-query";
import { getContentTypes } from "@/services/approval.service";

/**
 * Approval mode the backend applies to a content type: "off" (CMS behaves as
 * before), "optional" (held only when a workflow rule matches) or "required".
 * Falls back to "off" when the user can't read the registry.
 */
export function useApprovalMode(contentType: string) {
  const { data } = useQuery({
    queryKey: ["approval-content-types"],
    queryFn: getContentTypes,
    staleTime: 5 * 60_000,
    retry: false,
  });

  const mode = data?.find((t) => t.key === contentType)?.approval_mode ?? "off";
  return { mode, enabled: mode !== "off", required: mode === "required" };
}

/** Pulls the approval request a content save was routed into, if any. */
export function approvalRequestFrom(response: unknown): { id: string } | null {
  const candidate = (response as { approval_request?: { id?: string } } | null)?.approval_request;
  return candidate?.id ? { id: candidate.id } : null;
}
