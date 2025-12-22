import * as signalR from "@microsoft/signalr";

/**
 * @typedef {Object} GroupStatusPayload
 * @property {string} groupId
 * @property {"pending_close" | "closed" | "active"} status
 * @property {"close_requested" | "close_confirmed" | "close_rejected"} action
 */

/** @type {signalR.HubConnection | null} */
let connection = null;

/** @type {Set<(payload: GroupStatusPayload) => void>} */
const listeners = new Set();

export function subscribeGroupStatus(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function unsubscribeGroupStatus(listener) {
  listeners.delete(listener);
}

export async function connectGroupStatusHub(authToken) {
  if (!authToken) return null;

  if (connection) {
    // Nếu đã có kết nối rồi thì trả về luôn
    return connection;
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl("https://api.vps-sep490.io.vn/groupChatHub", {
      accessTokenFactory: () => authToken,
    })
    .withAutomaticReconnect()
    .build();

  connection.on("GroupStatusChanged", /** @param {GroupStatusPayload} payload */ (payload) => {
    const { groupId, status, action } = payload || {};

    // Bắn event cho các listener ở FE (leader / mentor đang mở UI)
    listeners.forEach((listener) => {
      try {
        listener(payload);
      } catch (err) {
        console.error("GroupStatus listener error", err);
      }
    });

    // Log debug nhẹ cho dev
    if (action === "close_requested") {
      console.log("Leader requested close", groupId, status);
    } else if (action === "close_confirmed") {
      console.log("Mentor confirmed close", groupId, status);
    } else if (action === "close_rejected") {
      console.log("Mentor rejected close", groupId, status);
    } else {
      console.log("GroupStatusChanged", payload);
    }
  });

  connection.onclose((err) => {
    console.warn("GroupStatus hub disconnected", err);
  });

  await connection.start();
  console.log("GroupStatus hub connected");

  return connection;
}

export async function disconnectGroupStatusHub() {
  if (connection) {
    await connection.stop();
    connection = null;
    listeners.clear();
  }
}


