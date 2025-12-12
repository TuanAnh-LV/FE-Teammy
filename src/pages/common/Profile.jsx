import React, { useEffect, useRef, useState } from "react";
import { AuthService } from "../../services/auth.service";
import { UserService } from "../../services/user.service";
import { useAuth } from "../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "../../hook/useTranslation";
import LoadingState from "../../components/common/LoadingState";
import EditProfileModal from "../../components/common/EditProfileModal";
import ProfileHeader from "../../components/common/profile/ProfileHeader";
import ProfileStats from "../../components/common/profile/ProfileStats";
import ProfileOverview from "../../components/common/profile/ProfileOverview";
import ProfileGroups from "../../components/common/profile/ProfileGroups";
import ProfileSettings from "../../components/common/profile/ProfileSettings";
import ProfilePostsTab from "../../components/common/profile/ProfilePostsTab";
import { notification } from "antd";
const Profile = () => {
  const { t } = useTranslation();
  const {
    userInfo,
    setUserInfo,
    role,
    setRole,
    isLoading,
    setIsLoading,
    token,
  } = useAuth();
  const navigate = useNavigate();
  const { userId: profileUserId } = useParams();

  const profileFetchTokenRef = useRef(null);
  const [profileData, setProfileData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // tab: overview | groups | settings
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user auth info
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!token || userInfo) {
        profileFetchTokenRef.current = null;
        return;
      }
      if (profileFetchTokenRef.current === token) return;
      profileFetchTokenRef.current = token;
      try {
        setIsLoading(true);
        const res = await AuthService.me();
        const d = res?.data ?? {};
        const mapped = {
          userId: d.userId,
          email: d.email,
          name: d.displayName,
          photoURL: d.avatarUrl || "",
          role: d.role,
          emailVerified: d.emailVerified,
          skillsCompleted: d.skillsCompleted,
        };
        if (!mounted) return;
        setUserInfo(mapped);
        setRole(mapped.role);
        localStorage.setItem("userInfo", JSON.stringify(mapped));
        localStorage.setItem("role", mapped.role);
      } catch (e) {
        notification.error({
          message: t("fetchProfileFailed") || "Failed to fetch profile",
          description: t("pleaseLoginAgain") || "Please log in again.",
        });
        navigate("/login");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [token, userInfo, setUserInfo, setRole, setIsLoading]);

  // Fetch detailed profile data
  useEffect(() => {
    let mounted = true;
    const fetchProfileData = async () => {
      if (!token) return;
      try {
        setProfileLoading(true);
        setProfileData(null);
        const response = profileUserId
          ? await UserService.getProfileById(profileUserId, false)
          : await UserService.getMyProfile(false);
        if (mounted) {
          setProfileData(response?.data || null);
        }
      } catch (error) {
        notification.error({
          message: t("fetchProfileFailed") || "Failed to fetch profile",
          description:
            error?.response?.data?.message ||
            t("pleaseTryAgain") ||
            "Please try again.",
        });
      } finally {
        if (mounted) setProfileLoading(false);
      }
    };
    fetchProfileData();
    return () => {
      mounted = false;
    };
  }, [token, profileUserId]);

  const handleUpdateProfile = (updatedData) => {
    if (profileUserId) return;
    setProfileData(updatedData);
    if (updatedData.displayName) {
      const updatedUserInfo = {
        ...userInfo,
        name: updatedData.displayName,
        displayName: updatedData.displayName,
        skillsCompleted: updatedData.skillsCompleted,
      };
      setUserInfo(updatedUserInfo);
      localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
    }
  };

  const isOwnProfile = !profileUserId || profileUserId === userInfo?.userId;
  const viewingOtherProfile = Boolean(
    profileUserId && profileUserId !== userInfo?.userId
  );
  const targetUserId = profileUserId || userInfo?.userId || "";
  const baseUser = viewingOtherProfile ? {} : userInfo || {};

  const profile = {
    userId:
      profileData?.userId ||
      profileData?.id ||
      profileData?.userID ||
      targetUserId,
    name:
      profileData?.displayName ||
      baseUser?.name ||
      baseUser?.displayName ||
      (targetUserId ? "User" : "Unnamed"),
    email: profileData?.email || baseUser?.email || "",
    phone: profileData?.phone || null,
    gender: profileData?.gender || null,
    studentCode: profileData?.studentCode || null,
    role: profileData?.role || role || baseUser?.role || "Student",
    photoURL:
      profileData?.avatarUrl || baseUser?.photoURL || baseUser?.avatarUrl || "",
    skillsCompleted:
      profileData?.skillsCompleted ?? baseUser?.skillsCompleted ?? false,
    skills: profileData?.skills || null,
    major: profileData?.majorName || "Software Engineering",
    majorId: profileData?.majorId || baseUser?.majorId || null,
    university: "FPT University",
    joined: "Jan 2024",
    activeProjects: 1,
    completedProjects: 5,
    skillCount: profileData?.skills
      ? Array.isArray(profileData.skills)
        ? profileData.skills.length
        : profileData.skills.split(",").length
      : 0,
    portfolioUrl: profileData?.portfolioUrl || "",
  };

  if ((isLoading && !userInfo) || (profileLoading && !profileData)) {
    return (
      <LoadingState
        message="Preparing your profile..."
        subtext="Hold on a second while we fetch your latest details."
      />
    );
  }

  return (
    <div className="bg-[#f9fafb] mt-16 md:mt-20 mb-24 md:mb-32">
      {/* HEADER */}
      <ProfileHeader profile={profile} />

      {/* CONTENT: stats + tabs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 md:space-y-8 mt-6">
        {/* STAT CARDS */}
        <ProfileStats profile={profile} />

        {/* TABS HEADER */}
        <div className="mt-4 flex justify-start">
          <div className="inline-flex rounded-2xl bg-gray-100 px-1.5 py-1.5">
            {/* Overview */}
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-2 text-sm font-medium rounded-xl transition ${
                activeTab === "overview"
                  ? "bg-white text-gray-900 shadow-sm border-gray-200"
                  : "bg-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Overview
            </button>

            {/* My Groups */}
            <button
              onClick={() => setActiveTab("groups")}
              className={`px-6 py-2 text-sm font-medium rounded-xl transition ${
                activeTab === "groups"
                  ? "bg-white text-gray-900 shadow-sm border-gray-200"
                  : "bg-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              My Groups
            </button>

            {/* Posts */}
            <button
              onClick={() => setActiveTab("posts")}
              className={`px-6 py-2 text-sm font-medium rounded-xl transition ${
                activeTab === "posts"
                  ? "bg-white text-gray-900 shadow-sm border-gray-200"
                  : "bg-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Posts
            </button>

            {/* Settings - Only show for own profile */}
            {isOwnProfile && (
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-6 py-2 text-sm font-medium rounded-xl transition ${
                  activeTab === "settings"
                    ? "bg-white text-gray-900 shadow-sm border-gray-200"
                    : "bg-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                Settings
              </button>
            )}
          </div>
        </div>

        {/* TABS CONTENT */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
          {activeTab === "overview" && <ProfileOverview profile={profile} />}
          {activeTab === "groups" && <ProfileGroups userId={profile.userId} />}
          {activeTab === "posts" && <ProfilePostsTab userId={profile.userId} />}
          {activeTab === "settings" && isOwnProfile && (
            <ProfileSettings profile={profile} onUpdate={handleUpdateProfile} />
          )}
        </div>
      </div>

      {isOwnProfile && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          profileData={profileData}
          onUpdate={handleUpdateProfile}
        />
      )}
    </div>
  );
};

export default Profile;
