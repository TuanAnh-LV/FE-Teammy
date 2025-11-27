import { BaseService } from "../config/basic.service";
import { API } from "../consts/path.api";

export const ChatService = {

  getConversations(params = {}) {
    return BaseService.get({
      url: API.CHAT.CONVERSATIONS,
      params,
      isLoading: false,
    });
  },

  createOrGetDMConversation(targetUserId) {
    // Validate targetUserId exists and is not empty
    if (!targetUserId || String(targetUserId).trim() === "") {
      return Promise.reject(new Error("targetUserId is required"));
    }
    return BaseService.post({
      url: API.CHAT.CONVERSATIONS,
      payload: {
        targetUserId,
        userId: targetUserId, // backend expects userId; send both for compatibility
      },
      isLoading: false,
    });
  },

  getMessages(sessionId, params = {}) {
    return BaseService.get({
      url: API.CHAT.MESSAGES(sessionId),
      params,
      isLoading: false,
    });
  },

  getGroupMessages(groupId, params = {}) {
    return BaseService.get({
      url: API.CHAT.GROUP_MESSAGES(groupId),
      params,
      isLoading: false,
    });
  },

  sendMessage(sessionId, content, type = "text") {
    return BaseService.post({
      url: API.CHAT.MESSAGES(sessionId),
      payload: {
        content,
        type,
      },
      isLoading: false,
    });
  },

  sendGroupMessage(groupId, content, type = "text") {
    return BaseService.post({
      url: API.CHAT.GROUP_MESSAGES(groupId),
      payload: {
        content,
        type,
      },
      isLoading: false,
    });
  },
};
