import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCurrentFlashNews } from "@/services/flashNews.service";

const STORAGE_KEY = "flashNewsDismissed";
const DISMISS_MS = 24 * 60 * 60 * 1000;

type Dismissal = {
  id: string;
  dismissedAt: number;
};

function readDismissal(): Dismissal | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Dismissal;
    if (!parsed?.id || typeof parsed.dismissedAt !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

function isFlashNewsDismissed(id: string): boolean {
  const stored = readDismissal();
  if (!stored || stored.id !== id) return false;
  return Date.now() - stored.dismissedAt < DISMISS_MS;
}

function dismissFlashNews(id: string): void {
  const payload: Dismissal = { id, dismissedAt: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

const FlashNewsModal = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ["flash-news", "current"],
    queryFn: getCurrentFlashNews,
    staleTime: 60_000,
    retry: false,
  });

  // Open once for each new announcement the visitor hasn't dismissed (adjusted during render).
  const [seenId, setSeenId] = useState<string | number | null>(null);
  if (data && data.id !== seenId) {
    setSeenId(data.id);
    if (!isFlashNewsDismissed(data.id)) setOpen(true);
  }

  const rememberDismissal = () => {
    if (data) dismissFlashNews(data.id);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) rememberDismissal();
    setOpen(next);
  };

  const handleCta = () => {
    if (!data?.cta_url) return;
    rememberDismissal();
    setOpen(false);

    if (isExternalUrl(data.cta_url)) {
      window.open(data.cta_url, "_blank", "noopener,noreferrer");
      return;
    }

    navigate(data.cta_url);
  };

  if (!data) return null;

  const buttonLabel = data.cta_label?.trim() || "Learn more";

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[80] bg-black/75 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-1/2 z-[80] max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-[28rem] -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-white px-8 py-10 text-neutral-900 shadow-2xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:px-10 sm:py-12"
        >
          <DialogPrimitive.Close
            className="absolute right-4 top-4 rounded-sm p-1 text-neutral-500 transition-colors hover:text-neutral-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </DialogPrimitive.Close>

          <DialogPrimitive.Title className="px-6 text-center font-heading text-3xl font-semibold leading-[1.15] tracking-tight text-neutral-900 sm:text-4xl">
            {data.title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-6 whitespace-pre-line text-center text-sm leading-relaxed text-neutral-800 sm:text-[15px]">
            {data.body}
          </DialogPrimitive.Description>

          {data.cta_url ? (
            <div className="mt-8 flex justify-center">
              <Button
                type="button"
                onClick={handleCta}
                className="bg-neutral-900 px-6 text-white hover:bg-neutral-800"
              >
                {buttonLabel}
              </Button>
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export default FlashNewsModal;
