
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth, AccountType, UserRole } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedAccountTypes?: AccountType[];
  allowedRoles?: UserRole[];
  expectedComponent?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedAccountTypes = [],
  allowedRoles = [],
  expectedComponent = null
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  console.log('expectedComponent', expectedComponent);
  console.log('allowedAccountTypes', allowedAccountTypes);
  console.log('user.accountType', user.accountType);
  console.log('user', user);

  // Check account type restrictions
  if (allowedAccountTypes.length > 0 && user && !allowedAccountTypes.includes(user.accountType)) {
    // Redirect to the appropriate dashboard based on account type
    if (user.accountType === "CONSOLE") {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/user/dashboard" replace />;
    }
  }

  // Check role restrictions
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    // For now, we'll just redirect to their main dashboard based on account type
    if (user.accountType === "CONSOLE") {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/user/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
