import { BaseService } from "../config/basic.service";
import { API } from "../consts/path.api";

export const SemesterService = {
  // Get all semesters
  list() {
    return BaseService.get({
      url: API.SEMESTERS.LIST,
      isLoading: true,
    });
  },

  // Create new semester
  create(payload) {
    return BaseService.post({
      url: API.SEMESTERS.CREATE,
      payload,
      isLoading: true,
    });
  },

  // Get semester by ID
  detail(id) {
    return BaseService.get({
      url: API.SEMESTERS.DETAIL(id),
      isLoading: true,
    });
  },

  // Update semester
  update(id, payload) {
    return BaseService.put({
      url: API.SEMESTERS.UPDATE(id),
      payload,
      isLoading: true,
    });
  },

  // Get active semester
  getActive() {
    return BaseService.get({
      url: API.SEMESTERS.ACTIVE,
      isLoading: true,
    });
  },

  // Get semester policy
  getPolicy(id) {
    return BaseService.get({
      url: API.SEMESTERS.POLICY(id),
      isLoading: true,
    });
  },

  // Update semester policy
  updatePolicy(id, payload) {
    return BaseService.put({
      url: API.SEMESTERS.UPDATE_POLICY(id),
      payload,
      isLoading: true,
    });
  },

  // Activate semester
  activate(id) {
    return BaseService.post({
      url: API.SEMESTERS.ACTIVATE(id),
      isLoading: true,
    });
  },
};
