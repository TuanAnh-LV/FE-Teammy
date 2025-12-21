import React from "react";
import {
  Calendar,
  Users,
  ClipboardList,
  Target,
  Edit2,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
} from "lucide-react";
import { useTranslation } from "../../../hook/useTranslation";

const formatText = (value) => {
  if (!value) return "";
  return value;
};

const formatDate = (dateString) => {
  if (!dateString) return "--";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

export default function InfoCard({
  group,
  memberCount = 0,
  onBack,
  onEdit,
  onSelectTopic,
  onActivate,
}) {
  const hasTopicAssigned = group?.topicId && group?.topicId.trim() !== "";
  const { t } = useTranslation();
  const statusLabel =
    formatText(group.statusText) ||
    formatText(group.status) ||
    (t("status") || "Status");
  const progressValue = Math.min(
    100,
    Math.max(0, Number(group.progress) || 0)
  );

  const getStatusColor = (status) => {
    const statusLower = (status || "").toLowerCase();
    if (statusLower.includes("recruiting")) {
      return "bg-blue-500 text-white";
    }
    if (statusLower.includes("active") || statusLower.includes("confirmed")) {
      return "bg-emerald-500 text-white";
    }
    if (statusLower.includes("pending")) {
      return "bg-amber-500 text-white";
    }
    return "bg-gray-500 text-white";
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      {/* Header with Title, Status, and Action Buttons */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
              {group.title}
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide flex-shrink-0 ${getStatusColor(
                statusLabel
              )}`}
            >
              {statusLabel}
            </span>
          </div>
          <p className="text-base text-gray-600">
            {group.topicName || group.field || t("selectMajor") || "Topic pending"}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors"
            >
              <Edit2 className="w-4 h-4 text-gray-600" />
              <span className="hidden sm:inline">
                {t("editGroup") || "Edit group"}
              </span>
              <span className="sm:hidden">{t("edit") || "Edit"}</span>
            </button>
          )}
          {onSelectTopic && (
            <button
              type="button"
              onClick={onSelectTopic}
              disabled={hasTopicAssigned}
              className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                hasTopicAssigned
                  ? "text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
                  : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              }`}
            >
              <BookOpen className={`w-4 h-4 ${hasTopicAssigned ? "text-gray-400" : "text-gray-600"}`} />
              <span className="hidden sm:inline">
                {t("selectTopic") || "Select Topic"}
              </span>
              <span className="sm:hidden">
                {t("topic") || "Topic"}
              </span>
            </button>
          )}
          {onActivate && (
            <button
              type="button"
              onClick={onActivate}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4 text-gray-600" />
              <span className="hidden sm:inline">
                {t("confirmGroup") || "Confirm group"}
              </span>
              <span className="sm:hidden">{t("confirm") || "Confirm"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Group Info - Single Row with Icons */}
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-5 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span>
            {memberCount}/{group.maxMembers} {t("members") || "members"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span>{group.field || t("selectMajor") || "Major"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span>{group.semester || group.semesterLabel || "-"}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <span>
            {t("due") || "Due"}:{" "}
            <span className="font-semibold text-gray-900">
              {formatDate(group.end)}
            </span>
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-xs font-semibold uppercase text-gray-500 mb-2">
          <p>{t("progress") || "Progress"}</p>
          <span className="text-gray-900">{progressValue}%</span>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gray-400 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressValue}%` }}
          />
        </div>
      </div>
    </div>
  );
}
