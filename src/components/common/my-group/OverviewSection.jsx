import React from "react";
import { Activity } from "lucide-react";

export default function OverviewSection({
  descriptionText,
  recentActivity,
  statusMeta,
  findAssignees,
  renderAssignee,
  t,
}) {
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
    </div>
  );
}
