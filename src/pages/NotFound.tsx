import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, LayoutDashboard, ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(10);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const redirectTarget = useMemo(() => {
    if (location.pathname.startsWith("/admin")) return "/admin";
    if (location.pathname.startsWith("/dashboard")) return "/dashboard";
    return "/";
  }, [location.pathname]);

  // Auto-redirect after a short delay (matches the message shown on the page).
  useEffect(() => {
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
  }, [navigate, redirectTarget, location.pathname]);

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(redirectTarget);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-background">
      {/* Header / Hero strip (matches other pages) */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mx-auto mb-4 w-12 h-12 rounded-lg bg-gradient-church flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-church-charcoal mb-2">
              Page Not Found
            </h1>
            <p className="text-muted-foreground text-lg">
              The page you requested doesn’t exist (or may have moved).
            </p>
          </div>
        </div>
      </div>

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
                  <p className="mt-4 text-muted-foreground">
                    You’ll be redirected in{" "}
                    <span className="font-semibold text-foreground">{secondsLeft}</span>{" "}
                    seconds.
                  </p>
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
        </div>
      </div>
    </div>
  );
};

export default NotFound;
