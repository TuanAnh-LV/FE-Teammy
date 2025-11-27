import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Edit,
  Mail,
  BookOpen,
  GraduationCap,
  Calendar,
  ArrowUp,
  LineChart,
  Users,
  Phone,
  User,
  Code,
  MessageSquare,
} from "lucide-react";
import { AuthService } from "../../services/auth.service";
import { UserService } from "../../services/user.service";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "../../hook/useTranslation";
import LoadingState from "../../components/common/LoadingState";
import EditProfileModal from "../../components/common/EditProfileModal";

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
        console.error("Không lấy được thông tin tài khoản:", e);
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
        console.error("Error fetching profile data:", error);
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
    // Also update userInfo if needed
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
    major: profileData?.majorName || "Computer Science",
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
  };

  const initials = useMemo(() => {
    const full = profile.name || "User";
    return full
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile.name]);

  if ((isLoading && !userInfo) || (profileLoading && !profileData)) {
    return (
      <LoadingState
        message="Preparing your profile..."
        subtext="Hold on a second while we fetch your latest details."
      />
    );
  }

  // ---- UI
  return (
    <div className="mt-16 md:mt-20 mb-24 md:mb-96 max-w-6xl mx-auto px-4 sm:px-6 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="bg-white shadow rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {profile.photoURL ? (
            <img
              src={profile.photoURL}
              alt={profile.name}
              className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex items-center justify-center bg-blue-100 text-blue-600 w-16 h-16 md:w-20 md:h-20 rounded-full font-bold text-xl md:text-2xl shrink-0">
              {initials}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="!text-2xl md:!text-3xl !font-extrabold !bg-gradient-to-r !from-blue-600 !to-green-500 !text-transparent !bg-clip-text break-words">
              {profile.name}
            </h1>

            <div className="!flex !flex-wrap !gap-x-4 md:!gap-x-6 !gap-y-2 !text-xs md:!text-sm !text-gray-600 !mt-2">
              <div className="flex items-center gap-1 min-w-0">
                <Mail className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                <span className="truncate">{profile.email}</span>
              </div>
              {profile.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-3 h-3 md:w-4 md:h-4 shrink-0" />{" "}
                  {profile.phone}
                </div>
              )}
              {profile.gender && (
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 md:w-4 md:h-4 shrink-0" />{" "}
                  {profile.gender}
                </div>
              )}
              {profile.studentCode && (
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-3 h-3 md:w-4 md:h-4 shrink-0" />{" "}
                  {profile.studentCode}
                </div>
              )}
              <div className="flex items-center gap-1">
                <BookOpen className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
                <span className="truncate">{profile.major}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                Role: {profile.role}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  profile.skillsCompleted
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                Skills form:{" "}
                {profile.skillsCompleted ? "Completed" : "Incomplete"}
              </span>
            </div>
          </div>
        </div>

        {isOwnProfile && (
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="!flex !items-center !justify-center !gap-2 !bg-blue-600 !text-white !px-4 md:!px-8 !py-2 !rounded-md !hover:bg-blue-700 !transition !w-full md:!w-auto !text-sm md:!text-base nowrap"
          >
            <Edit className="!w-4 !h-4" />
            {t("editProfile") || "Edit Profile"}
          </button>
        )}

        {/* Message Button */}
        <button
          onClick={() => {
            if (profile.userId) {
              navigate(`/messages/${profile.userId}`);
            }
          }}
          disabled={!profile.userId}
          className="!flex !items-center !justify-center !gap-2 !bg-green-600 !text-white !px-4 md:!px-5 !py-2 !rounded-md !hover:bg-green-700 !transition !w-full md:!w-auto !text-sm md:!text-base disabled:!opacity-50 disabled:!cursor-not-allowed"
        >
          <MessageSquare className="!w-4 !h-4" />
          {t("messages") || "Messages"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white shadow rounded-2xl p-4 md:p-5 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-xs md:text-sm">
              {t("groupsJoined") || "Groups Joined"}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold">
              {profile.activeProjects}
            </h2>
          </div>
          <Users className="text-green-500 w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div className="bg-white shadow rounded-2xl p-4 md:p-5 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-xs md:text-sm">
              {t("projectsCompleted") || "Projects Completed"}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold">
              {profile.completedProjects}
            </h2>
          </div>
          <LineChart className="text-green-500 w-5 h-5 md:w-6 md:h-6" />
        </div>
        <div className="bg-white shadow rounded-2xl p-4 md:p-5 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-xs md:text-sm">
              {t("skillsLogged") || "Skills Logged"}
            </p>
            <h2 className="text-2xl md:text-3xl font-bold">
              {profile.skillCount}
            </h2>
          </div>
          <Code className="text-green-500 w-5 h-5 md:w-6 md:h-6" />
        </div>
      </div>

      {/* Skills Section */}
      {profile.skills && (
        <div className="bg-white shadow rounded-2xl p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
            <Code className="w-4 h-4 md:w-5 md:h-5" />
            {t("skills") || "Skills"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(profile.skills)
              ? profile.skills
              : profile.skills.split(",")
            ).map((skill, index) => {
              const colors = [
                "bg-blue-100 text-blue-700 border-blue-300",
                "bg-green-100 text-green-700 border-green-300",
                "bg-purple-100 text-purple-700 border-purple-300",
                "bg-orange-100 text-orange-700 border-orange-300",
                "bg-pink-100 text-pink-700 border-pink-300",
                "bg-indigo-100 text-indigo-700 border-indigo-300",
                "bg-teal-100 text-teal-700 border-teal-300",
                "bg-red-100 text-red-700 border-red-300",
              ];
              const colorClass = colors[index % colors.length];
              return (
                <span
                  key={index}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border ${colorClass}`}
                >
                  {typeof skill === "string" ? skill.trim() : skill}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
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
