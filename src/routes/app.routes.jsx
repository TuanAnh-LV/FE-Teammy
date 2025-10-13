import { lazy } from "react";
import { ROUTER_URL } from "../consts/router.const";
import MainLayout from "../layout/MainLayout";
import DashboardLayout from "../layout/dashboard/DashboardLayout";
import ProtectedRoute from "./protected/ProtectedRoute";

// Mentor
const MyGroups = lazy(() => import("../pages/mentor/MyGroups"));
const Discover = lazy(() => import("../pages/mentor/Discover"));
const Notifications = lazy(() => import("../pages/mentor/Notifications"));
// Admin
const AdminDashboard = lazy(() => import("../pages/admin/Dashboard"));
const ManageUsers = lazy(() => import("../pages/admin/ManageUsers"));
const AuditLogs = lazy(() => import("../pages/admin/AuditLogs"));
const Reports = lazy(() => import("../pages/admin/Reports"));
const Settings = lazy(() => import("../pages/admin/Settings"));
// Common
const HomePage = lazy(() => import("../pages/common/Home"));
const Profile = lazy(() => import("../pages/common/Profile"));
// const LoginPage = lazy(() => import("../pages/common"));
//Moderator
const Dashboard = lazy(() => import("../pages/moderator/Dashboard"));
const TopicManagement = lazy(() =>
  import("../pages/moderator/TopicManagement")
);
const GroupManagement = lazy(() =>
  import("../pages/moderator/GroupManagement")
);
const AIAssistant = lazy(() => import("../pages/moderator/AIAssistant"));
const NotificationsMO = lazy(() => import("../pages/moderator/Notifications"));
const routes = [
  // Public
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      // { path: "/login", element: <LoginPage /> },
    ],
  },

  // Admin
  {
    path: "/admin",
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        element: <DashboardLayout role="admin" />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "dashboard", element: <AdminDashboard /> },
          { path: "users", element: <ManageUsers /> },
          { path: "logs", element: <AuditLogs /> },
          { path: "reports", element: <Reports /> },
          { path: "settings", element: <Settings /> },
          { path: "profile", element: <Profile /> },
        ],
      },
    ],
  },

  // Mentor
  {
    path: "/mentor",
    element: <ProtectedRoute allowedRoles={["mentor"]} />,
    children: [
      {
        element: <DashboardLayout role="mentor" />,
        children: [
          { index: true, element: <Discover /> },
          { path: "discover", element: <Discover /> },
          { path: "my-groups", element: <MyGroups /> },
          { path: "notifications", element: <Notifications /> },
          { path: "profile", element: <Profile /> },
        ],
      },
    ],
  },
  //Moderator
  {
    path: "/moderator",
    element: <ProtectedRoute allowedRoles={["moderator"]} />,
    children: [
      {
        element: <DashboardLayout role="moderator" />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "dashboard", element: <Dashboard /> },
          { path: "group", element: <GroupManagement /> },
          { path: "topic", element: <TopicManagement /> },
          { path: "ai-assistant", element: <AIAssistant /> },
          { path: "notifications", element: <NotificationsMO /> },
          { path: "profile", element: <Profile /> },
        ],
      },
    ],
  },

  // Fallback
  {
    path: "/unauthorize",
    element: (
      <div className="text-center text-red-500 text-xl mt-20">
        403 – Không có quyền truy cập
      </div>
    ),
  },
];

export default routes;
