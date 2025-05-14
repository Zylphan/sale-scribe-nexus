
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { profile, loading, isAdmin } = useAuth();
  const location = useLocation();
  
  console.log("AdminRoute - Auth state:", { profileRole: profile?.role, loading, isAdmin: isAdmin() });
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!profile || !isAdmin()) {
    console.log("AdminRoute - Not an admin, redirecting to dashboard");
    // Redirect to dashboard with access denied message
    toast.error("Access denied. Admin privileges required.");
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }
  
  console.log("AdminRoute - Admin authenticated, rendering children");
  return <>{children}</>;
};

export default AdminRoute;
