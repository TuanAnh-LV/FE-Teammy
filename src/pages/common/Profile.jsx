import React, { useEffect, useMemo } from "react";
import {
  Edit,
  Mail,
  BookOpen,
  GraduationCap,
  Calendar,
  ArrowUp,
  LineChart,
  Users,
} from "lucide-react";
import { AuthService } from "../../services/auth.service";
import { useAuth } from "../../context/AuthContext";

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

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!token || userInfo) return;
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

  const profile = {
    name: userInfo?.name ?? userInfo?.displayName ?? "Unnamed",
    email: userInfo?.email ?? "",
    role: role ?? userInfo?.role ?? "Student",
    photoURL: userInfo?.photoURL || userInfo?.avatarUrl || "",
    skillsCompleted: !!userInfo?.skillsCompleted,
    major: "Computer Science",
    university: "FPT University",
    joined: "Jan 2024",
    activeProjects: 1,
    completedProjects: 5,
    skillCount: 6,
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
    return <div className="mt-20 max-w-6xl mx-auto px-4">Loading...</div>;
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
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" /> {profile.major}
              </div>
              <div className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4" /> {profile.university}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> Joined {profile.joined}
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

        <button className="!flex !items-center !gap-2 !bg-blue-600 !text-white !px-5 !py-2 !rounded-md !hover:bg-blue-700 !transition">
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
          <ArrowUp className="text-green-500 w-6 h-6" />
        </div>
      </div>

      {/* Main Grid (giữ nguyên phần dưới) */}
      {/* ... */}
    </div>
  );
};

export default Profile;
