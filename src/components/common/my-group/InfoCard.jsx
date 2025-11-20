import React from "react";
import { ArrowLeft, Calendar, Users, ClipboardList, Target } from "lucide-react";
import { useTranslation } from "../../../hook/useTranslation";

const formatText = (value) => {
  if (!value) return "";
  return value;
};

export default function InfoCard({
  group,
  memberCount = 0,
  onBack,
  onEdit,
  onSelectTopic,
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

  return (
    <div className="relative left-1/2 right-1/2 w-screen -translate-x-1/2 border border-gray-200 bg-white shadow-sm">
      <div className="mx-auto w-full max-w-[79rem] px-6 py-4">
        <div className="flex items-center justify-between pt-10">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("back") || "Back"}
            </button>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                {t("editGroup") || "Edit group"}
              </button>
            )}
            {onSelectTopic && (
              <button
                type="button"
                onClick={onSelectTopic}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-green-100"
              >
                {hasTopicAssigned
                  ? (t("changeTopic") || "Change Topic")
                  : (t("selectTopic") || "Select Topic")}
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-3xl font-black bg-gradient-to-r from-[#3182ed] to-[#0595c7] text-transparent bg-clip-text">{group.title}</h3>
            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-0.5 text-xs font-semibold uppercase tracking-wide text-green-700">
              {statusLabel}
            </span>
          </div>
          <p className="text-[16px] text-[#627084]">
            {group.topicName || group.field || t("selectMajor") || "Topic pending"}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-6 text-sm text-[#627084]">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-[#627084]">
              {memberCount}/{group.maxMembers}
            </span>
            <span>{t("members") || "members"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gray-400" />
            <span className="">
              {group.field || t("selectMajor") || "Major"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-gray-400" />
            <span className="">
              {group.semester || group.semesterLabel || "-"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="">
              {t("due") || "Due"}: {group.end || "--"}
            </span>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-semibold uppercase text-gray-500">
            <p>{t("progress") || "Progress"}</p>
            <span className="text-gray-900">{progressValue}%</span>
          </div>
          <div className="mt-2 h-2 w-full bg-gray-100">
            <div
              className="h-full bg-blue-500"
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
