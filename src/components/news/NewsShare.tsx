import { Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type NewsShareProps = {
  title: string;
  url: string;
  className?: string;
};

const NewsShare = ({ title, url, className }: NewsShareProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({ title: "Link copied", description: "The article link is on your clipboard." });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Could not copy", description: "Please copy the address bar link manually.", variant: "destructive" });
    }
  };

  const nativeShare = async () => {
    if (!canNativeShare) {
      await copyLink();
      return;
    }
    try {
      await navigator.share({ title, url });
    } catch {
      // User dismissed the share sheet
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const whatsappHref = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} role="group" aria-label="Share this article">
      <Button type="button" variant="outline" size="sm" onClick={copyLink} className="gap-1.5">
        {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
        {copied ? "Copied" : "Copy link"}
      </Button>
      <Button type="button" variant="outline" size="sm" asChild className="gap-1.5">
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
          WhatsApp
        </a>
      </Button>
      <Button type="button" variant="outline" size="sm" asChild className="gap-1.5">
        <a href={facebookHref} target="_blank" rel="noopener noreferrer">
          Facebook
        </a>
      </Button>
      {canNativeShare && (
        <Button type="button" variant="outline" size="sm" onClick={nativeShare} className="gap-1.5">
          <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
          Share
        </Button>
      )}
    </div>
  );
};

export default NewsShare;
