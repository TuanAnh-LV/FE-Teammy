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

  // Get AI summary
  getSummary(params) {
    return BaseService.get({
      url: API.AI.SUMMARY,
      params,
      isLoading: true,
    });
  },

  // Get AI options
  getOptions(params) {
    return BaseService.get({
      url: API.AI.OPTIONS,
      params,
      isLoading: true,
    });
  },

  // Auto resolve
  autoResolve(payload) {
    return BaseService.post({
      url: API.AI.AUTO_RESOLVE,
      payload,
      isLoading: true,
    });
  },
};

