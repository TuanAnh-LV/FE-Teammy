// services/user.service.js
import { BaseService } from "../config/basic.service";
import { API } from "../consts/path.api";

export const UserService = {

  list(params = {}, isLoading = true) {
    return BaseService.get({
      url: API.USERS.LIST,
      params,
      isLoading,
    });
  },

  detail(userId, isLoading = true) {
    return BaseService.get({
      url: API.USERS.DETAIL(userId),
      isLoading,
    });
  },

  getUsersWithoutGroup(params = {}) {
    return BaseService.get({
      url: API.USERS.LIST,
      params,
      isLoading: false,
    });
  },

  getMyProfile(isLoading = true) {
    return BaseService.get({
      url: API.USERS.MY_PROFILE,
      isLoading,
    });
  },

  updateMyProfile(payload, isLoading = true) {
    return BaseService.put({
      url: API.USERS.UPDATE_PROFILE,
      payload,
      isLoading,
    });
  },
};
