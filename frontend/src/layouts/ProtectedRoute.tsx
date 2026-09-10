import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { PageLoader } from "@/components/ui/Feedback";

interface RouteWrapperProps {
  children: ReactNode;
}

// Blocks unauthenticated users and redirects to login with return path state.
export const ProtectedRoute = ({ children }: RouteWrapperProps) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader label="Restoring your session…" />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
};

// Redirects already authenticated users straight to the dashboard.
export const PublicOnlyRoute = ({ children }: RouteWrapperProps) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};
