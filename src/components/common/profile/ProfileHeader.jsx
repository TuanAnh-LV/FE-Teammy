import React, { useMemo } from "react";
import { Mail, Calendar, Phone, User, MessageSquare, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfileHeader = ({ profile, isOwnProfile = false }) => {
  const navigate = useNavigate();

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
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                {profile.name}
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                {profile.major || "Software Engineering"}
                {" • "}
                {profile.role || "Student"}
              </p>
              {profile.studentCode && (
                <p className="mt-1 text-xs text-gray-400">
                  Student ID: {profile.studentCode}
                </p>
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
            onClick={() => navigate(`/messages/${profile.userId}`)}
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
