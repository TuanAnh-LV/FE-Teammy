import React, { useState, useMemo } from "react";
import { X } from "lucide-react";

export default function CreateGroupModal({
  t,
  open,
  submitting,
  form,
  errors,
  majors = [],
  majorsLoading = false,
  skills = [],
  skillsLoading = false,
  onClose,
  onSubmit,
  onChange,
}) {
  const [activeSkillCategory, setActiveSkillCategory] = useState("All");
  const [skillSearchTerm, setSkillSearchTerm] = useState("");

  const skillCategories = useMemo(() => {
    const categories = ["All"];
    const uniqueCategories = new Set();
    skills.forEach((skill) => {
      if (skill.role) {
        uniqueCategories.add(skill.role);
      }
    });
    return [...categories, ...Array.from(uniqueCategories)];
  }, [skills]);

  const filteredSkills = useMemo(() => {
    let filtered = skills;
    
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
  }, [skills, activeSkillCategory, skillSearchTerm]);

  const handleToggleSkill = (skillName) => {
    const currentSkills = form.skills || [];
    const isSelected = currentSkills.includes(skillName);
    
    if (isSelected) {
      onChange("skills", currentSkills.filter((s) => s !== skillName));
    } else {
      onChange("skills", [...currentSkills, skillName]);
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
    return colors[role] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const capitalizeFirst = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  if (!open) return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      onClick={handleBackdrop}
    >
      <div className="absolute inset-0 bg-black/40" />

      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold">
            {t("createNewGroup") || "Create New Group"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 hover:bg-gray-100"
            disabled={submitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t("groupName") || "Group name"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-4 transition ${
                errors.name
                  ? "border-red-400 ring-red-100"
                  : "border-gray-200 focus:border-blue-400 ring-blue-100"
              }`}
              placeholder="E.g., AI Capstone"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t("description") || "Description"}
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-blue-100 transition focus:border-blue-400 focus:ring-4"
              placeholder="Team goals, preferred tech stack..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {t("maxMembers") || "Max members"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={4}
              max={6}
              value={form.maxMembers}
              onChange={(e) => onChange("maxMembers", e.target.value)}
              className={`w-40 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-4 transition ${
                errors.maxMembers
                  ? "border-red-400 ring-red-100"
                  : "border-gray-200 focus:border-blue-400 ring-blue-100"
              }`}
            />
            {errors.maxMembers && (
              <p className="mt-1 text-xs text-red-600">{errors.maxMembers}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("techStack") || "Tech Stack"}
            </label>

            {/* Selected Skills */}
            <div className="mb-3 min-h-[60px] rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-3">
              <p className="mb-2 text-xs font-medium text-gray-600">
                {t("selectedSkills") || "Selected Skills"} ({(form.skills || []).length})
              </p>
              {!form.skills || form.skills.length === 0 ? (
                <p className="text-xs text-gray-400">
                  {t("clickSkillsToAdd") || "Click skills below to add them"}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {form.skills.map((skillName) => {
                    const skill = skills.find(s => s.token === skillName);
                    const colorClass = skill ? getRoleColor(skill.role) : "bg-blue-100 text-blue-700 border-blue-300";
                    return (
                      <button
                        key={skillName}
                        type="button"
                        onClick={() => handleToggleSkill(skillName)}
                        className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium hover:opacity-80 ${colorClass}`}
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
            <div className="mb-2 flex flex-wrap gap-1.5">
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
            <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2">
              <p className="mb-2 px-2 text-xs font-medium text-gray-600">
                {t("availableSkills") || "Available Skills"} ({t("clickToAdd") || "Click to add"})
              </p>
              {skillsLoading ? (
                <p className="px-2 text-xs text-gray-400">
                  {t("loading") || "Loading..."}
                </p>
              ) : filteredSkills.length === 0 ? (
                <p className="px-2 text-xs text-gray-400">
                  {t("noSkillsFound") || "No skills found"}
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {filteredSkills.map((skill) => {
                    const isSelected = (form.skills || []).includes(skill.token);
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
                        {capitalizeFirst(skill.token)} +
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={submitting}
          >
            {t("cancel") || "Cancel"}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-lg bg-[#FF7A00] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
          >
            {submitting
              ? t("creating") || "Creating..."
              : t("createGroup") || "Create group"}
          </button>
        </div>
      </form>
    </div>
  );
}
