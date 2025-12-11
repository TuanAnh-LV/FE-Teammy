import React, { useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useGroupInvitationSignalR } from "../../hook/useGroupInvitationSignalR";
import { useDispatch } from "react-redux";
import { addPendingInvitation, updateInvitationStatus } from "../../app/invitationSlice";


export default function RealtimeInvitationListener() {
  const { token, userInfo } = useAuth();
  const dispatch = useDispatch();


  const handleInvitationCreated = useCallback((dto) => {
    console.log("📬 InvitationCreated:", dto);
    dispatch(addPendingInvitation(dto));
  }, [dispatch]);


  const handleInvitationStatusChanged = useCallback((dto) => {
    console.log("📋 InvitationStatusChanged:", dto);
    dispatch(updateInvitationStatus({
      invitationId: dto.invitationId || dto.id,
      status: dto.status,
    }));
  }, [dispatch]);

  const handlePendingUpdated = useCallback((payload) => {
    console.log("👥 PendingUpdated:", payload);
  }, []);

  const handleMemberRemoved = useCallback((dto) => {
    console.log("MemberRemoved:", dto);
  }, []);

  const handleMemberRoleChanged = useCallback((dto) => {
    console.log("MemberRoleChanged:", dto);
  }, []);

  const handleGroupUpdated = useCallback((dto) => {
    console.log("GroupUpdated:", dto);
  }, []);

  const handleMemberJoined = useCallback((dto) => {
    console.log("MemberJoined:", dto);
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
