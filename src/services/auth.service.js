import { BaseService } from "../config/basic.service";
import { API } from "../const/path.api";

export const AuthService = {
  login(params) {
    return BaseService.post({
      url: API.AUTH.LOGIN,
      payload: params,
      isLoading: true,
    });
  },
}