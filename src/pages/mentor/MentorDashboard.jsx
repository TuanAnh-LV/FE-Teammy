import React, { useState, useEffect } from "react";
import { Card, Button, Progress } from "antd";
import { useNavigate } from "react-router-dom";
import {
  Users,
  TrendingUp,
  MessageSquare,
  FileText,
  Loader2,
} from "lucide-react";
import { GroupService } from "../../services/group.service";
import { ReportService } from "../../services/report.service";
import { BoardService } from "../../services/board.service";
import { useTranslation } from "../../hook/useTranslation";

export default function MentorDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mentoringGroups, setMentoringGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalGroups: 0,
    avgProgress: 0,
    feedbackCount: 0,
  });

  useEffect(() => {
    fetchMyGroups();
  }, []);

  const fetchMyGroups = async () => {
    try {
      setLoading(true);

      const res = await GroupService.getMyGroups();
      const groups = Array.isArray(res?.data) ? res.data : [];

      let totalFeedbackCount = 0;

      const extractFeedbackCount = (payload) => {
        if (!payload) return 0;
        const totalFromPayload =
          payload?.totalItems ||
          payload?.total ||
          payload?.totalCount ||
          payload?.page?.totalElements ||
          payload?.meta?.total ||
          0;
        if (Number(totalFromPayload)) return Number(totalFromPayload);
        if (Array.isArray(payload?.data)) return payload.data.length;
        if (Array.isArray(payload?.items)) return payload.items.length;
        if (Array.isArray(payload)) return payload.length;
        return 0;
      };

      // Fetch progress, board data and feedback for each group
      const groupsWithProgress = await Promise.all(
        groups.map(async (g) => {
          try {
            const [reportRes, boardRes, feedbackRes] = await Promise.all([
              ReportService.getProjectReport(g.id),
              BoardService.getBoard(g.id),
              GroupService.getFeedbackList(g.id, { page: 1, pageSize: 1 }),
            ]);

            const progress = reportRes?.data?.project?.completionPercent ?? 0;
            const boardData = boardRes?.data;

            // Get all tasks from board
            const tasks =
              boardData?.columns
                ?.flatMap((col) => col.tasks || [])
                ?.filter(Boolean) || [];

            if (tasks.length > 0) {
            }

            // Recent activity logic (like MyGroup.jsx)
            const recentActivity = tasks
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.updatedAt || b.createdAt || 0) -
                  new Date(a.updatedAt || a.createdAt || 0)
              )
              .slice(0, 1)[0]; // Get most recent task

            const feedbackPayload = feedbackRes?.data ?? feedbackRes;
            const feedbackCount = extractFeedbackCount(feedbackPayload);
            totalFeedbackCount += feedbackCount;

            return {
              id: g.id,
              name: g.name || "Nhóm không tên",
              topic: g.topic?.title || "Chưa có topic",
              members: g.currentMembers || 0,
              progress: progress,
              lastUpdate: recentActivity?.updatedAt
                ? new Date(recentActivity.updatedAt).toLocaleDateString("vi-VN")
                : g.updatedAt
                ? new Date(g.updatedAt).toLocaleDateString("vi-VN")
                : "N/A",
              recentActivity: recentActivity?.title || "Chưa có hoạt động",
            };
          } catch {
            return {
              id: g.id,
              name: g.name || "Nhóm không tên",
              topic: g.topic?.title || "Chưa có topic",
              members: g.currentMembers || 0,
              progress: 0,
              lastUpdate: g.updatedAt
                ? new Date(g.updatedAt).toLocaleDateString("vi-VN")
                : "N/A",
              recentActivity: "Chưa có hoạt động",
            };
          }
        })
      );

      setMentoringGroups(groupsWithProgress);

      // Calculate stats
      const totalGroups = groupsWithProgress.length;
      const avgProgress =
        totalGroups > 0
          ? Math.round(
              groupsWithProgress.reduce((sum, g) => sum + g.progress, 0) /
                totalGroups
            )
          : 0;

      setStats({
        totalGroups,
        avgProgress,
        feedbackCount: totalFeedbackCount,
      });
    } catch {
      // Handle error if needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 space-x-8 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row">
        <div>
          <h1 className="t-2xl sm:text-3xl lg:text-4xl font-extrabold">
            {t("mentorDashboard")}
          </h1>
          <p className="text-gray-600 mt-1">{t("manageMentorships")}</p>
        </div>
      </div>

      {/* STATISTICS */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("totalGroupsLabel")}</p>
              <h2 className="text-2xl font-semibold">{stats.totalGroups}</h2>
            </div>
          </div>
        </Card>

        <Card bordered={false} className="rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("averageProgress")}</p>
              <h2 className="text-2xl font-semibold">{stats.avgProgress}%</h2>
            </div>
          </div>
        </Card>

        <Card bordered={false} className="rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-xl">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{t("feedbackSent")}</p>
              <h2 className="text-2xl font-semibold">{stats.feedbackCount}</h2>
            </div>
          </div>
        </Card>
      </div>

      {/* CONTENT AREA */}
      <div className="grid grid-cols-1 gap-6">
        {/* GROUP LIST */}
        <div>
          <Card
            title={
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-gray-800 text-lg">
                  {t("groupsBeingMentored")}
                </span>
              </div>
            }
            extra={
              <Button
                onClick={() => navigate("/mentor/my-groups")}
                className="
               !px-4 !py-1.5 !rounded-md !font-medium !text-gray-700 !bg-transparent !border-none hover:!bg-orange-500 hover:!text-white transition-all duration-200 !flex !items-center !gap-2 "
              >
                {t("viewAll")}
                <span className="text-lg leading-none">→</span>
              </Button>
            }
            className="rounded-2xl shadow-sm border-0"
          >
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : mentoringGroups.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>{t("noGroupsBeingMentored")}</p>
              </div>
            ) : (
              mentoringGroups.map((group) => (
                <div key={group.id} className="mb-5">
                  <Card className="border border-gray-200 rounded-xl shadow-sm">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-base">
                          {group.name}
                        </h3>
                        <p className="text-sm text-gray-500">{group.topic}</p>
                      </div>
                    </div>

                      {/* Progress */}
                      <div>
                        <div className="flex justify-between text-sm mb-1 text-gray-600">
                          <span>{t("progress")}</span>
                          <span className="font-semibold">
                            {group.progress}%
                          </span>
                        </div>

                        <Progress
                          percent={group.progress}
                          strokeColor={
                            group.progress >= 90
                              ? "#10b981"
                              : group.progress >= 50
                              ? "#3b82f6"
                              : "#f59e0b"
                          }
                          showInfo={false}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex gap-4 text-xs text-gray-500 my-3">
                        <div className="flex gap-1 items-center">
                          <Users className="w-3.5 h-3.5" />
                          {group.members} {t("students")}
                        </div>
                        <div className="flex gap-1 items-center">
                          <FileText className="w-3.5 h-3.5" />
                          {group.lastUpdate}
                        </div>
                      </div>

                      {/* Recent activity */}
                      <div className="pt-3 mt-2 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">
                          {t("recentUpdate")}:
                        </p>
                        <p className="text-sm text-gray-700">
                          {group.recentActivity}
                        </p>
                      </div>
                  </Card>
                </div>
              ))
            )}
          </Card>
        </div>

      </div>
    </div>
  );
}

