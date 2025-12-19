import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { DOMAIN_ADMIN } from "../consts/const";


let globalConnection = null;
let isConnecting = false;
let globalConnectionState = signalR.HubConnectionState.Disconnected;
const eventListeners = new Map();
const connectionStateListeners = new Set();

const getEventListenerSet = (eventName) => {
  if (!eventListeners.has(eventName)) {
    eventListeners.set(eventName, new Set());
  }
  return eventListeners.get(eventName);
};

const notifyConnectionState = (state) => {
  globalConnectionState = state;
  connectionStateListeners.forEach((listener) => {
    try {
      listener(state);
    } catch (error) {
      console.error("[SignalR] Error notifying listener:", error);
    }
  });
};

export const useGroupInvitationSignalR = (token, userId, callbacks = {}) => {
  const reconnectTimeoutRef = useRef(null);
  const callbackKeyRef = useRef(`listener_${Math.random().toString(36).slice(2)}`);
  const [connectionState, setConnectionState] = useState(globalConnectionState);

  useEffect(() => {
    connectionStateListeners.add(setConnectionState);
    return () => {
      connectionStateListeners.delete(setConnectionState);
    };
  }, []);

  useEffect(() => {
    const callbackKey = callbackKeyRef.current;

    if (callbacks.onInvitationCreated) {
      getEventListenerSet("InvitationCreated").add(callbacks.onInvitationCreated);
    }
    if (callbacks.onInvitationStatusChanged) {
      getEventListenerSet("InvitationStatusChanged").add(callbacks.onInvitationStatusChanged);
    }
    if (callbacks.onPendingUpdated) {
      getEventListenerSet("PendingUpdated").add(callbacks.onPendingUpdated);
    }
    if (callbacks.onMemberRemoved) {
      getEventListenerSet("MemberRemoved").add(callbacks.onMemberRemoved);
    }
    if (callbacks.onMemberRoleChanged) {
      getEventListenerSet("MemberRoleChanged").add(callbacks.onMemberRoleChanged);
    }
    if (callbacks.onGroupUpdated) {
      getEventListenerSet("GroupUpdated").add(callbacks.onGroupUpdated);
    }
    if (callbacks.onMemberJoined) {
      getEventListenerSet("MemberJoined").add(callbacks.onMemberJoined);
    }

    return () => {
      if (callbacks.onInvitationCreated) {
        getEventListenerSet("InvitationCreated").delete(callbacks.onInvitationCreated);
      }
      if (callbacks.onInvitationStatusChanged) {
        getEventListenerSet("InvitationStatusChanged").delete(callbacks.onInvitationStatusChanged);
      }
      if (callbacks.onPendingUpdated) {
        getEventListenerSet("PendingUpdated").delete(callbacks.onPendingUpdated);
      }
      if (callbacks.onMemberRemoved) {
        getEventListenerSet("MemberRemoved").delete(callbacks.onMemberRemoved);
      }
      if (callbacks.onMemberRoleChanged) {
        getEventListenerSet("MemberRoleChanged").delete(callbacks.onMemberRoleChanged);
      }
      if (callbacks.onGroupUpdated) {
        getEventListenerSet("GroupUpdated").delete(callbacks.onGroupUpdated);
      }
      if (callbacks.onMemberJoined) {
        getEventListenerSet("MemberJoined").delete(callbacks.onMemberJoined);
      }
    };
  }, [callbacks]);

  useEffect(() => {
    const setupConnection = async () => {
      if (!token || !userId) {
        notifyConnectionState(signalR.HubConnectionState.Disconnected);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        if (globalConnection?.state === signalR.HubConnectionState.Connected) {
          try {
            await globalConnection.stop();
          } catch (error) {
            console.error("[SignalR] Error disconnecting:", error);
          }
          globalConnection = null;
        }
        return;
      }

      // Reuse existing active connection so we only have one hub connection per login
      if (globalConnection) {
        const state = globalConnection.state;
        if (
          state === signalR.HubConnectionState.Connected ||
          state === signalR.HubConnectionState.Connecting ||
          state === signalR.HubConnectionState.Reconnecting
        ) {
          notifyConnectionState(state);
          return;
        }

        // Clean up stale instance before rebuilding
        globalConnection = null;
      }

      // Already connecting, skip
      if (isConnecting) {
        return;
      }

      // Attempt to connect (WebSockets with skipNegotiation as backend suggests)
      isConnecting = true;
      notifyConnectionState(signalR.HubConnectionState.Connecting);
      const base = DOMAIN_ADMIN || "";
      const hubUrl = base.replace(/\/api\/?$/, "") + "/groupChatHub";

      const conn = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl, {
          accessTokenFactory: () => {
            if (token) return token;
            // Get fresh token each time
            const freshToken = (() => {
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
            })();
            return freshToken || "";
          },
          transport: signalR.HttpTransportType.WebSockets,
          skipNegotiation: true,
        })
        .withAutomaticReconnect([0, 0, 3000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Error)
        .build();

      const eventNames = [
        "InvitationCreated",
        "InvitationStatusChanged",
        "PendingUpdated",
        "MemberRemoved",
        "MemberRoleChanged",
        "GroupUpdated",
        "MemberJoined",
        "UserOnline",
        "UserOffline",
      ];

      eventNames.forEach((eventName) => {
        conn.off(eventName);
        conn.on(eventName, (data) => {
          const listeners = getEventListenerSet(eventName);
          listeners.forEach((callback) => {
            try {
              callback(data);
            } catch (error) {
              console.error(`[SignalR] Error in ${eventName} callback:`, error);
            }
          });
        });
      });

      conn.onclose(async () => {
        isConnecting = false;
        notifyConnectionState(signalR.HubConnectionState.Disconnected);
        
        if (globalConnection === conn) {
          globalConnection = null;
        }

        if (token && userId) {
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
          }
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setupConnection();
          }, 3000);
        }
      });

      conn.onreconnecting((error) => {
        if (error) console.error("[SignalR] Reconnecting due to error:", error?.message || error);
        notifyConnectionState(signalR.HubConnectionState.Reconnecting);
      });

      conn.onreconnected(() => {
        notifyConnectionState(signalR.HubConnectionState.Connected);
      });

      try {
        await conn.start();
        globalConnection = conn;
        notifyConnectionState(signalR.HubConnectionState.Connected);
        isConnecting = false;
      } catch (error) {
        console.error("[SignalR] Failed to connect via WebSockets:", error?.message || error);
        isConnecting = false;
        notifyConnectionState(signalR.HubConnectionState.Disconnected);

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          setupConnection();
        }, 3000);
      }
    };

    setupConnection();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [token, userId]); // Re-connect when auth changes

  return {
    isConnected: connectionState === signalR.HubConnectionState.Connected,
    state: connectionState,
    connection: globalConnection,
  };
};
