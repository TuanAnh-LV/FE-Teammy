import { BaseService } from "../config/basic.service";
import { API } from "../consts/path.api";

export const AiService = {
  // Get recruitment post suggestions
  getRecruitmentPostSuggestions(payload) {
    return BaseService.post({
      url: API.AI.RECRUITMENT_POST_SUGGESTIONS,
      payload,
      isLoading: true,
    });
  },

  // Get topic suggestions
  getTopicSuggestions(payload) {
    return BaseService.post({
      url: API.AI.TOPIC_SUGGESTIONS,
      payload,
      isLoading: true,
    });
  },

  // Get profile post suggestions
  getProfilePostSuggestions(payload) {
    return BaseService.post({
      url: API.AI.PROFILE_POST_SUGGESTIONS,
      payload,
      isLoading: true,
    });
  },

  // Auto assign teams
  autoAssignTeams(payload) {
    return BaseService.post({
      url: API.AI.AUTO_ASSIGN_TEAMS,
      payload,
      isLoading: true,
    });
  },

  // Auto assign topic
  autoAssignTopic(payload) {
    return BaseService.post({
      url: API.AI.AUTO_ASSIGN_TOPIC,
      payload,
      isLoading: true,
    });
  },
};

