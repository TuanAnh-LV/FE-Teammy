import React from "react";
import { Users, Code } from "lucide-react";
import { useTranslation } from "../../../hook/useTranslation";

const ProfileStats = ({ profile }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
      {/* Groups Joined */}
      <div className="bg-white shadow rounded-2xl p-4 md:p-5 flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-xs md:text-sm">
            {t("groupsJoined") || "Groups Joined"}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold">
            {profile.activeProjects}
          </h2>
        </div>
        <Users className=" w-5 h-5 md:w-6 md:h-6" />
      </div>

      {/* Skills Logged */}
      <div className="bg-white shadow rounded-2xl p-4 md:p-5 flex justify-between items-center">
        <div>
          <p className="text-gray-500 text-xs md:text-sm">
            {t("skillsLogged") || "Skills Logged"}
          </p>
          <h2 className="text-2xl md:text-3xl font-bold">
            {profile.skillCount}
          </h2>
        </div>
        <Code className="w-5 h-5 md:w-6 md:h-6" />
      </div>
    </div>
  );
};

export default ProfileStats;
