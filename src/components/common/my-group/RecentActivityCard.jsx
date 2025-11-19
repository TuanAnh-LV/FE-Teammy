import React from "react";
import { Activity } from "lucide-react";
import { useTranslation } from "../../../hook/useTranslation";

const getStatusColor = (status) => {
  const normalized = String(status || "").toLowerCase();
  switch (normalized) {
    case "todo":
      return "bg-gray-400";
    case "in_progress":
    case "in progress":
      return "bg-blue-500";
    case "review":
      return "bg-orange-500";
    case "done":
    case "completed":
      return "bg-green-500";
    default:
      return "bg-gray-300";
  }
};

export default function RecentActivityCard({ items = [] }) {
  const { t } = useTranslation();

  // If no items provided, show a small set of mock activities
  const fallback = [
    {
      id: 1,
      title: t("activityTaskAssigned") || "New task assigned: Implement user registration",
      description: t("activityTaskAssignedDesc") || "Implement the registration API and UI.",
      assignees: [{ displayName: "Sarah Chen" }],
      status: "in_progress",
    },
    {
      id: 2,
      title: t("activityMockupsUploaded") || "UI mockups uploaded",
      description: t("activityMockupsDesc") || "Figma mockups uploaded to the design folder.",
      assignees: [{ displayName: "Mike Rodriguez" }],
      status: "todo",
    },
  ];

  const data = items.length > 0 ? items : fallback;

  const renderAssignees = (assignees = []) => {
    if (!Array.isArray(assignees) || assignees.length === 0) return <span className="text-xs text-gray-400">No assignees</span>;
    const show = assignees.slice(0, 4);
    return (
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {show.map((a, i) => (
            <img
              key={i}
              src={a.avatarUrl || a.avatar || a.photoURL || ""}
              alt={a.displayName || a.name || "assignee"}
              title={a.displayName || a.name}
              className="h-6 w-6 rounded-full border border-white object-cover"
            />
          ))}
        </div>
        <div className="text-xs text-gray-600">
          {show.map((a) => a.displayName || a.name).join(", ")}
          {assignees.length > show.length && ` +${assignees.length - show.length}`}
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      <div className="flex items-center gap-2 text-gray-900">
        <Activity className="h-5 w-5 text-[#4b6bfb]" />
        <h3 className="text-lg font-semibold">{t("recentActivity") || "Recent Activity"}</h3>
      </div>

      <div className="mt-5 space-y-4">
        {data.map((item) => (
          <div key={item.id || item.taskId || Math.random()} className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className={`mt-1 h-2.5 w-2.5 rounded-full ${getStatusColor(item.status)}`} />
                <div>
                  <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                  {item.description && (
                    <p className="mt-1 text-xs text-gray-500">{item.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                  {String(item.status || "").replace(/_/g, " ")}
                </span>
              </div>
            </div>

            <div className="pl-7">
              {renderAssignees(item.assignees)}
            </div>

            <div className="pl-4">
              <div className="h-px w-full bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
