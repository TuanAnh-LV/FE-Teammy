import React, { useState, useEffect, useMemo } from "react";
import { Calendar, X, Loader2 } from "lucide-react";
import { UserService } from "../../../services/user.service";
import { SkillService } from "../../../services/skill.service";
import { useAuth } from "../../../context/AuthContext";
import { notification } from "antd";

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
  const [activeSkillCategory, setActiveSkillCategory] = useState("All");
  const [skillSearchTerm, setSkillSearchTerm] = useState("");

  useEffect(() => {
    let skillsArray = [];
    if (Array.isArray(profile.skills)) {
      skillsArray = profile.skills;
    } else if (typeof profile.skills === "string" && profile.skills) {
      skillsArray = profile.skills.split(",").map(s => s.trim()).filter(Boolean);
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
        const majorName = userInfo?.majorName || profile?.major || profile?.majorName;
        
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

  const skillCategories = useMemo(() => {
    const categories = ["All"];
    const uniqueCategories = new Set();
    availableSkills.forEach((skill) => {
      if (skill.role) {
        uniqueCategories.add(skill.role);
      }
    });
    return [...categories, ...Array.from(uniqueCategories)];
  }, [availableSkills]);

  const filteredSkills = useMemo(() => {
    let filtered = availableSkills;
    
    if (activeSkillCategory !== "All") {
      filtered = filtered.filter(
        (skill) => skill.role === activeSkillCategory
      );
    }
    
    if (skillSearchTerm) {
      filtered = filtered.filter((skill) =>
        skill.token?.toLowerCase().includes(skillSearchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [availableSkills, activeSkillCategory, skillSearchTerm]);

  const handleChange = (field, value) => {
    setSettingsForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggleSkill = (skillName) => {
    const currentSkills = settingsForm.skills || [];
    const isSelected = currentSkills.includes(skillName);
    
    if (isSelected) {
      setSettingsForm(prev => ({
        ...prev,
        skills: currentSkills.filter((s) => s !== skillName)
      }));
    } else {
      setSettingsForm(prev => ({
        ...prev,
        skills: [...currentSkills, skillName]
      }));
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      frontend: "bg-blue-100 text-blue-700 border-blue-300",
      backend: "bg-green-100 text-green-700 border-green-300",
      mobile: "bg-purple-100 text-purple-700 border-purple-300",
      devops: "bg-orange-100 text-orange-700 border-orange-300",
      qa: "bg-red-100 text-red-700 border-red-300",
    };
    return colors[role?.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const capitalizeFirst = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleCancel = () => {
    let skillsArray = [];
    if (Array.isArray(profile.skills)) {
      skillsArray = profile.skills;
    } else if (typeof profile.skills === "string" && profile.skills) {
      skillsArray = profile.skills.split(",").map(s => s.trim()).filter(Boolean);
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
        skills: Array.isArray(settingsForm.skills) 
          ? settingsForm.skills.join(", ")
          : settingsForm.skills,
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
        description: error?.response?.data?.message || "Failed to update profile",
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
          <label className="text-xs font-medium text-gray-600">
            Full Name
          </label>
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
        <label className="text-xs font-medium text-gray-600">Tech Stack / Skills</label>
        
        {/* Selected Skills */}
        <div className="rounded-lg border-2 border-dashed border-blue-200 bg-blue-50 p-3 min-h-[60px]">
          <p className="mb-2 text-xs font-medium text-blue-900">
            Selected Skills ({settingsForm.skills?.length || 0})
          </p>
          {!settingsForm.skills || settingsForm.skills.length === 0 ? (
            <p className="text-xs text-blue-600 italic">
              Click skills below to add them
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {settingsForm.skills.map((skillName) => {
                const skill = availableSkills.find(s => s.token === skillName);
                const colorClass = skill ? getRoleColor(skill.role) : "bg-blue-100 text-blue-700 border-blue-300";
                return (
                  <button
                    key={skillName}
                    type="button"
                    onClick={() => handleToggleSkill(skillName)}
                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium hover:opacity-80 transition ${colorClass}`}
                  >
                    {capitalizeFirst(skillName)}
                    <X className="h-3 w-3" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Skill Categories */}
        <div className="flex flex-wrap gap-1.5">
          {skillCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveSkillCategory(category)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                activeSkillCategory === category
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {capitalizeFirst(category)}
            </button>
          ))}
        </div>

        {/* Available Skills */}
        <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3">
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
                const isSelected = (settingsForm.skills || []).includes(skill.token);
                const colorClass = getRoleColor(skill.role);
                return (
                  <button
                    key={skill.id || skill.token}
                    type="button"
                    onClick={() => handleToggleSkill(skill.token)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition border ${
                      isSelected
                        ? "opacity-50 cursor-not-allowed"
                        : `${colorClass} hover:opacity-80`
                    }`}
                    disabled={isSelected}
                  >
                    {capitalizeFirst(skill.token)}
                  </button>
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
          className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-lg bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
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

