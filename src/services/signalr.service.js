import * as signalR from "@microsoft/signalr";
import { DOMAIN_ADMIN } from "../consts/const";

const getAccessToken = () => {
  try {
    const raw = localStorage.getItem("account_admin");
    if (raw) {
      const obj = JSON.parse(raw);
      return obj?.accessToken || obj?.access_token || null;
    }
    return localStorage.getItem("token");
  } catch {
    return null;
  }
};

const buildHubUrl = () => {
  const base = DOMAIN_ADMIN || "";
  return base.replace(/\/api\/?$/, "") + "/groupChatHub";
};

class SignalRService {
  constructor() {
    this.connection = null;
    this.started = false;
    this.listeners = {
      ReceiveMessage: new Set(), // Backend sends this
      ReceiveSessionMessage: new Set(), // For backward compatibility
      SessionPresenceChanged: new Set(),
      PresenceChanged: new Set(),
      TypingSession: new Set(),
      // Group Invitation & Application Events
      InvitationCreated: new Set(), // Nhận invitation mới (direct invite & profile-post invite)
      InvitationStatusChanged: new Set(), // Status thay đổi (accepted/rejected)
      PendingUpdated: new Set(), // Cập nhật danh sách pending (applications & invitations)
    };
    this.currentSessionId = null;
    this.joinedGroups = new Set();
  }

  async start() {
    if (this.started) return this.connection;

    const hubUrl = buildHubUrl();

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => getAccessToken() || "",
        transport: signalR.HttpTransportType.LongPolling,
        skipNegotiation: false,
      })
      .withAutomaticReconnect([0, 0, 3000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.registerCoreHandlers();

    try {
      await this.connection.start();
      const transportName = this.connection.transport?.name || "unknown";

      this.started = true;
    } catch (err) {

      throw err;
    }
    return this.connection;
  }

  async stop() {
    if (!this.connection || !this.started) return;
    try {
      await this.connection.stop();
    } catch (err) {

    } finally {
      this.started = false;
      this.connection = null;
    }
  }

  registerCoreHandlers() {
    if (!this.connection) return;
    Object.keys(this.listeners).forEach((event) => {
      this.connection.off(event);
      this.connection.on(event, (payload) => {
        this.listeners[event].forEach((cb) => {
          try {
            cb(payload);
          } catch (err) {

          }
        });
      });
    });
  }

  on(event, cb) {
    if (!this.listeners[event]) return () => {};
    this.listeners[event].add(cb);
    return () => this.listeners[event].delete(cb);
  }

  async joinSession(sessionId) {
    if (!sessionId) return;
    await this.start();
    
    // Wait for connection to be in Connected state
    let retries = 0;
    while (this.connection.state !== signalR.HubConnectionState.Connected && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }
    
    if (this.connection.state !== signalR.HubConnectionState.Connected) {

      return;
    }
    
    if (this.currentSessionId && this.currentSessionId !== sessionId) {
      await this.leaveSession(this.currentSessionId);
    }
    this.currentSessionId = sessionId;
    return this.connection.invoke("JoinSession", sessionId).catch((err) => {

    });
  }

  async leaveSession(sessionId) {
    if (!sessionId || !this.connection) return;
    try {
      if (this.connection.state === signalR.HubConnectionState.Connected) {
        await this.connection.invoke("LeaveSession", sessionId);
      }
    } catch (err) {

    } finally {
      if (this.currentSessionId === sessionId) this.currentSessionId = null;
    }
  }

  async typingSession(sessionId, isTyping = false) {
    if (!sessionId || !this.connection) return;
    try {
      await this.connection.invoke("TypingSession", sessionId, isTyping);
    } catch (err) {

    }
  }

  async joinGroup(groupId) {
    if (!groupId) return;
    await this.start();
    
    // Wait for connection to be in Connected state
    let retries = 0;
    while (this.connection.state !== signalR.HubConnectionState.Connected && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      retries++;
    }
    
    if (this.connection.state !== signalR.HubConnectionState.Connected) {

      return;
    }
    
    this.joinedGroups.add(groupId);
    return this.connection.invoke("JoinGroup", groupId).catch((err) => {

      this.joinedGroups.delete(groupId);
    });
  }

  async leaveGroup(groupId) {
    if (!groupId || !this.connection) return;
    try {
      if (this.connection.state === signalR.HubConnectionState.Connected) {
        await this.connection.invoke("LeaveGroup", groupId);
      }
    } catch (err) {

    } finally {
      this.joinedGroups.delete(groupId);
    }
  }

  async typing(groupId, isTyping = false) {
    if (!groupId || !this.connection) return;
    try {
      await this.connection.invoke("Typing", groupId, isTyping);
    } catch (err) {

    }
  }

  /**
   * Unsubscribe from all group presences and leave all joined groups
   */
  async leaveAllGroups() {
    const groupsToLeave = Array.from(this.joinedGroups);
    for (const groupId of groupsToLeave) {
      await this.leaveGroup(groupId);
    }
  }
}

export const signalRService = new SignalRService();

