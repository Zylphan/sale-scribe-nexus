
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, profile } = useAuth();
  const location = useLocation();
  
  console.log("ProtectedRoute - Auth state:", { user: user?.id, loading, profile });
  
  useEffect(() => {
    // Additional check for blocked users
    if (profile?.role === 'blocked') {
      console.log("ProtectedRoute - User is blocked, will redirect to login");
      toast.error('Your account has been blocked. Please contact an administrator.');
    }
  }, [profile]);
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    console.log("ProtectedRoute - No user, redirecting to login");
    // Redirect to login but remember where they were trying to go
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (profile?.role === 'blocked') {
    console.log("ProtectedRoute - User is blocked, redirecting to login");
    toast.error('Your account has been blocked. Please contact an administrator.');
    return <Navigate to="/login" replace />;
  }
  
  console.log("ProtectedRoute - User authenticated, rendering children");
  return <>{children}</>;
};

export default ProtectedRoute;
