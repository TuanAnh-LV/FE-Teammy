import React, { useEffect, useState } from "react";
import { Check, Loader2, UserPlus, X, Users } from "lucide-react";
import { Modal, notification } from "antd";
import { InvitationService } from "../../services/invitation.service";
import { useTranslation } from "../../hook/useTranslation";
import { GroupService } from "../../services/group.service";
import { useNavigate } from "react-router-dom";

const Invitations = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [notificationApi, contextHolder] = notification.useNotification();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [acceptingInvitationId, setAcceptingInvitationId] = useState(null);
  const [rejectingInvitationId, setRejectingInvitationId] = useState(null);
  const [groupDetailModalVisible, setGroupDetailModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loadingGroupDetail, setLoadingGroupDetail] = useState(false);
  const [loadingGroupMembers, setLoadingGroupMembers] = useState(false);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await InvitationService.list();
      const data = Array.isArray(res?.data) ? res.data : [];
      setInvitations(data);
    } catch {
      setInvitations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvitation = async (invitation) => {
    const invitationId = invitation.invitationId || invitation.id;
    if (acceptingInvitationId === invitationId) return; // Prevent double click
    
    try {
      setAcceptingInvitationId(invitationId);
      await InvitationService.accept(invitationId);
      // Update status instead of removing from list
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invitation.id || inv.invitationId === invitationId
            ? { ...inv, status: "accepted" }
            : inv
        )
      );
      notificationApi.success({
        message: t("accepted") || "Accepted",
      });
    } catch {
      notificationApi.warning({
        message: t("acceptInvitationFailed") || "Accept invitation failed",
        description: t("pleaseTryAgainLater") || "Please try again later.",
      });
    } finally {
      setAcceptingInvitationId(null);
    }
  };

  const handleRejectInvitation = async (invitation) => {
    const invitationId = invitation.invitationId || invitation.id;
    if (rejectingInvitationId === invitationId) return; // Prevent double click
    
    try {
      setRejectingInvitationId(invitationId);
      await InvitationService.decline(invitationId);
      // Update status instead of removing from list
      setInvitations((prev) =>
        prev.map((inv) =>
          inv.id === invitation.id || inv.invitationId === invitationId
            ? { ...inv, status: "rejected" }
            : inv
        )
      );
      notificationApi.info({
        message: t("invitationRejected") || "Invitation rejected",
      });
    } catch {
      notificationApi.warning({
        message: t("rejectInvitationFailed") || "Reject invitation failed",
        description: t("pleaseTryAgainLater") || "Please try again later.",
      });
    } finally {
      setRejectingInvitationId(null);
    }
  };

  const getRelativeTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("justNow") || "just now";
    if (diffMins < 60) return `${diffMins} ${t("minutesAgo") || "minutes ago"}`;
    if (diffHours < 24) return `${diffHours} ${t("hoursAgo") || "hours ago"}`;
    if (diffDays < 7) return `${diffDays} ${t("daysAgo") || "days ago"}`;
    return date.toLocaleDateString("vi-VN");
  };

  const normalizeStatus = (status = "") => status.toString().toLowerCase();
  const isRejectedStatus = (status) => {
    const value = normalizeStatus(status);
    return value === "rejected" || value === "declined";
  };

  const filteredInvitations = invitations.filter((inv) => {
    const status = normalizeStatus(inv.status);
    if (activeTab === "all") return true;
    if (activeTab === "pending") return status === "pending";
    if (activeTab === "accepted") return status === "accepted";
    if (activeTab === "rejected") return isRejectedStatus(status);
    return true;
  });

  const pendingCount = invitations.filter(
    (inv) => normalizeStatus(inv.status) === "pending"
  ).length;
  const acceptedCount = invitations.filter(
    (inv) => normalizeStatus(inv.status) === "accepted"
  ).length;
  const rejectedCount = invitations.filter((inv) =>
    isRejectedStatus(inv.status)
  ).length;

  const openMemberProfile = (member) => {
    const memberId =
      member.id || member.userId || member.userID || member.memberId;
    if (!memberId) return;
    setGroupDetailModalVisible(false);
    navigate(`/mentor/profile/${memberId}`);
  };

  const openGroupDetailModal = async (invitation) => {
    if (!invitation?.groupId) return;
    setSelectedGroup({
      id: invitation.groupId,
      name:
        invitation.groupName || t("groupUnnamed") || "Unnamed group",
      topic:
        invitation.topicTitle || t("topicUndefined") || "Topic not set",
      description: invitation.description || "",
      members: invitation.currentMembers || 0,
      maxMembers: invitation.maxMembers || 0,
      skills: invitation.skills || [],
      topicSkills: invitation.topicSkills || [],
    });
    setGroupMembers([]);
    setGroupDetailModalVisible(true);

    try {
      setLoadingGroupDetail(true);
      const res = await GroupService.getGroupDetail(invitation.groupId);
      const g = res?.data || res || {};
      setSelectedGroup({
        id: g.id || invitation.groupId,
        name:
          g.name ||
          g.title ||
          invitation.groupName ||
          t("groupUnnamed") ||
          "Unnamed group",
        topic:
          g.topic?.title ||
          g.topicName ||
          invitation.topicTitle ||
          t("topicUndefined") ||
          "Topic not set",
        description: g.description || "",
        members: g.currentMembers || g.memberCount || 0,
        maxMembers: g.maxMembers || g.capacity || 0,
        skills: Array.isArray(g.skills) ? g.skills : [],
        topicSkills: Array.isArray(g.topic?.skills) ? g.topic.skills : [],
      });
    } catch {
      setSelectedGroup((prev) => prev || null);
    } finally {
      setLoadingGroupDetail(false);
    }

    try {
      setLoadingGroupMembers(true);
      const res = await GroupService.getListMembers(invitation.groupId);
      const members = Array.isArray(res?.data) ? res.data : [];
      setGroupMembers(members);
    } catch {
      setGroupMembers([]);
      notificationApi.warning({
        message:
          t("loadGroupMembersFailed") ||
          "Failed to load group members",
      });
    } finally {
      setLoadingGroupMembers(false);
    }
  };

  return (
    <div className="space-y-6 min-h-screen">
      {contextHolder}

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black">
          {t("mentoringInvitations") || "Mentoring Invitations"}
        </h1>
        <p className="text-gray-600">
          {t("mentorInvitations") ||
            "Review invitations and decide whether to mentor these groups."}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            {t("invitations") || "Invitations"}
          </h2>
        </div>

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
          <button
            type="button"
            onClick={() => setActiveTab("rejected")}
            className={`px-4 py-2 text-sm font-medium transition relative ${
              activeTab === "rejected"
                ? "text-blue-600 border-b-2 border-blue-600 -mb-px"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t("rejected") || "Rejected"} ({rejectedCount})
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          </div>
        ) : filteredInvitations.length === 0 ? (
          <div className="text-sm text-gray-500 py-6 text-center">
            {t("noInvitations") || "No invitations yet."}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredInvitations.map((inv) => (
              <div
                key={inv.id}
                className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition cursor-pointer"
                onClick={() => openGroupDetailModal(inv)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {inv.groupName || t("groupUnnamed") || "Unnamed group"}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                          normalizeStatus(inv.status) === "accepted"
                            ? "bg-green-50 text-green-600 border border-green-200"
                            : normalizeStatus(inv.status) === "pending"
                            ? "bg-yellow-50 text-yellow-600 border border-yellow-200"
                            : isRejectedStatus(inv.status)
                            ? "bg-red-50 text-red-600 border border-red-200"
                            : "bg-gray-50 text-gray-600 border border-gray-200"
                        }`}
                      >
                        {normalizeStatus(inv.status) === "accepted"
                          ? t("accepted") || "Accepted"
                          : normalizeStatus(inv.status) === "pending"
                          ? t("pending") || "Pending"
                          : isRejectedStatus(inv.status)
                          ? t("rejected") || "Rejected"
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
                                "Topic not set"}
                            </span>
                          </>
                        )}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">
                          {inv.invitedByName || t("invitedBy") || "Invited by"}
                        </span>{" "}
                        {t("invitedYouToMentorGroup") ||
                          "invited you to mentor the group for"}{" "}
                        <span className="font-medium">
                          {inv.topicTitle ||
                            t("topicUndefined") ||
                            "Topic not set"}
                        </span>
                      </p>
                    )}

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
                  {normalizeStatus(inv.status) === "pending" &&
                    inv.type !== "mentor_request" && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptInvitation(inv);
                        }}
                        disabled={acceptingInvitationId === (inv.invitationId || inv.id) || rejectingInvitationId === (inv.invitationId || inv.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {acceptingInvitationId === (inv.invitationId || inv.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        <span>{t("accept") || "Accept"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRejectInvitation(inv);
                        }}
                        disabled={rejectingInvitationId === (inv.invitationId || inv.id) || acceptingInvitationId === (inv.invitationId || inv.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {rejectingInvitationId === (inv.invitationId || inv.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        <span>{t("reject") || "Reject"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal
        open={groupDetailModalVisible}
        onCancel={() => setGroupDetailModalVisible(false)}
        footer={null}
        width={520}
        centered
        closeIcon={<X className="w-5 h-5" />}
      >
        {loadingGroupDetail ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-500 mt-3">
              {t("loadingDetails") || "Loading details..."}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
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
                    {selectedGroup.members || 0}/
                    {selectedGroup.maxMembers || 0}{" "}
                    {t("thanh_vien") || "members"}
                  </p>
                </div>
              </div>
            )}

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
                      {[
                        ...(selectedGroup.skills || []),
                        ...(selectedGroup.topicSkills || []),
                      ].map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-0.5 rounded-full bg-gray-100 text-xs text-gray-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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
                  {t("noMembersInGroup") ||
                    "No members in group."}
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {groupMembers.map((member) => (
                    <li
                      key={member.id || member.userId}
                      className="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => openMemberProfile(member)}
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
                              "Unknown"}
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
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Invitations;
