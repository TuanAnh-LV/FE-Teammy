import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  pendingInvitations: [],
  unreadCount: 0,
  applications: [],
  applicationCount: 0,
};

const getInviteKey = (inv = {}) => {
  if (inv.postId && inv.candidateId) return `${inv.postId}-${inv.candidateId}`;
  if (inv.groupId && inv.candidateId) return `${inv.groupId}-${inv.candidateId}`;
  return inv.invitationId || inv.id || inv.candidateId || inv.groupId;
};

const invitationSlice = createSlice({
  name: "invitation",
  initialState,
  reducers: {
    // Thêm invitation mới từ realtime
    addPendingInvitation: (state, action) => {
      const invitation = action.payload;
      const newKey = getInviteKey(invitation);
      const exists = state.pendingInvitations.find((inv) => {
        const existingKey = getInviteKey(inv);
        return existingKey && existingKey === newKey;
      });
      if (!exists) {
        state.pendingInvitations.unshift(invitation);
        state.unreadCount += 1;
      }
    },

    // Update status invitation
    updateInvitationStatus: (state, action) => {
      const { invitationId, status } = action.payload;
      const invitation = state.pendingInvitations.find(
        (inv) => inv.id === invitationId || inv.invitationId === invitationId
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
      const uniqueMap = new Map();
      action.payload.forEach((inv) => {
        const key = getInviteKey(inv);
        if (!key) return;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, inv);
        }
      });
      state.pendingInvitations = Array.from(uniqueMap.values());
      state.unreadCount = state.pendingInvitations.filter(
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
        (inv) => inv.id !== invitationId && inv.invitationId !== invitationId
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

    // Set applications từ API (initial load)
    setApplications: (state, action) => {
      state.applications = action.payload;
      state.applicationCount = action.payload.filter(
        (app) => app.status === "pending"
      ).length;
    },

    // Batch update từ PendingUpdated event
    updatePendingList: (state, action) => {
      const { groupId, candidates } = action.payload;
      
      if (!candidates || !Array.isArray(candidates)) return;
      
      // Update hoặc thêm mới các candidates
      candidates.forEach((candidate) => {
        const existingIndex = state.applications.findIndex(
          (app) => app.id === candidate.id
        );
        
        const application = {
          id: candidate.id,
          groupId: groupId,
          userId: candidate.userId,
          userName: candidate.userName,
          userEmail: candidate.userEmail,
          userAvatar: candidate.userAvatar,
          status: candidate.status || "pending",
          appliedAt: candidate.appliedAt,
          skills: candidate.skills || [],
          major: candidate.major,
        };
        
        if (existingIndex >= 0) {
          // Update existing
          const oldStatus = state.applications[existingIndex].status;
          state.applications[existingIndex] = application;
          
          // Update count nếu status changed
          if (oldStatus === "pending" && application.status !== "pending") {
            state.applicationCount = Math.max(0, state.applicationCount - 1);
          } else if (oldStatus !== "pending" && application.status === "pending") {
            state.applicationCount += 1;
          }
        } else {
          // Add new
          state.applications.unshift(application);
          if (application.status === "pending") {
            state.applicationCount += 1;
          }
        }
      });
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
  updatePendingList,
  removeApplication,
  markApplicationsAsRead,
} = invitationSlice.actions;

export default invitationSlice.reducer;
