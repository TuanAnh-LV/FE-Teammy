import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Globe, Bell, MessageSquare, Users, Search } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { getTranslation } from "../../translations";
import { message } from "antd";
import NotificationDrawer from "./NotificationDrawer";
import { InvitationService } from "../../services/invitation.service";

const Navbar = () => {
  const location = useLocation();
  const { logout, loginGoogle, userInfo, token } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(userInfo);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { language, toggleLanguage } = useLanguage();
  const dropdownRef = useRef(null);
  const inviteFetchTokenRef = useRef(null);

  const [signingIn, setSigningIn] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    setUser(userInfo || null);
  }, [userInfo]);

  useEffect(() => {
    const formatRelative = (iso) => {
      if (!iso) return "";
      const d = new Date(iso);
      const diff = Math.max(0, (Date.now() - d.getTime()) / 1000);
      if (diff < 60) return `${Math.floor(diff)} giây trước`;
      if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
      return `${Math.floor(diff / 86400)} ngày trước`;
    };

    const fetchInvites = async () => {
      try {
        const res = await InvitationService.list({ status: "pending" }, false);
        const data = Array.isArray(res?.data) ? res.data : [];
        const items = data.map((i) => ({
          id: i.invitationId || i.id,
          title: "Lời mời tham gia nhóm",
          message: `${i.invitedByName || "Ai đó"} đã mời bạn tham gia dự án: ${
            i.groupName || ""
          }`,
          time: formatRelative(i.createdAt),
          actions: ["reject", "accept"],
        }));
        setNotifications(items);
      } catch (e) {
        console.warn("Fetch invitations failed", e);
        setNotifications([]);
      }
    };
    if (token) {
      if (inviteFetchTokenRef.current !== token) {
        inviteFetchTokenRef.current = token;
        fetchInvites();
      }
    } else {
      inviteFetchTokenRef.current = null;
      setNotifications([]);
    }

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [token]);

  const isActive = (path) => location.pathname === path;

  const handleSignIn = async () => {
    navigate("/login");
  };

  const handleSignOut = () => {
    try {
      logout();
    } finally {
      setUser(null);
      setMenuOpen(false);
      messageApi.info("You have logged out.");
      navigate("/");
    }
  };

  const handleWorkspaceNav = () => {
    const lastId =
      (typeof localStorage !== "undefined" &&
        localStorage.getItem("last_group_id")) ||
      "";
    navigate(lastId ? `/workspace?groupId=${lastId}` : "/workspace");
  };

  return (
    <>
      <nav className="!w-full !h-16 !fixed !top-0 !z-50 !bg-white/80 !backdrop-blur-md !border-b !border-gray-200">
        <div className="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !h-full !flex !items-center !gap-6 !justify-between">
          {contextHolder}
          {/* Logo + menu */}
          <div className="!flex !items-center !gap-10">
            <Link to="/" className="!no-underline">
              <h1 className="font-sans text-2xl font-black text-black cursor-pointer !mb-0">
                Teammy.
              </h1>
            </Link>

            {/* Nav links */}
            <div className="!hidden md:!flex !items-center !space-x-8 !font-sans !font-semibold !text-[14px] !text-black">
              <Link
                to="/forum"
                className={`!flex !items-center !gap-2 !hover:text-blue-600 ${
                  isActive("/forum") ? "!text-blue-600" : ""
                }`}
              >
                <MessageSquare className="!w-4 !h-4" />
                <span>{getTranslation("forum", language)}</span>
              </Link>
              <Link
                to="/discover"
                className={`!flex !items-center !gap-2 !hover:text-blue-600 ${
                  isActive("/discover") ? "!text-blue-600" : ""
                }`}
              >
                <Globe className="!w-4 !h-4" />
                <span>{getTranslation("topics", language)}</span>
              </Link>
              <Link
                to="/my-group"
                className={`!flex !items-center !gap-2 !hover:text-blue-600 ${
                  isActive("/my-group") ? "!text-blue-600" : ""
                }`}
              >
                <Users className="!w-4 !h-4" />
                <span>{getTranslation("myGroups", language)}</span>
              </Link>
              {/* <button
              type="button"
              onClick={handleWorkspaceNav}
              className={`!flex !items-center !gap-2 !hover:text-blue-600 !bg-transparent !border-0 !p-0 ${
                isActive("/workspace") ? "!text-blue-600" : ""
              }`}
            >
              <FolderKanban className="!w-4 !h-4" />
              <span>{getTranslation("workspace", language)}</span>
            </button> */}
            </div>
          </div>

          {/* Search */}
          <div className="!hidden lg:!flex !flex-1 !justify-center">
            <label className="!relative !w-full !max-w-md">
              <Search className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-gray-400" />
              <input
                type="search"
                name="navbar-search"
                placeholder="Search skills, majors, projects..."
                className="!w-full !rounded-full !border !border-blue-200 !py-2.5 !pl-11 !pr-4 !text-sm !text-gray-700 placeholder:!text-gray-400 focus:!outline-none focus:!border-blue-400 focus:!ring-4 focus:!ring-blue-100"
              />
            </label>
          </div>

          {/* Right side */}
          <div
            className="!flex !items-center !gap-4 !relative"
            ref={dropdownRef}
          >
            {user && (
              <button
                onClick={() => setNotifOpen(true)}
                className="relative p-2 rounded-full hover:bg-gray-100"
                title={getTranslation("notifications", language)}
              >
                <Bell className="w-5 h-5 text-gray-700" />
                {notifications?.length ? (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 text-[11px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                    {notifications.length}
                  </span>
                ) : null}
              </button>
            )}
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              title={`Switch to ${
                language === "EN" ? "Vietnamese" : "English"
              }`}
              className="!flex !items-center !gap-1 !px-2 !py-1 !rounded-full hover:!bg-gray-100 !transition-colors !duration-200"
            >
              <Globe className="!w-5 !h-5 !text-gray-700" />
              <span className="!text-sm !font-semibold !text-gray-700">
                {language}
              </span>
            </button>

            {/* User Avatar / Sign-in */}
            {user ? (
              <>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="!flex !items-center !space-x-3 !focus:outline-none"
                >
                  {(() => {
                    const avatarSource =
                      user.photoUrl ||
                      user.photoURL ||
                      user.avatarUrl ||
                      user.avatarURL;
                    return (
                      <img
                        src={
                          avatarSource?.includes("=s96-c")
                            ? avatarSource.replace("=s96-c", "=s256-c")
                            : avatarSource
                        }
                        alt={
                          user.name ||
                          user.displayName ||
                          user.email ||
                          "avatar"
                        }
                        referrerPolicy="no-referrer"
                        className="!w-9 !h-9 !rounded-full !border !border-gray-300 !object-cover !bg-gray-100"
                      />
                    );
                  })()}
                  <span className="!text-sm !font-semibold !text-gray-800 !hidden sm:!inline-block">
                    {user.displayName || user.name || user.email}
                  </span>
                </button>

                {menuOpen && (
                  <div className="!absolute !right-0 !top-full !mt-2 !w-48 !bg-white !shadow-lg !rounded-xl !overflow-hidden">
                    <div className="!px-4 !py-3 !border-b !border-gray-100">
                      <p className="!text-sm !font-medium !text-gray-900 !truncate">
                        {user.name}
                      </p>
                      <p className="!text-xs !text-gray-500 !truncate">
                        {user.email}
                      </p>
                    </div>
                    <div className="!py-2">
                      <Link
                        to="/profile"
                        className="!block !px-4 !py-2 !text-sm !text-gray-700 hover:!bg-gray-100"
                      >
                        {getTranslation("profile", language)}
                      </Link>

                      <button
                        onClick={handleSignOut}
                        className="!block !w-full !text-left !px-4 !py-2 !text-sm !text-red-600 hover:!bg-red-50"
                      >
                        {getTranslation("logout", language)}
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={handleSignIn}
                className="!px-4 !py-2 !rounded-full !bg-black !text-white !text-sm !font-medium hover:!bg-gray-800 !transition-colors !duration-200 !flex !items-center !space-x-1 !font-sans"
              >
                <span>{getTranslation("signIn", language)}</span>
                <svg
                  className="!w-4 !h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </nav>
      <NotificationDrawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        items={notifications}
        onAccept={async (n) => {
          try {
            await InvitationService.accept(n.id);
            setNotifications((prev) => prev.filter((x) => x.id !== n.id));
            messageApi.success("Signed in successfully.");
          } catch (e) {
            console.error(e);
            messageApi.error("Chấp nhận thất bại");
          }
        }}
        onReject={async (n) => {
          try {
            await InvitationService.decline(n.id);
            setNotifications((prev) => prev.filter((x) => x.id !== n.id));
            messageApi.info("You have logged out.");
          } catch (e) {
            console.error(e);
            messageApi.error("Từ chối thất bại");
          }
        }}
      />
    </>
  );
};

export default Navbar;
