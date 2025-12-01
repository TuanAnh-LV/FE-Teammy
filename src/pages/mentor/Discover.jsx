import React, { useState, useEffect } from "react";
import {
  Search,
  Users,
  Calendar,
  Filter,
  CheckCircle2,
  UserPlus,
  Loader2,
} from "lucide-react";
import { InvitationService } from "../../services/invitation.service";
import { useTranslation } from "../../hook/useTranslation";

const Discover = () => {
  const [invites, setInvites] = useState([]);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteActionId, setInviteActionId] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setInviteLoading(true);
      const res = await InvitationService.list({ type: "mentor" }, false);
      const list = Array.isArray(res?.data) ? res.data : [];
      setInvites(list);
    } catch (error) {
      console.error("Failed to fetch invitations:", error);
      setInvites([]);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleInviteAction = async (invitationId, action) => {
    if (!invitationId) return;
    try {
      setInviteActionId(invitationId);
      if (action === "accept") {
        await InvitationService.accept(invitationId);
      } else {
        await InvitationService.decline(invitationId);
      }
      setInvites((prev) =>
        prev.filter((i) => (i.invitationId || i.id) !== invitationId)
      );
    } catch (error) {
      console.error(`Failed to ${action} invitation:`, error);
    } finally {
      setInviteActionId(null);
    }
  };

  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Mock data for available groups (replace with real API)
  const availableGroups = [
    {
      id: 1,
      name: "Smart Campus IoT System",
      topic: "IoT & Smart Systems",
      description:
        "Xây dựng hệ thống IoT thông minh cho khuôn viên trường đại học bao gồm quản lý năng lượng, bãi đỗ xe và an ninh.",
      members: 4,
      progress: 25,
      deadline: "20/12/2024",
      lookingForMentor: true,
      skills: ["Arduino", "Raspberry Pi", "Node.js", "+1"],
      expertiseNeeded: "IoT & Smart Systems",
    },
    {
      id: 2,
      name: "Blockchain Voting System",
      topic: "Blockchain & Security",
      description:
        "Hệ thống bỏ phiếu phi tập trung sử dụng blockchain để đảm bảo tính minh bạch và bảo mật của quá trình bỏ phiếu.",
      members: 3,
      progress: 15,
      deadline: "15/12/2024",
      lookingForMentor: true,
      skills: ["Solidity", "Ethereum", "Web3.js", "+1"],
      expertiseNeeded: "Blockchain & Security",
    },
    {
      id: 3,
      name: "AI-Powered Resume Builder",
      topic: "AI & Career Development",
      description:
        "Ứng dụng AI giúp sinh viên tạo CV chuyên nghiệp và gợi ý tối ưu hóa CV dựa trên phân tích từ khóa và định dạng.",
      members: 5,
      progress: 30,
      deadline: "10/1/2025",
      lookingForMentor: true,
      skills: ["Python", "GPT API", "React", "+1"],
      expertiseNeeded: "AI & Career Development",
    },
  ];

  const normalizedInvites = (invites || []).map((inv) => ({
    id: inv.invitationId || inv.id,
    groupName: inv.groupName || t("group") || "Group",
    topicTitle: inv.topicTitle || t("topic") || "Topic",
    invitedBy:
      inv.invitedByName || inv.invitedBy || t("invitedBy") || "Inviter",
    status: (inv.status || "pending").toLowerCase(),
    createdAt: inv.createdAt,
    expiresAt: inv.expiresAt,
  }));

  const filteredInvites =
    filterStatus === "all"
      ? normalizedInvites
      : normalizedInvites.filter((i) => i.status === filterStatus);

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen px-4 sm:px-6 lg:px-8 py-6">
      {/* Header Section */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-green-400 bg-clip-text text-transparent">
          Khám phá nhóm dự án
        </h1>
        <p className="text-gray-600">
          Tìm kiếm và tham gia các nhóm dự án phù hợp với chuyên môn của bạn. Hỗ
          trợ sinh viên thực hiện capstone project thành công.
        </p>
      </div>

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
            <span>Bộ lọc</span>
          </button>
        </div>

        <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>5 nhóm đang tìm mentor</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>19 sinh viên</span>
          </div>
        </div>
      </div>

      {/* Available Groups Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {availableGroups.map((group) => (
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

              {group.lookingForMentor && (
                <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-orange-50 text-orange-500 border border-orange-200">
                  Đang tìm mentor
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600">
              {group.description}
            </p>

            {/* Progress */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Tiến độ dự án</span>
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
                <span>{group.members} /5 thành viên</span>
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

            {/* Divider + Expertise Needed */}
            <div className="border-t border-gray-100 pt-3 mt-2 text-xs text-gray-500">
              <span>Tìm kiếm mentor chuyên ngành:</span>
              <p className="font-medium text-gray-700 mt-0.5">
                {group.expertiseNeeded}
              </p>
            </div>

            {/* Action Button */}
            <button
              type="button"
              className="mt-3 inline-flex items-center justify-center gap-2 w-full rounded-lg bg-[#4264D7] text-white text-sm font-medium py-2.5 shadow-sm transition"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tham gia hướng dẫn</span>
            </button>
          </div>
        ))}
      </div>

      {/* Pending Invitations Section – giữ style tag mới luôn */}
      {filteredInvites.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mt-8 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800 font-semibold text-lg">
              {t("mentorInvitations") || "Lời mời làm mentor"}
            </h3>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                <button
                  type="button"
                  className={`px-2 py-1 rounded-full border text-[11px] ${
                    filterStatus === "all"
                      ? "bg-blue-50 text-blue-600 border-blue-200"
                      : "bg-gray-50 text-gray-500 border-gray-200"
                  }`}
                  onClick={() => setFilterStatus("all")}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 rounded-full border text-[11px] ${
                    filterStatus === "pending"
                      ? "bg-orange-50 text-orange-600 border-orange-200"
                      : "bg-gray-50 text-gray-500 border-gray-200"
                  }`}
                  onClick={() => setFilterStatus("pending")}
                >
                  Đang chờ
                </button>
                <button
                  type="button"
                  className={`px-2 py-1 rounded-full border text-[11px] ${
                    filterStatus === "accepted"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-gray-50 text-gray-500 border-gray-200"
                  }`}
                  onClick={() => setFilterStatus("accepted")}
                >
                  Đã chấp nhận
                </button>
              </div>

              {inviteLoading && (
                <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInvites.map((inv) => (
              <div
                key={inv.id}
                className="border border-gray-200 rounded-2xl bg-white hover:shadow-md transition p-4 flex flex-col gap-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      {inv.groupName}
                    </p>
                    <span className="inline-flex items-center px-3 py-1 text-[11px] font-medium rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                      {inv.topicTitle}
                    </span>
                    <p className="text-[11px] text-gray-500 mt-2">
                      {t("invitedBy") || "Người mời"}:{" "}
                      <span className="font-medium text-gray-700">
                        {inv.invitedBy}
                      </span>
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-3 py-1 text-[11px] font-medium rounded-full ${
                      inv.status === "accepted"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : "bg-orange-50 text-orange-600 border border-orange-200"
                    }`}
                  >
                    {inv.status === "pending"
                      ? "Đang chờ"
                      : inv.status === "accepted"
                      ? "Đã chấp nhận"
                      : inv.status}
                  </span>
                </div>

                {inv.status !== "accepted" && (
                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => handleInviteAction(inv.id, "accept")}
                      disabled={inviteActionId === inv.id}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium py-2.5 text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {inviteActionId === inv.id && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t("accept") || "Chấp nhận"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInviteAction(inv.id, "reject")}
                      disabled={inviteActionId === inv.id}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-medium py-2.5 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {inviteActionId === inv.id && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      <span>{t("reject") || "Từ chối"}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Discover;
