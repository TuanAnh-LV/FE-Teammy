import React, { useState, useMemo } from "react";
import { X } from "lucide-react";

export default function EditGroupModal({
  t,
  open,
  submitting,
  form,
  errors,
  memberCount,
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
    return colors[role?.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-300";
  };

  const capitalizeFirst = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  if (!open) return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget && !submitting) {
      onClose();
    }
  };

  const label = (key, fallback) => t(key) || fallback;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={handleBackdrop}
    >
      <div className="absolute inset-0 bg-black/40" />
      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-blue-500">
              {label("editGroup", "Edit group")}
            </p>
            <h3 className="text-lg font-semibold text-gray-900">
              {label("updateGroupDetails", "Update group details")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded p-1 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 px-6 py-6">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {label("groupName", "Group name")}
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
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {label("description", "Description")}
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => onChange("description", e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none ring-blue-100 transition focus:border-blue-400 focus:ring-4"
              placeholder={label(
                "updateGroupPlaceholder",
                "Share the latest direction, scope, or constraints."
              )}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {label("maxMembers", "Max members")}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={memberCount || 1}
              value={form.maxMembers}
              onChange={(e) => onChange("maxMembers", e.target.value)}
              className={`w-40 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-4 transition ${
                errors.maxMembers
                  ? "border-red-400 ring-red-100"
                  : "border-gray-200 focus:border-blue-400 ring-blue-100"
              }`}
            />
            <p className="mt-1 text-xs text-gray-500">
              {label(
                "maxMembersHint",
                "Cannot be lower than current member count"
              )}{" "}
              ({memberCount})
            </p>
            {errors.maxMembers && (
              <p className="mt-1 text-xs text-red-600">{errors.maxMembers}</p>
            )}
          </div>

          {/* Tech Stack / Skills */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("techStack") || "Tech Stack"}
            </label>

            {/* Selected Skills */}
            <div className="mb-3 rounded-lg border-2 border-dashed border-blue-200 bg-blue-50 p-3 min-h-[60px]">
              <p className="mb-2 text-xs font-medium text-blue-900">
                {t("selectedSkills") || "Selected Skills"} ({(form.skills || []).length})
              </p>
              {!form.skills || form.skills.length === 0 ? (
                <p className="text-xs text-blue-600 italic">
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
                        {capitalizeFirst(skill.token)}
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
            disabled={submitting}
            className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {label("cancel", "Cancel")}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting
              ? label("saving", "Saving...")
              : label("saveChanges", "Save changes")}
          </button>
        </div>
      </form>
    </div>
  );
}
