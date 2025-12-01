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

  getProfileById(userId, isLoading = true) {
    return BaseService.get({
      url: API.USERS.PROFILE_BY_ID(userId),
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

  updateProfile(payload, isLoading = true) {
    return BaseService.put({
      url: API.USERS.UPDATE_PROFILE,
      payload,
      isLoading,
    });
  },

  getUserById(userId, isLoading = true) {
    return BaseService.get({
      url: API.USERS.GET_USER_BY_ID(userId),
      isLoading,
    });
  },
};
