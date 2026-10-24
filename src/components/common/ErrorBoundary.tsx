import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Changing this value (e.g. the pathname) clears a previous error. */
  resetKey?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

const isChunkLoadError = (error: Error) =>
  /Loading chunk|dynamically imported module|Importing a module script failed/i.test(error.message);

/**
 * Catches render errors so one broken section never blanks the whole site.
 * Also handles stale lazy-loaded chunks after a new deployment.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("Unhandled UI error:", error, info.componentStack);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    const staleBundle = isChunkLoadError(error);

    return (
      <section role="alert" className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-3xl md:text-4xl font-heading font-bold text-church-charcoal mb-4">
          {staleBundle ? "This page has been updated" : "Something went wrong"}
        </h1>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          {staleBundle
            ? "A newer version of the website is available. Please reload to continue."
            : "Sorry, this part of the page could not be displayed. Please reload, or return to the home page."}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button variant="church" onClick={() => window.location.reload()}>
            Reload page
          </Button>
          <Button variant="outline" asChild>
            <a href="/">Go to the home page</a>
          </Button>
        </div>
      </section>
    );
  }
}

export default ErrorBoundary;
