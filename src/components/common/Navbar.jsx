import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Globe,
  BookText,
  Bell,
  MessageSquare,
  Users,
  Search,
  Menu,
  X,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { getTranslation } from "../../translations";
import { useTranslation } from "../../hook/useTranslation";
import { notification } from "antd";
import NotificationDrawer from "./NotificationDrawer";
import { InvitationService } from "../../services/invitation.service";
import { useSelector, useDispatch } from "react-redux";
import { useInvitationRealtime } from "../../hook/useInvitationRealtime";
import { removeInvitation } from "../../app/invitationSlice";

const Navbar = () => {
  const location = useLocation();
  const { logout, userInfo, token, role } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState(userInfo);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { language, toggleLanguage } = useLanguage();
  const dropdownRef = useRef(null);
  const inviteFetchTokenRef = useRef(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [notificationApi, contextHolder] = notification.useNotification();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  
  // Get realtime pending invitations and applications from Redux store
  const reduxPendingInvitations = useSelector((state) => state.invitation?.pendingInvitations || []);
  const reduxApplications = useSelector((state) => state.invitation?.applications || []);
  const applicationCount = useSelector((state) => state.invitation?.applicationCount || 0);

  const getInviteKey = (inv = {}) => {
    if (inv.postId && inv.candidateId) return `${inv.postId}-${inv.candidateId}`;
    if (inv.groupId && inv.candidateId) return `${inv.groupId}-${inv.candidateId}`;
    return inv.invitationId || inv.id || inv.candidateId || inv.groupId;
  };

  // Setup real-time connection
  useInvitationRealtime(token, userInfo?.userId || userInfo?.id, {
    onInvitationReceived: (inv) => {},
    onApplicationReceived: (payload) => {},
  });
  useEffect(() => {
    setUser(userInfo || null);
  }, [userInfo]);

  // Debug: Log khi Redux state thay đổi
  useEffect(() => {
    console.log("[Navbar] Redux invitations updated:", reduxPendingInvitations);
    console.log("[Navbar] Redux applications updated:", reduxApplications);
  }, [reduxPendingInvitations, reduxApplications]);

  useEffect(() => {
    const formatRelative = (iso) => {
      if (!iso) return "";
      const d = new Date(iso);
      const diff = Math.max(0, (Date.now() - d.getTime()) / 1000);
      if (diff < 60)
        return `${Math.floor(diff)} seconds ago`;
      if (diff < 3600)
        return `${Math.floor(diff / 60)} minutes ago`;
      if (diff < 86400)
        return `${Math.floor(diff / 3600)} hours ago`;
      return `${Math.floor(diff / 86400)} days ago`;
    };

    const pendingInvites = (reduxPendingInvitations || []).filter(
      (inv) => inv.status === "pending" || !inv.status
    );

    const realtimeItems = pendingInvites.map((inv) => {
      const isProfilePostInvite =
        inv.type === "profile-post" || inv.type === "post";
      const inviteId = getInviteKey(inv);
      
      const inviterName = 
        inv.invitedByName || 
        inv.invitedBy || 
        inv.leaderDisplayName ||
        inv.leaderName ||
        inv.senderName ||
        getTranslation("someone", language) || 
        "Someone";
      
      const groupName = inv.groupName || inv.projectName || "the group";

      return {
        id: inviteId,
        invitationId: inv.invitationId || inv.id,
        type: isProfilePostInvite ? "post" : "realtime",
        postId: inv.postId,
        candidateId: inv.candidateId,
        title:
          getTranslation("groupInviteTitle", language) || "Group invitation",
        message: isProfilePostInvite
          ? `${inviterName} invited you from a profile post${inv.postTitle ? `: ${inv.postTitle}` : ""}`
          : `${inviterName} invited you to ${groupName}`,
        time: formatRelative(inv.createdAt),
        actions: ["reject", "accept"],
      };
    });

    setNotifications((prev) => {
      const uniqueMap = new Map();
      
      realtimeItems.forEach((item) => {
        const key = getInviteKey(item) || item.id;
        if (!key) return;
        uniqueMap.set(key, item);
      });
      
      prev.forEach((item) => {
        if (item.type === "application") {
          uniqueMap.set(item.id, item);
        }
      });
      
      return Array.from(uniqueMap.values());
    });
  }, [reduxPendingInvitations, language]);

  useEffect(() => {
    const formatRelative = (iso) => {
      if (!iso) return "";
      const d = new Date(iso);
      const diff = Math.max(0, (Date.now() - d.getTime()) / 1000);
      if (diff < 60)
        return `${Math.floor(diff)} ${t("secondsAgo") || "seconds ago"}`;
      if (diff < 3600)
        return `${Math.floor(diff / 60)} ${t("minutesAgo") || "minutes ago"}`;
      if (diff < 86400)
        return `${Math.floor(diff / 3600)} ${t("hoursAgo") || "hours ago"}`;
      return `${Math.floor(diff / 86400)} ${t("daysAgo") || "days ago"}`;
    };

    const fetchInvites = async () => {
      try {
        const [directRes, postRes] = await Promise.all([
          InvitationService.list({ status: "pending" }, false),
          InvitationService.getMyProfilePostInvitations(
            { status: "pending" },
            false
          ),
        ]);

        const directData = Array.isArray(directRes?.data) ? directRes.data : [];
        const postData = Array.isArray(postRes?.data) ? postRes.data : [];

        // Lời mời trực tiếp
        const directItems = directData.map((i) => ({
          id: getInviteKey(i) || i.invitationId || i.id,
          type: "direct",
          title:
            getTranslation("groupInviteTitle", language) || "Group invitation",
          message: `${
            i.invitedByName || getTranslation("someone", language) || "Someone"
          } ${
            getTranslation("invitedToProject", language) ||
            "invited you to the project:"
          } ${i.groupName || ""}`,
          time: formatRelative(i.createdAt),
          actions: ["reject", "accept"],
        }));

        // Lời mời qua bài post
        const postItems = postData.map((p) => ({
          id: getInviteKey(p) || `${p.postId}-${p.candidateId}`,
          type: "post",
          postId: p.postId,
          candidateId: p.candidateId,
          title: t("postInviteTitle"),
          message: `${p.leaderDisplayName || t("someone")} ${t(
            "invitedYouFromPost"
          )}`,
          time: formatRelative(p.createdAt),
          actions: ["reject", "accept"],
        }));

        // Realtime invitations từ Redux
        const realtimeItems = reduxPendingInvitations.map((inv) => {
          const isProfilePostInvite =
            inv.type === "profile-post" || inv.type === "post";
          const inviteId = getInviteKey(inv);

          return {
            id: inviteId,
            type: isProfilePostInvite ? "post" : "realtime",
            postId: inv.postId,
            candidateId: inv.candidateId,
            title:
              getTranslation("groupInviteTitle", language) || "Group invitation",
            message: isProfilePostInvite
              ? `${inv.invitedByName || getTranslation("someone", language) || "Someone"} invited you from a profile post${inv.postTitle ? `: ${inv.postTitle}` : ""}`
              : `${inv.invitedByName || getTranslation("someone", language) || "Someone"} invited you to ${inv.groupName || "a group"}`,
            time: formatRelative(inv.createdAt),
            actions: ["reject", "accept"],
          };
        });

        const applicationItems = reduxApplications
          .filter((app) => app.status === "pending")
          .map((app) => ({
            id: `app-${app.id}`,
            type: "application",
            applicationId: app.id,
            groupId: app.groupId,
            title: t("newApplication") || "New Application",
            message: `${app.userName || "A student"} applied to your group`,
            name: app.userName,
            avatarUrl: app.userAvatar,
            time: formatRelative(app.appliedAt),
            actions: [], 
          }));

        const allNotifications = [...realtimeItems, ...applicationItems, ...directItems, ...postItems];
        
        const uniqueMap = new Map();
        allNotifications.forEach((n) => {
          const key = getInviteKey(n) || n.id;
          if (!key) return;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, n);
          }
        });
        
        setNotifications(Array.from(uniqueMap.values()));
      } catch (e) {
        const fallbackRealtime = reduxPendingInvitations.map((inv) => {
          const isProfilePostInvite =
            inv.type === "profile-post" || inv.type === "post";
          const inviteId = getInviteKey(inv);

          return {
            id: inviteId,
            type: isProfilePostInvite ? "post" : "realtime",
            postId: inv.postId,
            candidateId: inv.candidateId,
            title:
              getTranslation("groupInviteTitle", language) || "Group invitation",
            message: isProfilePostInvite
              ? `${inv.invitedByName || getTranslation("someone", language) || "Someone"} invited you from a profile post${inv.postTitle ? `: ${inv.postTitle}` : ""}`
              : `${inv.invitedByName || getTranslation("someone", language) || "Someone"} invited you to ${inv.groupName || "a group"}`,
            time: formatRelative(inv.createdAt),
            actions: ["reject", "accept"],
          };
        });
        setNotifications(fallbackRealtime);
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
  }, [token, language, reduxPendingInvitations]);

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
      notificationApi.info({
        message:
          getTranslation("loggedOut", language) || "You have logged out.",
      });
      navigate("/");
    }
  };

  return (
    <>
      <nav className="!w-full !h-16 !fixed !top-0 !z-50 !bg-white/80 !backdrop-blur-md !border-b !border-gray-200">
        <div className="max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !h-full !flex !items-center !gap-4 md:!gap-6 !justify-between">
          {contextHolder}
          {/* Logo + menu */}
          <div className="!flex !items-center !gap-4 md:!gap-10 !flex-1 md:!flex-initial">
            <Link to="/" className="!no-underline">
              <h1 className="font-sans text-xl md:text-2xl font-black text-black cursor-pointer !mb-0">
                Teammy.
              </h1>
            </Link>

            {/* Nav links - Desktop */}
            <div className="!hidden lg:!flex !items-center !space-x-6 xl:!space-x-8 !font-sans !font-semibold !text-[14px] !text-black">
              <Link
                to="/forum"
                className={`!flex !items-center !gap-2 !transition-colors !duration-200 ${
                  isActive("/forum")
                    ? "!text-orange-600"
                    : "!text-gray-700 hover:!text-orange-600"
                }`}
              >
                <MessageSquare className="!w-4 !h-4" />
                <span>{getTranslation("forum", language)}</span>
              </Link>

              <Link
                to="/discover"
                className={`!flex !items-center !gap-2 !transition-colors !duration-200 ${
                  isActive("/discover")
                    ? "!text-orange-600"
                    : "!text-gray-700 hover:!text-orange-600"
                }`}
              >
                <BookText className="!w-4 !h-4" />
                <span>{getTranslation("topics", language)}</span>
              </Link>

              <Link
                to="/my-group"
                className={`!flex !items-center !gap-2 !transition-colors !duration-200 ${
                  isActive("/my-group")
                    ? "!text-orange-600"
                    : "!text-gray-700 hover:!text-orange-600"
                }`}
              >
                <Users className="!w-4 !h-4" />
                <span>{getTranslation("myGroups", language)}</span>
              </Link>
            </div>
          </div>

          {/* Search - Desktop only */}
          <div className="!hidden xl:!flex !flex-1 !justify-center">
            <label className="!relative !w-full !max-w-xl">
              <Search className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-gray-400" />
              <input
                type="search"
                name="navbar-search"
                placeholder={
                  t("searchPlaceholder") || "Search skills, majors, projects..."
                }
                className="!w-full !rounded-full !border !border-blue-200 !py-2.5 !pl-11 !pr-4 !text-sm !text-gray-700 placeholder:!text-gray-400 focus:!outline-none focus:!border-blue-400 focus:!ring-4 focus:!ring-blue-100"
              />
            </label>
          </div>

          {/* Right side */}
          <div
            className="!flex !items-center !gap-2 md:!gap-4 !relative"
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
            {/* Language toggle - Desktop only */}
            <button
              onClick={toggleLanguage}
              title={
                language === "EN"
                  ? t("switchToVietnamese") || "Switch to Vietnamese"
                  : t("switchToEnglish") || "Switch to English"
              }
              className="!hidden md:!flex !items-center !gap-1 !px-2 !py-1 !rounded-full hover:!bg-gray-100 !transition-colors !duration-200"
            >
              <Globe className="!w-5 !h-5 !text-gray-700" />
              <span className="!text-sm !font-semibold !text-gray-700">
                {language}
              </span>
            </button>

            {/* Messages icon */}
            {user && (
              <button
                type="button"
                onClick={() => navigate("/messages")}
                title={getTranslation("messages", language) || "Messages"}
                className="relative p-2 rounded-full hover:bg-gray-100 transition"
              >
                <MessageSquare className="w-5 h-5 text-gray-700" />
              </button>
            )}

            {/* User Avatar / Sign-in */}
            {user ? (
              <>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="!flex !items-center !space-x-2 md:!space-x-3 !focus:outline-none"
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
                        className="!w-8 !h-8 md:!w-9 md:!h-9 !rounded-full !border !border-gray-300 !object-cover !bg-gray-100"
                      />
                    );
                  })()}
                  <span className="!text-sm !font-semibold !text-gray-800 !hidden lg:!inline-block">
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
                      {/* Dashboard link for admin, moderator, mentor */}
                      {["admin", "moderator", "mentor"].includes(
                        role?.toLowerCase()
                      ) && (
                        <Link
                          to={`/${role?.toLowerCase()}/dashboard`}
                          className="!block !px-4 !py-2 !text-sm !text-gray-700 hover:!bg-gray-100"
                          onClick={() => setMenuOpen(false)}
                        >
                          {getTranslation("dashboard", language)}
                        </Link>
                      )}

                      <Link
                        to="/profile"
                        className="!block !px-4 !py-2 !text-sm !text-gray-700 hover:!bg-gray-100"
                        onClick={() => setMenuOpen(false)}
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
                className="!px-3 md:!px-4 !py-2 !rounded-full !bg-black !text-white !text-xs md:!text-sm !font-medium hover:!bg-gray-800 !transition-colors !duration-200 !flex !items-center !space-x-1 !font-sans"
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

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:!hidden !p-2 !rounded-lg hover:!bg-gray-100 !transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="!w-6 !h-6 !text-gray-700" />
              ) : (
                <Menu className="!w-6 !h-6 !text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:!hidden !absolute !top-16 !left-0 !right-0 !bg-white !border-b !border-gray-200 !shadow-lg">
            <div className="!px-4 !py-4 !space-y-3">
              {/* Mobile nav links */}
              <Link
                to="/forum"
                onClick={() => setMobileMenuOpen(false)}
                className={`!flex !items-center !gap-2 !px-4 !py-3 !rounded-lg !font-semibold !text-sm !transition-colors ${
                  isActive("/forum")
                    ? "!bg-orange-50 !text-orange-600"
                    : "!text-gray-700 hover:!bg-orange-50 hover:!text-orange-600 active:!bg-orange-100 active:!text-orange-700"
                }`}
              >
                <MessageSquare className="!w-4 !h-4" />
                <span>{getTranslation("forum", language)}</span>
              </Link>

              <Link
                to="/discover"
                onClick={() => setMobileMenuOpen(false)}
                className={`!flex !items-center !gap-2 !px-4 !py-3 !rounded-lg !font-semibold !text-sm !transition-colors ${
                  isActive("/discover")
                    ? "!bg-orange-50 !text-orange-600"
                    : "!text-gray-700 hover:!bg-orange-50 hover:!text-orange-600 active:!bg-orange-100 active:!text-orange-700"
                }`}
              >
                <BookText className="!w-4 !h-4" />
                <span>{getTranslation("topics", language)}</span>
              </Link>

              <Link
                to="/my-group"
                onClick={() => setMobileMenuOpen(false)}
                className={`!flex !items-center !gap-2 !px-4 !py-3 !rounded-lg !font-semibold !text-sm !transition-colors ${
                  isActive("/my-group")
                    ? "!bg-orange-50 !text-orange-600"
                    : "!text-gray-700 hover:!bg-orange-50 hover:!text-orange-600 active:!bg-orange-100 active:!text-orange-700"
                }`}
              >
                <Users className="!w-4 !h-4" />
                <span>{getTranslation("myGroups", language)}</span>
              </Link>

              {/* Mobile search */}
              <div className="!pt-3 !border-t !border-gray-200">
                <label className="!relative !w-full">
                  <Search className="!absolute !left-4 !top-1/2 !-translate-y-1/2 !w-4 !h-4 !text-gray-400" />
                  <input
                    type="search"
                    placeholder={t("search") || "Search..."}
                    className="!w-full !rounded-lg !border !border-gray-200 !py-2.5 !pl-11 !pr-4 !text-sm !text-gray-700 placeholder:!text-gray-400 focus:!outline-none focus:!border-blue-400 focus:!ring-2 focus:!ring-blue-100"
                  />
                </label>
              </div>

              {/* Mobile language toggle */}
              <button
                onClick={() => {
                  toggleLanguage();
                  setMobileMenuOpen(false);
                }}
                className="!w-full !flex !items-center !gap-2 !px-4 !py-3 !rounded-lg !text-gray-700 hover:!bg-gray-50 !transition-colors !border-t !border-gray-200"
              >
                <Globe className="!w-4 !h-4" />
                <span className="!text-sm !font-semibold">
                  {language === "EN"
                    ? t("switchToVietnamese") || "Switch to Vietnamese"
                    : t("switchToEnglish") || "Switch to English"}
                </span>
              </button>
            </div>
          </div>
        )}
      </nav>
      <NotificationDrawer
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        items={notifications}
        onAccept={async (n) => {
          try {
            if (n.type === "post") {
              // lời mời qua bài post
              await InvitationService.acceptProfilePostInvitation(
                n.postId,
                n.candidateId
              );
            } else {
              // lời mời trực tiếp
              await InvitationService.accept(n.id);
            }

            // Remove from local state
            setNotifications((prev) => prev.filter((x) => x.id !== n.id));
            
            // Remove from Redux store
            if (n.invitationId || n.id) {
              dispatch(removeInvitation(n.invitationId || n.id));
            }
            
            notificationApi.success({
              message: getTranslation("acceptSuccess", language) || "Accepted",
            });
          } catch (e) {
            notificationApi.error({
              message:
                getTranslation("approveFailed", language) || "Accept failed",
            });
          }
        }}
        onReject={async (n) => {
          try {
            if (n.type === "post") {
              await InvitationService.rejectProfilePostInvitation(
                n.postId,
                n.candidateId
              );
            } else {
              await InvitationService.decline(n.id);
            }

            // Remove from local state
            setNotifications((prev) => prev.filter((x) => x.id !== n.id));
            
            // Remove from Redux store
            if (n.invitationId || n.id) {
              dispatch(removeInvitation(n.invitationId || n.id));
            }
            
            notificationApi.info({
              message: getTranslation("declineInfo", language) || "Declined",
            });
          } catch (e) {
            notificationApi.error({
              message:
                getTranslation("rejectFailed", language) || "Decline failed",
            });
          }
        }}
      />
    </>
  );
};

export default Navbar;
