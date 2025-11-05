import { createBrowserRouter, Navigate } from "react-router-dom";
import App from '@/App';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
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
      { path: "student", element: <ProtectedRoute roles={['student']}><AppLayout><StudentDashboardPage /></AppLayout></ProtectedRoute> },
      { path: "student/menu", element: <ProtectedRoute roles={['student']}><AppLayout><WeeklyMenuPage /></AppLayout></ProtectedRoute> },
      { path: "student/complaints", element: <ProtectedRoute roles={['student']}><AppLayout><ComplaintsPage /></AppLayout></ProtectedRoute> },
      { path: "student/suggestions", element: <ProtectedRoute roles={['student']}><AppLayout><SuggestionsPage /></AppLayout></ProtectedRoute> },
      { path: "student/dues", element: <ProtectedRoute roles={['student']}><AppLayout><MyDuesPage /></AppLayout></ProtectedRoute> },
      { path: "student/rules", element: <ProtectedRoute roles={['student']}><AppLayout><MessRulesPage /></AppLayout></ProtectedRoute> },
      // Manager Routes
      { path: "manager", element: <ProtectedRoute roles={['manager']}><AppLayout><ManagerDashboardPage /></AppLayout></ProtectedRoute> },
      { path: "manager/students", element: <ProtectedRoute roles={['manager']}><AppLayout><StudentManagementPage /></AppLayout></ProtectedRoute> },
      { path: "manager/menu", element: <ProtectedRoute roles={['manager']}><AppLayout><MenuManagementPage /></AppLayout></ProtectedRoute> },
      { path: "manager/feedback", element: <ProtectedRoute roles={['manager']}><AppLayout><FeedbackPage /></AppLayout></ProtectedRoute> },
      { path: "manager/financials", element: <ProtectedRoute roles={['manager']}><AppLayout><FinancialsPage /></AppLayout></ProtectedRoute> },
      { path: "manager/settings", element: <ProtectedRoute roles={['manager']}><AppLayout><SettingsPage /></AppLayout></ProtectedRoute> },
      { path: "manager/broadcast", element: <ProtectedRoute roles={['manager']}><AppLayout><BroadcastPage /></AppLayout></ProtectedRoute> },
      { path: "manager/notes", element: <ProtectedRoute roles={['manager']}><AppLayout><NotesPage /></AppLayout></ProtectedRoute> },
      // Admin Routes
      { path: "admin", element: <ProtectedRoute roles={['admin']}><AppLayout><AdminDashboardPage /></AppLayout></ProtectedRoute> },
      { path: "admin/complaints", element: <ProtectedRoute roles={['admin']}><AppLayout><AllComplaintsPage /></AppLayout></ProtectedRoute> },
      // Fallback redirect
      { path: "*", element: <Navigate to="/" replace /> }
    ]
  }
]);