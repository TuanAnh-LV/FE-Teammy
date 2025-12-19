import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { useGroupInvitationSignalR } from "./useGroupInvitationSignalR";
import {
  addPendingInvitation,
  updateInvitationStatus,
  addApplication,
  updateApplicationStatus,
} from "../app/invitationSlice";


export const useInvitationRealtime = (token, userId, options = {}) => {
  const dispatch = useDispatch();
  const {
    onInvitationReceived,
    onApplicationReceived,
    onStatusChanged,
  } = options;


  const handleInvitationCreated = useCallback(
    (invitation) => {
      const normalizedId =
        invitation.invitationId ||
        invitation.id ||
        (invitation.postId && invitation.candidateId
          ? `${invitation.postId}-${invitation.candidateId}`
          : null) ||
        invitation.candidateId ||
        invitation.groupId ||
        `inv-${Date.now()}`;

      const normalizedInvitation = {
        id: normalizedId,
        invitationId: normalizedId,
        groupId: invitation.groupId,
        groupName: invitation.groupName,
        postId: invitation.postId,
        candidateId: invitation.candidateId,
        postTitle: invitation.postTitle,
        invitedBy: invitation.invitedBy || invitation.invitedByName,
        invitedByName: invitation.invitedBy || invitation.invitedByName,
        invitedByAvatar: invitation.invitedByAvatar,
        type:
          invitation.type ||
          (invitation.postId ? "profile-post" : "direct"),
        status: invitation.status || "pending",
        createdAt: invitation.createdAt || new Date().toISOString(),
      };

      dispatch(addPendingInvitation(normalizedInvitation));

      if (onInvitationReceived) {
        onInvitationReceived(normalizedInvitation);
      }
    },
    [dispatch, onInvitationReceived]
  );


  const handleInvitationStatusChanged = useCallback(
    (payload) => {
      const invitationId =
        payload.invitationId ||
        payload.id ||
        (payload.postId && payload.candidateId
          ? `${payload.postId}-${payload.candidateId}`
          : null) ||
        payload.candidateId;

      if (!invitationId) {
        console.warn("[Realtime] Missing invitationId in status payload");
        return;
      }

      dispatch(updateInvitationStatus({ invitationId, status: payload.status }));

      if (onStatusChanged) {
        onStatusChanged({ ...payload, invitationId });
      }
    },
    [dispatch, onStatusChanged]
  );


  const handlePendingUpdated = useCallback(
    (payload) => {
      const { groupId, candidates = [] } = payload;

      candidates.forEach((candidate) => {
        const application = {
          id: candidate.id,
          groupId,
          userId: candidate.userId,
          userName: candidate.userName,
          userEmail: candidate.userEmail,
          userAvatar: candidate.userAvatar,
          status: candidate.status || "pending",
          appliedAt: candidate.appliedAt || new Date().toISOString(),
          skills: candidate.skills || [],
          major: candidate.major,
        };

        if (candidate.status === "pending") {
          dispatch(addApplication(application));
        } else {
          dispatch(
            updateApplicationStatus({
              applicationId: candidate.id,
              status: candidate.status,
            })
          );
        }
      });

      if (onApplicationReceived) {
        onApplicationReceived(payload);
      }
    },
    [dispatch, onApplicationReceived]
  );

  const callbacks = {
    onInvitationCreated: handleInvitationCreated,
    onInvitationStatusChanged: handleInvitationStatusChanged,
    onPendingUpdated: handlePendingUpdated,
  };

  const { isConnected, state, connection } = useGroupInvitationSignalR(
    token,
    userId,
    callbacks
  );

  const joinGroupChannel = useCallback(
    async (groupId) => {
      if (!connection || !isConnected) {
        console.warn("[Realtime] Cannot join group - not connected");
        return;
      }

      try {
        await connection.invoke("JoinGroup", groupId);
      } catch (error) {
        console.error("[Realtime] Error joining group:", error);
      }
    },
    [connection, isConnected]
  );

  const leaveGroupChannel = useCallback(
    async (groupId) => {
      if (!connection || !isConnected) return;

      try {
        await connection.invoke("LeaveGroup", groupId);
      } catch (error) {
        console.error("[Realtime] Error leaving group:", error);
      }
    },
    [connection, isConnected]
  );

  return {
    isConnected,
    connectionState: state,
    joinGroupChannel,
    leaveGroupChannel,
  };
};
