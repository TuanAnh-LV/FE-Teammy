// services/auth.service.js
import { BaseService } from "../config/basic.service";
import { API } from "../consts/path.api";

export const AuthService = {
  login({ idToken } = {}) {
    return BaseService.post({
      url: API.AUTH.LOGIN,
      payload: { IdToken: idToken },
      isLoading: true,
    });
  },
  getMembership() {
    return BaseService.get({
      url: API.GROUPS.MEMBERSHIP,
      isLoading: true,
    });
  },
};
