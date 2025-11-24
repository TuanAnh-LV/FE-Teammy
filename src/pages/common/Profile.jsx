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
} from "lucide-react";
import { AuthService } from "../../services/auth.service";
import { UserService } from "../../services/user.service";
import { useAuth } from "../../context/AuthContext";
import LoadingState from "../../components/common/LoadingState";
import EditProfileModal from "../../components/common/EditProfileModal";

const Profile = () => {
  const {
    userInfo,
    setUserInfo,
    role,
    setRole,
    isLoading,
    setIsLoading,
    token,
  } = useAuth();

  const profileFetchTokenRef = useRef(null);
  const [profileData, setProfileData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
        const response = await UserService.getMyProfile(false);
        if (mounted && response?.data) {
          setProfileData(response.data);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fetchProfileData();
    return () => {
      mounted = false;
    };
  }, [token]);


  const handleUpdateProfile = (updatedData) => {
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

  const profile = {
    userId: profileData?.userId || userInfo?.userId || "",
    name: profileData?.displayName || userInfo?.name || userInfo?.displayName || "Unnamed",
    email: profileData?.email || userInfo?.email || "",
    phone: profileData?.phone || null,
    gender: profileData?.gender || null,
    studentCode: profileData?.studentCode || null,
    role: role ?? userInfo?.role ?? "Student",
    photoURL: profileData?.avatarUrl || userInfo?.photoURL || userInfo?.avatarUrl || "",
    skillsCompleted: profileData?.skillsCompleted ?? userInfo?.skillsCompleted ?? false,
    skills: profileData?.skills || null,
    major: profileData?.majorName || "Computer Science",
    majorId: profileData?.majorId || null,
    university: "FPT University",
    joined: "Jan 2024",
    activeProjects: 1,
    completedProjects: 5,
    skillCount: profileData?.skills ? profileData.skills.split(",").length : 0,
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

  if (isLoading && !userInfo) {
    return (
      <LoadingState
        message="Preparing your profile..."
        subtext="Hold on a second while we fetch your latest details."
      />
    );
  }

  // ---- UI
  return (
    <div className="mt-20 mb-96 max-w-6xl mx-auto px-4 space-y-8">
      {/* Header */}
      <div className="bg-white shadow rounded-2xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          {profile.photoURL ? (
            <img
              src={profile.photoURL}
              alt={profile.name}
              className="w-20 h-20 rounded-full object-cover border"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="flex items-center justify-center bg-blue-100 text-blue-600 w-20 h-20 rounded-full font-bold text-2xl">
              {initials}
            </div>
          )}

          <div>
            <h1 className="!text-3xl !font-extrabold !bg-gradient-to-r !from-blue-600 !to-green-500 !text-transparent !bg-clip-text">
              {profile.name}
            </h1>

            <div className="!flex !flex-wrap !gap-x-6 !gap-y-2 !text-sm !text-gray-600 !mt-2">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" /> {profile.email}
              </div>
              {profile.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="w-4 h-4" /> {profile.phone}
                </div>
              )}
              {profile.gender && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" /> {profile.gender}
                </div>
              )}
              {profile.studentCode && (
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" /> {profile.studentCode}
                </div>
              )}
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" /> {profile.major}
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                Role:{profile.role}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
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

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="!flex !items-center !gap-2 !bg-blue-600 !text-white !px-5 !py-2 !rounded-md !hover:bg-blue-700 !transition"
        >
          <Edit className="!w-4 !h-4" />
          Edit Profile
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-2xl p-5 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Active Projects</p>
            <h2 className="text-3xl font-bold">{profile.activeProjects}</h2>
          </div>
          <ArrowUp className="text-green-500 w-6 h-6" />
        </div>
        <div className="bg-white shadow rounded-2xl p-5 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Completed Projects</p>
            <h2 className="text-3xl font-bold">{profile.completedProjects}</h2>
          </div>
          <LineChart className="text-green-500 w-6 h-6" />
        </div>
        <div className="bg-white shadow rounded-2xl p-5 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm">Skills</p>
            <h2 className="text-3xl font-bold">{profile.skillCount}</h2>
          </div>
          <Code className="text-green-500 w-6 h-6" />
        </div>
      </div>

      {/* Skills Section */}
      {profile.skills && (
        <div className="bg-white shadow rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Code className="w-5 h-5" />
            Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.split(',').map((skill, index) => {
              const colors = [
                'bg-blue-100 text-blue-700 border-blue-300',
                'bg-green-100 text-green-700 border-green-300',
                'bg-purple-100 text-purple-700 border-purple-300',
                'bg-orange-100 text-orange-700 border-orange-300',
                'bg-pink-100 text-pink-700 border-pink-300',
                'bg-indigo-100 text-indigo-700 border-indigo-300',
                'bg-teal-100 text-teal-700 border-teal-300',
                'bg-red-100 text-red-700 border-red-300',
              ];
              const colorClass = colors[index % colors.length];
              return (
                <span
                  key={index}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border ${colorClass}`}
                >
                  {skill.trim()}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profileData={profileData}
        onUpdate={handleUpdateProfile}
      />
    </div>
  );
};

export default Profile;
