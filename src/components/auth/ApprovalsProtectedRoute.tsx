import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

/** Permissions that grant access to the Approvals area without full CMS admin. */
const APPROVAL_ACCESS_PERMISSIONS = [
  "view approvals",
  "decide approvals",
  "manage workflows",
  "view workflows",
];

interface ApprovalsProtectedRouteProps {
  children: React.ReactNode;
  /** Narrow access further, e.g. ["manage workflows", "view workflows"] for the builder. */
  permissions?: string[];
}

/**
 * Guards /admin/approvals/*. Admins always pass; other staff (editors, priests,
 * finance officers, …) pass when they hold an approval permission. The API
 * re-checks every action, so this only controls what the UI offers.
 */
const ApprovalsProtectedRoute = ({ children, permissions = APPROVAL_ACCESS_PERMISSIONS }: ApprovalsProtectedRouteProps) => {
  const { user, isLoading, isAdmin, hasPermission } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (!isAdmin() && !hasPermission(...permissions)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ApprovalsProtectedRoute;
