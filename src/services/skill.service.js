// services/skill.service.js
import { BaseService } from "../config/basic.service";
import { API } from "../consts/path.api";

export const SkillService = {
  list(params = {}, isLoading = true) {
    return BaseService.get({
      url: API.SKILLS.LIST,
      params,
      isLoading,
    });
  },

  create(payload, isLoading = true) {
    return BaseService.post({
      url: API.SKILLS.CREATE,
      payload,
      isLoading,
    });
  },

  detail(token, isLoading = true) {
    return BaseService.get({
      url: API.SKILLS.DETAIL(token),
      isLoading,
    });
  },

  update(token, payload, isLoading = true) {
    return BaseService.put({
      url: API.SKILLS.UPDATE(token),
      payload,
      isLoading,
    });
  },

  delete(token, isLoading = true) {
    return BaseService.delete({
      url: API.SKILLS.DELETE(token),
      isLoading,
    });
  },
};
