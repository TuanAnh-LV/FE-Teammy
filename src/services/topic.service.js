import { BaseService } from "../config/basic.service";
import { API } from "../consts/path.api";

export const TopicService = {
  getTopics(params = {}) {
    return BaseService.get({
      url: API.TOPICS.LIST,
      params,
      isLoading: true,
    });
  },
};
