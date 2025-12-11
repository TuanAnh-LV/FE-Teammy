import React, { useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGroupInvitationSignalR } from "../../hook/useGroupInvitationSignalR";
import { useDispatch } from "react-redux";
import { addPendingInvitation, updateInvitationStatus, removeInvitation } from "../../app/invitationSlice";
import { notification } from "antd";
import { useTranslation } from "../../hook/useTranslation";


export default function RealtimeInvitationListener() {
  const { token, userInfo } = useAuth();
  const dispatch = useDispatch();
  const { t } = useTranslation();


  /**
   * Handle InvitationCreated Event
   * Triggered when: invite member, invite in forum, or any new invitation
   */
  const handleInvitationCreated = useCallback((dto) => {
    // Add to Redux state
    dispatch(addPendingInvitation(dto));
  }, [dispatch, t]);


  /**
   * Handle InvitationStatusChanged Event
   * Triggered when: user accepts/declines invitation, or invitation expires/cancelled
   */
  const handleInvitationStatusChanged = useCallback((dto) => {
    // Update Redux state
    dispatch(updateInvitationStatus({
      invitationId: dto.invitationId || dto.id,
      status: dto.status,
    }));
    
    // Show appropriate notification based on status
    const statusMessages = {
      accepted: {
        title: t("notifications.invitationAccepted") || "Invitation Accepted",
        description: "You have accepted the invitation successfully!",
        type: "success",
      },
      declined: {
        title: t("notifications.invitationDeclined") || "Invitation Declined",
        description: "You have declined the invitation",
        type: "info",
      },
      expired: {
        title: t("notifications.invitationExpired") || "Invitation Expired",
        description: "This invitation has expired",
        type: "warning",
      },
      cancelled: {
        title: t("notifications.invitationCancelled") || "Invitation Cancelled",
        description: dto.message || "The invitation has been cancelled",
        type: "info",
      },
    };
    
    const config = statusMessages[dto.status];
    if (config) {
      if (config.type === "success") {
        notification.success({
          message: config.title,
          description: config.description,
          duration: 3,
          placement: "topRight",
        });
      } else if (config.type === "warning") {
        notification.warning({
          message: config.title,
          description: config.description,
          duration: 3,
          placement: "topRight",
        });
      } else {
        notification.info({
          message: config.title,
          description: config.description,
          duration: 3,
          placement: "topRight",
        });
      }
    }
    
    // Remove from pending list if not pending anymore
    if (dto.status !== "pending") {
      dispatch(removeInvitation(dto.invitationId || dto.id));
    }
  }, [dispatch, t]);

  /**
   * Handle PendingUpdated Event
   * Triggered when: user applies for forum post, application status changes, admin reviews application
   */
  const handlePendingUpdated = useCallback((payload) => {
    // Show notification based on application status
    const statusConfig = {
      pending: {
        type: "info",
        title: t("notifications.applicationSubmitted") || "Application Submitted",
        message: `Your application for "${payload.postTitle}" has been submitted`,
        icon: "📋",
      },
      approved: {
        type: "success",
        title: t("notifications.applicationApproved") || "Application Approved! 🎉",
        message: `Congratulations! You've been selected for "${payload.postTitle}"`,
        icon: "🎉",
      },
      rejected: {
        type: "error",
        title: t("notifications.applicationRejected") || "Application Reviewed",
        message: `Your application for "${payload.postTitle}" was not selected`,
        icon: "❌",
      },
      withdrawn: {
        type: "info",
        title: t("notifications.applicationWithdrawn") || "Application Withdrawn",
        message: `Your application for "${payload.postTitle}" has been withdrawn`,
        icon: "↩️",
      },
    };
    
    const config = statusConfig[payload.status];
    
    if (config) {
      if (config.type === "success") {
        notification.success({
          message: config.title,
          description: config.message,
          duration: 5,
          placement: "topRight",
        });
      } else if (config.type === "error") {
        notification.error({
          message: config.title,
          description: config.message,
          duration: 5,
          placement: "topRight",
        });
      } else {
        notification.info({
          message: config.title,
          description: config.message,
          duration: 3,
          placement: "topRight",
        });
      }
    }
  }, [t]);

  const handleMemberRemoved = useCallback((dto) => {
  }, []);

  const handleMemberRoleChanged = useCallback((dto) => {
  }, []);

  const handleGroupUpdated = useCallback((dto) => {
  }, []);

  const handleMemberJoined = useCallback((dto) => {
  }, []);

  // Khởi tạo SignalR connection
  useGroupInvitationSignalR(token, userInfo?.userId, {
    onInvitationCreated: handleInvitationCreated,
    onInvitationStatusChanged: handleInvitationStatusChanged,
    onPendingUpdated: handlePendingUpdated,
    onMemberRemoved: handleMemberRemoved,
    onMemberRoleChanged: handleMemberRoleChanged,
    onGroupUpdated: handleGroupUpdated,
    onMemberJoined: handleMemberJoined,
  });

  return null; 
}
