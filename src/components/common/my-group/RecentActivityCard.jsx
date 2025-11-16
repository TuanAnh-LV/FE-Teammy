import React from "react";
import { Activity } from "lucide-react";
import { useTranslation } from "../../../hook/useTranslation";

const getStatusColor = (status) => {
  switch (status) {
    case "info":
      return "bg-blue-500";
    case "success":
      return "bg-green-500";
    case "warning":
      return "bg-orange-500";
    default:
      return "bg-gray-300";
  }
};

export default function RecentActivityCard({ items = [] }) {
  const { t } = useTranslation();

  const data =
    items.length > 0
      ? items
      : [
          {
            id: 1,
            title: t("activityTaskAssigned") || "New task assigned: Implement user registration",
            author: "Sarah Chen",
            timeAgo: t("activityTime2Hours") || "2 hours ago",
            status: "info",
          },
          {
            id: 2,
            title: t("activityMockupsUploaded") || "UI mockups uploaded",
            author: "Mike Rodriguez",
            timeAgo: t("activityTime1Day") || "1 day ago",
            status: "warning",
          },
          {
            id: 3,
            title: t("activityMemberJoined") || "Emma joined the team",
            author: "Emma Johnson",
            timeAgo: t("activityTime3Days") || "3 days ago",
            status: "success",
          },
          {
            id: 4,
            title: t("activityTaskCompleted") || "Completed: Database schema design",
            author: "Sarah Chen",
            timeAgo: t("activityTime4Days") || "4 days ago",
            status: "info",
          },
          {
            id: 5,
            title: t("activityMeetingScheduled") || "Team meeting scheduled for next week",
            author: "Sarah Chen",
            timeAgo: t("activityTime5Days") || "5 days ago",
            status: "success",
          },
        ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md">
      <div className="flex items-center gap-2 text-gray-900">
        <Activity className="h-5 w-5 text-[#4b6bfb]" />
        <h3 className="text-lg font-semibold">
          {t("recentActivity") || "Recent Activity"}
        </h3>
      </div>

      <div className="mt-5 space-y-4">
        {data.map((item) => (
          <div key={item.id} className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${getStatusColor(
                  item.status
                )}`}
              />
              <p className="text-sm font-semibold text-gray-800">
                {item.title}
              </p>
            </div>
            <div className="pl-4 text-xs text-gray-500">
              <span className="font-medium text-gray-700">{item.author}</span>
              <span className="mx-2 text-gray-300">•</span>
              <span>{item.timeAgo}</span>
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
