import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/auth";
type ProtectedRouteProps = {
  children: React.ReactElement;
  roles: string[];
};
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const user = useAuthStore(s => s.user);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (user?.status === 'pending' && user.role === 'student') {
    return <Navigate to="/pending-approval" replace />;
  }
  if (roles.length > 0 && !roles.includes(user?.role || '')) {
    // Redirect to a relevant dashboard if role doesn't match
    const homePath = `/${user?.role || ''}`;
    return <Navigate to={homePath} replace />;
  }
  return children;
};