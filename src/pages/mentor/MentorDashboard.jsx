import React from "react";
import {
  Card,
  Button,
  Progress,
  Tag,
} from "antd";
import {
  Users,
  TrendingUp,
  Clock,
  MessageSquare,
  FileText,
  Eye,
  Send,
  Target,
  Bookmark,
  Award,
} from "lucide-react";
import { useTranslation } from "../../hook/useTranslation";


export default function MentorDashboard() {
  const { t } = useTranslation();
  
  const mentoringGroups = [
    {
      id: 1,
      name: "EcoTracker Mobile App",
      topic: "Sustainability & Mobile Development",
      members: 4,
      progress: 65,
      status: "on_track",
      lastUpdate: "26/11/2024",
      recentActivity: "Completed user authentication module",
    },
    {
      id: 2,
      name: "AI Study Assistant",
      topic: "Educational Technology",
      members: 5,
      progress: 58,
      status: "need_attention",
      lastUpdate: "25/11/2024",
      recentActivity: "Delayed on dataset preparation",
    },
    {
      id: 3,
      name: "Campus Navigation AR",
      topic: "Augmented Reality",
      members: 4,
      progress: 72,
      status: "on_track",
      lastUpdate: "27/11/2024",
      recentActivity: "Successfully tested AR markers",
    },
  ];

  return (
    <div className="space-y-8 bg-gray-50 min-h-screen">
      {/* HEADER + OVERVIEW */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent">
            Mentor Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your mentorships, monitor progress, and support your student
            teams.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button icon={<Send className="w-4 h-4" />}>
            <span className="hidden sm:inline">
              {t("sendAnnouncement") || "Send Announcement"}
            </span>
          </Button>
          <Button type="primary" icon={<FileText className="w-4 h-4" />}>
            <span className="hidden sm:inline">Export Report</span>
          </Button>
        </div>
      </div>

      {/* STATISTICS OVERVIEW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          bordered={false}
          className="rounded-xl shadow hover:shadow-md transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Tổng số nhóm</p>
              <h2 className="text-2xl font-semibold text-gray-900">3</h2>
            </div>
          </div>
        </Card>
        <Card
          bordered={false}
          className="rounded-xl shadow hover:shadow-md transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Cần xem xét</p>
              <h2 className="text-2xl font-semibold text-gray-900">1</h2>
            </div>
          </div>
        </Card>
        <Card
          bordered={false}
          className="rounded-xl shadow hover:shadow-md transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Tiến độ trung bình</p>
              <h2 className="text-2xl font-semibold text-gray-900">65%</h2>
            </div>
          </div>
        </Card>
        <Card
          bordered={false}
          className="rounded-xl shadow hover:shadow-md transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Phản hồi đã gửi</p>
              <h2 className="text-2xl font-semibold text-gray-900">12</h2>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MENTORING GROUPS - 2/3 width */}
        <div className="lg:col-span-2">
          <Card
            title={
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-gray-800 text-lg">
                  Các nhóm đang hướng dẫn
                </span>
              </div>
            }
            extra={
              <Button type="link" className="text-blue-500">
                Xem tất cả →
              </Button>
            }
            className="rounded-2xl shadow-sm border-0"
            bodyStyle={{ padding: "24px" }}
          >
            <div className="space-y-4">
              {mentoringGroups.map((group) => (
                <Card
                  key={group.id}
                  className="border border-gray-200 rounded-xl hover:shadow-md transition-all"
                  bodyStyle={{ padding: "20px" }}
                >
                  <div className="flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-base">
                          {group.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{group.topic}</p>
                      </div>
                      <Tag
                        color={group.status === "on_track" ? "green" : "orange"}
                        className="text-xs"
                      >
                        {group.status === "on_track" ? "Đúng tiến độ" : "Cần theo dõi"}
                      </Tag>
                    </div>

                    {/* Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">Tiến độ</span>
                        <span className="text-sm font-semibold text-gray-700">
                          {group.progress}%
                        </span>
                      </div>
                      <Progress
                        percent={group.progress}
                        strokeColor={
                          group.progress >= 70
                            ? "#10b981"
                            : group.progress >= 50
                            ? "#3b82f6"
                            : "#f59e0b"
                        }
                        showInfo={false}
                        className="mb-2"
                      />
                    </div>

                    {/* Info Row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>{group.members} sinh viên</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{group.lastUpdate}</span>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">
                        Cập nhật gần nhất:
                      </p>
                      <p className="text-sm text-gray-700">{group.recentActivity}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        icon={<Eye className="w-4 h-4" />}
                        className="flex-1"
                        size="small"
                      >
                        Xem chi tiết
                      </Button>
                      <Button
                        icon={<MessageSquare className="w-4 h-4" />}
                        type="primary"
                        className="flex-1"
                        size="small"
                      >
                        Nhắn tin
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        {/* QUICK ACTIONS - 1/3 width */}
        <div className="lg:col-span-1">
          <Card
            title={
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-gray-800 text-lg">
                  Thao tác nhanh
                </span>
              </div>
            }
            className="rounded-2xl shadow-sm border-0"
            bodyStyle={{ padding: "20px" }}
          >
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left group">
                <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Tìm nhóm mới</p>
                  <p className="text-xs text-gray-500">Khám phá nhóm cần mentor</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left group">
                <div className="p-2 bg-green-50 rounded-lg group-hover:bg-green-100 transition-colors">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Tin nhắn</p>
                  <p className="text-xs text-gray-500">Nhắn tin với nhóm</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left group">
                <div className="p-2 bg-amber-50 rounded-lg group-hover:bg-amber-100 transition-colors">
                  <Bookmark className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">Đánh giá nhóm</p>
                  <p className="text-xs text-gray-500">Xem và đánh giá tiến độ</p>
                </div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
