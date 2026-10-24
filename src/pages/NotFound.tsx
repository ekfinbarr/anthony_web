import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, LayoutDashboard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import SEOHead from "@/components/seo/SEOHead";
import PageHeader from "@/components/layout/PageHeader";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(10);
  // The redirect is cancelled as soon as the visitor interacts (WCAG 2.2.1 Timing Adjustable).
  const [redirectCancelled, setRedirectCancelled] = useState(false);

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.warn("404: no route matches", location.pathname);
    }
  }, [location.pathname]);

  useEffect(() => {
    const cancel = () => setRedirectCancelled(true);
    window.addEventListener("pointerdown", cancel, { once: true });
    window.addEventListener("keydown", cancel, { once: true });
    return () => {
      window.removeEventListener("pointerdown", cancel);
      window.removeEventListener("keydown", cancel);
    };
  }, []);

  const redirectTarget = useMemo(() => {
    if (location.pathname.startsWith("/admin")) return "/admin";
    if (location.pathname.startsWith("/dashboard")) return "/dashboard";
    return "/";
  }, [location.pathname]);

  // Auto-redirect after a short delay (matches the message shown on the page).
  useEffect(() => {
    if (redirectCancelled) return;
    // Reset countdown asynchronously to satisfy the lint rule that blocks
    // synchronous setState at the top-level of an effect.
    const reset = window.setTimeout(() => setSecondsLeft(10), 0);

    const interval = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);

    const timeout = window.setTimeout(() => {
      navigate(redirectTarget);
    }, 10_000);

    return () => {
      window.clearTimeout(reset);
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [navigate, redirectTarget, location.pathname, redirectCancelled]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(redirectTarget);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background">
      <SEOHead
        title="Page Not Found"
        description="The page you requested could not be found."
        path={location.pathname}
        noindex
      />
      <PageHeader
        title="Page Not Found"
        description="The page you requested doesn’t exist (or may have moved)."
        breadcrumbs={false}
      />

      <div className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <Card className="border-muted">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <div className="text-6xl md:text-7xl font-black tracking-tight text-primary/20 leading-none">
                    404
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Requested path:{" "}
                    <code className="px-1 py-0.5 rounded bg-muted text-foreground">
                      {location.pathname}
                    </code>
                  </p>
                  {!redirectCancelled && (
                    <p className="mt-4 text-muted-foreground">
                      You’ll be redirected in{" "}
                      <span className="font-semibold text-foreground">{secondsLeft}</span>{" "}
                      seconds.
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" onClick={handleGoBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Go back
                  </Button>
                  <Button asChild className="gap-2">
                    <Link to={redirectTarget}>
                      {redirectTarget === "/dashboard" ? (
                        <>
                          <LayoutDashboard className="h-4 w-4" />
                          Go to Dashboard
                        </>
                      ) : redirectTarget === "/admin" ? (
                        <>
                          <LayoutDashboard className="h-4 w-4" />
                          Go to Admin
                        </>
                      ) : (
                        <>
                          <Home className="h-4 w-4" />
                          Go to Home
                        </>
                      )}
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            If you believe this is a mistake, try refreshing or navigating from the homepage.
          </p>

          <nav aria-label="Popular pages" className="mt-6 text-center text-sm">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <li><Link to="/visit" className="text-primary hover:underline">Mass Times</Link></li>
              <li><Link to="/sacraments" className="text-primary hover:underline">Sacraments</Link></li>
              <li><Link to="/book-mass" className="text-primary hover:underline">Book a Mass</Link></li>
              <li><Link to="/news" className="text-primary hover:underline">Parish News</Link></li>
              <li><Link to="/contact" className="text-primary hover:underline">Contact the Parish</Link></li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
