import React from "react";
import { Activity, Code } from "lucide-react";

export default function OverviewSection({
  descriptionText,
  recentActivity,
  statusMeta,
  findAssignees,
  renderAssignee,
  groupSkills = [],
  t,
}) {
  const getRoleColor = (skillName) => {
    const name = skillName?.toLowerCase() || "";
    if (name.includes("react") || name.includes("vue") || name.includes("angular") || name.includes("frontend")) {
      return "bg-blue-100 text-blue-700 border-blue-300";
    }
    if (name.includes("node") || name.includes("java") || name.includes("python") || name.includes("backend")) {
      return "bg-green-100 text-green-700 border-green-300";
    }
    if (name.includes("mobile") || name.includes("android") || name.includes("ios") || name.includes("flutter")) {
      return "bg-purple-100 text-purple-700 border-purple-300";
    }
    if (name.includes("devops") || name.includes("docker") || name.includes("kubernetes")) {
      return "bg-orange-100 text-orange-700 border-orange-300";
    }
    if (name.includes("qa") || name.includes("test")) {
      return "bg-red-100 text-red-700 border-red-300";
    }
    return "bg-gray-100 text-gray-700 border-gray-300";
  };

  const capitalizeFirst = (str) => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  return (
    <div className="lg:col-span-2 space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {t("Description") || "Description"}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {descriptionText || t("noDescription") || "No description provided."}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            {t("recentActivity") || "Recent Activity"}
          </h3>
          <span className="text-sm text-gray-400">
            {recentActivity.length}{" "}
            {recentActivity.length === 1 ? "update" : "updates"}
          </span>
        </div>
        {recentActivity.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentActivity.map((task, idx) => {
              const statusKey = (task.status || "").toLowerCase().replace(/\s+/g, "_");
              const statusInfo = statusMeta[statusKey] || statusMeta.todo;
              const assignees = findAssignees(task);
              const assigneeNames = assignees
                .map((a) => renderAssignee(a).name)
                .filter(Boolean)
                .join(", ");
              return (
                <div key={task.id || idx} className="flex items-start gap-3 py-3">
                  <span className={`mt-2 w-2.5 h-2.5 rounded-full ${statusInfo.dot}`} />
                  <div className="flex-1 space-y-1">
                    <p className="font-semibold text-gray-800">
                      {task.title || "Untitled task"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {assigneeNames || t("member") || "Member"}{" "}
                      <span className="mx-1">·</span>
                      {new Date(
                        task.updatedAt || task.createdAt || Date.now()
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            {t("noActivityYet") || "No activity yet. Start by creating a task."}
          </div>
        )}
      </div>

      {/* Technologies Section */}
      {groupSkills && groupSkills.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
            {t("technologies") || "Technologies"}
          </h3>
          <div className="flex flex-wrap gap-2">
            {groupSkills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border bg-blue-100 text-blue-700 border-blue-300"
              >
                {capitalizeFirst(skill)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
