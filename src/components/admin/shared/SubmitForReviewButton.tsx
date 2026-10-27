import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useApprovalMode } from "@/hooks/useApprovalMode";
import { notify } from "@/lib/notify";
import { submitForReview } from "@/services/approval.service";

interface SubmitForReviewButtonProps extends Omit<ButtonProps, "onClick"> {
  /** Registry key, e.g. "event", "bulletin", "sermon" (see config/workflow_content_types.php). */
  contentType: string;
  /** ID of the saved item; the button hides until the item exists. */
  contentId?: string | null;
  /** Save pending edits first so review sees the latest content. */
  beforeSubmit?: () => Promise<unknown>;
}

/**
 * Sends a saved content item into its approval workflow. Renders nothing when
 * approval is switched off for the type, so forms stay unchanged until rollout.
 */
export function SubmitForReviewButton({ contentType, contentId, beforeSubmit, children, ...props }: SubmitForReviewButtonProps) {
  const approval = useApprovalMode(contentType);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (beforeSubmit) await beforeSubmit();
      return submitForReview(contentType, contentId!);
    },
    onSuccess: (res) => {
      notify.success("Submitted for approval", "It stays unpublished until review is complete.");
      queryClient.invalidateQueries({ queryKey: ["approvals-overview"] });
      navigate(`/admin/approvals/requests/${res.data.id}`);
    },
    onError: (error) => notify.error(error, { description: "The item could not be submitted for review." }),
  });

  if (!approval.enabled || !contentId) return null;

  return (
    <Button type="button" variant="secondary" {...props} onClick={() => mutation.mutate()} disabled={props.disabled || mutation.isPending}>
      <Send className="mr-2 h-4 w-4" />
      {children ?? "Submit for Review"}
    </Button>
  );
}

export default SubmitForReviewButton;
