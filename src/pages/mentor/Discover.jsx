import React, { useState, useEffect } from "react";
import {
  Search,
  Users,
  Calendar,
  Filter,
  UserPlus,
  Loader2,
  X,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Modal, notification } from "antd";
import { GroupService } from "../../services/group.service";
import { BoardService } from "../../services/board.service";
import { ReportService } from "../../services/report.service";
import { InvitationService } from "../../services/invitation.service";
import { useTranslation } from "../../hook/useTranslation";

const Discover = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [acceptModalVisible, setAcceptModalVisible] = useState(false);
  const [acceptedGroupName, setAcceptedGroupName] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [notificationApi, contextHolder] = notification.useNotification();

  useEffect(() => {
    fetchAvailableGroups();
    fetchPendingInvitations();
  }, []);

  const fetchAvailableGroups = async () => {
    try {
      setLoading(true);
      
      const myGroupsRes = await GroupService.getMyGroups();
      const myGroups = Array.isArray(myGroupsRes?.data) ? myGroupsRes.data : [];
      
      const withProgressAndActivities = await Promise.all(
        myGroups.map(async (g) => {
          try {
            const [reportRes, boardRes] = await Promise.all([
              ReportService.getProjectReport(g.id),
              BoardService.getBoard(g.id)
            ]);
            
            const progress = reportRes?.data?.project?.completionPercent ?? 0;
            const boardData = boardRes?.data;
            
            const activities = [];
            if (boardData && boardData.columns) {
              const allTasks = boardData.columns.flatMap(col => col.tasks || []);
              const sortedTasks = allTasks
                .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
                .slice(0, 3);
              
              sortedTasks.forEach(task => {
                activities.push({
                  type: 'task',
                  title: task.title || t("newTask") || "Task mới",
                  user: task.assignee?.displayName || t("member") || "Member",
                  time: task.createdAt,
                });
              });
            }
            
            return { ...g, calculatedProgress: progress, activities };
          } catch (err) {

            return { ...g, calculatedProgress: 0, activities: [] };
          }
        })
      );

      setGroups(withProgressAndActivities);
    } catch (error) {

      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingInvitations = async () => {
    try {
      const res = await InvitationService.list();
      const data = Array.isArray(res?.data) ? res.data : [];
      setInvitations(data);
    } catch (error) {

      setInvitations([]);
    }
  };

  const handleAcceptInvitation = async (invitation) => {
    try {
      await InvitationService.accept(invitation.invitationId || invitation.id);
      setAcceptedGroupName(invitation.groupName || "nhóm");
      setAcceptModalVisible(true);
      setInvitations((prev) => prev.filter((x) => x.id !== invitation.id));
      fetchAvailableGroups();
    } catch (error) {

      notificationApi.error({
        message: "Chấp nhận lời mời thất bại",
        description: "Vui lòng thử lại sau.",
      });
    }
  };

  const handleRejectInvitation = async (invitation) => {
    try {
      await InvitationService.decline(invitation.invitationId || invitation.id);
      setInvitations((prev) => prev.filter((x) => x.id !== invitation.id));
      notificationApi.info({
        message: "Đã từ chối lời mời",
      });
    } catch (error) {

      notificationApi.error({
        message: "Từ chối lời mời thất bại",
        description: "Vui lòng thử lại sau.",
      });
    }
  };

  const normalizeGroup = (g) => {
    const topicTitle = g.topic?.title || "Chưa có topic";
    const semesterEnd = g.semester?.endDate
      ? new Date(g.semester.endDate).toLocaleDateString("vi-VN")
      : "N/A";
    
    const skills = Array.isArray(g.skills) ? g.skills : [];
    const displaySkills = skills.slice(0, 3);
    if (skills.length > 3) {
      displaySkills.push(`+${skills.length - 3}`);
    }

    return {
      id: g.id,
      name: g.name || "Nhóm không tên",
      topic: topicTitle,
      description: g.description || "Chưa có mô tả.",
      members: g.currentMembers || 0,
      maxMembers: g.maxMembers || 5,
      progress: g.calculatedProgress || 0,
      deadline: semesterEnd,
      skills: displaySkills,
      expertiseNeeded: g.major?.majorName || "Chưa xác định",
      activities: g.activities || [],
      status: g.status || "active",
    };
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("justNow") || "vừa xong";
    if (diffMins < 60) return `${diffMins} ${t("minutesAgo") || "phút trước"}`;
    if (diffHours < 24) return `${diffHours} ${t("hoursAgo") || "giờ trước"}`;
    if (diffDays < 7) return `${diffDays} ${t("daysAgo") || "ngày trước"}`;
    return date.toLocaleDateString("vi-VN");
  };

  const normalizedGroups = groups.map(normalizeGroup);

  const filteredGroups = normalizedGroups.filter((g) =>
    g.name.toLowerCase().includes(searchText.toLowerCase()) ||
    g.topic.toLowerCase().includes(searchText.toLowerCase()) ||
    g.expertiseNeeded.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredInvitations = invitations.filter((inv) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return inv.status === "pending";
    if (activeTab === "accepted") return inv.status === "accepted";
    return true;
  });

  const pendingCount = invitations.filter(inv => inv.status === "pending").length;
  const acceptedCount = invitations.filter(inv => inv.status === "accepted").length;

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen px-4 sm:px-6 lg:px-8 py-6">
      {contextHolder}
      
      {/* Header Section */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent">
          {t("groupsBeingMentored")}
        </h1>
        <p className="text-gray-600">
          Quản lý và theo dõi các nhóm dự án bạn đang hướng dẫn. Hỗ trợ sinh viên thực hiện capstone project thành công.
        </p>
      </div>

      {/* Invitations Section */}
      {invitations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <UserPlus className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {t("mentoringInvitations")}
            </h2>
          </div>
          
          {/* Tabs */}
          <div className="flex items-center gap-2 mb-4 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-sm font-medium transition relative ${
                activeTab === "all"
                  ? "text-blue-600 border-b-2 border-blue-600 -mb-px"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("all")} ({invitations.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 text-sm font-medium transition relative ${
                activeTab === "pending"
                  ? "text-blue-600 border-b-2 border-blue-600 -mb-px"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("pending")} ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("accepted")}
              className={`px-4 py-2 text-sm font-medium transition relative ${
                activeTab === "accepted"
                  ? "text-blue-600 border-b-2 border-blue-600 -mb-px"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("accepted")} ({acceptedCount})
            </button>
          </div>

          <div className="space-y-3">
            {filteredInvitations.map((inv) => (
              <div
                key={inv.id}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {inv.groupName || "Nhóm"}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                        inv.status === "accepted"
                          ? "bg-green-50 text-green-600 border border-green-200"
                          : inv.status === "pending"
                          ? "bg-yellow-50 text-yellow-600 border border-yellow-200"
                          : "bg-gray-50 text-gray-600 border border-gray-200"
                      }`}>
                        {inv.status === "accepted" ? "Đã chấp nhận" : inv.status === "pending" ? "Đang chờ" : inv.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{inv.invitedByName || "Người gửi"}</span> mời bạn hướng dẫn nhóm cho đề tài <span className="font-medium">{inv.topicTitle || "chưa xác định"}</span>
                    </p>
                    {inv.createdAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {getRelativeTime(inv.createdAt)}
                      </p>
                    )}
                  </div>
                  {inv.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAcceptInvitation(inv)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition"
                      >
                        <Check className="w-4 h-4" />
                        <span>Chấp nhận</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectInvitation(inv)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium transition"
                      >
                        <X className="w-4 h-4" />
                        <span>Từ chối</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search input */}
          <div className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 focus-within:ring-2 focus-within:ring-blue-500">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              className="w-full bg-transparent outline-none text-sm"
              placeholder="Tìm kiếm theo tên, topic hoặc từ khóa..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          {/* Filter button */}
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition sm:w-auto"
          >
            <Filter className="w-4 h-4" />
            <span>{t("filters")}</span>
          </button>
        </div>

        <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{normalizedGroups.length} {t("groupsBeingMentored")}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>
              {normalizedGroups.reduce((sum, g) => sum + g.members, 0)} {t("sinh_vien") || "sinh viên"}
            </span>
          </div>
        </div>
      </div>

      {/* Available Groups Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map((group) => (
          <div
            key={group.id}
            className="border border-gray-200 rounded-2xl bg-white hover:shadow-lg transition-all p-5 flex flex-col gap-3"
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-base mb-1">
                  {group.name}
                </h3>
                <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                  {group.topic}
                </span>
              </div>

              <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-600 border border-green-200 capitalize">
                {group.status}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600">
              {group.description}
            </p>

            {/* Progress */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">{t("projectProgress")}</span>
                <span className="text-sm font-semibold text-gray-700">
                  {group.progress}%
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${group.progress}%` }}
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>{group.members}/{group.maxMembers} {t("thanh_vien") || "thành viên"}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{group.deadline}</span>
              </div>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-2">
              {group.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-white text-gray-700 text-xs rounded-full border border-gray-200 shadow-sm"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="border-t border-gray-100 pt-3 mt-2">
              <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                Hoạt động gần đây
              </p>
              {group.activities.length > 0 ? (
                <div className="space-y-2">
                  {group.activities.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-800 font-medium line-clamp-1">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {activity.user} • {getRelativeTime(activity.time)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">Chưa có hoạt động gần đây</p>
              )}
            </div>

            {/* Expertise Needed */}
            <div className="border-t border-gray-100 pt-3 mt-2 text-xs text-gray-500">
              <span>Tìm kiếm mentor chuyên ngành:</span>
              <p className="font-medium text-gray-700 mt-0.5">
                {group.expertiseNeeded}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/mentor/my-groups/${group.id}`)}
              className="mt-3 inline-flex items-center justify-center gap-2 w-full rounded-lg bg-[#4264D7] hover:bg-[#3451b8] text-white text-sm font-medium py-2.5 shadow-sm transition"
            >
              <span>{t("viewGroupDetails")}</span>
            </button>
          </div>
          ))}
        </div>
      )}

      {/* Success Modal */}
      <Modal
        open={acceptModalVisible}
        onCancel={() => setAcceptModalVisible(false)}
        footer={null}
        centered
        width={400}
        closeIcon={<X className="w-5 h-5" />}
      >
        <div className="text-center py-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Chấp nhận thành công!
          </h3>
          <p className="text-gray-600 mb-6">
            Bạn đã chấp nhận lời mời hướng dẫn nhóm <span className="font-semibold">{acceptedGroupName}</span>
          </p>
          <button
            type="button"
            onClick={() => setAcceptModalVisible(false)}
            className="w-full rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 transition"
          >
            Đóng
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Discover;

