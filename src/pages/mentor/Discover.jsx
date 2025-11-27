    import React, { useState, useEffect } from "react";
import { Card, Tag, Button, Spin } from "antd";
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

  const normalizedInvites = (invites || []).map((inv) => ({
    id: inv.invitationId || inv.id,
    groupName: inv.groupName || t("group") || "Group",
    topicTitle: inv.topicTitle || t("topic") || "Topic",
    invitedBy: inv.invitedByName || inv.invitedBy || t("invitedBy") || "Inviter",
    status: (inv.status || "pending").toLowerCase(),
    createdAt: inv.createdAt,
    expiresAt: inv.expiresAt,
  }));

  return (
    <div className="space-y-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="space-y-1 mb-8">
        <h1
          className="inline-block text-4xl font-extrabold"
          style={{
            backgroundImage: "linear-gradient(90deg,#3182ED 0%,#43D08A 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Mentor Invitations
        </h1>
        <p className="text-gray-500 text-sm">
          Review and respond to group invitations.
        </p>
      </div>

      {/* Invitations for mentor */}
      <Card className="shadow-sm border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-800 font-semibold">
            {t("mentorInvitations") || "Mentor invitations"}
          </h3>
          {inviteLoading && <Spin size="small" />}
        </div>
        {normalizedInvites.length === 0 && !inviteLoading ? (
          <p className="text-sm text-gray-500">
            {t("noMentorInvitations") || "No invitations at the moment."}
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {normalizedInvites.map((inv) => (
              <Card
                key={inv.id}
                className="border border-gray-200 rounded-xl"
                size="small"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {inv.groupName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t("topic") || "Topic"}: {inv.topicTitle}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("invitedBy") || "Invited by"}: {inv.invitedBy}
                    </p>
                  </div>
                  <Tag color={inv.status === "accepted" ? "green" : "orange"}>
                    {inv.status}
                  </Tag>
                </div>
                <div className="flex gap-2 mt-3">
                  {inv.status !== "accepted" && (
                    <>
                      <Button
                        type="primary"
                        className="flex-1"
                        loading={inviteActionId === inv.id}
                        onClick={() => handleInviteAction(inv.id, "accept")}
                      >
                        {t("accept") || "Accept"}
                      </Button>
                      <Button
                        className="flex-1"
                        danger
                        loading={inviteActionId === inv.id}
                        onClick={() => handleInviteAction(inv.id, "reject")}
                      >
                        {t("reject") || "Reject"}
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
};

export default Discover;
