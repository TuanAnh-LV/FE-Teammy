import React, { useEffect, useState } from "react";
import { Check, Loader2, UserPlus, X } from "lucide-react";
import { notification } from "antd";
import { InvitationService } from "../../services/invitation.service";
import { useTranslation } from "../../hook/useTranslation";

const Invitations = () => {
  const { t } = useTranslation();
  const [notificationApi, contextHolder] = notification.useNotification();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [acceptingInvitationId, setAcceptingInvitationId] = useState(null);
  const [rejectingInvitationId, setRejectingInvitationId] = useState(null);

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
                className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition"
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
                        onClick={() => handleAcceptInvitation(inv)}
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
                        onClick={() => handleRejectInvitation(inv)}
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
    </div>
  );
};

export default Invitations;
