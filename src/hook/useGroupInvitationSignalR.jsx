import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { DOMAIN_ADMIN } from "../consts/const";


let globalConnection = null;
let isConnecting = false;
const eventListeners = new Map();

const getEventListenerSet = (eventName) => {
  if (!eventListeners.has(eventName)) {
    eventListeners.set(eventName, new Set());
  }
  return eventListeners.get(eventName);
};


export const useGroupInvitationSignalR = (token, userId, callbacks = {}) => {
  const reconnectTimeoutRef = useRef(null);
  const callbackKeyRef = useRef(`listener_${Math.random().toString(36).slice(2)}`);

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
        console.log("[SignalR] No token/userId - disconnecting...");
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
        if (globalConnection?.state === signalR.HubConnectionState.Connected) {
          try {
            await globalConnection.stop();
            console.log("[SignalR] Disconnected");
          } catch (error) {
            console.error("[SignalR] Error disconnecting:", error);
          }
          globalConnection = null;
        }
        return;
      }

      // Already connected or connecting
      if (isConnecting || globalConnection?.state === signalR.HubConnectionState.Connected) {
        console.log("[SignalR] Already connected/connecting, skipping...");
        return;
      }

      // Attempt to connect
      isConnecting = true;
      try {
        console.log("[SignalR] Attempting to connect...");
        const base = DOMAIN_ADMIN || "";
        const hubUrl = base.replace(/\/api\/?$/, "") + "/groupChatHub";

        const conn = new signalR.HubConnectionBuilder()
          .withUrl(hubUrl, {
            accessTokenFactory: () => token,
            transport: signalR.HttpTransportType.LongPolling,
            skipNegotiation: false,
          })
          .withAutomaticReconnect([0, 0, 3000, 5000, 10000, 30000])
          .configureLogging(signalR.LogLevel.Information)
          .build();

        const eventNames = [
          "InvitationCreated",
          "InvitationStatusChanged",
          "PendingUpdated",
          "MemberRemoved",
          "MemberRoleChanged",
          "GroupUpdated",
          "MemberJoined",
        ];

        eventNames.forEach((eventName) => {
          conn.off(eventName);
          conn.on(eventName, (data) => {
            console.log(`[SignalR] Event received: ${eventName}`, data);
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
          console.log("[SignalR]  Connection closed");
          isConnecting = false;
          globalConnection = null;

          if (token && userId) {
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log("[SignalR] Attempting auto-reconnect...");
              setupConnection();
            }, 3000);
          }
        });

        conn.onreconnecting((error) => {
          console.log("[SignalR] Reconnecting...", error?.message);
        });

        conn.onreconnected((connectionId) => {
          console.log("[SignalR] Reconnected:", connectionId);
        });

        // Start connection
        await conn.start();
        console.log("[SignalR] Connected successfully");
        globalConnection = conn;
        isConnecting = false;
      } catch (error) {
        console.error("[SignalR] Failed to connect:", error?.message);
        isConnecting = false;

        // Retry if still authenticated
        if (token && userId) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("[SignalR] Retrying connection...");
            setupConnection();
          }, 3000);
        }
      }
    };

    setupConnection();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [token, userId]);

  return {
    isConnected: globalConnection?.state === signalR.HubConnectionState.Connected,
    connection: globalConnection,
  };
};
