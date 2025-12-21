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
  Send,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Modal, notification } from "antd";
import { GroupService } from "../../services/group.service";
import { InvitationService } from "../../services/invitation.service";
import { TopicService } from "../../services/topic.service";
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
  const [groupDetailModalVisible, setGroupDetailModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loadingGroupMembers, setLoadingGroupMembers] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [notificationApi, contextHolder] = notification.useNotification();

  // Mentor request modal state
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestingGroup, setRequestingGroup] = useState(null);
  const [ownedTopics, setOwnedTopics] = useState([]);
  const [requestTopicId, setRequestTopicId] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [topicSearch, setTopicSearch] = useState("");

  useEffect(() => {
    fetchAvailableGroups();
    fetchPendingInvitations();
  }, []);

  const fetchAvailableGroups = async () => {
    try {
      setLoading(true);

      // Mentor: xem danh sách nhóm đang tuyển, không load board/progress chi tiết
      const groupsRes = await GroupService.listRecruitingGroups();
      const recruitingGroups = Array.isArray(groupsRes?.data)
        ? groupsRes.data
        : [];

      setGroups(recruitingGroups);
    } catch {
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
    } catch {
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
    } catch {
      notificationApi.error({
        message: t("acceptInvitationFailed") || "Chấp nhận lời mời thất bại",
        description: t("pleaseTryAgainLater") || "Vui lòng thử lại sau.",
      });
    }
  };

  const handleRejectInvitation = async (invitation) => {
    try {
      await InvitationService.decline(invitation.invitationId || invitation.id);
      setInvitations((prev) => prev.filter((x) => x.id !== invitation.id));
      notificationApi.info({
        message: t("invitationRejected") || "Đã từ chối lời mời",
      });
    } catch {
      notificationApi.error({
        message: t("rejectInvitationFailed") || "Từ chối lời mời thất bại",
        description: t("pleaseTryAgainLater") || "Vui lòng thử lại sau.",
      });
    }
  };

  const normalizeGroup = (g) => {
    const topicTitle = g.topic?.title || t("noTopic") || "Chưa có topic";
    const topicDescription = g.topic?.description || "";
    const topicSkills = Array.isArray(g.topic?.skills) ? g.topic.skills : [];
    const mentorName =
      g.mentor?.displayName ||
      g.mentor?.fullName ||
      g.mentor?.name ||
      g.mentorName ||
      (Array.isArray(g.mentors) && g.mentors[0]
        ? g.mentors[0].mentorName ||
          g.mentors[0].name ||
          g.mentors[0].displayName
        : "") ||
      "";
    const mentorAvatarUrl =
      g.mentor?.avatarUrl ||
      g.mentor?.avatar ||
      g.mentor?.profilePicture ||
      (Array.isArray(g.mentors) && g.mentors[0]
        ? g.mentors[0].avatarUrl ||
          g.mentors[0].avatar ||
          g.mentors[0].profilePicture
        : "") ||
      "";
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
      name: g.name || t("unnamedGroup") || "Nhóm không tên",
      topic: topicTitle,
      topicDescription,
      description: g.description || t("noDescription") || "Chưa có mô tả.",
      members: g.currentMembers || 0,
      maxMembers: g.maxMembers || 5,
      // Không hiển thị progress chi tiết ở màn Discover để tránh gọi API board/report
      progress: typeof g.projectProgress === "number" ? g.projectProgress : 0,
      deadline: semesterEnd,
      skills: displaySkills,
      expertiseNeeded:
        g.major?.majorName || t("noExpertiseNeeded") || "Chưa xác định",
      topicSkills,
      mentorName,
      mentorAvatarUrl,
      hasTopic: !!g.topic,
      hasMentor: !!mentorName,
      activities: [],
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

  const filteredGroups = normalizedGroups.filter(
    (g) =>
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

  const pendingCount = invitations.filter(
    (inv) => inv.status === "pending"
  ).length;
  const acceptedCount = invitations.filter(
    (inv) => inv.status === "accepted"
  ).length;

  const openRequestModal = async (group) => {
    setRequestingGroup(group);
    setRequestTopicId("");
    setRequestMessage("");
    setOwnedTopics([]);
    setRequestModalOpen(true);
    try {
      const res = await TopicService.getOwnedOpenTopics();
      const data = Array.isArray(res?.data) ? res.data : [];
      setOwnedTopics(data);
    } catch {
      setOwnedTopics([]);
    }
  };

  const handleSendMentorRequest = async () => {
    if (!requestingGroup?.id || !requestTopicId || !requestMessage.trim())
      return;
    try {
      setSendingRequest(true);
      await GroupService.sendMentorRequest(requestingGroup.id, {
        topicId: requestTopicId,
        message: requestMessage.trim(),
      });
      notificationApi.success({
        message: t("inviteSent") || "Mentor request sent",
      });
      setRequestModalOpen(false);
    } catch (error) {
      notificationApi.error({
        message: t("inviteFailed") || "Failed to send mentor request",
        description:
          error?.response?.data?.message ||
          t("pleaseTryAgainLater") ||
          "Please try again later",
      });
    } finally {
      setSendingRequest(false);
    }
  };

  const filteredOwnedTopics =
    topicSearch.trim().length === 0
      ? ownedTopics
      : ownedTopics.filter((topic) =>
          (topic.title || "")
            .toLowerCase()
            .includes(topicSearch.trim().toLowerCase())
        );

  const openGroupDetailModal = async (group) => {
    if (!group?.id) return;
    setSelectedGroup(group);
    setGroupMembers([]);
    setGroupDetailModalVisible(true);
    try {
      setLoadingGroupMembers(true);
      const res = await GroupService.getListMembers(group.id);
      const members = Array.isArray(res?.data) ? res.data : [];
      setGroupMembers(members);
    } catch (error) {
      setGroupMembers([]);
      notificationApi.error({
        message: t("loadGroupMembersFailed") || "Không tải được danh sách thành viên",
      });
    } finally {
      setLoadingGroupMembers(false);
    }
  };

  return (
    <div className="space-y-6 min-h-screen">
      {contextHolder}

      {/* Header Section */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-clip-text text-black">
          {t("recruitingGroupsHeader") || "Recruiting groups"}
        </h1>
        <p className="text-gray-600">
          {t("recruitingGroupsSubtitle") ||
            "Danh sách các nhóm đang ở trạng thái recruiting để bạn gửi yêu cầu mentor."}
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
                        {inv.groupName || t("groupUnnamed") || "Nhóm không tên"}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                          inv.status === t("accepted")
                            ? "bg-green-50 text-green-600 border border-green-200"
                            : inv.status === t("pending")
                            ? "bg-yellow-50 text-yellow-600 border border-yellow-200"
                            : "bg-gray-50 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {inv.status === t("accepted")
                          ? "Đã chấp nhận"
                          : inv.status === t("pending")
                          ? "Đang chờ"
                          : inv.status}
                      </span>
                    </div>
                    {inv.type === "mentor_request" ? (
                      <p className="text-sm text-gray-600">
                        {t("youSentMentorRequest") ||
                          "You sent a mentor request for this group with the topic below."}
                        {inv.topicTitle && (
                          <>
                            {" "}
                            <span className="font-medium">
                              {inv.topicTitle ||
                                t("topicUndefined") ||
                                "chưa xác định"}
                            </span>
                          </>
                        )}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">
                          {inv.invitedByName || t("invitedBy") || "Người mời"}
                        </span>{" "}
                        {t("invitedYouToMentorGroup") ||
                          "mời bạn hướng dẫn nhóm cho đề tài"}{" "}
                        <span className="font-medium">
                          {inv.topicTitle ||
                            t("topicUndefined") ||
                            "chưa xác định"}
                        </span>
                      </p>
                    )}

                    {/* Optional message from student/group leader */}
                    {inv.message && (
                      <p className="mt-2 text-sm text-gray-700 bg-white border border-blue-100 rounded-lg px-3 py-2 shadow-sm">
                        <span className="text-xs uppercase tracking-wide text-blue-500 font-semibold">
                          {t("message") || "Message"}
                        </span>
                        <br />
                        <span className="italic break-words">{inv.message}</span>
                      </p>
                    )}

                    {inv.createdAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        {getRelativeTime(inv.createdAt)}
                      </p>
                    )}
                  </div>
                  {inv.status === "pending" && inv.type !== "mentor_request" && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAcceptInvitation(inv)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition"
                      >
                        <Check className="w-4 h-4" />
                        <span>{t("accept") || "Chấp nhận"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectInvitation(inv)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium transition"
                      >
                        <X className="w-4 h-4" />
                        <span>{t("reject") || "Từ chối"}</span>
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
              placeholder={
                t("searchGroups") || "Tìm kiếm theo tên, topic hoặc từ khóa..."
              }
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
            <span>
              {normalizedGroups.length}{" "}
              {t("recruitingGroupsHeader") || "Recruiting groups"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>
              {normalizedGroups.reduce((sum, g) => sum + g.members, 0)}{" "}
              {t("sinh_vien") || "sinh viên"}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="border border-gray-200 rounded-2xl bg-white hover:shadow-lg transition-all p-4 sm:p-5 flex flex-col gap-3"
            >
              {/* Header */}
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0 overflow-hidden">
                  <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">
                    {group.name}
                  </h3>
                  <span className="inline-flex items-center max-w-full px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600 border border-blue-200 overflow-hidden">
                    <span className="block truncate max-w-full">{group.topic}</span>
                  </span>
                </div>

                <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-600 border border-green-200 capitalize flex-shrink-0">
                  {group.status}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600">{group.description}</p>

              {/* Info */}
              <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  <span>
                    {group.members}/{group.maxMembers}{" "}
                    {t("thanh_vien") || "thành viên"}
                  </span>
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

              {/* Expertise Needed */}
              <div className="border-t border-gray-100 pt-3 mt-2 text-xs text-gray-500">
                <span>
                  {t("expertiseNeeded") || "Tìm kiếm mentor chuyên ngành:"}
                </span>
                <p className="font-medium text-gray-700 mt-0.5">
                  {group.expertiseNeeded}
                </p>
              </div>

              <div className="mt-3 flex flex-col xl:flex-row gap-2 md:gap-2.5">
                {/** View details button */}
                <button
                  type="button"
                  onClick={() => openGroupDetailModal(group)}
                  className="inline-flex items-center justify-center gap-1.5 xl:gap-2 w-full xl:w-1/2 rounded-lg bg-[#4264D7] hover:bg-[#3451b8] text-white text-xs sm:text-sm font-medium py-2 sm:py-2.5 px-3 sm:px-4 md:px-5 shadow-sm transition whitespace-nowrap"
                >
                  <span className="truncate">{t("viewGroupDetails")}</span>
                </button>
                {/** Mentor request button: disabled if group already has topic & mentor */}
                <button
                  type="button"
                  onClick={() => {
                    if (group.hasTopic && group.hasMentor) return;
                    openRequestModal(group);
                  }}
                  disabled={group.hasTopic && group.hasMentor}
                  className={`inline-flex items-center justify-center gap-1.5 xl:gap-2 w-full xl:w-1/2 rounded-lg border text-xs sm:text-sm font-medium py-2 sm:py-2.5 px-3 sm:px-4 md:px-5 shadow-sm transition whitespace-nowrap ${
                    group.hasTopic && group.hasMentor
                      ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                      : "border-orange-400 text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  {!group.hasTopic || !group.hasMentor ? (
                    <>
                      <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">
                        {t("sendMentorRequest") || "Send mentor request"}
                      </span>
                    </>
                  ) : (
                    <span className="truncate">
                      {t("mentorAssigned") || "Mentor already assigned"}
                    </span>
                  )}
                </button>
              </div>
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
            {t("acceptSuccess") || "Chấp nhận thành công!"}
          </h3>
          <p className="text-gray-600 mb-6">
            {t("acceptSuccessMessage") ||
              `Bạn đã chấp nhận lời mời hướng dẫn nhóm `}
            <span className="font-semibold">{acceptedGroupName}</span>
          </p>
          <button
            type="button"
            onClick={() => setAcceptModalVisible(false)}
            className="w-full rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 transition"
          >
            {t("close") || "Đóng"}
          </button>
        </div>
      </Modal>

      {/* Group detail modal */}
      <Modal
        open={groupDetailModalVisible}
        onCancel={() => setGroupDetailModalVisible(false)}
        footer={null}
        width={520}
        centered
        closeIcon={<X className="w-5 h-5" />}
      >
        <div className="space-y-5">
          {/* Header */}
          {selectedGroup && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Users className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {selectedGroup.name}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {groupMembers.length || selectedGroup.members}/
                  {selectedGroup.maxMembers}{" "}
                  {t("thanh_vien") || "members"}
                </p>
              </div>
            </div>
          )}

          {/* Topic & description */}
          {selectedGroup && (
            <div className="space-y-4 text-sm">
              {selectedGroup.topic && (
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                    {t("topic") || "Topic"}
                  </p>
                  <p className="mt-1 text-gray-900">
                    {selectedGroup.topic}
                  </p>
                </div>
              )}

              {selectedGroup.description && (
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                    {t("description") || "Description"}
                  </p>
                  <p className="mt-1 text-gray-700">
                    {selectedGroup.description}
                  </p>
                </div>
              )}

              {(selectedGroup.skills?.length > 0 ||
                selectedGroup.topicSkills?.length > 0) && (
                <div>
                  <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
                    {t("skills") || "Skills"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[...(selectedGroup.skills || []), ...(selectedGroup.topicSkills || [])].map(
                      (skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-0.5 rounded-full bg-gray-100 text-xs text-gray-800"
                        >
                          {skill}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mentor badge */}
          {selectedGroup?.mentorName && (
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                  {selectedGroup.mentorAvatarUrl ? (
                    <img
                      src={selectedGroup.mentorAvatarUrl}
                      alt={selectedGroup.mentorName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-blue-700">
                      {selectedGroup.mentorName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedGroup.mentorName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("mentor") || "Mentor"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Members list */}
          <div className="pt-3 border-t border-gray-100">
            <p className="text-[11px] font-semibold tracking-wide text-gray-500 uppercase mb-2">
              {t("members") || "Members"}
            </p>
            {loadingGroupMembers ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : groupMembers.length === 0 ? (
              <p className="text-sm text-gray-500">
                {t("noMembersInGroup") || "Nhóm hiện chưa có thành viên nào."}
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {groupMembers.map((member) => (
                  <li
                    key={member.id || member.userId}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.fullName || member.name || "avatar"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-gray-600">
                          {(member.fullName || member.name || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.displayName ||
                            member.fullName ||
                            member.name ||
                            t("unknownUser") ||
                            "Không rõ tên"}
                        </p>
                        {member.role && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] border ${
                              String(member.role).toLowerCase() === "mentor"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-gray-100 text-gray-700 border-gray-200"
                            }`}
                          >
                            {String(member.role).toLowerCase()}
                          </span>
                        )}
                      </div>
                      {member.email && (
                        <p className="text-xs text-gray-500 truncate">
                          {member.email}
                        </p>
                      )}
                      {Array.isArray(member.skills) && member.skills.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {member.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[11px] text-blue-700"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Modal>

      {/* Mentor request modal */}
      <Modal
        open={requestModalOpen}
        title={
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {t("sendMentorRequestTitle") || "Gửi yêu cầu mentor"}
              </h3>
              <p className="text-xs text-gray-500">
                {t("sendMentorRequestSubtitle") ||
                  "Chọn một topic và viết lời nhắn để gửi yêu cầu mentor cho nhóm."}
              </p>
            </div>
          </div>
        }
        onCancel={() => setRequestModalOpen(false)}
        onOk={handleSendMentorRequest}
        okButtonProps={{
          loading: sendingRequest,
          disabled: !requestTopicId || !requestMessage.trim(),
        }}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-600 mb-1 mt-8">
              {t("topic") || "Topic"}
            </label>
            {/* Search input with icon */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 mb-1">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                placeholder={t("searchGroupsTopics") || "Search topics..."}
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>

            {/* Topic list */}
            <div className="mt-1 max-h-56 overflow-y-auto rounded-xl bg-white border border-gray-200">
              {filteredOwnedTopics.length === 0 ? (
                <div className="px-3 py-3 text-xs text-gray-500">
                  {t("noTopics") || "No topics available."}
                </div>
              ) : (
                <div className="py-1 space-y-1">
                  {filteredOwnedTopics.map((topic) => {
                    const topicId = topic.id || topic.topicId || topic.topicID;
                    const selected = requestTopicId === topicId;
                    return (
                      <button
                        key={topicId}
                        type="button"
                        onClick={() => setRequestTopicId(topicId)}
                        className={`w-full flex items-start gap-3 px-3 py-2 text-left text-sm rounded-xl transition ${
                          selected ? "bg-blue-50" : "hover:bg-gray-50"
                        }`}
                        title={topic.title}
                      >
                        <span
                          className={`mt-1 flex items-center justify-center w-4 h-4 rounded-full border ${
                            selected
                              ? "border-blue-600 bg-blue-600"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {selected && (
                            <span className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">
                            {topic.title}
                          </p>
                          {topic.positions && (
                            <p className="text-xs text-gray-500 truncate">
                              {topic.positions}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
              <span className="inline-flex w-4 h-4 items-center justify-center">
                <MessageSquare className="w-3 h-3 text-gray-500" />
              </span>
              <span>{t("message") || "Message"}</span>
            </label>
            <textarea
              rows={3}
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
              placeholder={
                t("enterNotificationMessage") || "Nhập lời nhắn của bạn..."
              }
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Discover;
