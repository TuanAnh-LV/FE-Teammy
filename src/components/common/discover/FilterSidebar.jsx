import React, { useEffect, useState } from "react";
import { MajorService } from "../../../services/major.service";
import { notification } from "antd";
import { useTranslation } from "../../../hook/useTranslation";

const FilterSidebar = ({ onFilterChange }) => {
  const { t } = useTranslation();
  const [majors, setMajors] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedTeamSize, setSelectedTeamSize] = useState("all");
  const [aiRecommended, setAiRecommended] = useState(false);

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const res = await MajorService.getMajors();
        const payload = res?.data ?? res;
        const list = Array.isArray(payload) ? payload : payload?.data ?? [];
        setMajors(list || []);
      } catch (err) {
        console.error("Failed to fetch majors:", err);
        notification.error({
          message: t("failedLoadMajors") || "Failed to load majors",
          description: t("couldNotLoadMajors") || "Could not load major categories",
        });
      }
    };
    fetchMajors();
  }, []);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        major: selectedMajor,
        difficulty: selectedDifficulty,
        teamSize: selectedTeamSize,
        aiRecommended,
      });
    }
  }, [
    selectedMajor,
    selectedDifficulty,
    selectedTeamSize,
    aiRecommended,
    onFilterChange,
  ]);

  return (
    <div className="!bg-white !rounded-2xl !shadow-md !border !border-gray-100 !p-7 !w-full !max-w-[340px] !mx-auto">
      {/* Title */}
      <h3 className="!text-lg !font-bold !text-gray-900 !mb-5">{t("filters") || "Filters"}</h3>

      {/* AI Recommended */}
      <div className="!flex !items-center !justify-between !mb-5">
        <span className="!text-sm !text-gray-700 !font-medium">
          {t("aiRecommended") || "AI Recommended"}
        </span>
        <label className="!relative !inline-flex !items-center !cursor-pointer">
          <input
            type="checkbox"
            className="!sr-only peer"
            checked={aiRecommended}
            onChange={(e) => setAiRecommended(e.target.checked)}
          />
          <div className="!w-10 !h-5 !bg-gray-200 !rounded-full peer-checked:!bg-blue-500 !transition-all"></div>
          <div className="!absolute !left-1 !top-[3px] !bg-white !w-4 !h-4 !rounded-full !transition-all peer-checked:!translate-x-5"></div>
        </label>
      </div>

      <hr className="!border-gray-200 !my-5" />

      {/* Major */}
      <div className="!mb-6">
        <h4 className="!font-semibold !text-sm !text-gray-800 !mb-3">{t("major") || "Major"}</h4>
        <div className="!space-y-2">
          <label className="!flex !items-center !space-x-2 !text-gray-700 !text-sm">
            <input
              type="radio"
              name="major"
              value="all"
              checked={selectedMajor === "all"}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="!text-blue-600 focus:!ring-blue-500"
            />
            <span>{t("allMajors") || "All Majors"}</span>
          </label>
          {majors.map((major) => (
            <label
              key={major.id || major.majorId}
              className="!flex !items-center !space-x-2 !text-gray-700 !text-sm"
            >
              <input
                type="radio"
                name="major"
                value={major.id || major.majorId}
                checked={selectedMajor === (major.id || major.majorId)}
                onChange={(e) => setSelectedMajor(e.target.value)}
                className="!text-blue-600 focus:!ring-blue-500"
              />
              <span>{major.name || major.majorName}</span>
            </label>
          ))}
        </div>
      </div>

      <hr className="!border-gray-200 !my-5" />

      {/* Difficulty */}
      <div className="!mb-6">
        <h4 className="!font-semibold !text-sm !text-gray-800 !mb-3">
          {t("difficulty") || "Difficulty"}
        </h4>
        <div className="!space-y-2">
          {["all", "beginner", "intermediate", "advanced"].map((opt) => (
            <label
              key={opt}
              className="!flex !items-center !space-x-2 !text-gray-700 !text-sm"
            >
              <input
                type="radio"
                name="difficulty"
                value={opt}
                checked={selectedDifficulty === opt}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="!text-blue-600 focus:!ring-blue-500"
              />
              <span>
                {opt === "all"
                  ? t("allLevels") || "All Levels"
                  : t(opt) || opt.charAt(0).toUpperCase() + opt.slice(1)}
              </span>
            </label>
          ))}
        </div>
      </div>

      <hr className="!border-gray-200 !my-5" />

      {/* Team Size */}
      <div>
        <h4 className="!font-semibold !text-sm !text-gray-800 !mb-3">
          {t("teamSize") || "Team Size"}
        </h4>
        <div className="!space-y-2">
          {[
            { value: "all", label: t("anySize") || "Any Size" },
            { value: "2-4", label: t("size2to4") || "2-4 members" },
            { value: "5-8", label: t("size5to8") || "5-8 members" },
            { value: "9+", label: t("size9plus") || "9+ members" },
          ].map((opt) => (
            <label
              key={opt.value}
              className="!flex !items-center !space-x-2 !text-gray-700 !text-sm"
            >
              <input
                type="radio"
                name="team"
                value={opt.value}
                checked={selectedTeamSize === opt.value}
                onChange={(e) => setSelectedTeamSize(e.target.value)}
                className="!text-blue-600 focus:!ring-blue-500"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;
