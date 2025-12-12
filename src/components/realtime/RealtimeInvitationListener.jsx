import React, { useCallback, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGroupInvitationSignalR } from "../../hook/useGroupInvitationSignalR";
import { useDispatch } from "react-redux";
import {
  addPendingInvitation,
  updateInvitationStatus,
  removeInvitation,
  setPendingInvitations,
} from "../../app/invitationSlice";
import { notification } from "antd";
import { useTranslation } from "../../hook/useTranslation";
import { InvitationService } from "../../services/invitation.service";


export default function RealtimeInvitationListener() {
  const { token, userInfo } = useAuth();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const syncLockRef = useRef(false);

  const normalizeInvitation = useCallback((invitation) => {
    const normalizedId =
      invitation.invitationId ||
      invitation.id ||
      (invitation.postId && invitation.candidateId
        ? `${invitation.postId}-${invitation.candidateId}`
        : undefined) ||
      invitation.candidateId ||
      invitation.groupId ||
      `inv-${Date.now()}`;

    // Extract inviter name from multiple possible fields
    const inviterName = 
      invitation.invitedByName || 
      invitation.invitedBy || 
      invitation.leaderDisplayName || 
      invitation.leaderName ||
      invitation.senderName ||
      invitation.senderDisplayName ||
      invitation.inviterName ||
      invitation.inviterDisplayName;

    return {
      id: normalizedId,
      invitationId: normalizedId,
      groupId: invitation.groupId,
      groupName: invitation.groupName,
      postId: invitation.postId,
      candidateId: invitation.candidateId,
      postTitle: invitation.postTitle,
      invitedBy: inviterName,
      invitedByName: inviterName,
      invitedByAvatar: invitation.invitedByAvatar || invitation.inviterAvatar,
      type: invitation.type || (invitation.postId ? "profile-post" : "direct"),
      status: invitation.status || "pending",
      createdAt: invitation.createdAt || new Date().toISOString(),
    };
  }, []);

  const syncPendingInvitations = useCallback(async () => {
    if (syncLockRef.current) return;
    if (!token) return;
    syncLockRef.current = true;
    try {
      const [directRes, postRes] = await Promise.all([
        InvitationService.list({ status: "pending" }, false),
        InvitationService.getMyProfilePostInvitations({ status: "pending" }, false),
      ]);

      const directData = Array.isArray(directRes?.data) ? directRes.data : [];
      const postData = Array.isArray(postRes?.data) ? postRes.data : [];

      const normalizedDirect = directData.map((item) =>
        normalizeInvitation({
          ...item,
          type: "direct",
        })
      );

      const normalizedPost = postData.map((item) =>
        normalizeInvitation({
          ...item,
          type: "profile-post",
          postId: item.postId,
          candidateId: item.candidateId,
          postTitle: item.postTitle,
          groupId: item.groupId,
          groupName: item.groupName,
          invitedByName: item.leaderDisplayName || item.invitedByName,
        })
      );

      dispatch(setPendingInvitations([...normalizedDirect, ...normalizedPost]));
    } catch (error) {
      console.error("[Realtime] Failed to sync pending invitations:", error);
    } finally {
      syncLockRef.current = false;
    }
  }, [dispatch, normalizeInvitation, token]);


  /**
   * Handle InvitationCreated Event
   * Triggered when: invite member, invite in forum, or any new invitation
   */
  const handleInvitationCreated = useCallback((dto) => {
    const normalized = normalizeInvitation(dto);
    dispatch(addPendingInvitation(normalized));
    // Ensure store/UI consistent even if realtime payload misses some fields
    syncPendingInvitations();
  }, [dispatch, normalizeInvitation, syncPendingInvitations, t]);


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
    
    // Remove from pending list if not pending anymore
    if (dto.status !== "pending") {
      dispatch(removeInvitation(dto.invitationId || dto.id));
    }
  }, [dispatch]);

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
  const { isConnected } = useGroupInvitationSignalR(token, userInfo?.userId, {
    onInvitationCreated: handleInvitationCreated,
    onInvitationStatusChanged: handleInvitationStatusChanged,
    onPendingUpdated: handlePendingUpdated,
    onMemberRemoved: handleMemberRemoved,
    onMemberRoleChanged: handleMemberRoleChanged,
    onGroupUpdated: handleGroupUpdated,
    onMemberJoined: handleMemberJoined,
  });

  useEffect(() => {
    if (!token || !userInfo?.userId || !isConnected) return;
    syncPendingInvitations();
  }, [isConnected, syncPendingInvitations, token, userInfo?.userId]);

  return null; 
}
