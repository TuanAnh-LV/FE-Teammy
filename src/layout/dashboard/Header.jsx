import React, { useEffect, useState, useRef } from "react";
import { Layout, Avatar } from "antd";
import {
  BellOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Globe } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { AuthService } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";
import { subscribeGroupStatus } from "../../services/groupStatusHub";
import NotificationDrawer from "../../components/common/NotificationDrawer";
import { GroupService } from "../../services/group.service";

const { Header } = Layout;

const HeaderBar = ({ collapsed, onToggle }) => {
  const { language, toggleLanguage } = useLanguage();
  const [avatarUrl, setAvatarUrl] = useState(null);
  // Unread bell badge for realtime group close events (mentor view)
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [groupNameMap, setGroupNameMap] = useState({});
  const groupNameRef = useRef({});
  const { role } = useAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await AuthService.me();
        if (response?.data?.avatarUrl) {
          setAvatarUrl(response.data.avatarUrl);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Listen to GroupStatusChanged and push into bell drawer (mentor-focused)
  useEffect(() => {
    const handler = (payload) => {
      if (!payload) return;
      const { action, groupId } = payload;
      if (
        action !== "close_requested" &&
        action !== "close_confirmed" &&
        action !== "close_rejected"
      ) {
        return;
      }

      const currentRole = (role || "").toLowerCase();
      const isMentor = currentRole === "mentor";
      // Only show requests to mentor; hide accept/reject from mentor dashboard to avoid self-notifications.
      if (action === "close_requested" && !isMentor) return;
      if (
        (action === "close_confirmed" || action === "close_rejected") &&
        isMentor
      )
        return;

      const fetchGroupName = async (gid) => {
        if (groupNameRef.current[gid]) return groupNameRef.current[gid];
        try {
          const res = await GroupService.getGroupDetail(gid);
          const name =
            res?.data?.name ||
            res?.data?.title ||
            res?.data?.groupName ||
            `Group ${gid}`;
          setGroupNameMap((prev) => ({ ...prev, [gid]: name }));
          groupNameRef.current = { ...groupNameRef.current, [gid]: name };
          return name;
        } catch {
          return `Group ${gid}`;
        }
      };

      const buildMessage = (act, gid, name) => {
        const displayName = name || "Group " + gid;
        if (act === "close_requested")
          return displayName + " sent a close request";
        if (act === "close_confirmed")
          return "Mentor accepted closing " + displayName;
        return "Mentor rejected closing " + displayName;
      };

      (async () => {
        const groupName = await fetchGroupName(groupId);
        const title =
          action === "close_requested"
            ? "Close request received"
            : action === "close_confirmed"
            ? "Close request accepted"
            : "Close request rejected";

        const message = buildMessage(action, groupId, groupName);

        setNotifications((prev) => [
          {
            id: `group-status-${groupId}-${action}-${Date.now()}`,
            groupId,
            action,
            type: "group_status",
            title,
            message,
            time: "just now",
          },
          ...prev,
        ]);

        setUnreadCount((prev) => (Number.isFinite(prev) ? prev + 1 : 1));
        console.log("[Dashboard Header][GroupStatusChanged]", payload);
      })();
    };

    const unsubscribe = subscribeGroupStatus(handler);
    return () => unsubscribe();
  }, [role]);

  return (
    <Header
      className="bg-white border-b border-gray-100 px-6 flex items-center justify-between top-0 z-50"
      style={{
        height: "64px",
        lineHeight: "64px",
        background: "#ffffff",
        padding: "0 24px",
      }}
    >
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="text-gray-600 hover:text-blue-600 transition"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Language toggle */}
        <button
          onClick={toggleLanguage}
          title={`Switch to ${language === "EN" ? "Vietnamese" : "English"}`}
          className="flex items-center gap-1 px-2 py-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
        >
          <Globe className="w-5 h-5 text-gray-700" />
          <span className="text-sm font-semibold text-gray-700">
            {language}
          </span>
        </button>

        <button
          type="button"
          className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition"
          title="Notifications"
          onClick={() => {
            setNotifOpen(true);
            setUnreadCount(0);
          }}
        >
          <BellOutlined className="text-gray-500 text-lg hover:text-blue-600 transition" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[11px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
        <Avatar size="medium" icon={<UserOutlined />} src={avatarUrl} />
      </div>

      <NotificationDrawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        items={notifications}
      />
    </Header>
  );
};

export default HeaderBar;
