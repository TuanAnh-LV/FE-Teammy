/**
 * SignalR & Real-time Chat Configuration
 * 
 * This file documents all configuration needed for the real-time chat feature
 */

// ============================================
// 1. ENVIRONMENT VARIABLES
// ============================================
// Add to .env or .env.local:
// VITE_API_URL=https://api.example.com
// VITE_SIGNALR_HUB_URL=wss://api.example.com/groupChatHub
// 
// The signalRService will construct the URL as:
// BASE_URL/groupChatHub where BASE_URL is derived from DOMAIN_ADMIN

// ============================================
// 2. DEPENDENCIES
// ============================================
// Already installed in package.json:
// "@microsoft/signalr": "^8.0.7"
// "@reduxjs/toolkit": "^2.9.0"
// "react-redux": "^9.2.0"

// ============================================
// 3. REDUX STORE SETUP
// ============================================
// src/app/store.js - Already configured with chatSlice

// ============================================
// 4. SIGNALR CONSTANTS
// ============================================
export const SIGNALR_CONFIG = {
  // Hub connection settings
  HUB_PATH: "/groupChatHub",
  TRANSPORT_TYPE: "WebSockets",
  
  // Timing
  TYPING_TIMEOUT_MS: 3000,
  MAX_MESSAGES_PER_LOAD: 50,
  
  // Events (must match backend exactly)
  EVENTS: {
    // Client methods to invoke
    JOIN_SESSION: "JoinSession",
    LEAVE_SESSION: "LeaveSession",
    JOIN_GROUP: "JoinGroup",
    LEAVE_GROUP: "LeaveGroup",
    TYPING_SESSION: "TypingSession",
    TYPING: "Typing",
    SEND_MESSAGE: "SendMessage",
    SEND_GROUP_MESSAGE: "SendGroupMessage",
    
    // Server events to listen
    RECEIVE_SESSION_MESSAGE: "ReceiveSessionMessage",
    SESSION_PRESENCE_CHANGED: "SessionPresenceChanged",
    RECEIVE_TYPING: "ReceiveTyping",
    TYPING_SESSION: "TypingSession",
    PRESENCE_CHANGED: "PresenceChanged",
  },
};

// ============================================
// 5. MESSAGE DTO SCHEMA
// ============================================
export const MESSAGE_SCHEMA = {
  // From backend ReceiveSessionMessage event:
  // {
  //   messageId: string (UUID),
  //   sessionId: string,
  //   groupId?: string,
  //   senderId: string (userId),
  //   senderDisplayName: string,
  //   content: string,
  //   type: "text" | "image" | "file",
  //   createdAt: ISO8601 timestamp,
  //   updatedAt?: ISO8601 timestamp,
  //   reactions?: Array<{
  //     emoji: string,
  //     users: string[]
  //   }>
  // }
};

// ============================================
// 6. PRESENCE DTO SCHEMA
// ============================================
export const PRESENCE_SCHEMA = {
  // From SessionPresenceChanged event:
  // {
  //   sessionId: string,
  //   userId: string,
  //   displayName: string,
  //   status: "online" | "offline" | "idle"
  // }
  
  // From PresenceChanged event (group-level):
  // {
  //   groupId: string,
  //   userId: string,
  //   displayName: string,
  //   status: "online" | "offline" | "idle"
  // }
};

// ============================================
// 7. TYPING INDICATOR SCHEMA
// ============================================
export const TYPING_SCHEMA = {
  // From TypingSession or ReceiveTyping event:
  // {
  //   sessionId: string,
  //   groupId?: string,
  //   userId: string,
  //   displayName: string,
  //   isTyping: boolean
  // }
};

// ============================================
// 8. AUTH SETUP
// ============================================
// Authentication is handled in signalRService.js
// 
// Token source:
// 1. localStorage.getItem("account_admin") → JSON → accessToken
// 2. localStorage.getItem("token")
// 
// Passed to SignalR as Bearer token in header:
// Authorization: Bearer <token>
// 
// Ensure token is same JWT used for REST API calls

// ============================================
// 9. ERROR HANDLING STRATEGY
// ============================================
export const ERROR_HANDLING = {
  // Connection errors are handled by signalRService.withAutomaticReconnect()
  
  // Message send errors:
  // - Show notification to user
  // - Keep message in input (optimistic revert)
  // - User can retry
  
  // Typing timeout:
  // - Auto-stop after 3s (TYPING_TIMEOUT_MS)
  // - Prevent spam of typing events
  
  // Presence changes:
  // - If user goes offline unexpectedly, backend sends offline event
  // - Redux updates and UI reflects
};

// ============================================
// 10. MEMORY MANAGEMENT
// ============================================
export const MEMORY_MANAGEMENT = {
  // Message history:
  // - Only last 50 messages kept in state (MAX_MESSAGES_PER_LOAD)
  // - Old messages not stored locally
  // - Backend maintains full history
  
  // Event listeners:
  // - Each component subscribes via useEffect
  // - Unsubscribe on unmount (return cleanup function)
  // - signalRService maintains Set of listeners
  // - Listeners are never duplicated
  
  // Typing timeouts:
  // - Cleared on component unmount
  // - Each user has separate timeout
  // - Timeout cleared before setting new one
};

// ============================================
// 11. TESTING GUIDE
// ============================================
// See: src/utils/realtimeChat.test.helper.js
// Import and run test functions for manual testing

// ============================================
// 12. TROUBLESHOOTING
// ============================================
export const TROUBLESHOOTING = {
  NoConnection: {
    check: [
      "Backend URL correct in VITE_API_URL",
      "SignalR hub endpoint exists: /groupChatHub",
      "WebSocket protocol enabled",
      "CORS allows wss:// connections",
      "Token valid and in localStorage",
    ],
  },
  
  MessagesNotReceived: {
    check: [
      "joinSession() called with correct sessionId",
      "ReceiveSessionMessage listener attached",
      "Redux state updating (check Redux DevTools)",
      "Selector reading from correct key",
    ],
  },
  
  TypingNotShowing: {
    check: [
      "typingSession() method called during input",
      "Timeout clearing before event arrives",
      "Display name in payload",
      "Redux state updating",
      "Typing indicator not filtered out self user",
    ],
  },
  
  PresenceNotUpdating: {
    check: [
      "joinGroup() called for group chats",
      "SessionPresenceChanged or PresenceChanged listener attached",
      "Payload includes userId and displayName",
      "Status field in payload",
      "Redux presence reducer working",
    ],
  },
  
  MemoryLeak: {
    check: [
      "Cleanup functions returning from useEffect",
      "Unsubscribe called on listener cleanup",
      "Timeouts cleared",
      "Old sessions left properly",
      "No circular references in state",
    ],
  },
};

// ============================================
// 13. PERFORMANCE TIPS
// ============================================
export const PERFORMANCE_TIPS = {
  useReduxSelectors: "Use useSelector to avoid unnecessary re-renders",
  memoizeComponents: "Wrap PresenceIndicator in React.memo",
  debounceTyping: "Already implemented with 3s timeout",
  limitMessages: "Only keep 50 messages, backend maintains history",
  lazyLoadHistory: "Future: implement pagination for older messages",
};

// ============================================
// 14. SECURITY CONSIDERATIONS
// ============================================
export const SECURITY = {
  auth: "JWT token in Authorization header",
  xss: "Content escaped by React automatically",
  sqlInjection: "Backend responsibility via prepared statements",
  cors: "Backend should configure CORS for wss:// connections",
  validation: "Sanitize user input before sending to backend",
};

export default SIGNALR_CONFIG;
