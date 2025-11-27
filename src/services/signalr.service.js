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
      ReceiveSessionMessage: new Set(),
      SessionPresenceChanged: new Set(),
      ReceiveTyping: new Set(),
      TypingSession: new Set(),
      PresenceChanged: new Set(),
    };
    this.currentSessionId = null;
  }

  async start() {
    if (this.started) return this.connection;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(buildHubUrl(), {
        accessTokenFactory: () => getAccessToken() || "",
        transport: signalR.HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.None)
      .build();

    this.registerCoreHandlers();

    await this.connection.start();
    this.started = true;
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
      await this.connection.invoke("LeaveSession", sessionId);
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
}

export const signalRService = new SignalRService();
