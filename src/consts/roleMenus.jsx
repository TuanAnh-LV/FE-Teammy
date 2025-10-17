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
} from "@ant-design/icons";

export const getRoleMenus = (role) => {
  const common = [
    {
      key: "profile",
      label: "Profile",
      path: `/${role}/profile`,
      icon: <UserOutlined />,
    },
  ];

  const roleMenus = {
    mentor: [
      {
        key: "discover",
        label: "Discover",
        path: "/mentor/discover",
        icon: <HomeOutlined />,
      },
      {
        key: "my-groups",
        label: "My Groups",
        path: "/mentor/my-groups",
        icon: <TeamOutlined />,
      },
      {
        key: "notifications",
        label: "Notifications",
        path: "/mentor/notifications",
        icon: <BellOutlined />,
      },
    ],
    admin: [
      {
        key: "c",
        label: "Dashboard",
        path: "/admin/dashboard",
        icon: <HomeOutlined />,
      },
      {
        key: "users",
        label: "Management Users",
        path: "/admin/users",
        icon: <TeamOutlined />,
      },
      {
        key: "logs",
        label: "Audit Logs",
        path: "/admin/logs",
        icon: <HistoryOutlined />,
      },
      {
        key: "reports",
        label: "Report",
        path: "/admin/reports",
        icon: <FileTextOutlined />,
      },
      {
        key: "settings",
        label: "Setting",
        path: "/admin/settings",
        icon: <SettingOutlined />,
      },
    ],
    moderator: [
      {
        key: "dashboard",
        label: "Dashboard",
        path: "/moderator/dashboard",
        icon: <HomeOutlined />,
      },
      {
        key: "group",
        label: "Group Management",
        path: "/moderator/group",
        icon: <TeamOutlined />,
      },
      {
        key: "topic",
        label: "Topic Management",
        path: "/moderator/topic",
        icon: <TagsOutlined />,
      },
      {
        key: "ai",
        label: "AI Assistant",
        path: "/moderator/ai-assistant",
        icon: <BulbOutlined />,
      },
      {
        key: "notifications",
        label: "Notifications",
        path: "/moderator/notifications",
        icon: <BellOutlined />,
      },
    ],
    student: [
      {
        key: "project",
        label: "My Project",
        path: "/student/my-project",
        icon: <DashboardOutlined />,
      },
      {
        key: "discover",
        label: "Discover Mentors",
        path: "/student/discover",
        icon: <SearchOutlined />,
      },
    ],
  };

  return [...(roleMenus[role] || []), ...common];
};
