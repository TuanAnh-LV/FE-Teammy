import React, { useEffect, useMemo, useState } from "react";
import { BarChart3, TrendingUp, CheckCircle2, Clock, AlertTriangle, Target } from "lucide-react";
import dayjs from "dayjs";
import { ReportService } from "../../../services/report.service";
import { useTranslation } from "../../../hook/useTranslation";

export default function ReportsTab({ groupId }) {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = async () => {
    if (!groupId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await ReportService.getProjectReport(groupId);
      setData(res?.data ?? res);
    } catch (err) {
      console.error(err);
      setError(t("failedLoadReport") || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [groupId]);

  const project = data?.project || {};
  const backlog = data?.tasks?.backlog || {};
  const columns = data?.tasks?.columns || [];
  const milestones = data?.tasks?.milestones || [];
  const team = data?.team || {};

  const metricCards = useMemo(
    () => [
      {
        icon: <Target className="w-5 h-5 text-blue-600" />,
        label: t("completion") || "Completion",
        value: `${project.completionPercent ?? 0}%`,
      },
      {
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
        label: t("tasksCompleted") || "Tasks Completed",
        value: backlog.completed ?? 0,
      },
      {
        icon: <TrendingUp className="w-5 h-5 text-orange-500" />,
        label: t("dueSoon") || "Due soon",
        value: backlog.dueSoon ?? 0,
      },
      {
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
        label: t("overdue") || "Overdue",
        value: backlog.overdue ?? 0,
      },
      {
        icon: <Clock className="w-5 h-5 text-gray-600" />,
        label: t("pending") || "Remaining",
        value: backlog.remaining ?? 0,
      },
    ],
    [project.completionPercent, backlog, t]
  );

  if (loading) {
    return (
      <div className="mt-4 p-6 bg-gray-50 rounded-lg text-center text-gray-500">
        {t("loading") || "Loading..."}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-6 bg-red-50 text-red-600 rounded-lg text-center">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mt-4 p-6 bg-gray-50 rounded-lg text-center px-2 sm:px-0">
        <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">
          {t("reportsPlaceholder") || "Reports view coming soon"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-2 sm:px-0">
      <div>
        <h3 className="text-xl font-semibold text-gray-900">
          {t("reportsTitle") || "Progress Reports & Analytics"}
        </h3>
        <p className="text-sm text-gray-500">
          {t("reportsSubtitle") || "Track your team's performance and project metrics."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {metricCards.map((card, idx) => (
          <div
            key={idx}
            className="p-4 border border-gray-200 rounded-xl bg-white flex items-center gap-3 shadow-sm"
          >
            <div className="p-2 bg-gray-50 rounded-full">{card.icon}</div>
            <div>
              <div className="text-xs text-gray-500">{card.label}</div>
              <div className="text-lg font-semibold text-gray-900">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">{t("backlogSummary") || "Backlog Summary"}</h4>
            <span className="text-sm text-gray-500">
              {t("total") || "Total"}: {backlog.total ?? 0}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <InfoRow label={t("ready") || "Ready"} value={backlog.ready} />
            <InfoRow label={t("inProgress") || "In Progress"} value={backlog.inProgress} />
            <InfoRow label={t("blocked") || "Blocked"} value={backlog.blocked} />
            <InfoRow label={t("completed") || "Completed"} value={backlog.completed} />
            <InfoRow label={t("archived") || "Archived"} value={backlog.archived} />
            <InfoRow label={t("notStarted") || "Not started"} value={backlog.notStarted} />
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">
              {t("boardColumns") || "Board columns"}
            </h4>
          </div>
          <div className="space-y-2">
            {columns.map((col) => (
              <div key={col.columnId} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">
                  {col.columnName} {col.isDone ? `(${t("done") || "done"})` : ""}
                </span>
                <span className="font-semibold text-gray-900">{col.taskCount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-gray-900">
              {t("milestones") || "Milestones"}
            </h4>
            <span className="text-sm text-gray-500">
              {project.milestoneCount || 0} {t("items") || "items"}
            </span>
          </div>
          <div className="space-y-3">
            {milestones.map((m) => (
              <div key={m.milestoneId} className="p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{m.name || "Milestone"}</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {m.status || "planned"}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {t("targetDate") || "Target"}: {formatDate(m.targetDate)}
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  {t("completion") || "Completion"}: {m.completionPercent ?? 0}%
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
          <h4 className="font-semibold text-gray-900 mb-2">
            {t("teamInfo") || "Team"}
          </h4>
          <div className="text-sm text-gray-700">
            {t("activeMembers") || "Active members"}: {team.activeMemberCount ?? 0}
          </div>
          <div className="mt-2 space-y-1 text-sm text-gray-700">
            <div className="font-semibold text-gray-900">{t("leader") || "Leader"}</div>
            {(team.leaders || []).map((u) => (
              <div key={u.userId} className="text-gray-700">
                {u.displayName}
              </div>
            ))}
            <div className="font-semibold text-gray-900 mt-2">{t("mentor") || "Mentor"}</div>
            {team.mentor ? (
              <div className="text-gray-700">{team.mentor.displayName}</div>
            ) : (
              <div className="text-gray-500">{t("noMentor") || "No mentor"}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-gray-600">{label}</span>
    <span className="font-semibold text-gray-900">{value ?? 0}</span>
  </div>
);

const formatDate = (value) => {
  if (!value) return "--";
  const d = dayjs(value);
  return d.isValid() ? d.format("DD/MM/YYYY") : "--";
};
