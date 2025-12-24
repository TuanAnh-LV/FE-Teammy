import React from "react";
import { Code, Briefcase } from "lucide-react";
import { useTranslation } from "../../../hook/useTranslation";

const ProfileOverview = ({ profile }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <h3 className="text-lg md:text-xl font-bold text-gray-800 flex items-center gap-2">
        <Code className="w-4 h-4 md:w-5 md:h-5" />
        {t("skills") || "Skills"}
      </h3>
      {profile.skills ? (
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
      ) : (
        <p className="text-sm text-gray-500">
          {t("noSkillsUpdated") || "No skills updated."}
        </p>
      )}
    </div>
  );
};

export default ProfileOverview;
