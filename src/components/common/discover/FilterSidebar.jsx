import React, { useEffect, useState } from "react";
import { MajorService } from "../../../services/major.service";
import { notification } from "antd";
import { useTranslation } from "../../../hook/useTranslation";

const FilterSidebar = ({ onFilterChange }) => {
  const { t } = useTranslation();
  const [majors, setMajors] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState("all");

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const res = await MajorService.getMajors();
        const payload = res?.data ?? res;
        const list = Array.isArray(payload) ? payload : payload?.data ?? [];
        setMajors(list || []);
      } catch {
        notification.error({
          message: t("failedLoadMajors") || "Failed to load majors",
          description:
            t("couldNotLoadMajors") || "Could not load major categories",
        });
      }
    };
    fetchMajors();
    // t is unstable and can trigger refetch loops; keep effect stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (onFilterChange) {
      onFilterChange({
        major: selectedMajor,
      });
    }
  }, [selectedMajor, onFilterChange]);

  return (
    <div className="!bg-white !rounded-2xl !shadow-md !border !border-gray-100 !p-7 !w-full !max-w-[340px] !mx-auto">
      {/* Title */}
      <h3 className="!text-lg !font-bold !text-gray-900 !mb-5">
        {t("filters") || "Filters"}
      </h3>

      <hr className="!border-gray-200 !my-5" />

      {/* Major */}
      <div className="!mb-6">
        <h4 className="!font-semibold !text-sm !text-gray-800 !mb-3">
          {t("major") || "Major"}
        </h4>
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
    </div>
  );
};

export default FilterSidebar;
