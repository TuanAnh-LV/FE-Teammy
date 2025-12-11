import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pendingInvitations: [],
  unreadCount: 0,
};

const invitationSlice = createSlice({
  name: "invitation",
  initialState,
  reducers: {
    // Thêm invitation mới từ realtime
    addPendingInvitation: (state, action) => {
      const invitation = action.payload;
      const exists = state.pendingInvitations.find(
        (inv) => inv.id === invitation.id
      );
      if (!exists) {
        state.pendingInvitations.unshift(invitation);
        state.unreadCount += 1;
      }
    },

    // Update status invitation
    updateInvitationStatus: (state, action) => {
      const { invitationId, status } = action.payload;
      const invitation = state.pendingInvitations.find(
        (inv) => inv.id === invitationId
      );
      if (invitation) {
        invitation.status = status;
        if (status !== "pending") {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },

    // Set invitations từ API
    setPendingInvitations: (state, action) => {
      state.pendingInvitations = action.payload;
      state.unreadCount = action.payload.filter(
        (inv) => inv.status === "pending"
      ).length;
    },

    // Mark as read
    markAsRead: (state, action) => {
      state.unreadCount = 0;
    },

    // Remove invitation
    removeInvitation: (state, action) => {
      const invitationId = action.payload;
      state.pendingInvitations = state.pendingInvitations.filter(
        (inv) => inv.id !== invitationId
      );
    },
  },
});

export const {
  addPendingInvitation,
  updateInvitationStatus,
  setPendingInvitations,
  markAsRead,
  removeInvitation,
} = invitationSlice.actions;

export default invitationSlice.reducer;
