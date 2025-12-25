import React, { useMemo } from "react";
import {
  Mail,
  Phone,
  User,
  MessageSquare,
  ExternalLink,
  Sparkles,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  Hash,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const ProfileHeader = ({ profile, isOwnProfile = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 md:py-8 flex items-center justify-between">
        {/* Left: avatar + info */}
        <div className="flex items-center gap-6">
          {/* Avatar */}
          {profile.photoURL ? (
            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center shadow-sm">
              <img
                src={profile.photoURL}
                alt={profile.name}
                className="w-20 h-20 rounded-full object-cover border border-white"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center shadow-sm">
              <span className="text-2xl font-semibold text-blue-600">
                {initials}
              </span>
            </div>
          )}

          {/* Info block */}
          <div className="space-y-3">
            <div className="flex flex-col gap-2">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                  {profile.name}
                </h1>
                <div className="mt-2 flex flex-wrap gap-2 text-xs md:text-sm">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-blue-700 font-semibold">
                    <GraduationCap className="w-4 h-4" />
                    {profile.major || "Software Engineering"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    {profile.role || "Student"}
                  </span>
                  {profile.studentCode && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-indigo-700 font-semibold">
                      <Hash className="w-4 h-4" />
                      {profile.studentCode}
                    </span>
                  )}
                </div>
              </div>

              {/* Desired position pill */}
              {profile.desiredPositionId && (
                <div className="inline-flex items-center gap-2 self-start rounded-full border border-amber-300 bg-amber-50 text-amber-800 px-3 py-1 text-xs font-semibold shadow-sm">
                  <Briefcase className="w-4 h-4" />
                  <span>
                    {profile.desiredPositionName ||
                      profile.desiredPositionId ||
                      "Desired Position"}
                  </span>
                </div>
              )}
            </div>

            {/* contact row */}
            <div className="flex flex-wrap items-center gap-5 text-xs md:text-sm text-gray-600">
              {profile.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  <span>{profile.email}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  <span>{profile.phone}</span>
                </div>
              )}
              {profile.gender && (
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span className="capitalize">{profile.gender}</span>
                </div>
              )}
            </div>

            {/* Portfolio social button */}
            {profile.portfolioUrl && (
              <div className="mt-3">
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs md:text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Portfolio
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Right: Send Message button - hide when viewing own profile */}
        {profile.userId && !isOwnProfile && (
          <button
            onClick={() => {
              if (location.pathname.startsWith("/mentor")) {
                navigate(`/mentor/messages/${profile.userId}`);
              } else {
                navigate(`/messages/${profile.userId}`);
              }
            }}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send Message</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
