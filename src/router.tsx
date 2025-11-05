import { createBrowserRouter, Navigate } from "react-router-dom";
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
// Pages
import { HomePage } from '@/pages/HomePage';
import { RegisterPage } from '@/pages/RegisterPage';
import { PendingApprovalPage } from '@/pages/PendingApprovalPage';
import { GuestPaymentPage } from '@/pages/GuestPaymentPage';
// Layout
import { AppLayout } from "@/components/layout/AppLayout";
// Dashboard Placeholders
const StudentDashboard = () => <AppLayout><div>Student Dashboard</div></AppLayout>;
const ManagerDashboard = () => <AppLayout><div>Manager Dashboard</div></AppLayout>;
const AdminDashboard = () => <AppLayout><div>Admin Dashboard</div></AppLayout>;
// This is a placeholder for a real protected route component
import { useAuthStore } from "./store/auth";
import React from "react";
const ProtectedRoute: React.FC<{ children: React.ReactElement; roles: string[] }> = ({ children, roles }) => {
    const user = useAuthStore(s => s.user);
    const isAuthenticated = useAuthStore(s => s.isAuthenticated);
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    if (user?.status === 'pending' && user.role === 'student') {
        return <Navigate to="/pending-approval" replace />;
    }
    if (roles.length > 0 && !roles.includes(user?.role || '')) {
        return <Navigate to="/" replace />;
    }
    return children;
};
export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/pending-approval",
    element: <PendingApprovalPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/guest-payment",
    element: <GuestPaymentPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/student",
    element: <ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/manager",
    element: <ProtectedRoute roles={['manager']}><ManagerDashboard /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/admin",
    element: <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>,
    errorElement: <RouteErrorBoundary />,
  },
]);