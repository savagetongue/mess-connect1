import { createBrowserRouter, Navigate } from "react-router-dom";
import App from '@/App';
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
import { MessRulesPage } from "@/pages/student/MessRulesPage";
// Manager Pages
import { ManagerDashboardPage } from "@/pages/manager/ManagerDashboardPage";
import { StudentManagementPage } from "@/pages/manager/StudentManagementPage";
import { MenuManagementPage } from "@/pages/manager/MenuManagementPage";
import { FeedbackPage } from "@/pages/manager/FeedbackPage";
import { FinancialsPage } from "@/pages/manager/FinancialsPage";
import { SettingsPage } from "@/pages/manager/SettingsPage";
import { BroadcastPage } from "@/pages/manager/BroadcastPage";
import { NotesPage } from "@/pages/manager/NotesPage";
// Admin Pages
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AllComplaintsPage } from "@/pages/admin/AllComplaintsPage";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <RouteErrorBoundary />,
    children: [
      // Public Routes
      { index: true, element: <HomePage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "pending-approval", element: <PendingApprovalPage /> },
      { path: "guest-payment", element: <GuestPaymentPage /> },
      // Student Routes
      { path: "student", element: <ProtectedRoute roles={['student']}><StudentDashboardPage /></ProtectedRoute> },
      { path: "student/menu", element: <ProtectedRoute roles={['student']}><WeeklyMenuPage /></ProtectedRoute> },
      { path: "student/complaints", element: <ProtectedRoute roles={['student']}><ComplaintsPage /></ProtectedRoute> },
      { path: "student/suggestions", element: <ProtectedRoute roles={['student']}><SuggestionsPage /></ProtectedRoute> },
      { path: "student/dues", element: <ProtectedRoute roles={['student']}><MyDuesPage /></ProtectedRoute> },
      { path: "student/rules", element: <ProtectedRoute roles={['student']}><MessRulesPage /></ProtectedRoute> },
      // Manager Routes
      { path: "manager", element: <ProtectedRoute roles={['manager']}><ManagerDashboardPage /></ProtectedRoute> },
      { path: "manager/students", element: <ProtectedRoute roles={['manager']}><StudentManagementPage /></ProtectedRoute> },
      { path: "manager/menu", element: <ProtectedRoute roles={['manager']}><MenuManagementPage /></ProtectedRoute> },
      { path: "manager/feedback", element: <ProtectedRoute roles={['manager']}><FeedbackPage /></ProtectedRoute> },
      { path: "manager/financials", element: <ProtectedRoute roles={['manager']}><FinancialsPage /></ProtectedRoute> },
      { path: "manager/settings", element: <ProtectedRoute roles={['manager']}><SettingsPage /></ProtectedRoute> },
      { path: "manager/broadcast", element: <ProtectedRoute roles={['manager']}><BroadcastPage /></ProtectedRoute> },
      { path: "manager/notes", element: <ProtectedRoute roles={['manager']}><NotesPage /></ProtectedRoute> },
      // Admin Routes
      { path: "admin", element: <ProtectedRoute roles={['admin']}><AdminDashboardPage /></ProtectedRoute> },
      { path: "admin/complaints", element: <ProtectedRoute roles={['admin']}><AllComplaintsPage /></ProtectedRoute> },
      // Fallback redirect
      { path: "*", element: <Navigate to="/" replace /> }
    ]
  }
]);