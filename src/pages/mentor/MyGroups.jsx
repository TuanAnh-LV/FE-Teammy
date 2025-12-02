import React, { useState, useEffect } from "react";
import {
  Card,
  Progress,
  Tag,
  Button,
  Spin,
} from "antd";
import {
  MessageOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Search, BookOpen, Target, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GroupService } from "../../services/group.service";
import { ReportService } from "../../services/report.service";
import { useTranslation } from "../../hook/useTranslation";

export default function MyGroups() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

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
    
    const allMembers = [
      g.leader,
      ...(g.members || [])
    ].filter(Boolean);
    
    const getInitials = (name) => {
      if (!name) return "?";
      return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    };

    return {
      id: g.id,
      name: g.name || "Nhóm không tên",
      topic: g.topic?.title || "Chưa có topic",
      topicDescription: g.topic?.description || g.description || "Chưa có mô tả.",
      description: g.description || "Chưa có mô tả.",
      members: g.currentMembers || 0,
      maxMembers: g.maxMembers || 5,
      progress: g.calculatedProgress || 0,
      status: g.calculatedProgress >= 60 ? "Đúng tiến độ" : "Cần theo dõi",
      memberAvatars: allMembers.slice(0, 4).map(m => ({
        name: m.displayName || "User",
        avatarUrl: m.avatarUrl,
        initials: getInitials(m.displayName)
      })),
      deadline: semesterEnd,
      semester: g.semester,
      major: g.major?.majorName || "N/A",
      skills: g.skills || [],
    };
  };

  const normalized = groups.map(normalize);

  const stats = {
    total: normalized.length,
    ontrack: normalized.filter((g) => g.status === "Đúng tiến độ").length,
    need: normalized.filter((g) => g.status !== "Đúng tiến độ").length,
    avg:
      normalized.length > 0
        ? Math.round(
            normalized.reduce((s, g) => s + g.progress, 0) / normalized.length
          )
        : 0,
  };

  const filtered = normalized.filter((g) => {
    const match = g.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === "ontrack") return match && g.status === "Đúng tiến độ";
    if (filter === "need") return match && g.status !== "Đúng tiến độ";
    return match;
  });

  return (
    <div className="bg-[#f9fafb] min-h-screen pb-20">

      {/* ---------------------------------- */}
      {/* HEADER + SEARCH + STATS + FILTERS */}
      {/* ---------------------------------- */}
      <div className="max-w-8xl mx-auto px-8 pt-7">

        <h1 className="text-4xl font-extrabold text-blue-600">
          My Groups
        </h1>
        <p className="text-gray-600 mt-1">
          Quản lý và theo dõi các nhóm dự án bạn đang hướng dẫn
        </p>

        {/* SEARCH */}
        <div className="relative mt-8 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nhóm..."
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F9FAFB] border border-gray-300 rounded-md px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-10">
          {/* TOTAL */}
          <div className="rounded-xl border border-gray-300 bg-white shadow-sm p-6">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-500 mt-2">{t("totalGroupsLabel")}</p>
          </div>

          {/* ON TRACK */}
          <div className="rounded-xl border border-gray-300 bg-white shadow-sm p-6">
            <p className="text-2xl font-bold text-green-600">{stats.ontrack}</p>
            <p className="text-sm text-gray-500 mt-2">{t("onTrack")}</p>
          </div>

          {/* NEED ATTENTION */}
          <div className="rounded-xl border border-gray-300 bg-white shadow-sm p-6">
            <p className="text-2xl font-bold text-orange-500">{stats.need}</p>
            <p className="text-sm text-gray-500 mt-2">Cần theo dõi</p>
          </div>

          {/* AVG PROGRESS */}
          <div className="rounded-xl border border-gray-300 bg-white shadow-sm p-6">
            <p className="text-2xl font-bold text-blue-600">{stats.avg}%</p>
            <p className="text-sm text-gray-500 mt-2">{t("averageProgress")}</p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="inline-flex gap-2 mt-10 p-1 bg-[#f3f5f6] rounded-sm">

          <button
            onClick={() => setFilter("all")}
            className={`
              px-4 py-2 text-sm font-medium transition rounded-md
              ${
                filter === "all"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }
            `}
          >
            Tất cả ({stats.total})
          </button>

          <button
            onClick={() => setFilter("ontrack")}
            className={`
              px-4 py-2 text-sm font-medium transition rounded-md
              ${
                filter === "ontrack"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }
            `}
          >
            Đúng tiến độ ({stats.ontrack})
          </button>

          <button
            onClick={() => setFilter("need")}
            className={`
              px-4 py-2 text-sm font-medium transition rounded-md
              ${
                filter === "need"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }
            `}
          >
            Cần theo dõi ({stats.need})
          </button>

        </div>

      </div>

      {/* ---------------------------------- */}
      {/* GROUP LIST */}
      {/* ---------------------------------- */}
      <div className="w-full px-8 mt-8 space-y-8">

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
                    <Tag
                      color={g.status === "Đúng tiến độ" ? "green" : "orange"}
                      className="!rounded-full !px-3 !py-1 !ml-4"
                    >
                      {g.status}
                    </Tag>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed">{g.topicDescription}</p>

                  <div>
                    <p className="text-xs text-gray-500 mb-2">{t("progress")}</p>
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
                      {g.members} thành viên
                    </span>
                  </div>
                </div>

                {/* RIGHT BLOCK */}
                <div className="md:w-80 space-y-4 flex flex-col">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span>Chuyên ngành: {g.major}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span>Deadline: {g.deadline}</span>
                    </div>
                    {g.semester && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Học kỳ: {g.semester.season} {g.semester.year}</span>
                      </div>
                    )}
                  </div>

                  {g.skills && g.skills.length > 0 && (
                    <div className="p-4 bg-gray-50 rounded-xl flex-1">
                      <p className="text-xs text-gray-500 mb-2">Kỹ năng:</p>
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
                      Xem chi tiết
                    </Button>

                    <Button
                      className="!rounded-lg !border !h-10 !w-10 !flex !items-center !justify-center !p-0"
                      icon={<MessageOutlined />}
                    />
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
