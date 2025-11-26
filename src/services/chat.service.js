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

  createOrGetDMConversation(userId) {
    return BaseService.post({
      url: API.CHAT.CONVERSATIONS,
      payload: {
        userId,
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
};
