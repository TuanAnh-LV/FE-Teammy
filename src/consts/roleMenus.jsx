import {
  DashboardOutlined,
  TeamOutlined,
  SearchOutlined,
  SettingOutlined,
  HomeOutlined,
  BellOutlined,
  HistoryOutlined,
  FileTextOutlined,
  UserOutlined,
  TagsOutlined,
  BulbOutlined,
  BarChartOutlined,
  MessageOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { getTranslation } from "../translations";

export const getRoleMenus = (role, language = "EN") => {
  const roleMenus = {
    mentor: [
      {
        key: "dashboard",
        label: getTranslation("dashboard", language),
        path: "/mentor/dashboard",
        icon: <BarChartOutlined />,
      },
      {
        key: "discover",
        label: getTranslation("discover", language),
        path: "/mentor/discover",
        icon: <HomeOutlined />,
      },
      {
        key: "my-groups",
        label: getTranslation("myGroups", language),
        path: "/mentor/my-groups",
        icon: <TeamOutlined />,
      },
      {
        key: "chat",
        label: getTranslation("messages", language),
        path: "/mentor/messages",
        icon: <MessageOutlined />,
      },
      // {
      //   key: "notifications",
      //   label: getTranslation("notifications", language),
      //   path: "/mentor/notifications",
      //   icon: <BellOutlined />,
      // },
    ],
    admin: [
      {
        key: "c",
        label: getTranslation("dashboard", language),
        path: "/admin/dashboard",
        icon: <HomeOutlined />,
      },
      {
        key: "users",
        label: getTranslation("managementUsers", language),
        path: "/admin/users",
        icon: <TeamOutlined />,
      },
      {
        key: "semesters",
        label: getTranslation("semesterManagement", language),
        path: "/admin/semesters",
        icon: <CalendarOutlined />,
      },
      {
        key: "logs",
        label: getTranslation("auditLogs", language),
        path: "/admin/logs",
        icon: <HistoryOutlined />,
      },
      {
        key: "reports",
        label: getTranslation("report", language),
        path: "/admin/reports",
        icon: <FileTextOutlined />,
      },
    ],
    moderator: [
      {
        key: "dashboard",
        label: getTranslation("dashboard", language),
        path: "/moderator/dashboard",
        icon: <HomeOutlined />,
      },
      {
        key: "group",
        label: getTranslation("groupManagement", language),
        path: "/moderator/group",
        icon: <TeamOutlined />,
      },
      {
        key: "topic",
        label: getTranslation("topicManagement", language),
        path: "/moderator/topic",
        icon: <TagsOutlined />,
      },
      {
        key: "ai",
        label: getTranslation("aiAssistant", language),
        path: "/moderator/ai-assistant",
        icon: <BulbOutlined />,
      },
      // {
      //   key: "notifications",
      //   label: getTranslation("notifications", language),
      //   path: "/moderator/notifications",
      //   icon: <BellOutlined />,
      // },
    ],
    student: [
      {
        key: "project",
        label: getTranslation("myGroups", language),
        path: "/student/my-group",
        icon: <DashboardOutlined />,
      },
      {
        key: "discover",
        label: getTranslation("discoverMentors", language),
        path: "/student/discover",
        icon: <SearchOutlined />,
      },
    ],
  };

  return role === "mentor"
    ? roleMenus[role] || []
    : [...(roleMenus[role] || [])];
};
