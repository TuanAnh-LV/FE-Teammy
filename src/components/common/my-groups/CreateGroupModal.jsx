import React, { useState, useMemo } from "react";
import { X, Plus } from "lucide-react";
import { Tag } from "antd";

export default function CreateGroupModal({
  t,
  open,
  submitting,
  form,
  errors,
  skills = [],
  skillsLoading = false,
  onClose,
  onSubmit,
  onChange,
}) {
  const [skillFilter, setSkillFilter] = useState("all"); // all, frontend, backend, mobile, devops, qa

  const filteredSkills = useMemo(() => {
    if (skillFilter === "all") return skills;
    return skills.filter(
      (skill) => skill.role?.toLowerCase() === skillFilter.toLowerCase()
    );
  }, [skills, skillFilter]);

  const handleToggleSkill = (skillName) => {
    const currentSkills = form.skills || [];
    const isSelected = currentSkills.includes(skillName);

    if (isSelected) {
      onChange(
        "skills",
        currentSkills.filter((s) => s !== skillName)
      );
    } else {
      onChange("skills", [...currentSkills, skillName]);
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

  if (!open) return null;

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget && !submitting) {
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
        className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl"
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
          {/* Group name */}
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

          {/* Description */}
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

          {/* Max members */}
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

          {/* Tech Stack / Skills - đồng bộ với EditGroupModal */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              {t("techStack") || "Tech Stack"}
            </label>

            {/* Selected Skills */}
            <div className="min-h-[90px] p-3 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
              <p className="text-xs font-medium text-gray-700 mb-2">
                {t("yourSelectedSkills") || "Your selected skills"} (
                {(form.skills || []).length})
              </p>
              <div className="flex flex-wrap gap-2">
                {!form.skills || form.skills.length === 0 ? (
                  <p className="text-gray-400 text-xs">
                    {t("clickSkillsBelowToAdd") ||
                      "Click skills below to add them to the group"}
                  </p>
                ) : (
                  form.skills.map((skillToken) => {
                    const skill = skills.find((s) => s.token === skillToken);
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

            {/* Role Filter */}
            <div className="flex gap-2 flex-wrap mt-3">
              <button
                type="button"
                onClick={() => setSkillFilter("all")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  skillFilter === "all"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {t("all") || "All"} ({skills.length})
              </button>
              {["frontend", "backend", "mobile", "devops", "qa"].map((role) => {
                const count = skills.filter(
                  (s) => s.role?.toLowerCase() === role
                ).length;
                if (count === 0) return null;
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
            <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3 mt-3">
              <p className="mb-2 text-xs font-medium text-gray-700">
                {t("availableSkills") || "Available skills"}
              </p>
              {skillsLoading ? (
                <p className="text-xs text-gray-400">
                  {t("loading") || "Loading..."}
                </p>
              ) : filteredSkills.length === 0 ? (
                <p className="text-xs text-gray-400">
                  {t("noSkillsFound") || "No skills found"}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filteredSkills.map((skill) => {
                    const isSelected = (form.skills || []).includes(
                      skill.token
                    );
                    return (
                      <Tag
                        key={skill.id || skill.token}
                        color={
                          isSelected ? "default" : getRoleColor(skill.role)
                        }
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
