import React, { useState, useEffect } from "react";
import { AlertCircle, LogOut, Plus } from "lucide-react";
import { notification, Tag } from "antd";
import { UserService } from "../../services/user.service";
import { MajorService } from "../../services/major.service";
import { SkillService } from "../../services/skill.service";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "../../hook/useTranslation";
const CompleteProfileModal = ({ isOpen, profileData, onComplete, onClose }) => {
  const { logout, role } = useAuth();
  const { t } = useTranslation();

  const roleNormalized = role?.toLowerCase();
  const isStaffRole = ["admin", "moderator", "mentor"].includes(roleNormalized);
  const isStudent = !isStaffRole;

  const [formData, setFormData] = useState({
    displayName: "",
    phone: "",
    gender: "",
    majorId: "",
    skills: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [majors, setMajors] = useState([]);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillFilter, setSkillFilter] = useState("all"); // all, frontend, backend, mobile, devops, qa
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (profileData) {
      setFormData({
        displayName: profileData.displayName || "",
        phone: profileData.phone || "",
        gender: profileData.gender || "",
        majorId: profileData.majorId || "",
        skills: profileData.skills || [],
      });
      setSelectedSkills(profileData.skills || []);
    }
  }, [profileData]);

  useEffect(() => {
    const fetchMajors = async () => {
      try {
        const response = await MajorService.getMajors();
        if (response?.data) {
          setMajors(response.data);
        }
      } catch (error) {
        console.error("Error fetching majors:", error);
      }
    };
    if (isOpen) {
      fetchMajors();
    }
  }, [isOpen]);

  // Fetch skills when major changes
  useEffect(() => {
    const fetchSkills = async () => {
      if (!formData.majorId) {
        setAvailableSkills([]);
        return;
      }

      try {
        // Find the major name from majorId
        const selectedMajor = majors.find(
          (major) => major.majorId === formData.majorId
        );

        if (!selectedMajor) {
          setAvailableSkills([]);
          return;
        }

        const response = await SkillService.list({
          major: selectedMajor.majorName,
        });

        if (response?.data) {
          setAvailableSkills(response.data);
        }
      } catch (error) {
        console.error("Error fetching skills:", error);
        setAvailableSkills([]);
      }
    };

    fetchSkills();
  }, [formData.majorId, majors]);

  // eslint-disable-next-line no-unused-vars
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear skills when major changes
    if (name === "majorId") {
      setFormData((prev) => ({
        ...prev,
        majorId: value,
        skills: [],
      }));
      setSelectedSkills([]);
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddSkill = (skillToken) => {
    if (!selectedSkills.includes(skillToken)) {
      const newSkills = [...selectedSkills, skillToken];
      setSelectedSkills(newSkills);
      setFormData((prev) => ({
        ...prev,
        skills: newSkills,
      }));

      if (errors.skills) {
        setErrors((prev) => ({ ...prev, skills: "" }));
      }
    }
  };

  const handleRemoveSkill = (skillToken) => {
    const newSkills = selectedSkills.filter((s) => s !== skillToken);
    setSelectedSkills(newSkills);
    setFormData((prev) => ({
      ...prev,
      skills: newSkills,
    }));
  };

  const filteredSkills = availableSkills.filter((skill) => {
    if (skillFilter === "all") return true;
    return skill.role === skillFilter;
  });

  const getRoleColor = (role) => {
    const colors = {
      frontend: "blue",
      backend: "green",
      mobile: "purple",
      devops: "orange",
      qa: "red",
    };
    return colors[role] || "default";
  };

  const getRoleButtonClass = (role, isActive) => {
    const baseClass =
      "px-3 py-1 rounded-full text-sm font-medium transition capitalize";
    const inactiveClass = "bg-gray-200 text-gray-700 hover:bg-gray-300";

    if (!isActive) return `${baseClass} ${inactiveClass}`;

    const activeClasses = {
      frontend: "bg-blue-600 text-white",
      backend: "bg-green-600 text-white",
      mobile: "bg-purple-600 text-white",
      devops: "bg-orange-600 text-white",
      qa: "bg-red-600 text-white",
    };

    return `${baseClass} ${activeClasses[role] || "bg-gray-800 text-white"}`;
  };

  const validateForm = () => {
    const newErrors = {};

    // Skills: bắt buộc với student
    if (isStudent && (!formData.skills || formData.skills.length === 0)) {
      newErrors.skills = t("skillsRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      notification.error({
        message: t("profileCompleteValidationError"),
        description: isStudent ? t("skillsRequired") : t("allFieldsRequired"),
        placement: "topRight",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Add skillsCompleted: true to mark profile as complete
      const payload = {
        ...formData,
        skillsCompleted: true,
      };

      const response = await UserService.updateMyProfile(payload);
      if (response?.data) {
        notification.success({
          message: t("profileCompleted"),
          description: isStudent
            ? t("skillsSavedSuggestions")
            : t("profileUpdatedSuccess"),
          placement: "topRight",
        });
        onComplete(response.data);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      notification.error({
        message: t("error"),
        description: t("failedLoadGroups"),
        placement: "topRight",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    // Close modal first before logout
    if (onClose) {
      onClose();
    }

    // Then logout
    setTimeout(() => {
      logout();
      notification.info({
        message: "Logged Out",
        description: "You have been logged out successfully.",
        placement: "topRight",
      });
    }, 100);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      if (onClose) onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fadeIn">
        {/* Header with Warning */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8" />
              <h2 className="text-2xl font-bold">{t("completeYourProfile")}</h2>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-white font-medium"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">{t("logout")}</span>
            </button>
          </div>
          <p className="text-white/90">
            {isStudent ? t("selectYourSkills") : t("completeBasicInfo")}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Major */}
          <div>
            <label
              htmlFor="majorId"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("major")}{" "}
              <span className="text-gray-400 text-xs">
                {t("majorProvidedBySchool")}
              </span>
            </label>
            <input
              type="text"
              value={
                majors.find((m) => m.majorId === formData.majorId)?.majorName ||
                majors.find((m) => m.majorId === formData.majorId)?.name ||
                formData.majorId ||
                t("notSpecified") ||
                "Not specified"
              }
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed outline-none"
            />
            {errors.majorId && (
              <p className="text-red-500 text-sm mt-1">{errors.majorId}</p>
            )}
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("skills")}{" "}
              {isStudent ? (
                <span className="text-red-500">*</span>
              ) : (
                <span className="text-gray-400">({t("optional")})</span>
              )}
            </label>

            {!formData.majorId ? (
              <div className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                {t("pleaseFillAllFields")}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Selected Skills */}
                <div className="min-h-[100px] p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {t("yourSelectedSkills")} ({selectedSkills.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.length === 0 ? (
                      <p className="text-gray-400 text-sm">
                        {t("clickSkillsBelowToAdd")}
                      </p>
                    ) : (
                      selectedSkills.map((skillToken) => {
                        const skill = availableSkills.find(
                          (s) => s.token === skillToken
                        );
                        return (
                          <Tag
                            key={skillToken}
                            color={getRoleColor(skill?.role)}
                            closable
                            onClose={() => handleRemoveSkill(skillToken)}
                            className="cursor-pointer"
                          >
                            {skillToken}
                          </Tag>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Role Filter */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setSkillFilter("all")}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      skillFilter === "all"
                        ? "bg-gray-800 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    All ({availableSkills.length})
                  </button>
                  {["frontend", "backend", "mobile", "devops", "qa"].map(
                    (role) => {
                      const count = availableSkills.filter(
                        (s) => s.role === role
                      ).length;
                      if (count === 0) return null;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setSkillFilter(role)}
                          className={getRoleButtonClass(
                            role,
                            skillFilter === role
                          )}
                        >
                          {role} ({count})
                        </button>
                      );
                    }
                  )}
                </div>

                {/* Available Skills */}
                <div className="max-h-[250px] overflow-y-auto p-4 border border-gray-300 rounded-lg bg-white">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {t("availableSkills")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {filteredSkills.map((skill) => {
                      const isSelected = selectedSkills.includes(skill.token);
                      return (
                        <Tag
                          key={skill.token}
                          color={
                            isSelected ? "default" : getRoleColor(skill.role)
                          }
                          className={`cursor-pointer transition ${
                            isSelected
                              ? "opacity-40 cursor-not-allowed"
                              : "hover:scale-105"
                          }`}
                          onClick={() =>
                            !isSelected && handleAddSkill(skill.token)
                          }
                        >
                          {skill.token}
                          {!isSelected && (
                            <Plus className="inline-block w-3 h-3 ml-1" />
                          )}
                        </Tag>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {errors.skills && (
              <p className="text-red-500 text-sm mt-1">{errors.skills}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {formData.majorId
                ? isStudent
                  ? t("skillsHelperStudent")
                  : t("skillsHelperStaff")
                : isStaffRole
                ? t("skillsHelperOptional")
                : t("skillsHelperNoMajor")}
            </p>
          </div>

          {/* Warning Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">
                  {isStudent ? t("whySkills") : t("quickSetup")}
                </p>
                <p>
                  {isStudent ? t("weUseYourSkills") : t("youCanUpdateAnytime")}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg shadow-lg"
            >
              {isSubmitting ? t("completingProfile") : t("completeYourProfile")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfileModal;
