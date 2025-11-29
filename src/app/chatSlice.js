import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  messages: {}, // { [sessionId]: ChatMessageDto[] }
  typingUsers: {}, // { [sessionId]: { [userId]: displayName } }
  sessionPresence: {}, // { [sessionId]: { [userId]: { displayName, status } } }
  groupPresence: {}, // { [groupId]: { [userId]: { displayName, status } } }
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // Messages
    setMessages: (state, action) => {
      const { sessionId, messages } = action.payload;
      state.messages[sessionId] = messages;
    },
    addMessage: (state, action) => {
      const { sessionId, message } = action.payload;
      if (!state.messages[sessionId]) state.messages[sessionId] = [];
      state.messages[sessionId].push(message);
    },
    clearMessages: (state, action) => {
      const { sessionId } = action.payload;
      if (sessionId) {
        delete state.messages[sessionId];
      } else {
        state.messages = {};
      }
    },

    // Typing indicators
    setTypingUser: (state, action) => {
      const { sessionId, userId, displayName } = action.payload;
      if (!state.typingUsers[sessionId]) state.typingUsers[sessionId] = {};
      state.typingUsers[sessionId][userId] = displayName;
    },
    removeTypingUser: (state, action) => {
      const { sessionId, userId } = action.payload;
      if (state.typingUsers[sessionId]) {
        delete state.typingUsers[sessionId][userId];
      }
    },
    clearTypingUsers: (state, action) => {
      const { sessionId } = action.payload;
      if (sessionId) {
        state.typingUsers[sessionId] = {};
      } else {
        state.typingUsers = {};
      }
    },

    // Session presence (for DM and session-level tracking)
    setSessionPresence: (state, action) => {
      const { sessionId, presence } = action.payload;
      state.sessionPresence[sessionId] = presence;
    },
    updateSessionPresenceUser: (state, action) => {
      const { sessionId, userId, displayName, status } = action.payload;
      if (!state.sessionPresence[sessionId]) state.sessionPresence[sessionId] = {};
      state.sessionPresence[sessionId][userId] = { displayName, status };
    },
    removeSessionPresenceUser: (state, action) => {
      const { sessionId, userId } = action.payload;
      if (state.sessionPresence[sessionId]) {
        delete state.sessionPresence[sessionId][userId];
      }
    },

    // Group presence (for group-level tracking)
    setGroupPresence: (state, action) => {
      const { groupId, presence } = action.payload;
      state.groupPresence[groupId] = presence;
    },
    updateGroupPresenceUser: (state, action) => {
      const { groupId, userId, displayName, status } = action.payload;
      if (!state.groupPresence[groupId]) state.groupPresence[groupId] = {};
      state.groupPresence[groupId][userId] = { displayName, status };
    },
    removeGroupPresenceUser: (state, action) => {
      const { groupId, userId } = action.payload;
      if (state.groupPresence[groupId]) {
        delete state.groupPresence[groupId][userId];
      }
    },

    // Loading
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setMessages,
  addMessage,
  clearMessages,
  setTypingUser,
  removeTypingUser,
  clearTypingUsers,
  setSessionPresence,
  updateSessionPresenceUser,
  removeSessionPresenceUser,
  setGroupPresence,
  updateGroupPresenceUser,
  removeGroupPresenceUser,
  setLoading,
  setError,
} = chatSlice.actions;

export default chatSlice.reducer;
