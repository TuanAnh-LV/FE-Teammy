import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pendingInvitations: [],
  unreadCount: 0,
  applications: [],
  applicationCount: 0,
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

    // ========== Application Status Management ==========
    // Add application từ realtime
    addApplication: (state, action) => {
      const application = action.payload;
      const exists = state.applications.find(
        (app) => app.id === application.id
      );
      if (!exists) {
        state.applications.unshift(application);
        if (application.status === "pending") {
          state.applicationCount += 1;
        }
      }
    },

    // Update application status
    updateApplicationStatus: (state, action) => {
      const { applicationId, status } = action.payload;
      const application = state.applications.find(
        (app) => app.id === applicationId
      );
      if (application) {
        const wasPending = application.status === "pending";
        application.status = status;
        if (wasPending && status !== "pending") {
          state.applicationCount = Math.max(0, state.applicationCount - 1);
        }
      }
    },

    // Set applications từ API
    setApplications: (state, action) => {
      state.applications = action.payload;
      state.applicationCount = action.payload.filter(
        (app) => app.status === "pending"
      ).length;
    },

    // Remove application
    removeApplication: (state, action) => {
      const applicationId = action.payload;
      state.applications = state.applications.filter(
        (app) => app.id !== applicationId
      );
    },

    // Mark applications as read
    markApplicationsAsRead: (state) => {
      state.applicationCount = 0;
    },
  },
});

export const {
  addPendingInvitation,
  updateInvitationStatus,
  setPendingInvitations,
  markAsRead,
  removeInvitation,
  addApplication,
  updateApplicationStatus,
  setApplications,
  removeApplication,
  markApplicationsAsRead,
} = invitationSlice.actions;

export default invitationSlice.reducer;
