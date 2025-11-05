import { createBrowserRouter, Navigate } from "react-router-dom";
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { ProtectedRoute } from "@/components/ProtectedRoute";
// Public Pages
import { HomePage } from '@/pages/HomePage';
import { RegisterPage } from '@/pages/RegisterPage';
import { PendingApprovalPage } from '@/pages/PendingApprovalPage';
import { GuestPaymentPage } from '@/pages/GuestPaymentPage';
// Student Pages
import { StudentDashboardPage } from "@/pages/student/StudentDashboardPage";
import { WeeklyMenuPage } from "@/pages/student/WeeklyMenuPage";
import { ComplaintsPage } from "@/pages/student/ComplaintsPage";
import { SuggestionsPage } from "@/pages/student/SuggestionsPage";
import { MyDuesPage } from "@/pages/student/MyDuesPage";
// Manager Pages
import { ManagerDashboardPage } from "@/pages/manager/ManagerDashboardPage";
import { StudentManagementPage } from "@/pages/manager/StudentManagementPage";
import { MenuManagementPage } from "@/pages/manager/MenuManagementPage";
import { FeedbackPage } from "@/pages/manager/FeedbackPage";
import { FinancialsPage } from "@/pages/manager/FinancialsPage";
import { SettingsPage } from "@/pages/manager/SettingsPage";
// Admin Pages
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AllComplaintsPage } from "@/pages/admin/AllComplaintsPage";
export const router = createBrowserRouter([
  // Public Routes
  { path: "/", element: <HomePage />, errorElement: <RouteErrorBoundary /> },
  { path: "/register", element: <RegisterPage />, errorElement: <RouteErrorBoundary /> },
  { path: "/pending-approval", element: <PendingApprovalPage />, errorElement: <RouteErrorBoundary /> },
  { path: "/guest-payment", element: <GuestPaymentPage />, errorElement: <RouteErrorBoundary /> },
  // Student Routes
  { path: "/student", element: <ProtectedRoute roles={['student']}><StudentDashboardPage /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
  { path: "/student/menu", element: <ProtectedRoute roles={['student']}><WeeklyMenuPage /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
  { path: "/student/complaints", element: <ProtectedRoute roles={['student']}><ComplaintsPage /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
  { path: "/student/suggestions", element: <ProtectedRoute roles={['student']}><SuggestionsPage /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
  { path: "/student/dues", element: <ProtectedRoute roles={['student']}><MyDuesPage /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
  // Manager Routes
  { path: "/manager", element: <ProtectedRoute roles={['manager']}><ManagerDashboardPage /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
  { path: "/manager/students", element: <ProtectedRoute roles={['manager']}><StudentManagementPage /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
  { path: "/manager/menu", element: <ProtectedRoute roles={['manager']}><MenuManagementPage /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
  { path: "/manager/feedback", element: <ProtectedRoute roles={['manager']}><FeedbackPage /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
  { path: "/manager/financials", element: <ProtectedRoute roles={['manager']}><FinancialsPage /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
  { path: "/manager/settings", element: <ProtectedRoute roles={['manager']}><SettingsPage /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
  // Admin Routes
  { path: "/admin", element: <ProtectedRoute roles={['admin']}><AdminDashboardPage /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
  { path: "/admin/complaints", element: <ProtectedRoute roles={['admin']}><AllComplaintsPage /></ProtectedRoute>, errorElement: <RouteErrorBoundary /> },
  // Fallback redirect
  { path: "*", element: <Navigate to="/" replace /> }
]);