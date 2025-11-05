// services/auth.service.js
import { BaseService } from "../config/basic.service";
import { API } from "../consts/path.api";

export const AuthService = {
  // destructure có default {} để tránh ReferenceError
  login({ idToken } = {}) {
    // có thể thêm guard nếu muốn:
    // if (!idToken) return Promise.reject(new Error("Missing idToken"));

    return BaseService.post({
      url: API.AUTH.LOGIN,
      // Backend yêu cầu khóa "IdToken" (PascalCase)
      payload: { IdToken: idToken },
      isLoading: true,
    });
  },
};
