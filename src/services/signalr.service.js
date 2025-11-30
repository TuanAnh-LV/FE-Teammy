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
    };
    this.currentSessionId = null;
    this.joinedGroups = new Set();
  }

  async start() {
    if (this.started) return this.connection;

    const hubUrl = buildHubUrl();
    console.log("🔗 Connecting to SignalR hub:", hubUrl);

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
      console.log("✅ SignalR connected! Transport:", transportName);
      this.started = true;
    } catch (err) {
      console.error("❌ SignalR connection failed:", err.message);
      throw err;
    }
    return this.connection;
  }

  async stop() {
    if (!this.connection || !this.started) return;
    try {
      await this.connection.stop();
    } catch (err) {
      console.error("Failed to stop SignalR connection", err);
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
            console.error(`SignalR handler error for ${event}`, err);
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
      console.error("Connection not ready after retries");
      return;
    }
    
    if (this.currentSessionId && this.currentSessionId !== sessionId) {
      await this.leaveSession(this.currentSessionId);
    }
    this.currentSessionId = sessionId;
    return this.connection.invoke("JoinSession", sessionId).catch((err) => {
      console.error("JoinSession failed", err);
    });
  }

  async leaveSession(sessionId) {
    if (!sessionId || !this.connection) return;
    try {
      if (this.connection.state === signalR.HubConnectionState.Connected) {
        await this.connection.invoke("LeaveSession", sessionId);
      }
    } catch (err) {
      console.error("LeaveSession failed", err);
    } finally {
      if (this.currentSessionId === sessionId) this.currentSessionId = null;
    }
  }

  async typingSession(sessionId, isTyping = false) {
    if (!sessionId || !this.connection) return;
    try {
      await this.connection.invoke("TypingSession", sessionId, isTyping);
    } catch (err) {
      console.warn("TypingSession failed", err);
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
      console.error("Connection not ready after retries");
      return;
    }
    
    this.joinedGroups.add(groupId);
    return this.connection.invoke("JoinGroup", groupId).catch((err) => {
      console.error("JoinGroup failed", err);
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
      console.error("LeaveGroup failed", err);
    } finally {
      this.joinedGroups.delete(groupId);
    }
  }

  async typing(groupId, isTyping = false) {
    if (!groupId || !this.connection) return;
    try {
      await this.connection.invoke("Typing", groupId, isTyping);
    } catch (err) {
      console.warn("Typing failed", err);
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
