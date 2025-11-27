import { BaseService } from "../config/basic.service";
import { API } from "../consts/path.api";

export const BacklogService = {
  getBacklog(groupId, params = {}) {
    return BaseService.get({
      url: API.BACKLOG.LIST(groupId),
      params,
      isLoading: true,
    });
  },

  createBacklogItem(groupId, payload = {}) {
    return BaseService.post({
      url: API.BACKLOG.CREATE(groupId),
      payload,
      isLoading: true,
    });
  },

  updateBacklogItem(groupId, backlogId, payload = {}) {
    return BaseService.put({
      url: API.BACKLOG.UPDATE(groupId, backlogId),
      payload,
      isLoading: true,
    });
  },

  archiveBacklogItem(groupId, backlogId) {
    return BaseService.remove({
      url: API.BACKLOG.ARCHIVE(groupId, backlogId),
      isLoading: true,
    });
  },

  promoteBacklogItem(groupId, backlogId, payload = {}) {
    return BaseService.post({
      url: API.BACKLOG.PROMOTE(groupId, backlogId),
      payload,
      isLoading: true,
    });
  },
};
