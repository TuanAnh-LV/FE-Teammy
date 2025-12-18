import React, { useState, useEffect, useMemo } from "react";
import { Calendar, X, Loader2, Plus } from "lucide-react";
import { UserService } from "../../../services/user.service";
import { SkillService } from "../../../services/skill.service";
import { useAuth } from "../../../context/AuthContext";
import { notification, Tag } from "antd";

const ProfileSettings = ({ profile, onUpdate }) => {
  const { userInfo } = useAuth();

  const [settingsForm, setSettingsForm] = useState({
    fullName: "",
    phone: "",
    gender: "",
    skills: [],
    skillsCompleted: false,
    portfolioUrl: "",
  });

  const [saving, setSaving] = useState(false);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);

  // filter theo role giống CreateGroup / EditGroup
  const [skillFilter, setSkillFilter] = useState("all"); // all, frontend, backend, mobile, devops, qa

  useEffect(() => {
    let skillsArray = [];
    if (Array.isArray(profile.skills)) {
      skillsArray = profile.skills;
    } else if (typeof profile.skills === "string" && profile.skills) {
      skillsArray = profile.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    setSettingsForm({
      fullName: profile.name || "",
      phone: profile.phone || "",
      gender: profile.gender || "",
      skills: skillsArray,
      skillsCompleted: Boolean(profile.skillsCompleted),
      portfolioUrl: profile.portfolioUrl || "",
    });
  }, [profile]);

  // Fetch available skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setSkillsLoading(true);
        const majorName =
          userInfo?.majorName || profile?.major || profile?.majorName;

        const params = {
          pageSize: 100,
        };

        if (majorName) {
          params.major = majorName;
        }

        const response = await SkillService.list(params);

        const skillsList = Array.isArray(response?.data) ? response.data : [];
        setAvailableSkills(skillsList);
      } catch (error) {
        setAvailableSkills([]);
      } finally {
        setSkillsLoading(false);
      }
    };

    fetchSkills();
  }, [userInfo?.majorName, profile?.major, profile?.majorName]);

  const filteredSkills = useMemo(() => {
    if (skillFilter === "all") return availableSkills;
    return availableSkills.filter(
      (skill) => skill.role?.toLowerCase() === skillFilter.toLowerCase()
    );
  }, [availableSkills, skillFilter]);

  const handleChange = (field, value) => {
    setSettingsForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleSkill = (skillName) => {
    const currentSkills = settingsForm.skills || [];
    const isSelected = currentSkills.includes(skillName);

    if (isSelected) {
      setSettingsForm((prev) => ({
        ...prev,
        skills: currentSkills.filter((s) => s !== skillName),
      }));
    } else {
      setSettingsForm((prev) => ({
        ...prev,
        skills: [...currentSkills, skillName],
      }));
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      frontend: "blue",
      backend: "green",
      mobile: "purple",
      devops: "orange",
      qa: "red",
    };
    return colors[role?.toLowerCase()] || "default";
  };

  const getRoleButtonClass = (role, isActive) => {
    const baseClass =
      "px-3 py-1 rounded-full text-xs font-medium transition capitalize";
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

  const handleCancel = () => {
    let skillsArray = [];
    if (Array.isArray(profile.skills)) {
      skillsArray = profile.skills;
    } else if (typeof profile.skills === "string" && profile.skills) {
      skillsArray = profile.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    setSettingsForm({
      fullName: profile.name || "",
      phone: profile.phone || "",
      gender: profile.gender || "",
      skills: skillsArray,
      skillsCompleted: Boolean(profile.skillsCompleted),
      portfolioUrl: profile.portfolioUrl || "",
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        displayName: settingsForm.fullName.trim(),
        phone: settingsForm.phone.trim(),
        gender: settingsForm.gender,
        // Send skills as an array (same style as group creation / complete profile)
        skills: Array.isArray(settingsForm.skills)
          ? settingsForm.skills
          : typeof settingsForm.skills === "string" && settingsForm.skills
          ? settingsForm.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
        skillsCompleted: settingsForm.skillsCompleted,
        portfolioUrl: settingsForm.portfolioUrl.trim(),
      };

      const response = await UserService.updateProfile(payload, false);

      notification.success({
        message: "Success",
        description: "Profile updated successfully",
      });

      if (onUpdate && response?.data) {
        onUpdate(response.data);
      }
    } catch (error) {
      notification.error({
        message: "Error",
        description:
          error?.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Full Name</label>
          <input
            type="text"
            value={settingsForm.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Phone</label>
          <input
            type="text"
            value={settingsForm.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Gender */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">Gender</label>
          <select
            value={settingsForm.gender}
            onChange={(e) => handleChange("gender", e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Portfolio URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">
            Portfolio URL
          </label>
          <input
            type="text"
            value={settingsForm.portfolioUrl}
            onChange={(e) => handleChange("portfolioUrl", e.target.value)}
            placeholder="https://your-portfolio.dev"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Skills Selection */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-gray-600">
          Tech Stack / Skills
        </label>

        {/* Selected Skills */}
        <div className="rounded-lg border-2 border-dashed border-blue-200 bg-blue-50 p-3 min-h-[60px]">
          <p className="mb-2 text-xs font-medium text-blue-900">
            Selected Skills ({settingsForm.skills?.length || 0})
          </p>
          <div className="flex flex-wrap gap-2">
            {!settingsForm.skills || settingsForm.skills.length === 0 ? (
              <p className="text-xs text-blue-600 italic">
                Click skills below to add them
              </p>
            ) : (
              settingsForm.skills.map((skillToken) => {
                const skill = availableSkills.find(
                  (s) => s.token === skillToken
                );
                return (
                  <Tag
                    key={skillToken}
                    color={getRoleColor(skill?.role)}
                    closable
                    onClose={(e) => {
                      e.preventDefault();
                      handleToggleSkill(skillToken);
                    }}
                    className="cursor-pointer text-xs px-2 py-1"
                  >
                    {skillToken}
                  </Tag>
                );
              })
            )}
          </div>
        </div>

        {/* Skill Role Filter */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setSkillFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              skillFilter === "all"
                ? "bg-blue-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({availableSkills.length})
          </button>
          {["frontend", "backend", "mobile", "devops", "qa"].map((role) => {
            const count = availableSkills.filter(
              (s) => s.role?.toLowerCase() === role
            ).length;
            if (!count) return null;
            return (
              <button
                key={role}
                type="button"
                onClick={() => setSkillFilter(role)}
                className={getRoleButtonClass(role, skillFilter === role)}
              >
                {role} ({count})
              </button>
            );
          })}
        </div>

        {/* Available Skills */}
        <div className="max-h-8no0 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3">
          <p className="mb-2 text-xs font-medium text-gray-600">
            Available Skills (Click to add)
          </p>
          {skillsLoading ? (
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Loading skills...</span>
            </div>
          ) : filteredSkills.length === 0 ? (
            <p className="text-xs text-gray-400">No skills found</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {filteredSkills.map((skill) => {
                const isSelected = (settingsForm.skills || []).includes(
                  skill.token
                );
                return (
                  <Tag
                    key={skill.id || skill.token}
                    color={isSelected ? "default" : getRoleColor(skill.role)}
                    className={`cursor-pointer text-xs px-2 py-1 transition ${
                      isSelected
                        ? "opacity-40 cursor-not-allowed"
                        : "hover:scale-105"
                    }`}
                    onClick={() =>
                      !isSelected && handleToggleSkill(skill.token)
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
          )}
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={settingsForm.skillsCompleted}
            onChange={(e) => handleChange("skillsCompleted", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span>Mark skills form as completed</span>
        </label>
      </div>

      <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
        <button
          type="button"
          onClick={handleCancel}
          disabled={saving}
          className="px-4 py-2 rounded-lg border !border-gray-300 hover:!border-orange-400 hover:!text-orange-400 transition-all text-sm  disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-lg !bg-[#FF7A00] hover:!opacity-90 !text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ProfileSettings;
