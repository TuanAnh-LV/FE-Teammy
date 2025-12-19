import React, { useState, useEffect } from "react";
import { Card, Progress, Button, Spin } from "antd";
import { BookOpen, Target, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GroupService } from "../../services/group.service";
import { ReportService } from "../../services/report.service";
import { useTranslation } from "../../hook/useTranslation";

export default function MyGroups() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyGroups();
  }, []);

  const fetchMyGroups = async () => {
    try {
      setLoading(true);
      const res = await GroupService.getMyGroups();
      const list = Array.isArray(res?.data) ? res.data : [];

      const withProgress = await Promise.all(
        list.map(async (g) => {
          try {
            const reportRes = await ReportService.getProjectReport(g.id);
            const progress = reportRes?.data?.project?.completionPercent ?? 0;
            return { ...g, calculatedProgress: progress };
          } catch {
            return { ...g, calculatedProgress: 0 };
          }
        })
      );

      setGroups(withProgress);
    } finally {
      setLoading(false);
    }
  };

  const normalize = (g) => {
    const semesterEnd = g.semester?.endDate
      ? new Date(g.semester.endDate).toLocaleDateString("vi-VN")
      : "N/A";

    const allMembers = [g.leader, ...(g.members || [])].filter(Boolean);

    const getInitials = (name) => {
      if (!name) return "?";
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };

    return {
      id: g.id,
      name: g.name || t("unnamedGroup") || "Nhóm không tên",
      topic: g.topic?.title || t("noTopic") || "Chưa có topic",
      topicDescription:
        g.topic?.description ||
        g.description ||
        t("noDescription") ||
        "Chưa có mô tả.",
      description: g.description || t("noDescription") || "Chưa có mô tả.",
      members: g.currentMembers || 0,
      maxMembers: g.maxMembers || 5,
      progress: g.calculatedProgress || 0,
      status:
        g.calculatedProgress >= 60
          ? t("onTrack") || "Đúng tiến độ"
          : t("needAttention") || "Cần theo dõi",
      memberAvatars: allMembers.slice(0, 4).map((m) => ({
        name: m.displayName || "User",
        avatarUrl: m.avatarUrl,
        initials: getInitials(m.displayName),
      })),
      deadline: semesterEnd,
      semester: g.semester,
      major: g.major?.majorName || "N/A",
      skills: g.skills || [],
    };
  };

  const normalized = groups.map(normalize);
  const filtered = normalized;

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-8xl mx-auto">
        <h1 className="text-4xl font-extrabold text-black">
          {t("myGroups") || "My Groups"}
        </h1>
        <p className="text-gray-600 mt-1">
          {t("manageAndTrackGroups") ||
            "Quản lý và theo dõi các nhóm dự án bạn đang hướng dẫn"}
        </p>
      </div>

      {/* ---------------------------------- */}
      {/* GROUP LIST */}
      {/* ---------------------------------- */}
      <div className="w-full mt-8 ">
        {loading ? (
          <div className="flex justify-center py-20">
            <Spin size="large" />
          </div>
        ) : (
          filtered.map((g) => (
            <Card
              key={g.id}
              className="!rounded-2xl !shadow-sm !border !border-gray-200 hover:!shadow-md !transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between gap-6">
                {/* LEFT BLOCK */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900">
                        {g.name}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">{g.topic}</p>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed">
                    {g.topicDescription}
                  </p>

                  <div>
                    <p className="text-xs text-gray-500 mb-2">
                      {t("progress")}
                    </p>
                    <Progress
                      percent={g.progress}
                      strokeColor="#3b82f6"
                      trailColor="#e5e7eb"
                      className="!mb-1"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    {g.memberAvatars.map((member, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-medium overflow-hidden"
                        title={member.name}
                      >
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{member.initials}</span>
                        )}
                      </div>
                    ))}

                    <span className="text-gray-600 text-sm ml-1">
                      {g.members} {t("members") || "thành viên"}
                    </span>
                  </div>
                </div>

                {/* RIGHT BLOCK */}
                <div className="md:w-80 space-y-4 flex flex-col">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span>
                        {t("major") || "Chuyên ngành"}: {g.major}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span>
                        {t("deadline") || "Deadline"}: {g.deadline}
                      </span>
                    </div>
                    {g.semester && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>
                          {t("semester") || "Học kỳ"}: {g.semester.season}{" "}
                          {g.semester.year}
                        </span>
                      </div>
                    )}
                  </div>

                  {g.skills && g.skills.length > 0 && (
                    <div className="p-4 bg-gray-50 rounded-xl flex-1">
                      <p className="text-xs text-gray-500 mb-2">
                        {t("skills") || "Kỹ năng:"}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {g.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Button
                      type="primary"
                      className="!rounded-lg !px-3 !py-4 !flex-1 !h-10 !font-medium !bg-[#4264d7]"
                      onClick={() => navigate(`/mentor/my-groups/${g.id}`)}
                      icon={<span className="mr-1">👁</span>}
                    >
                      {t("viewDetails") || "Xem chi tiết"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
