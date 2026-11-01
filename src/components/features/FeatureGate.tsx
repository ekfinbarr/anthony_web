import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/seo/SEOHead";
import useFeatures from "@/hooks/useFeatures";

export function FeatureUnavailable() {
  const { pathname } = useLocation();

  return (
    <div className="container mx-auto max-w-xl px-4 py-24 text-center">
      <SEOHead
        title="Not available"
        description="This part of the parish site is not available right now."
        path={pathname}
        noindex
      />
      <h1 className="font-heading text-3xl font-bold text-foreground">Not available right now</h1>
      <p className="mt-3 text-muted-foreground">
        This part of the parish site is turned off. Please check back later, or contact the parish office.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}

/** Keeps the URL and shows a noindex notice when the module is off. Empty content does not use this. */
export function FeatureGate({ feature, children }: { feature: string; children: ReactNode }) {
  const { isOn } = useFeatures();
  if (!isOn(feature)) return <FeatureUnavailable />;
  return children;
}

/** Hides a home teaser or menu block when the module is off or has nothing published. */
export function FeatureShow({ feature, children }: { feature: string; children: ReactNode }) {
  const { isNavOn } = useFeatures();
  if (!isNavOn(feature)) return null;
  return children;
}

export default FeatureGate;
